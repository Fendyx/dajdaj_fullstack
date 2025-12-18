const express = require("express");
const Stripe = require("stripe");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken"); // ✅ Добавили для ручной проверки токена
const products = require("../products");
const auth = require("../middleware/auth"); // Оставляем для защищенных роутов, если понадобятся
const Order = require("../models/order");
const sendOrderEmail = require("../utils/sendEmail");
require("dotenv").config();

const router = express.Router();
const stripe = Stripe(process.env.STRIPE_KEY);

// ✅ NEW: Middleware "Мягкой" авторизации
// Если токен есть и валиден -> req.user = user
// Если токена нет или он кривой -> req.user = null (но не 401 ошибка!)
const optionalAuth = (req, res, next) => {
  const token = req.header("Authorization")?.replace("Bearer ", ""); // или x-auth-token, смотря как шлешь
  
  if (!token) {
    req.user = null;
    return next();
  }

  try {
    // Убедись, что имя переменной секрета совпадает с тем, что в .env (обычно JWT_SECRET)
    const decoded = jwt.verify(token, process.env.JWT_SECRET); 
    req.user = decoded;
    next();
  } catch (err) {
    // Если токен протух, считаем юзера гостем, а не блокируем
    req.user = null; 
    next();
  }
};

// простой генератор токена заказа
function generateOrderToken() {
  return (
    Math.random().toString(36).slice(2, 14) +
    Math.random().toString(36).slice(2, 14)
  );
}

function parseAddress(rawAddress) {
  if (!rawAddress || typeof rawAddress !== "string") return {};
  const parts = rawAddress.split(",").map((p) => p.trim()).filter(Boolean);
  const postalCode = parts.at(-2) || "";
  const city = parts.at(-4) || "";
  const street = parts.slice(0, 2).reverse().join(" ");
  return { street, city, postalCode };
}

// Универсальная логика создания заказа в статусе pending
async function createPendingOrder({ userId, cartItems, deliveryInfo, orderToken, paymentIntentId }) {
  const productsFull = (cartItems || []).map((item) => {
    const product = products.find((p) => p.id === item.id);
    return {
      name: product?.name?.en || item.name || "Unknown",
      price: product?.price ?? item.price ?? 0,
      quantity: item.qty ?? item.quantity ?? 1,
      image: product?.image || item.image || "",
    };
  });

  const totalAmount = productsFull.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const orderNumber = `ORD-${new Date().toISOString().slice(0,10).replace(/-/g,'')}-${String(orderToken).slice(-4).toUpperCase()}`;

  const parsedAddress = parseAddress(deliveryInfo?.address || "");

  const order = new Order({
    // ✅ Исправлено: если userId null/undefined, mongoose это проигнорирует или запишет null
    userId: (userId && mongoose.Types.ObjectId.isValid(userId)) ? mongoose.Types.ObjectId(userId) : undefined,
    orderToken,
    orderNumber,
    paymentIntentId,
    products: productsFull,
    totalPrice: totalAmount,
    status: "pending",
    deliveryInfo: {
      method: deliveryInfo?.method || "",
      name: deliveryInfo?.name || "",
      phone: deliveryInfo?.phone || "",
      address: parsedAddress,
      email: deliveryInfo?.email || "",
    },
  });

  await order.save();
  console.log(`✅ Pending order created with token ${orderToken} (id: ${order._id})`);

  return order;
}

// Функция для проверки существующего заказа с такими же данными
async function findExistingOrder({ userId, cartItems, deliveryInfo }) {
  try {
    const cartHash = JSON.stringify(cartItems.map(item => ({
      id: item.id,
      qty: item.qty,
      price: item.price
    })).sort((a, b) => a.id.localeCompare(b.id)));

    const deliveryHash = JSON.stringify({
      name: deliveryInfo?.name,
      email: deliveryInfo?.email,
      phone: deliveryInfo?.phone,
      address: deliveryInfo?.address
    });

    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
    
    const existingOrders = await Order.find({
      // ✅ Исправлено: поиск учитывает гостей (userId: undefined/null)
      userId: (userId && mongoose.Types.ObjectId.isValid(userId)) ? mongoose.Types.ObjectId(userId) : { $exists: false },
      status: { $in: ["pending", "processing"] },
      createdAt: { $gte: tenMinutesAgo }
    }).exec();

    for (const order of existingOrders) {
      const orderCartHash = JSON.stringify(order.products.map(item => ({
        id: item.id,
        qty: item.quantity,
        price: item.price
      })).sort((a, b) => a.id.localeCompare(b.id)));

      const orderDeliveryHash = JSON.stringify({
        name: order.deliveryInfo?.name,
        email: order.deliveryInfo?.email,
        phone: order.deliveryInfo?.phone,
        address: order.deliveryInfo?.address ? 
          `${order.deliveryInfo.address.street}, ${order.deliveryInfo.address.city}, ${order.deliveryInfo.address.postalCode}` : ''
      });

      if (cartHash === orderCartHash && deliveryHash === orderDeliveryHash) {
        console.log(`🔍 Found existing order with same data: ${order._id}`);
        return order;
      }
    }

    return null;
  } catch (error) {
    console.error("❌ Error finding existing order:", error);
    return null;
  }
}

