// backend/routes/webhook.js
const express = require("express");
const Stripe = require("stripe");
const mongoose = require("mongoose");
const Order = require("../models/order");
const sendOrderEmail = require("../utils/sendEmail");
require("dotenv").config();

const router = express.Router();
const stripe = Stripe(process.env.STRIPE_KEY);

// Отдельная функция отправки письма с защитой ошибок
async function trySendOrderEmail(order) {
  if (!order?.deliveryInfo?.email) return;
  try {
    await sendOrderEmail(order);
    console.log(`✅ Confirmation email sent to ${order.deliveryInfo.email}`);
  } catch (e) {
    console.warn("⚠️ Failed to send order email:", e.message);
  }
}

// Webhook endpoint
router.post("/webhook", express.raw({ type: "application/json" }), async (req, res) => {
  const sig = req.headers["stripe-signature"];
  let event;

  console.log("📦 Webhook received, verifying signature...");

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    console.log("✅ Webhook signature verified:", event.type);
  } catch (err) {
    console.error("❌ Webhook signature verification failed:", err?.message || err);
    return res.status(400).send(`Webhook Error: ${err?.message || "Invalid signature"}`);
  }

  try {
    // Обрабатываем успешные платежи
    if (event.type === "payment_intent.succeeded") {
      const paymentIntent = event.data.object;
      const paymentIntentId = paymentIntent.id;
      const metadata = paymentIntent.metadata || {};
      const orderToken = metadata.orderToken;

      console.log("💰 Payment succeeded:", {
        paymentIntentId,
        orderToken,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency
      });

      if (!orderToken) {
        console.warn("⚠️ No orderToken in payment intent metadata");
        return res.status(200).json({ received: true, processed: false, reason: "missing_order_token" });
      }

      // Ищем заказ по orderToken - ДОЛЖЕН УЖЕ СУЩЕСТВОВАТЬ
      let order = await Order.findOne({ orderToken }).exec();

      if (!order) {
        console.error(`❌ Order not found for orderToken: ${orderToken} - order should have been created in create-payment-intent`);
        
        // НЕ создаем новый заказ, только логируем ошибку
        return res.status(200).json({ 
          received: true, 
          processed: false, 
          reason: "order_not_found",
          message: "Order should have been created before payment"
        });
      }

      // Обновляем существующий заказ
      if (order.status !== "paid") {
        order.status = "paid";
        order.paymentIntentId = paymentIntentId; // убедимся что paymentIntentId установлен
        await order.save();
        console.log(`✅ Order ${order.orderToken} updated to paid status`);
        
        // Отправляем письмо подтверждения
        await trySendOrderEmail(order);
      } else {
        console.log(`ℹ️ Order ${order.orderToken} already paid`);
      }

      return res.status(200).json({ 
        received: true, 
        processed: true, 
        orderId: order._id,
        status: order.status 
      });
    }

    // Обрабатываем failed платежи
    if (event.type === "payment_intent.payment_failed") {
      const paymentIntent = event.data.object;
      const paymentIntentId = paymentIntent.id;
      const metadata = paymentIntent.metadata || {};
      const orderToken = metadata.orderToken;

      console.log("❌ Payment failed:", {
        paymentIntentId,
        orderToken
      });

      if (orderToken) {
        const order = await Order.findOne({ orderToken }).exec();
        if (order && order.status !== "canceled") {
          order.status = "pending"; // или "failed" в зависимости от вашей логики
          await order.save();
          console.log(`🔄 Order ${order.orderToken} marked as pending due to payment failure`);
        }
      }
    }

    // Обрабатываем другие типы событий если нужно
    console.log(`ℹ️ Ignoring event type: ${event.type}`);
    return res.status(200).json({ received: true, ignored: true });

  } catch (err) {
    console.error("❌ Webhook processing error:", err);
    return res.status(500).json({ error: "Internal webhook error" });
  }
});

// Тестовый эндпоинт для ручного обновления статуса заказа
router.post("/webhook-test", express.json(), async (req, res) => {
  console.log("🧪 Manual webhook test received:", req.body);
  
  try {
    const { orderToken, paymentIntentId } = req.body;
    
    if (!orderToken) {
      return res.status(400).json({ error: "orderToken is required" });
    }

    const order = await Order.findOne({ orderToken }).exec();
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    console.log(`🔄 Manually updating order ${orderToken} to paid status`);
    order.status = "paid";
    if (paymentIntentId) {
      order.paymentIntentId = paymentIntentId;
    }
    await order.save();

    // Отправляем email
    await trySendOrderEmail(order);

    console.log(`✅ Order ${orderToken} manually updated to paid`);
    
    return res.json({ 
      success: true, 
      orderId: order._id,
      status: order.status,
      orderToken: order.orderToken
    });
  } catch (err) {
    console.error("❌ Manual webhook test error:", err);
    return res.status(500).json({ error: err.message });
  }
});

// Эндпоинт для проверки статуса вебхука
router.get("/webhook-status", (req, res) => {
  res.json({ 
    status: "active", 
    stripe_key: process.env.STRIPE_KEY ? "set" : "missing",
    webhook_secret: process.env.STRIPE_WEBHOOK_SECRET ? "set" : "missing" 
  });
});

module.exports = router;