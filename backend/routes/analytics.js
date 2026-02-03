// backend/routes/analytics.js
const express = require("express");
const router = express.Router();
const User = require("../models/user");
const Visit = require("../models/Visit");
const auth = require("../middleware/auth");
const authorizeRole = require("../middleware/authorizeRole");

router.get("/dashboard-stats", auth, async (req, res) => {
  try {
    // 1. Всего пользователей
    const totalUsers = await User.countDocuments();

    // 2. Активные сейчас (те, кто делал запрос в последние 15 минут)
    const fiveMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);
    const activeVisitors = await Visit.countDocuments({ lastActive: { $gte: fiveMinutesAgo } });

    // 3. Всего уникальных IP (это по сути кол-во документов в коллекции Visit, так как мы делаем upsert по IP)
    const totalUniqueIps = await Visit.countDocuments();

    // 4. Зарегистрированные vs Гости (среди уникальных IP)
    // Те, у кого поле userId не null
    const registeredVisitors = await Visit.countDocuments({ userId: { $ne: null } });
    const guestVisitors = totalUniqueIps - registeredVisitors;

    res.json({
      totalUsers,
      activeVisitors,
      traffic: {
        total: totalUniqueIps,
        registered: registeredVisitors,
        guests: guestVisitors
      }
    });
  } catch (err) {
    console.error("Ошибка аналитики:", err);
    res.status(500).json({ message: "Ошибка сервера" });
  }
});

module.exports = router;