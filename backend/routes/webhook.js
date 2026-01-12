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

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    console.log("✅ Webhook verified:", event.type);
  } catch (err) {
    console.error("❌ Webhook verification failed:", err?.message);
    return res.status(400).send(`Webhook Error: ${err?.message}`);
  }

  try {
    // Обрабатываем успешные платежи
    if (event.type === "payment_intent.succeeded") {
      const paymentIntent = event.data.object;
      const paymentIntentId = paymentIntent.id;
      const metadata = paymentIntent.metadata || {};
      const orderToken = metadata.orderToken;

      console.log("💰 Payment succeeded for:", orderToken);

      if (!orderToken) {
        return res.status(200).json({ received: true, processed: false, reason: "missing_order_token" });
      }

      // Ищем заказ по orderToken
      let order = await Order.findOne({ orderToken }).exec();

      if (!order) {
        console.error(`❌ Order not found for token: ${orderToken}. Creating Emergency Order...`);
        
        // --- 🚨 АВАРИЙНОЕ СОЗДАНИЕ ЗАКАЗА ---
        try {
          const userId = metadata.userId === "guest" ? undefined : metadata.userId;
          const cartItems = JSON.parse(metadata.cart || '[]');
          
          const deliveryInfo = {
            name: metadata.delivery_name,
            phone: metadata.delivery_phone,
            method: metadata.delivery_method,
            address: `${metadata.delivery_street}, ${metadata.delivery_city}, ${metadata.delivery_postal}`,
            email: metadata.delivery_email
          };

          order = new Order({
            userId: (userId && mongoose.Types.ObjectId.isValid(userId)) ? mongoose.Types.ObjectId(userId) : undefined,
            orderToken,
            orderNumber: `ORD-${new Date().toISOString().slice(0,10).replace(/-/g,'')}-${String(orderToken).slice(-4).toUpperCase()}`,
            paymentIntentId,
            products: cartItems.map(item => ({
              id: item.id, // Сохраняем ID товара
              name: item.name || "Unknown",
              price: item.price || 0,
              quantity: item.qty || item.quantity || 1,
              image: item.image || "",
              // 👇 ГЛАВНОЕ ИСПРАВЛЕНИЕ ЗДЕСЬ 👇
              personalOrderId: item.personalOrderId || null 
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
          console.log(`🆕 Emergency order created successfully with ID: ${order._id}`);
        } catch (createError) {
          console.error("❌ Failed to create emergency order:", createError);
          return res.status(200).json({ received: true, processed: false, reason: "creation_failed" });
        }
      } else {
        // Заказ найден - просто обновляем статус
        if (order.status !== "paid") {
          order.status = "paid";
          order.paymentIntentId = paymentIntentId;
          await order.save();
          console.log(`✅ Order updated to PAID`);
        }
      }

      await trySendOrderEmail(order);
      return res.status(200).json({ received: true, processed: true, orderId: order._id });
    }

    // Обработка остальных событий (Failed / Processing)
    if (event.type === "payment_intent.payment_failed") {
      const paymentIntent = event.data.object;
      const orderToken = paymentIntent.metadata?.orderToken;
      if (orderToken) {
        await Order.updateOne({ orderToken }, { status: "failed" });
        console.log(`🔴 Order ${orderToken} marked as failed`);
      }
    }

    if (event.type === "payment_intent.processing") {
      const paymentIntent = event.data.object;
      const orderToken = paymentIntent.metadata?.orderToken;
      if (orderToken) {
        await Order.updateOne({ orderToken }, { status: "processing" });
        console.log(`🔄 Order ${orderToken} marked as processing`);
      }
    }

    return res.status(200).json({ received: true });

  } catch (err) {
    console.error("❌ Webhook fatal error:", err);
    return res.status(500).json({ error: "Webhook error" });
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


// ✅ НОВЫЙ РОУТ: Тест отправки почты (без покупки)
// Вызови в браузере: http://localhost:3000/api/webhook/test-email?email=tvoy@email.com
router.get("/test-email", async (req, res) => {
  const targetEmail = req.query.email;

  if (!targetEmail) {
    return res.status(400).send("❌ Укажите email в параметрах. Пример: /test-email?email=test@test.com");
  }

  console.log(`📧 Testing email sending to: ${targetEmail}`);

  // Создаем фейковый объект заказа для теста
  const fakeOrder = {
    _id: "TEST-ID-123",
    orderNumber: "TEST-ORDER-001",
    totalPrice: 999,
    products: [
      { name: "Test Product A", quantity: 1, price: 500 },
      { name: "Test Product B", quantity: 2, price: 249.5 }
    ],
    deliveryInfo: {
      name: "Test User",
      method: "Courier",
      phone: "123-456-789",
      address: { city: "Warsaw", street: "Testowa 1" },
      email: targetEmail // 👈 Используем email из запроса
    }
  };

  try {
    // Пробуем отправить
    await sendOrderEmail(fakeOrder);
    res.send(`✅ Письмо успешно отправлено на ${targetEmail}. Проверь папку Спам!`);
  } catch (err) {
    console.error("❌ Email Test Failed:", err);
    res.status(500).send(`❌ Ошибка отправки: ${err.message}. Смотри консоль сервера.`);
  }
});

module.exports = router;