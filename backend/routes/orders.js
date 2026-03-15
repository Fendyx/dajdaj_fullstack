// backend/routes/orders.js
const express = require("express");
const router = express.Router();
const Order = require("../models/order");
const auth = require("../middleware/auth");

// Админ: получение всех заказов
router.get("/", auth, async (req, res) => {
  try {
    const orders = await Order.find().populate("userId", "email name");
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: "Ошибка сервера" });
  }
});

// Публичный: получение заказа по токену (минимальные поля) — НЕ требует авторизации.
// Используется страницей checkout-success для polling.
router.get("/token/:orderToken", async (req, res) => {
  const { orderToken } = req.params;
  try {
    if (!orderToken) return res.status(400).json({ message: "Missing token" });

    const order = await Order.findOne({ orderToken }).lean().exec();
    if (!order) return res.status(404).json({ message: "Order not found" });

    // Возвращаем минимальный набор полей, достаточный для checkout-success
    return res.json({
      orderId: order._id,
      orderToken: order.orderToken,
      status: order.status,
      totalPrice: order.totalPrice,
      products: order.products,
      deliveryInfo: order.deliveryInfo,
      createdAt: order.createdAt,
      orderNumber: order.orderNumber,
    });
  } catch (err) {
    console.error("Order by token error:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

// Эндпоинт для поиска заказа по paymentIntentId (для отладки)
router.get("/payment-intent/:paymentIntentId", async (req, res) => {
  const { paymentIntentId } = req.params;
  try {
    const order = await Order.findOne({ paymentIntentId }).lean().exec();
    if (!order) return res.status(404).json({ message: "Order not found" });
    
    return res.json({
      orderId: order._id,
      orderToken: order.orderToken,
      status: order.status,
      paymentIntentId: order.paymentIntentId,
      orderNumber: order.orderNumber,
    });
  } catch (err) {
    console.error("Order by paymentIntentId error:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

// Защищённый: получение полного заказа — только владелец
router.get("/token/:orderToken/full", auth, async (req, res) => {
  const { orderToken } = req.params;
  try {
    const order = await Order.findOne({ orderToken }).populate("userId", "email name");
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Сравниваем owner id с id из токена авторизации
    const requesterId = String(req.user._id);
    const ownerId = String(order.userId);

    if (requesterId !== ownerId) {
      return res.status(403).json({ message: "Access denied" });
    }

    return res.json(order);
  } catch (err) {
    console.error("Error fetching full order by token:", err);
    return res.status(500).json({ message: "Internal server error" });
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
    res.status(500).json({ message: "Ошибка сервера" });
  }
});

// Добавьте этот роут в orders.js
const Stripe = require("stripe");
const stripe = Stripe(process.env.STRIPE_KEY);

// Эндпоинт для принудительной проверки статуса платежа
router.post("/:orderToken/check-payment", async (req, res) => {
  const { orderToken } = req.params;
  
  try {
    const order = await Order.findOne({ orderToken }).exec();
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    if (!order.paymentIntentId) {
      return res.status(400).json({ error: "No payment intent associated with this order" });
    }

    // Проверяем статус в Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(order.paymentIntentId);
    console.log(`🔍 Payment intent status: ${paymentIntent.status}`);

    if (paymentIntent.status === "succeeded" && order.status !== "paid") {
      // Обновляем статус заказа
      order.status = "paid";
      await order.save();
      console.log(`✅ Order ${orderToken} updated to paid based on Stripe status`);
    }

    return res.json({
      orderStatus: order.status,
      paymentIntentStatus: paymentIntent.status,
      orderId: order._id,
      paymentIntentId: order.paymentIntentId
    });

  } catch (err) {
    console.error("❌ Check payment error:", err);
    return res.status(500).json({ error: err.message });
  }
});

module.exports = router;