const express = require('express');
const router = express.Router();
const { BetaAnalyticsDataClient } = require('@google-analytics/data');
const path = require('path');
const NodeGeocoder = require('node-geocoder');
const DailyStats = require('../models/DailyStats');

const geocoder = NodeGeocoder({ provider: 'openstreetmap' });
const propertyId = '524737614'; // ТВОЙ ID

const cityCache = { "(not set)": { lat: 0, lng: 0 } };
let analyticsDataClient;

try {
  if (process.env.GOOGLE_SERVICE_ACCOUNT_JSON) {
    const credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON);
    analyticsDataClient = new BetaAnalyticsDataClient({ credentials });
  } else {
    const keyPath = path.join(__dirname, '../service-account.json');
    analyticsDataClient = new BetaAnalyticsDataClient({ keyFilename: keyPath });
  }
} catch (error) {
  console.error("❌ GA Init Error:", error.message);
}

const getTodayString = () => new Date().toISOString().split('T')[0];

const formatDateGA = (dateStr) => {
  if (!dateStr || dateStr.length !== 8) return dateStr;
  return `${dateStr.substring(0, 4)}-${dateStr.substring(4, 6)}-${dateStr.substring(6, 8)}`;
};

router.get('/dashboard-stats', async (req, res) => {
  if (!analyticsDataClient) return res.status(500).json({ message: 'GA Client not initialized' });

  try {
    // 1. REALTIME (Гео - дает точное число уникальных юзеров за 30 мин)
    const geoPromise = analyticsDataClient.runRealtimeReport({
      property: `properties/${propertyId}`,
      dimensions: [{ name: 'country' }, { name: 'city' }],
      metrics: [{ name: 'activeUsers' }],
    });

    // 2. REALTIME (Временная шкала)
    const timePromise = analyticsDataClient.runRealtimeReport({
      property: `properties/${propertyId}`,
      dimensions: [{ name: 'minutesAgo' }],
      metrics: [{ name: 'activeUsers' }],
    });

    // 3. ИСТОРИЯ (За 30 дней)
    const gaHistoryPromise = analyticsDataClient.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [{ startDate: '29daysAgo', endDate: 'today' }],
      dimensions: [{ name: 'date' }],
      metrics: [{ name: 'activeUsers' }],
      orderBys: [{ dimension: { orderType: 'ALPHANUMERIC', dimensionName: 'date' } }]
    });

    // 4. ИСТОРИЯ ИЗ БД
    const dbHistoryPromise = DailyStats.find().sort({ date: 1 }).limit(31);

    const [geoResponse, timeResponse, gaHistoryResponse, dbHistoryData] = await Promise.all([
      geoPromise, timePromise, gaHistoryPromise, dbHistoryPromise
    ]);

    // --- ОБРАБОТКА REALTIME (ГЕО + TOTAL) ---
    let totalActiveUsers = 0;
    const activeLocations = [];
    if (geoResponse[0].rows) {
      for (const row of geoResponse[0].rows) {
        const users = parseInt(row.metricValues[0].value, 10);
        totalActiveUsers += users; // Это самое точное число "Уникальных прямо сейчас"
        
        const country = row.dimensionValues[0].value;
        const city = row.dimensionValues[1].value;

        if (!cityCache[city] && city !== "(not set)") {
          try {
            const res = await geocoder.geocode(`${city}, ${country}`);
            cityCache[city] = res.length > 0 ? { lat: res[0].latitude, lng: res[0].longitude } : { lat: 0, lng: 0 };
          } catch (e) { cityCache[city] = { lat: 0, lng: 0 }; }
        }
        const coords = cityCache[city] || { lat: 0, lng: 0 };
        if (coords.lat !== 0) activeLocations.push({ country, city, lat: coords.lat, lng: coords.lng, count: users });
      }
    }

    // --- ОБРАБОТКА ВРЕМЕНИ (FIXED LOGIC) ---
    let breakdown = { last1min: 0, last5min: 0, last10min: 0, last30min: totalActiveUsers };
    
    // Временные переменные для "сырой" суммы
    let rawSum1 = 0;
    let rawSum5 = 0;
    let rawSum10 = 0;

    if (timeResponse[0].rows) {
      timeResponse[0].rows.forEach(row => {
        const min = parseInt(row.dimensionValues[0].value, 10);
        const cnt = parseInt(row.metricValues[0].value, 10);
        
        if (min < 1) rawSum1 += cnt;
        if (min < 5) rawSum5 += cnt;
        if (min < 10) rawSum10 += cnt;
      });
    }

    // 🔥 ЛОГИКА НОРМАЛИЗАЦИИ 🔥
    // 1. Если Total > 0, но Google Time еще не обновился (там 0), форсируем 1 минуту
    if (totalActiveUsers > 0 && rawSum1 === 0) {
        rawSum1 = totalActiveUsers;
    }

    // 2. Ограничиваем суммы. "Пользователей за 5 мин" не может быть больше, 
    // чем "Всего пользователей на сайте (30м)".
    // Это убирает баг "1 юзер превращается в 5".
    breakdown.last1min = Math.min(rawSum1, totalActiveUsers);
    
    // Для 5 и 10 минут берем сырую сумму, но не больше Total. 
    // Если сырая сумма 0 (глюк), а тотал есть - берем тотал.
    breakdown.last5min = rawSum5 === 0 && totalActiveUsers > 0 ? totalActiveUsers : Math.min(rawSum5, totalActiveUsers);
    breakdown.last10min = rawSum10 === 0 && totalActiveUsers > 0 ? totalActiveUsers : Math.min(rawSum10, totalActiveUsers);
    
    // Иерархия (1м не может быть больше 5м)
    if (breakdown.last5min < breakdown.last1min) breakdown.last5min = breakdown.last1min;
    if (breakdown.last10min < breakdown.last5min) breakdown.last10min = breakdown.last5min;

    // --- БД: ОБНОВЛЕНИЕ РЕКОРДА ---
    const todayStr = getTodayString();
    let todayStats = await DailyStats.findOne({ date: todayStr });
    
    if (!todayStats) {
      todayStats = new DailyStats({ date: todayStr, maxActiveUsers: totalActiveUsers });
      await todayStats.save();
    } else if (totalActiveUsers > todayStats.maxActiveUsers) {
      todayStats.maxActiveUsers = totalActiveUsers;
      todayStats.updatedAt = Date.now();
      await todayStats.save();
    }

    // --- СЛИЯНИЕ ИСТОРИИ ---
    const historyMap = {};

    if (gaHistoryResponse[0].rows) {
      gaHistoryResponse[0].rows.forEach(row => {
        const date = formatDateGA(row.dimensionValues[0].value);
        historyMap[date] = { 
          date, 
          uniqueUsers: parseInt(row.metricValues[0].value, 10), 
          peakOnline: 0 
        };
      });
    }

    dbHistoryData.forEach(doc => {
      if (historyMap[doc.date]) {
        historyMap[doc.date].peakOnline = doc.maxActiveUsers;
      } else {
        historyMap[doc.date] = { date: doc.date, uniqueUsers: 0, peakOnline: doc.maxActiveUsers };
      }
    });

    // ФИКС ДЛЯ "СЕГОДНЯ" В ИСТОРИИ
    if (!historyMap[todayStr]) {
      historyMap[todayStr] = { 
        date: todayStr, 
        // Если GA еще не посчитал уников за сегодня, берем минимум (текущий онлайн)
        uniqueUsers: totalActiveUsers, 
        peakOnline: todayStats.maxActiveUsers 
      };
    } else {
      // Обновляем пик
      if (todayStats.maxActiveUsers > historyMap[todayStr].peakOnline) {
         historyMap[todayStr].peakOnline = todayStats.maxActiveUsers;
      }
      // Если уников в истории 0 (GA тормозит), но мы видим людей онлайн -> ставим хотя бы их
      if (historyMap[todayStr].uniqueUsers < totalActiveUsers) {
         historyMap[todayStr].uniqueUsers = totalActiveUsers;
      }
    }

    const fullHistory = Object.values(historyMap).sort((a, b) => new Date(a.date) - new Date(b.date));

    res.json({
      realtime: {
        count: totalActiveUsers,
        locations: activeLocations,
        breakdown
      },
      today: {
        peak: todayStats.maxActiveUsers
      },
      history: fullHistory
    });

  } catch (error) {
    console.error('Analytics Error:', error);
    res.status(500).json({ message: 'Error', error: error.message });
  }
});

module.exports = router;