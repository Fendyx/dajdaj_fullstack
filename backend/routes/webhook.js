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

  console.log("📦 Webhook received from:", req.headers['host'] || req.headers['origin']);
  console.log("📦 Webhook user agent:", req.headers['user-agent']);
  console.log("📦 Webhook timestamp:", new Date().toISOString());

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    console.log("✅ Webhook verified:", event.type, "ID:", event.id);
  } catch (err) {
    console.error("❌ Webhook verification failed:", err?.message);
    console.error("❌ Webhook secret present:", !!process.env.STRIPE_WEBHOOK_SECRET);
    return res.status(400).send(`Webhook Error: ${err?.message}`);
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
        currency: paymentIntent.currency,
        status: paymentIntent.status
      });

      if (!orderToken) {
        console.warn("⚠️ No orderToken in payment intent metadata");
        return res.status(200).json({ received: true, processed: false, reason: "missing_order_token" });
      }

      // Ищем заказ по orderToken
      let order = await Order.findOne({ orderToken }).exec();

      if (!order) {
        console.error(`❌ Order not found for orderToken: ${orderToken}`);
        
        // Создаем новый заказ если не найден (резервный вариант)
        try {
          const userId = metadata.userId;
          const cartItems = JSON.parse(metadata.cart || '[]');
          const deliveryInfo = {
            name: metadata.delivery_name,
            phone: metadata.delivery_phone,
            method: metadata.delivery_method,
            address: `${metadata.delivery_street}, ${metadata.delivery_city}, ${metadata.delivery_postal}`,
            email: metadata.delivery_email
          };

          order = new Order({
            userId: mongoose.Types.ObjectId.isValid(userId) ? mongoose.Types.ObjectId(userId) : undefined,
            orderToken,
            orderNumber: `ORD-${new Date().toISOString().slice(0,10).replace(/-/g,'')}-${String(orderToken).slice(-4).toUpperCase()}`,
            paymentIntentId,
            products: cartItems.map(item => ({
              name: item.name || "Unknown",
              price: item.price || 0,
              quantity: item.qty || item.quantity || 1,
              image: item.image || "",
            })),
            totalPrice: paymentIntent.amount / 100,
            status: "paid",
            deliveryInfo: {
              method: deliveryInfo.method || "",
              name: deliveryInfo.name || "",
              phone: deliveryInfo.phone || "",
              address: {
                street: metadata.delivery_street || "",
                city: metadata.delivery_city || "",
                postalCode: metadata.delivery_postal || "",
              },
              email: deliveryInfo.email || "",
            },
          });

          await order.save();
          console.log(`🆕 Emergency order created for token ${orderToken}`);
        } catch (createError) {
          console.error("❌ Failed to create emergency order:", createError);
          return res.status(200).json({ 
            received: true, 
            processed: false, 
            reason: "order_creation_failed" 
          });
        }
      } else {
        // Обновляем существующий заказ
        if (order.status !== "paid") {
          order.status = "paid";
          order.paymentIntentId = paymentIntentId;
          await order.save();
          console.log(`✅ Order ${order.orderToken} updated to paid status`);
        } else {
          console.log(`ℹ️ Order ${order.orderToken} already paid`);
        }
      }

      // Отправляем письмо подтверждения
      await trySendOrderEmail(order);

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
        orderToken,
        failure_message: paymentIntent.last_payment_error?.message
      });

      if (orderToken) {
        const order = await Order.findOne({ orderToken }).exec();
        if (order && order.status !== "canceled") {
          order.status = "failed";
          order.paymentError = paymentIntent.last_payment_error?.message || "Payment failed";
          await order.save();
          console.log(`🔴 Order ${order.orderToken} marked as failed`);
        }
      }
    }

    // Обрабатываем processing платежи
    if (event.type === "payment_intent.processing") {
      const paymentIntent = event.data.object;
      const orderToken = paymentIntent.metadata?.orderToken;
      
      console.log("🔄 Payment processing:", {
        paymentIntentId: paymentIntent.id,
        orderToken
      });

      if (orderToken) {
        const order = await Order.findOne({ orderToken }).exec();
        if (order && order.status === "pending") {
          order.status = "processing";
          await order.save();
          console.log(`🔄 Order ${order.orderToken} marked as processing`);
        }
      }
    }

    console.log(`ℹ️ Webhook processed event type: ${event.type}`);
    return res.status(200).json({ received: true, processed: true });

  } catch (err) {
    console.error("❌ Webhook processing error:", err);
    return res.status(500).json({ error: "Internal webhook error" });
  }
});

// Эндпоинт для принудительной синхронизации статуса
router.post("/sync-payment", express.json(), async (req, res) => {
  try {
    const { paymentIntentId, orderToken } = req.body;
    
    console.log("🔄 Manual payment sync:", { paymentIntentId, orderToken });

    if (!paymentIntentId && !orderToken) {
      return res.status(400).json({ error: "paymentIntentId or orderToken required" });
    }

    let order;
    if (orderToken) {
      order = await Order.findOne({ orderToken }).exec();
    }

    // Если есть paymentIntentId, проверяем статус в Stripe
    let paymentIntent;
    if (paymentIntentId) {
      paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
      console.log("📊 Stripe payment status:", paymentIntent.status);
    }

    // Синхронизируем статус
    if (order) {
      let updated = false;
      
      if (paymentIntent) {
        if (paymentIntent.status === 'succeeded' && order.status !== 'paid') {
          order.status = 'paid';
          updated = true;
        } else if (paymentIntent.status === 'processing' && order.status !== 'processing') {
          order.status = 'processing';
          updated = true;
        } else if (paymentIntent.status === 'requires_payment_method' && order.status !== 'failed') {
          order.status = 'failed';
          updated = true;
        }
      }

      if (updated) {
        await order.save();
        console.log(`✅ Order ${order.orderToken} synced to ${order.status}`);
        
        // Отправляем email если платеж успешен
        if (order.status === 'paid') {
          await trySendOrderEmail(order);
        }
      }
    }

    res.json({
      paymentIntentStatus: paymentIntent?.status,
      orderStatus: order?.status,
      orderToken: order?.orderToken,
      synced: !!updated
    });

  } catch (err) {
    console.error("❌ Payment sync error:", err);
    res.status(500).json({ error: err.message });
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
    timestamp: new Date().toISOString(),
    stripe_key: process.env.STRIPE_KEY ? "set" : "missing",
    webhook_secret: process.env.STRIPE_WEBHOOK_SECRET ? "set" : "missing",
    url: `${req.protocol}://${req.get('host')}${req.originalUrl}`
  });
});

// Тестовый эндпоинт для проверки доступности
router.get("/webhook-test-endpoint", (req, res) => {
  res.json({
    message: "Webhook endpoint is reachable",
    timestamp: new Date().toISOString(),
    url: `${req.protocol}://${req.get('host')}${req.originalUrl}`
  });
});

module.exports = router;