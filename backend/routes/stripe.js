const express = require("express");
const Stripe = require("stripe");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const products = require("../products");
const Order = require("../models/order");
const sendOrderEmail = require("../utils/sendEmail"); // Убедись, что путь верный
require("dotenv").config();

const router = express.Router();
const stripe = Stripe(process.env.STRIPE_KEY);

// ✅ 1. Middleware "Мягкой" авторизации
const optionalAuth = (req, res, next) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");
  
  if (!token) {
    req.user = null;
    return next();
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET); 
    req.user = decoded;
    next();
  } catch (err) {
    req.user = null; 
    next();
  }
};

// Вспомогательные функции
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

// Создание заказа (Pending)
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

  // Формат номера заказа: ORD-YYYYMMDD-XXXX
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
      surname: deliveryInfo?.surname || "",
      phone: deliveryInfo?.phone || "",
      address: parsedAddress,
      email: deliveryInfo?.email || "",
    },
  });

  await order.save();
  console.log(`📝 Pending order created: ${orderNumber} (ID: ${order._id})`);
  return order;
}

// Поиск дубликата заказа (чтобы не создавать новый при повторном клике)
async function findExistingOrder({ userId, cartItems, deliveryInfo }) {
  try {
    const cartHash = JSON.stringify(cartItems.map(item => ({ id: item.id, qty: item.qty })).sort((a, b) => a.id.localeCompare(b.id)));
    const deliveryHash = JSON.stringify({ name: deliveryInfo?.name, email: deliveryInfo?.email }); // Упростили хеш для скорости

    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
    
    const existingOrders = await Order.find({
      userId: (userId && mongoose.Types.ObjectId.isValid(userId)) ? mongoose.Types.ObjectId(userId) : { $exists: false },
      status: { $in: ["pending", "processing"] },
      createdAt: { $gte: tenMinutesAgo }
    }).exec();

    for (const order of existingOrders) {
      const orderCartHash = JSON.stringify(order.products.map(item => ({ id: item.id, qty: item.quantity })).sort((a, b) => a.id.localeCompare(b.id)));
      const orderDeliveryHash = JSON.stringify({ name: order.deliveryInfo?.name, email: order.deliveryInfo?.email });

      if (cartHash === orderCartHash && deliveryHash === orderDeliveryHash) {
        return order;
      }
    }
    return null;
  } catch (error) {
    console.error("❌ Error finding existing order:", error);
    return null;
  }
}

// ✅ 2. Основной роут создания платежа
router.post("/create-payment-intent", optionalAuth, async (req, res) => {
  try {
    const { cartItems, deliveryInfo } = req.body;
    const userId = req.user?._id; 
    
    console.log(`💳 Creating PaymentIntent for User: ${userId || "Guest"}`);

    if (!Array.isArray(cartItems) || cartItems.length === 0) {
      return res.status(400).json({ error: "Cart is empty" });
    }

    // 1. Проверяем, есть ли уже такой заказ (pending), чтобы не плодить дубли
    const existingOrder = await findExistingOrder({ userId, cartItems, deliveryInfo });
    
    if (existingOrder && existingOrder.paymentIntentId) {
      try {
        const existingPaymentIntent = await stripe.paymentIntents.retrieve(existingOrder.paymentIntentId);
        
        // Если заказ уже оплачен
        if (existingPaymentIntent.status === 'succeeded') {
          if (existingOrder.status !== 'paid') {
            existingOrder.status = 'paid';
            await existingOrder.save();
            // Попытка отправить письмо, если вдруг не ушло
            sendOrderEmail(existingOrder).catch(err => console.error("Email err:", err.message));
          }
        }

        console.log(`♻️ Reusing existing order: ${existingOrder.orderNumber}`);
        return res.json({
          clientSecret: existingPaymentIntent.client_secret,
          orderToken: existingOrder.orderToken,
          paymentIntentId: existingOrder.paymentIntentId,
          reused: true
        });
      } catch (e) {
        console.warn("⚠️ Old PaymentIntent invalid, creating new one.");
      }
    }

    // 2. Если заказа нет или старый протух — создаем новый
    const orderToken = generateOrderToken();

    // Считаем сумму на сервере (безопасность!)
    const productsFull = (cartItems || []).map((item) => {
      const p = products.find((pp) => pp.id === item.id);
      return {
        price: p?.price ?? item.price ?? 0,
        quantity: item.qty ?? item.quantity ?? 1,
      };
    });
    const totalAmount = productsFull.reduce((sum, it) => sum + it.price * it.quantity, 0);

    const parsed = parseAddress(deliveryInfo?.address || "");
    
    // ВАЖНО: Stripe metadata имеет лимит 500 символов на поле. Cart может быть длинным.
    // Обрезаем cart, если он слишком длинный, чтобы не получить ошибку от Stripe
    let cartString = JSON.stringify(cartItems);
    if (cartString.length > 490) cartString = cartString.substring(0, 490) + "...";

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(totalAmount * 100),
      currency: "pln",
      payment_method_types: ["card", "blik"],
      metadata: {
        userId: userId ? userId.toString() : "guest",
        orderToken,
        delivery_email: deliveryInfo?.email || "",
        // cart: cartString // Можно убрать, если полагаемся на БД, чтобы избежать ошибок длины
      },
    });

    // 3. Сохраняем заказ в БД
    await createPendingOrder({
      userId,
      cartItems,
      deliveryInfo,
      orderToken,
      paymentIntentId: paymentIntent.id
    });

    res.json({
      clientSecret: paymentIntent.client_secret,
      orderToken,
      paymentIntentId: paymentIntent.id,
      reused: false
    });

  } catch (err) {
    console.error("❌ Create Payment Intent Error:", err);
    res.status(500).json({ error: err.message });
  }
});

