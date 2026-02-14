const express = require('express');
const router = express.Router();
const { BetaAnalyticsDataClient } = require('@google-analytics/data');
const path = require('path');
const NodeGeocoder = require('node-geocoder'); // <--- НОВАЯ БИБЛИОТЕКА

// Настройка геокодера (используем бесплатный OpenStreetMap)
const geocoder = NodeGeocoder({
  provider: 'openstreetmap'
});

// !!! ТВОЙ ID РЕСУРСА !!!
const propertyId = '524737614'; 

// --- КЭШ ГОРОДОВ ---
// Чтобы не спрашивать координаты одного и того же города 100 раз,
// мы будем запоминать их здесь, пока сервер работает.
const cityCache = {
  "(not set)": { lat: 0, lng: 0 } // Игнорируем неопределенные города
};

let analyticsDataClient;

// --- ЛОГИКА ПОДКЛЮЧЕНИЯ ---
try {
  if (process.env.GOOGLE_SERVICE_ACCOUNT_JSON) {
    console.log("🔐 Analytics: Используем ключи из Environment Variables");
    const credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON);
    analyticsDataClient = new BetaAnalyticsDataClient({ credentials });
  } else {
    console.log("📂 Analytics: Используем ключи из файла service-account.json");
    const keyPath = path.join(__dirname, '../service-account.json');
    analyticsDataClient = new BetaAnalyticsDataClient({ keyFilename: keyPath });
  }
} catch (error) {
  console.error("❌ Ошибка инициализации GA:", error.message);
}

// @route   GET /api/analytics/dashboard-stats
router.get('/dashboard-stats', async (req, res) => {
  if (!analyticsDataClient) {
    return res.status(500).json({ message: 'Google Analytics Client not initialized' });
  }

  try {
    // 1. REALTIME ОТЧЕТ (Берем только Название города)
    const [realtimeResponse] = await analyticsDataClient.runRealtimeReport({
      property: `properties/${propertyId}`,
      dimensions: [
        { name: 'country' }, 
        { name: 'city' }
      ],
      metrics: [{ name: 'activeUsers' }],
    });

    let activeUsersNow = 0;
    const activeLocations = [];

    if (realtimeResponse.rows) {
      // Мы используем for...of, чтобы работал await внутри цикла
      for (const row of realtimeResponse.rows) {
        const users = parseInt(row.metricValues[0].value, 10);
        activeUsersNow += users;

        const country = row.dimensionValues[0].value;
        const city = row.dimensionValues[1].value;

        // Если города нет в кэше, ищем его координаты
        if (!cityCache[city] && city !== "(not set)") {
          try {
            // Запрашиваем координаты у OpenStreetMap
            const res = await geocoder.geocode(`${city}, ${country}`);
            
            if (res && res.length > 0) {
              // Запоминаем в кэш
              cityCache[city] = {
                lat: res[0].latitude,
                lng: res[0].longitude
              };
            } else {
              // Если не нашли, ставим заглушку (0,0) чтобы не искать снова
              cityCache[city] = { lat: 0, lng: 0 };
            }
          } catch (geoError) {
            console.error(`Ошибка геокодинга для ${city}:`, geoError.message);
            // Временная заглушка, если сервис недоступен
            cityCache[city] = { lat: 0, lng: 0 };
          }
        }

        // Берем координаты из кэша
        const coords = cityCache[city] || { lat: 0, lng: 0 };

        // Добавляем в ответ только если координаты валидные (не 0,0)
        if (coords.lat !== 0 && coords.lng !== 0) {
            activeLocations.push({
            country: country,
            city: city,
            lat: coords.lat,
            lng: coords.lng,
            count: users
            });
        }
      }
    }

    // 2. ОТЧЕТ ЗА СЕГОДНЯ
    const [basicReport] = await analyticsDataClient.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [{ startDate: 'today', endDate: 'today' }],
      metrics: [
        { name: 'activeUsers' },
        { name: 'screenPageViews' },
        { name: 'sessions' }
      ],
    });

    const todayStats = { users: 0, views: 0, sessions: 0 };

    if (basicReport.rows && basicReport.rows[0]) {
      todayStats.users = basicReport.rows[0].metricValues[0].value;
      todayStats.views = basicReport.rows[0].metricValues[1].value;
      todayStats.sessions = basicReport.rows[0].metricValues[2].value;
    }

    res.json({
      realtime: {
        count: activeUsersNow,
        locations: activeLocations
      },
      today: todayStats
    });

  } catch (error) {
    console.error('Google Analytics Error:', error);
    res.status(500).json({ message: 'Error fetching analytics', error: error.message });
  }
});

module.exports = router;