// ✅ ИЗМЕНЕНО: Умная проверка прав доступа
router.get("/order-status/:orderToken", optionalAuth, async (req, res) => {
  try {
    const { orderToken } = req.params;
    const order = await Order.findOne({ orderToken }).exec();
    
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    // --- 🔒 ЛОГИКА БЕЗОПАСНОСТИ ---

    // 1. Если заказ принадлежит зарегистрированному пользователю (есть userId)
    if (order.userId) {
      // Проверяем, авторизован ли тот, кто делает запрос
      if (!req.user) {
        // Если не залогинен -> 403 (Frontend должен перекинуть на логин)
        return res.status(403).json({ error: "Please login to view this order", requiresLogin: true });
      }
      
      // Если залогинен, но ID не совпадают (попытка подсмотреть чужой заказ)
      if (req.user._id !== order.userId.toString()) {
        return res.status(403).json({ error: "Access denied" });
      }
    }

    // 2. Если order.userId === undefined (Заказ Гостя)
    // Мы пропускаем к просмотру любого, у кого есть правильный orderToken.
    // OrderToken выступает в роли "ключа".
    
    // -------------------------------

    // Синхронизация статуса (оставляем как было)
    if (order.status === "pending" && order.paymentIntentId) {
      try {
        const paymentIntent = await stripe.paymentIntents.retrieve(order.paymentIntentId);
        
        if (paymentIntent.status === 'succeeded' && order.status !== 'paid') {
          order.status = 'paid';
          await order.save();
          
          if (order.deliveryInfo?.email) {
            try {
              await sendOrderEmail(order);
            } catch (e) {
              console.warn("⚠️ Failed to send email:", e.message);
            }
          }
        }
      } catch (stripeError) {
        console.warn(`⚠️ Could not check Stripe status: ${stripeError.message}`);
      }
    }

    res.json({
      status: order.status,
      orderToken: order.orderToken,
      orderNumber: order.orderNumber,
      paymentIntentId: order.paymentIntentId,
      totalPrice: order.totalPrice,
      products: order.products,
      deliveryInfo: order.deliveryInfo,
      createdAt: order.createdAt
    });
  } catch (err) {
    console.error("❌ Order status error:", err);
    res.status(500).json({ error: err.message });
  }
});

// ✅ ИЗМЕНЕНО: optionalAuth, так как запрос может идти с фронта гостя
router.post("/sync-payment-status", optionalAuth, async (req, res) => {
  try {
    const { paymentIntentId, orderToken } = req.body;
    
    console.log("🔄 Syncing payment status:", { paymentIntentId, orderToken });

    if (!paymentIntentId && !orderToken) {
      return res.status(400).json({ error: "paymentIntentId or orderToken required" });
    }

    let paymentIntent;
    if (paymentIntentId) {
      paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    }

    let order;
    if (orderToken) {
      order = await Order.findOne({ orderToken }).exec();
    } else if (paymentIntentId) {
      order = await Order.findOne({ paymentIntentId }).exec();
    }

    console.log("📊 Payment Intent status:", paymentIntent?.status);
    console.log("📊 Order status:", order?.status);

    let updated = false;
    if (order && paymentIntent) {
      if (paymentIntent.status === 'succeeded' && order.status !== 'paid') {
        order.status = 'paid';
        updated = true;
      } else if (paymentIntent.status === 'processing' && order.status !== 'processing') {
        order.status = 'processing';
        updated = true;
      } else if (paymentIntent.status === 'requires_payment_method' && order.status === 'pending') {
        order.status = 'failed';
        updated = true;
      }

      if (updated) {
        await order.save();
        console.log(`✅ Order ${order.orderToken} synced to ${order.status}`);
        
        if (order.status === 'paid' && order.deliveryInfo?.email) {
          try {
            await sendOrderEmail(order);
          } catch (e) {
            console.warn("⚠️ Failed to send email:", e.message);
          }
        }
      }
    }

    res.json({
      paymentIntentStatus: paymentIntent?.status,
      orderStatus: order?.status,
      orderToken: order?.orderToken,
      orderNumber: order?.orderNumber,
      synced: updated
    });

  } catch (err) {
    console.error("❌ Sync payment status error:", err);
    res.status(500).json({ error: err.message });
  }
});

