const express = require('express');
const router = express.Router();
const { BetaAnalyticsDataClient } = require('@google-analytics/data');
const path = require('path');

// !!! ТВОЙ ID РЕСУРСА !!!
const propertyId = '524737614'; 

let analyticsDataClient;

// --- ЛОГИКА ПОДКЛЮЧЕНИЯ (Универсальная) ---
try {
  // 1. Проверяем, есть ли переменная окружения (для Хостинга/Production)
  if (process.env.GOOGLE_SERVICE_ACCOUNT_JSON) {
    console.log("🔐 Analytics: Используем ключи из Environment Variables");
    
    // Превращаем строку обратно в JSON-объект
    const credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON);
    
    analyticsDataClient = new BetaAnalyticsDataClient({
      credentials, 
    });

  } else {
    // 2. Если переменной нет, ищем файл (для Localhost)
    console.log("📂 Analytics: Используем ключи из файла service-account.json");
    
    const keyPath = path.join(__dirname, '../service-account.json');
    analyticsDataClient = new BetaAnalyticsDataClient({
      keyFilename: keyPath,
    });
  }
} catch (error) {
  console.error("❌ Критическая ошибка инициализации Google Analytics:", error.message);
  console.error("Убедитесь, что файл существует ИЛИ переменная окружения GOOGLE_SERVICE_ACCOUNT_JSON настроена верно.");
}

// @route   GET /api/analytics/dashboard-stats
// @desc    Получение статистики (Realtime + Basic)
router.get('/dashboard-stats', async (req, res) => {
  // Если клиент не инициализировался (ошибка ключей), вернем ошибку сразу
  if (!analyticsDataClient) {
    return res.status(500).json({ message: 'Google Analytics Client not initialized' });
  }

  try {
    // 1. REALTIME ОТЧЕТ (Кто прямо сейчас на сайте)
    const [realtimeResponse] = await analyticsDataClient.runRealtimeReport({
      property: `properties/${propertyId}`,
      dimensions: [{ name: 'country' }, { name: 'city' }],
      metrics: [{ name: 'activeUsers' }],
    });

    // Считаем сумму активных пользователей
    let activeUsersNow = 0;
    const activeLocations = [];

    if (realtimeResponse.rows) {
      realtimeResponse.rows.forEach(row => {
        const users = parseInt(row.metricValues[0].value, 10);
        activeUsersNow += users;
        activeLocations.push({
          country: row.dimensionValues[0].value,
          city: row.dimensionValues[1].value,
          count: users
        });
      });
    }

    // 2. ОТЧЕТ ЗА СЕГОДНЯ (Общая сводка)
    const [basicReport] = await analyticsDataClient.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [
        { startDate: 'today', endDate: 'today' }, // Данные за сегодня
      ],
      metrics: [
        { name: 'activeUsers' },  // Уникальные посетители
        { name: 'screenPageViews' }, // Просмотры страниц
        { name: 'sessions' }      // Сессии
      ],
    });

    const todayStats = {
      users: 0,
      views: 0,
      sessions: 0
    };

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