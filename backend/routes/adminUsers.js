const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const User = require("../models/user");

// Middleware: пропускает admin ИЛИ superadmin
const adminOrSuper = [
  auth,
  (req, res, next) => {
    if (req.user.role === "admin" || req.user.role === "superadmin") return next();
    return res.status(403).json({ message: "Доступ запрещен" });
  },
];

// GET /api/users — все пользователи (список)
router.get("/", adminOrSuper, async (req, res) => {
  try {
    const users = await User.find()
      .select("clientId name email cardNumber registrationDate role")
      .sort({ registrationDate: -1 })
      .lean();
    res.json(users);
  } catch (err) {
    console.error("❌ Ошибка получения пользователей:", err.message);
    res.status(500).json({ message: "Ошибка сервера" });
  }
});

// GET /api/users/admins — только admin и superadmin
router.get("/admins", adminOrSuper, async (req, res) => {
  try {
    const admins = await User.find({ role: { $in: ["admin", "superadmin"] } })
      .select("name email role registrationDate")
      .lean();
    res.json(admins);
  } catch (err) {
    console.error("❌ Ошибка получения админов:", err.message);
    res.status(500).json({ message: "Ошибка сервера" });
  }
});

// GET /api/users/find-by-email?email=... — поиск по email
router.get("/find-by-email", adminOrSuper, async (req, res) => {
  const { email } = req.query;
  if (!email) return res.status(400).json({ message: "Email обязателен" });
  try {
    const user = await User.findOne({ email })
      .select("name email role registrationDate clientId cardNumber")
      .lean();
    if (!user) return res.status(404).json({ message: "Пользователь не найден" });
    res.json(user);
  } catch (err) {
    console.error("❌ Ошибка поиска пользователя:", err.message);
    res.status(500).json({ message: "Ошибка сервера" });
  }
});

// GET /api/users/:id — полная инфа об одном юзере
router.get("/:id", adminOrSuper, async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select("-password")
      .lean();
    if (!user) return res.status(404).json({ message: "Пользователь не найден" });
    res.json(user);
  } catch (err) {
    console.error("❌ Ошибка получения пользователя:", err.message);
    res.status(500).json({ message: "Ошибка сервера" });
  }
});

// DELETE /api/users/:id — удаление
router.delete("/:id", adminOrSuper, async (req, res) => {
  try {
    const deleted = await User.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Пользователь не найден" });
    res.json({ message: "Пользователь удален" });
  } catch (err) {
    console.error("❌ Ошибка удаления пользователя:", err.message);
    res.status(500).json({ message: "Ошибка сервера" });
  }
});

// PUT /api/users/promote/:id — назначить админом
router.put("/promote/:id", adminOrSuper, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role: "admin" },
      { new: true }
    ).select("name email role registrationDate").lean();
    if (!user) return res.status(404).json({ message: "Пользователь не найден" });
    res.json({ message: "Пользователь назначен админом", user });
  } catch (err) {
    console.error("❌ Ошибка назначения админа:", err.message);
    res.status(500).json({ message: "Ошибка сервера" });
  }
});

module.exports = router;