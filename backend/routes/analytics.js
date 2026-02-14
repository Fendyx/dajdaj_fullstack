const express = require('express');
const router = express.Router();
const { BetaAnalyticsDataClient } = require('@google-analytics/data');
const path = require('path');

// Путь к твоему JSON ключу
const keyPath = path.join(__dirname, '../service-account.json');

// Инициализация клиента Google
const analyticsDataClient = new BetaAnalyticsDataClient({
  keyFilename: keyPath,
});

// !!! ВСТАВЬ СЮДА ЦИФРЫ PROPERTY ID ИЗ GOOGLE ANALYTICS !!!
const propertyId = '524737614'; 

// @route   GET /api/analytics/dashboard-stats
// @desc    Получение статистики (Realtime + Basic)
// @access  Admin (потом добавишь protect middleware)
router.get('/dashboard-stats', async (req, res) => {
  try {
    // 1. REALTIME ОТЧЕТ (Кто прямо сейчас на сайте)
    // Google отдает данные с задержкой в несколько секунд
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