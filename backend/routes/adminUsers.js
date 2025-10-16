const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const User = require("../models/user");
const authorizeRole = require("../middleware/authorizeRole");

// Получение всех пользователей (только для админа)
router.get("/", auth, authorizeRole("superadmin"), async (req, res) => {
  try {
    const users = await User.find().select(
      "clientId name email registrationDate cardNumber"
    );
    console.log("📦 Users fetched:", users.length);
    res.json(users);
  } catch (err) {
    console.error("❌ Ошибка получения пользователей:", err.message);
    res.status(500).json({ message: "Ошибка сервера" });
  }
});

// Удаление пользователя по ID (только для админа)
router.delete("/:id", auth, async (req, res) => {
  try {
    const deletedUser = await User.findByIdAndDelete(req.params.id);
    if (!deletedUser) {
      return res.status(404).json({ message: "Пользователь не найден" });
    }
    console.log("🗑️ User deleted:", deletedUser._id);
    res.json({ message: "Пользователь удален" });
  } catch (err) {
    console.error("❌ Ошибка удаления пользователя:", err.message);
    res.status(500).json({ message: "Ошибка сервера" });
  }
});

// ✅ Получить всех админов и супер-админов
router.get("/admins", auth, authorizeRole("superadmin"), async (req, res) => {
  try {
    const admins = await User.find({ role: { $in: ["admin", "superadmin"] } })
      .select("name email role registrationDate");
    res.json(admins);
  } catch (err) {
    console.error("❌ Ошибка получения админов:", err.message);
    res.status(500).json({ message: "Ошибка сервера" });
  }
});

// 🔍 Найти пользователя по email
router.get("/find-by-email", auth, authorizeRole("superadmin"), async (req, res) => {
  const { email } = req.query;
  if (!email) return res.status(400).json({ message: "Email обязателен" });

  try {
    const user = await User.findOne({ email }).select("name email role registrationDate clientId cardNumber");
    if (!user) return res.status(404).json({ message: "Пользователь не найден" });
    res.json(user);
  } catch (err) {
    console.error("❌ Ошибка поиска пользователя:", err.message);
    res.status(500).json({ message: "Ошибка сервера" });
  }
});

// 🛡 Назначить админом
router.put("/promote/:id", auth, authorizeRole("superadmin"), async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role: "admin" },
      { new: true }
    ).select("name email role registrationDate");
    if (!user) return res.status(404).json({ message: "Пользователь не найден" });
    res.json({ message: "Пользователь назначен админом", user });
  } catch (err) {
    console.error("❌ Ошибка назначения админа:", err.message);
    res.status(500).json({ message: "Ошибка сервера" });
  }
});


module.exports = router; // ✅ обязательно router, не { router }
