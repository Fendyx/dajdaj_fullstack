const express = require("express");
const Stripe = require("stripe");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken"); 
const Joi = require("joi");
const products = require("../products");
// const auth = require("../middleware/auth"); // Не используется здесь напрямую
const Order = require("../models/order");
const sendOrderEmail = require("../utils/sendEmail");
require("dotenv").config();

const router = express.Router();
const stripe = Stripe(process.env.STRIPE_KEY);


const deliveryInfoSchema = Joi.object({
  name: Joi.string().min(2).max(50).required(),
  phone: Joi.string().pattern(/^\+?[\d\s\-]{7,20}$/).required(),
  email: Joi.string().email().required(),
  address: Joi.string().min(5).max(200).allow("", null),
  method: Joi.string().max(50).allow("", null),
  city: Joi.string().max(100).allow("", null),
  postal_code: Joi.string().max(20).allow("", null),
  surname: Joi.string().max(50).allow("", null),
}).unknown(true); // unknown(true) — разрешаем доп поля которые могут быть

// ✅ ИСПРАВЛЕННЫЙ Middleware "Мягкой" авторизации
// Теперь проверяет правильный ключ и не падает молча
const optionalAuth = (req, res, next) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");
  
  if (!token) {
    req.user = null;
    return next();
  }

  try {
    // ⚠️ ВАЖНО: Используем тот же ключ, что и при создании токена
    const secret = process.env.JWT_SECRET_KEY || process.env.JWT_SECRET;
    
    if (!secret) {
      console.error("❌ CRITICAL: JWT_SECRET_KEY is missing in .env");
    }

    const decoded = jwt.verify(token, secret); 
    req.user = decoded;
    console.log("🔑 Token verified for user:", decoded._id || decoded.id);
    next();
  } catch (err) {
    console.warn(`⚠️ Token validation failed (User treated as Guest): ${err.message}`);
    req.user = null; 
    next();
  }
};

// Генератор токена для заказа
function generateOrderToken() {
  return (
    Math.random().toString(36).slice(2, 14) +
    Math.random().toString(36).slice(2, 14)
  );
}

// Парсер адреса
function parseAddress(rawAddress) {
  if (!rawAddress || typeof rawAddress !== "string") return {};
  const parts = rawAddress.split(",").map((p) => p.trim()).filter(Boolean);
  const postalCode = parts.at(-2) || "";
  const city = parts.at(-4) || "";
  const street = parts.slice(0, 2).reverse().join(" ");
  return { street, city, postalCode };
}