// ✅ 3. Роут Синхронизации (вызывается фронтендом на success-page)
router.post("/sync-payment-status", optionalAuth, async (req, res) => {
  try {
    const { paymentIntentId, orderToken } = req.body;
    
    // Ищем заказ
    let order;
    if (orderToken) order = await Order.findOne({ orderToken }).exec();
    else if (paymentIntentId) order = await Order.findOne({ paymentIntentId }).exec();

    if (!order) return res.status(404).json({ error: "Order not found" });

    // Если заказ уже оплачен в БД — просто отдаем статус (письмо уже должно было уйти через webhook)
    if (order.status === 'paid') {
      return res.json({ status: 'paid', synced: false });
    }

    // Если в БД не оплачен — спрашиваем Stripe напрямую
    if (order.paymentIntentId) {
      const paymentIntent = await stripe.paymentIntents.retrieve(order.paymentIntentId);
      
      if (paymentIntent.status === 'succeeded') {
        order.status = 'paid';
        await order.save();
        console.log(`✅ Sync: Order ${order.orderNumber} marked as PAID via Frontend Sync`);
        
        // Отправляем письмо (т.к. статус изменился только что)
        try {
          await sendOrderEmail(order);
          console.log("📧 Email sent via Sync");
        } catch (e) {
          console.error("⚠️ Email send failed in sync:", e.message);
        }
        
        return res.json({ status: 'paid', synced: true });
      }
    }

    res.json({ status: order.status, synced: false });

  } catch (err) {
    console.error("❌ Sync Error:", err);
    res.status(500).json({ error: err.message });
  }
});

// ✅ 4. Получение статуса заказа (для страницы просмотра заказа)
router.get("/order-status/:orderToken", optionalAuth, async (req, res) => {
  try {
    const { orderToken } = req.params;
    const order = await Order.findOne({ orderToken }).exec();
    
    if (!order) return res.status(404).json({ error: "Order not found" });

    // Проверка прав: Если у заказа есть UserID, проверяем, тот ли это юзер
    if (order.userId) {
      if (!req.user || req.user._id !== order.userId.toString()) {
        return res.status(403).json({ error: "Access denied" });
      }
    }
    // Если order.userId нет (гость), пускаем всех, кто знает секретный orderToken

    res.json({
      status: order.status,
      orderNumber: order.orderNumber,
      products: order.products,
      totalPrice: order.totalPrice,
      deliveryInfo: order.deliveryInfo,
      createdAt: order.createdAt
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;