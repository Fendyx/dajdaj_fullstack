//backend/routes/analytics.js
const express = require('express');
const router = express.Router();
const { BetaAnalyticsDataClient } = require('@google-analytics/data');
const path = require('path');
const NodeGeocoder = require('node-geocoder');
const DailyStats = require('../models/DailyStats');

const geocoder = NodeGeocoder({ provider: 'openstreetmap' });
const propertyId = '524737614';

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

// ── GET /api/analytics/dashboard-stats ────────────────────────────────────────
router.get('/dashboard-stats', async (req, res) => {
  if (!analyticsDataClient) return res.status(500).json({ message: 'GA Client not initialized' });

  try {
    const geoPromise = analyticsDataClient.runRealtimeReport({
      property: `properties/${propertyId}`,
      dimensions: [{ name: 'country' }, { name: 'city' }],
      metrics: [{ name: 'activeUsers' }],
    });

    const timePromise = analyticsDataClient.runRealtimeReport({
      property: `properties/${propertyId}`,
      dimensions: [{ name: 'minutesAgo' }],
      metrics: [{ name: 'activeUsers' }],
    });

    const gaHistoryPromise = analyticsDataClient.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [{ startDate: '29daysAgo', endDate: 'today' }],
      dimensions: [{ name: 'date' }],
      metrics: [{ name: 'activeUsers' }],
      orderBys: [{ dimension: { orderType: 'ALPHANUMERIC', dimensionName: 'date' } }]
    });

    const dbHistoryPromise = DailyStats.find().sort({ date: 1 }).limit(31);

    const [geoResponse, timeResponse, gaHistoryResponse, dbHistoryData] = await Promise.all([
      geoPromise, timePromise, gaHistoryPromise, dbHistoryPromise
    ]);

    let totalActiveUsers = 0;
    const activeLocations = [];
    if (geoResponse[0].rows) {
      for (const row of geoResponse[0].rows) {
        const users = parseInt(row.metricValues[0].value, 10);
        totalActiveUsers += users;
        
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

    let breakdown = { last1min: 0, last5min: 0, last10min: 0, last30min: totalActiveUsers };
    let rawSum1 = 0, rawSum5 = 0, rawSum10 = 0;

    if (timeResponse[0].rows) {
      timeResponse[0].rows.forEach(row => {
        const min = parseInt(row.dimensionValues[0].value, 10);
        const cnt = parseInt(row.metricValues[0].value, 10);
        if (min < 1)  rawSum1  += cnt;
        if (min < 5)  rawSum5  += cnt;
        if (min < 10) rawSum10 += cnt;
      });
    }

    if (totalActiveUsers > 0 && rawSum1 === 0) rawSum1 = totalActiveUsers;
    breakdown.last1min  = Math.min(rawSum1, totalActiveUsers);
    breakdown.last5min  = rawSum5  === 0 && totalActiveUsers > 0 ? totalActiveUsers : Math.min(rawSum5,  totalActiveUsers);
    breakdown.last10min = rawSum10 === 0 && totalActiveUsers > 0 ? totalActiveUsers : Math.min(rawSum10, totalActiveUsers);
    if (breakdown.last5min  < breakdown.last1min)  breakdown.last5min  = breakdown.last1min;
    if (breakdown.last10min < breakdown.last5min)  breakdown.last10min = breakdown.last5min;

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

    const historyMap = {};

    if (gaHistoryResponse[0].rows) {
      gaHistoryResponse[0].rows.forEach(row => {
        const date = formatDateGA(row.dimensionValues[0].value);
        historyMap[date] = { date, uniqueUsers: parseInt(row.metricValues[0].value, 10), peakOnline: 0 };
      });
    }

    dbHistoryData.forEach(doc => {
      if (historyMap[doc.date]) {
        historyMap[doc.date].peakOnline = doc.maxActiveUsers;
      } else {
        historyMap[doc.date] = { date: doc.date, uniqueUsers: 0, peakOnline: doc.maxActiveUsers };
      }
    });

    if (!historyMap[todayStr]) {
      historyMap[todayStr] = { date: todayStr, uniqueUsers: totalActiveUsers, peakOnline: todayStats.maxActiveUsers };
    } else {
      if (todayStats.maxActiveUsers > historyMap[todayStr].peakOnline) {
        historyMap[todayStr].peakOnline = todayStats.maxActiveUsers;
      }
      if (historyMap[todayStr].uniqueUsers < totalActiveUsers) {
        historyMap[todayStr].uniqueUsers = totalActiveUsers;
      }
    }

    const fullHistory = Object.values(historyMap).sort((a, b) => new Date(a.date) - new Date(b.date));

    res.json({
      realtime: { count: totalActiveUsers, locations: activeLocations, breakdown },
      today:    { peak: todayStats.maxActiveUsers },
      history:  fullHistory
    });

  } catch (error) {
    console.error('Analytics Error:', error);
    res.status(500).json({ message: 'Error', error: error.message });
  }
});

// ── GET /api/analytics/history-all ────────────────────────────────────────────
// Вся история из DailyStats (для графика "All Time")
// Данные накапливаются с первого дня запуска сайта — не удаляются как Event (90 дней TTL)
router.get('/history-all', async (req, res) => {
  try {
    const docs = await DailyStats.find().sort({ date: 1 });

    const result = docs.map((doc) => ({
      date:        doc.date,
      uniqueUsers: 0,               // DailyStats не хранит уников — только пик онлайн
      peakOnline:  doc.maxActiveUsers ?? 0,
    }));

    res.json(result);
  } catch (e) {
    console.error('❌ history-all error:', e.message);
    res.status(500).json({ message: 'Error' });
  }
});

module.exports = router;