// Создание заказа в статусе pending
async function createPendingOrder({ userId, cartItems, deliveryInfo, orderToken, paymentIntentId }) {
  const productsFull = (cartItems || []).map((item) => {    
    const product = products.find((p) => p.id === item.id);

    return {
      id: item.id,
      name: product?.name?.en || item.name || "Unknown",
      price: product?.price ?? item.price ?? 0,
      quantity: item.qty ?? item.quantity ?? 1,
      image: product?.image || item.image || "",
      personalOrderId: item.personalOrderId || null 
    };
  });

  const totalAmount = productsFull.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const orderNumber = `ORD-${new Date().toISOString().slice(0,10).replace(/-/g,'')}-${String(orderToken).slice(-4).toUpperCase()}`;

  const parsedAddress = parseAddress(deliveryInfo?.address || "");

  const order = new Order({
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
  console.log(`✅ Pending order created. User: ${userId || "Guest"}, ID: ${order._id}`);

  return order;
}

// Поиск существующего заказа (чтобы не дублировать, если юзер нажал "Назад")
async function findExistingOrder({ userId, cartItems, deliveryInfo }) {
  try {
    const cartHash = JSON.stringify(cartItems.map(item => ({
      id: item.id,
      qty: item.qty,
      price: item.price,
      personalOrderId: item.personalOrderId || null 
    })).sort((a, b) => a.id.localeCompare(b.id)));

    const deliveryHash = JSON.stringify({
      name: deliveryInfo?.name,
      email: deliveryInfo?.email,
      phone: deliveryInfo?.phone,
      address: deliveryInfo?.address
    });

    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
    
    const existingOrders = await Order.find({
      userId: (userId && mongoose.Types.ObjectId.isValid(userId)) ? mongoose.Types.ObjectId(userId) : { $exists: false },
      status: { $in: ["pending", "processing"] },
      createdAt: { $gte: tenMinutesAgo }
    }).exec();

    for (const order of existingOrders) {
      const orderCartHash = JSON.stringify(order.products.map(item => ({
        id: item.id,
        qty: item.quantity,
        price: item.price,
        personalOrderId: item.personalOrderId || null 
      })).sort((a, b) => a.id.localeCompare(b.id)));

      const orderDeliveryHash = JSON.stringify({
        name: order.deliveryInfo?.name,
        email: order.deliveryInfo?.email,
        phone: order.deliveryInfo?.phone,
        address: order.deliveryInfo?.address ? 
          `${order.deliveryInfo.address.street}, ${order.deliveryInfo.address.city}, ${order.deliveryInfo.address.postalCode}` : ''
      });

      if (cartHash === orderCartHash && deliveryHash === orderDeliveryHash) {
        console.log(`🔍 Found existing order to reuse: ${order._id}`);
        return order;
      }
    }

    return null;
  } catch (error) {
    console.error("❌ Error finding existing order:", error);
    return null;
  }
}

// ==========================================
// ОСНОВНОЙ РОУТ: /create-payment-intent
// ==========================================
router.post("/create-payment-intent", optionalAuth, async (req, res) => {
  try {
    console.log("📨 Incoming request to /create-payment-intent");
    const { cartItems, deliveryInfo } = req.body;

    // ✅ Валидация deliveryInfo
    const { error } = deliveryInfoSchema.validate(deliveryInfo);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }
    
    // ✅ ИСПРАВЛЕНИЕ: Надежное получение ID (поддержка и _id и id)
    const userId = req.user?._id || req.user?.id;
    console.log("👤 User Context:", userId ? `Registered (${userId})` : "Guest");

    if (!Array.isArray(cartItems) || cartItems.length === 0) {
      console.warn("⚠️ cartItems is missing or empty");
      return res.status(400).json({ error: "Missing or empty cartItems" });
    }

    const existingOrder = await findExistingOrder({ userId, cartItems, deliveryInfo });
    
    if (existingOrder && existingOrder.paymentIntentId) {
      console.log(`🔄 Reusing existing order: ${existingOrder._id}`);
      
      try {
        const existingPaymentIntent = await stripe.paymentIntents.retrieve(existingOrder.paymentIntentId);
        
        if (existingPaymentIntent.status === 'succeeded') {
          existingOrder.status = 'paid';
          await existingOrder.save();
        }

        return res.json({
          clientSecret: existingPaymentIntent.client_secret,
          orderToken: existingOrder.orderToken,
          paymentIntentId: existingOrder.paymentIntentId,
          reused: true
        });
      } catch (stripeError) {
        console.warn(`⚠️ Existing payment intent not found: ${stripeError.message}`);
      }
    }

    const orderToken = existingOrder ? existingOrder.orderToken : generateOrderToken();

    // Расчет суммы (берем цены из базы для безопасности)
    const productsFull = (cartItems || []).map((item) => {
      const p = products.find((pp) => pp.id === item.id);
      return {
        price: p?.price ?? item.price ?? 0,
        quantity: item.qty ?? item.quantity ?? 1,
      };
    });
    const totalAmount = productsFull.reduce((sum, it) => sum + it.price * it.quantity, 0);
    
    // Минимальная сумма Stripe для PLN ~2.00
    const finalAmount = Math.max(Math.round(totalAmount * 100), 200); 

    const parsed = parseAddress(deliveryInfo?.address || "");

    // Создаем Intent в Stripe
    const paymentIntent = await stripe.paymentIntents.create({
      amount: finalAmount,
      currency: "pln",
      payment_method_types: ["card", "blik", "p24", "klarna"],
      metadata: {
        userId: userId ? userId.toString() : "guest", // ✅ Теперь здесь будет реальный ID
        orderToken,
        delivery_email: deliveryInfo?.email || "",
      },
    });

    console.log("✅ Stripe PaymentIntent created:", paymentIntent.id);

    if (existingOrder) {
      existingOrder.paymentIntentId = paymentIntent.id;
      await existingOrder.save();
    } else {
      await createPendingOrder({
        userId,
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

// GET /order-status/:orderToken
router.get("/order-status/:orderToken", optionalAuth, async (req, res) => {
  try {
    const { orderToken } = req.params;
    const order = await Order.findOne({ orderToken }).exec();
    
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    if (order.userId) {
      // Если у заказа есть хозяин, проверяем, тот ли это юзер
      if (!req.user) {
        return res.status(403).json({ error: "Please login", requiresLogin: true });
      }
      const requestUserId = req.user._id || req.user.id;
      if (requestUserId.toString() !== order.userId.toString()) {
        return res.status(403).json({ error: "Access denied" });
      }
    }

    if (order.status === "pending" && order.paymentIntentId) {
      try {
        const paymentIntent = await stripe.paymentIntents.retrieve(order.paymentIntentId);
        if (paymentIntent.status === 'succeeded' && order.status !== 'paid') {
          order.status = 'paid';
          await order.save();
          if (order.deliveryInfo?.email) await sendOrderEmail(order).catch(console.warn);
        }
      } catch (e) {
        console.warn(`Status sync warning: ${e.message}`);
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
    res.status(500).json({ error: err.message });
  }
});

// POST /sync-payment-status
router.post("/sync-payment-status", optionalAuth, async (req, res) => {
  try {
    const { paymentIntentId, orderToken } = req.body;
    let order;

    if (orderToken) order = await Order.findOne({ orderToken }).exec();
    else if (paymentIntentId) order = await Order.findOne({ paymentIntentId }).exec();

    if (!order) return res.json({ synced: false });

    if (order.status !== 'paid' && paymentIntentId) {
       const pi = await stripe.paymentIntents.retrieve(paymentIntentId);
       if (pi.status === 'succeeded') {
         order.status = 'paid';
         await order.save();
         if (order.deliveryInfo?.email) await sendOrderEmail(order).catch(console.warn);
         return res.json({ synced: true, orderStatus: 'paid' });
       }
    }
    
    res.json({ synced: false, orderStatus: order.status });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/test", (req, res) => res.send("✅ /create-payment-intent route is alive"));

module.exports = router;