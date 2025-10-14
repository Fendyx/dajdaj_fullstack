const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const User = require("../models/user");

// Получение всех пользователей (только для админа)
router.get("/", auth, async (req, res) => {
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


module.exports = router; // ✅ обязательно router, не { router }
