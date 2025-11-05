const express = require("express");
const Stripe = require("stripe");
const mongoose = require("mongoose");
const products = require("../products");
const auth = require("../middleware/auth");
const Order = require("../models/order");
const sendOrderEmail = require("../utils/sendEmail");
require("dotenv").config();

const router = express.Router();
const stripe = Stripe(process.env.STRIPE_KEY);

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
    userId: mongoose.Types.ObjectId.isValid(userId) ? mongoose.Types.ObjectId(userId) : undefined,
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
    // Создаем хеш корзины для сравнения
    const cartHash = JSON.stringify(cartItems.map(item => ({
      id: item.id,
      qty: item.qty,
      price: item.price
    })).sort((a, b) => a.id.localeCompare(b.id)));

    // Создаем хеш данных доставки
    const deliveryHash = JSON.stringify({
      name: deliveryInfo?.name,
      email: deliveryInfo?.email,
      phone: deliveryInfo?.phone,
      address: deliveryInfo?.address
    });

    // Ищем заказы за последние 10 минут с такими же данными
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
    
    const existingOrders = await Order.find({
      userId: mongoose.Types.ObjectId.isValid(userId) ? mongoose.Types.ObjectId(userId) : undefined,
      status: { $in: ["pending", "processing"] },
      createdAt: { $gte: tenMinutesAgo }
    }).exec();

    for (const order of existingOrders) {
      // Сравниваем корзину
      const orderCartHash = JSON.stringify(order.products.map(item => ({
        id: item.id,
        qty: item.quantity,
        price: item.price
      })).sort((a, b) => a.id.localeCompare(b.id)));

      // Сравниваем доставку
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

// Эндпоинт для проверки статуса заказа
router.get("/order-status/:orderToken", auth, async (req, res) => {
  try {
    const { orderToken } = req.params;
    const order = await Order.findOne({ orderToken }).exec();
    
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    // Если заказ pending, проверяем статус в Stripe
    if (order.status === "pending" && order.paymentIntentId) {
      try {
        const paymentIntent = await stripe.paymentIntents.retrieve(order.paymentIntentId);
        console.log(`🔄 Checking Stripe status for ${orderToken}: ${paymentIntent.status}`);
        
        if (paymentIntent.status === 'succeeded' && order.status !== 'paid') {
          order.status = 'paid';
          await order.save();
          console.log(`✅ Order ${orderToken} updated to paid from Stripe status`);
          
          // Отправляем email
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

// Эндпоинт для синхронизации статуса платежа
router.post("/sync-payment-status", auth, async (req, res) => {
  try {
    const { paymentIntentId, orderToken } = req.body;
    
    console.log("🔄 Syncing payment status:", { paymentIntentId, orderToken });

    if (!paymentIntentId && !orderToken) {
      return res.status(400).json({ error: "paymentIntentId or orderToken required" });
    }

    // Проверяем статус в Stripe
    let paymentIntent;
    if (paymentIntentId) {
      paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    }

    let order;
    if (orderToken) {
      order = await Order.findOne({ orderToken }).exec();
    } else if (paymentIntentId) {
      // Ищем заказ по paymentIntentId
      order = await Order.findOne({ paymentIntentId }).exec();
    }

    console.log("📊 Payment Intent status:", paymentIntent?.status);
    console.log("📊 Order status:", order?.status);

    // Синхронизируем статус
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
        
        // Отправляем email если платеж успешен
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

// POST /create-payment-intent
router.post("/create-payment-intent", auth, async (req, res) => {
  try {
    console.log("📨 Incoming request to /create-payment-intent");
    const { cartItems, deliveryInfo } = req.body;
    const userId = req.user?._id;

    if (!userId || typeof userId !== "string" || userId.length !== 24) {
      console.warn("⚠️ Invalid or missing userId from token");
      return res.status(401).json({ error: "Unauthorized or invalid userId" });
    }

    if (!Array.isArray(cartItems) || cartItems.length === 0) {
      console.warn("⚠️ cartItems is missing or empty");
      return res.status(400).json({ error: "Missing or empty cartItems" });
    }

    // Сначала проверяем, нет ли уже существующего заказа с такими же данными
    const existingOrder = await findExistingOrder({ userId, cartItems, deliveryInfo });
    
    if (existingOrder && existingOrder.paymentIntentId) {
      console.log(`🔄 Reusing existing order: ${existingOrder._id} with paymentIntent: ${existingOrder.paymentIntentId}`);
      
      try {
        // Проверяем статус существующего PaymentIntent в Stripe
        const existingPaymentIntent = await stripe.paymentIntents.retrieve(existingOrder.paymentIntentId);
        
        if (existingPaymentIntent.status === 'succeeded') {
          // Если платеж уже прошел, обновляем статус заказа
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
        // Если старый PaymentIntent невалиден, продолжаем создавать новый
      }
    }

    const orderToken = existingOrder ? existingOrder.orderToken : generateOrderToken();

    // build products and total
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

    // create PaymentIntent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(totalAmount * 100),
      currency: "pln",
      payment_method_types: ["card", "blik"],
      metadata: {
        userId,
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
      // Обновляем существующий заказ с новым paymentIntentId
      existingOrder.paymentIntentId = paymentIntent.id;
      await existingOrder.save();
      console.log(`✅ Existing order ${existingOrder._id} updated with new payment intent`);
    } else {
      // Создаем новый заказ в статусе pending
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

// Тестовый эндпоинт
router.get("/test", (req, res) => {
  console.log("🧪 /create-payment-intent test route hit");
  res.send("✅ /create-payment-intent route is alive and responding");
});

module.exports = router;