// ✅ POST /create-payment-intent
// ИЗМЕНЕНО: Заменили 'auth' на 'optionalAuth'
router.post("/create-payment-intent", optionalAuth, async (req, res) => {
  try {
    console.log("📨 Incoming request to /create-payment-intent");
    const { cartItems, deliveryInfo } = req.body;
    
    // ✅ ИЗМЕНЕНО: Если юзера нет, userId будет undefined (или null)
    const userId = req.user?._id; 
    console.log("👤 User ID:", userId || "Guest");

    // ❌ УДАЛЕНО: Блок проверки if (!userId ...), который блокировал гостей

    if (!Array.isArray(cartItems) || cartItems.length === 0) {
      console.warn("⚠️ cartItems is missing or empty");
      return res.status(400).json({ error: "Missing or empty cartItems" });
    }

    const existingOrder = await findExistingOrder({ userId, cartItems, deliveryInfo });
    
    if (existingOrder && existingOrder.paymentIntentId) {
      console.log(`🔄 Reusing existing order: ${existingOrder._id} with paymentIntent: ${existingOrder.paymentIntentId}`);
      
      try {
        const existingPaymentIntent = await stripe.paymentIntents.retrieve(existingOrder.paymentIntentId);
        
        if (existingPaymentIntent.status === 'succeeded') {
          existingOrder.status = 'paid';
          await existingOrder.save();
          console.log(`✅ Existing order marked as paid: ${existingOrder._id}`);
        }

        return res.json({
          clientSecret: existingPaymentIntent.client_secret,
          orderToken: existingOrder.orderToken,
          paymentIntentId: existingOrder.paymentIntentId,
          reused: true
        });
      } catch (stripeError) {
        console.warn(`⚠️ Existing payment intent not found or invalid: ${stripeError.message}`);
      }
    }

    const orderToken = existingOrder ? existingOrder.orderToken : generateOrderToken();

    const productsFull = (cartItems || []).map((item) => {
      const p = products.find((pp) => pp.id === item.id);
      return {
        name: p?.name?.en || item.name || "Unknown",
        price: p?.price ?? item.price ?? 0,
        quantity: item.qty ?? item.quantity ?? 1,
      };
    });
    const totalAmount = productsFull.reduce((sum, it) => sum + it.price * it.quantity, 0);

    const parsed = parseAddress(deliveryInfo?.address || "");

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(totalAmount * 100),
      currency: "pln",
      payment_method_types: ["card", "blik"],
      metadata: {
        userId: userId ? userId.toString() : "guest", // ✅ Сохраняем "guest" если нет ID
        orderToken,
        delivery_name: `${deliveryInfo?.name || ""} ${deliveryInfo?.surname || ""}`.trim(),
        delivery_email: deliveryInfo?.email || "",
        delivery_phone: deliveryInfo?.phone || "",
        delivery_method: deliveryInfo?.method || "",
        delivery_street: parsed.street || "",
        delivery_city: parsed.city || "",
        delivery_postal: parsed.postalCode || "",
        cart: JSON.stringify(cartItems),
      },
    });

    console.log("✅ PaymentIntent created:", paymentIntent.id);

    if (existingOrder) {
      existingOrder.paymentIntentId = paymentIntent.id;
      await existingOrder.save();
      console.log(`✅ Existing order ${existingOrder._id} updated with new payment intent`);
    } else {
      await createPendingOrder({
        userId, // здесь может быть null
        cartItems,
        deliveryInfo,
        orderToken,
        paymentIntentId: paymentIntent.id
      });
    }

    return res.json({
      clientSecret: paymentIntent.client_secret,
      orderToken,
      paymentIntentId: paymentIntent.id,
      reused: !!existingOrder
    });
  } catch (err) {
    console.error("❌ PaymentIntent error:", err);
    return res.status(500).json({ error: err.message || "Server error" });
  }
});

router.get("/test", (req, res) => {
  console.log("🧪 /create-payment-intent test route hit");
  res.send("✅ /create-payment-intent route is alive and responding");
});

module.exports = router;