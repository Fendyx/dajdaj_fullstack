const express = require("express");
const router = express.Router();
const Order = require("../models/order");
const auth = require("../middleware/auth");

// Получение всех заказов (для админа)
router.get("/", auth, async (req, res) => {
  try {
    const orders = await Order.find().populate("userId", "email name");
    console.log("📦 Orders fetched:", orders.length);
    res.json(orders);
  } catch (err) {
    console.error("❌ Ошибка получения заказов:", err.message);
    res.status(500).json({ message: "Ошибка сервера" });
  }
});

// Изменение статуса заказа
router.patch("/:orderId/status", auth, async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;
    const order = await Order.findByIdAndUpdate(orderId, { status }, { new: true });
    res.json(order);
  } catch (err) {
    console.error("❌ Ошибка обновления статуса:", err.message);
    res.status(500).json({ message: "Ошибка сервера" });
  }
});

module.exports = router;
