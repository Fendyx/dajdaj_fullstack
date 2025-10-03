const express = require("express");
const Stripe = require("stripe");
const mongoose = require("mongoose");
const Order = require("../models/order");
const products = require("../products");
const sendOrderEmail = require("../utils/sendEmail");
require("dotenv").config();

const router = express.Router();
const stripe = Stripe(process.env.STRIPE_KEY);

// 🔧 Проверка валидности ObjectId
function isValidObjectId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

// 🔧 Унифицированная логика создания заказа
async function createOrder({ userId, cart, amount, deliveryInfo, emailSource, source }) {
  const productsFull = cart.map((item) => {
    const product = products.find((p) => p.id === item.id);
    return {
      name: product?.name?.en || "Unknown",
      price: product?.price || 0,
      quantity: item.qty,
      image: product?.image || "",
    };
  });

  const order = new Order({
    userId: isValidObjectId(userId) ? userId : undefined,
    products: productsFull,
    totalPrice: amount / 100,
    status: "paid",
    deliveryInfo: {
      ...deliveryInfo,
      email: emailSource || "",
    },
  });

  await order.save();
  console.log(`✅ Order saved via ${source} for user:`, userId || "guest");

  if (order.deliveryInfo.email) {
    await sendOrderEmail(order);
  } else {
    console.warn("⚠️ Email отсутствует, письмо не отправлено");
  }
}

router.post("/webhook", express.raw({ type: "application/json" }), async (req, res) => {
  const sig = req.headers["stripe-signature"];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error("❌ Webhook signature verification failed:", err.message);
    return res.status(400).send("Webhook Error");
  }

  console.log("📦 Verified Stripe event:", event.type);

  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      const metadata = session.metadata;

      const cart = JSON.parse(metadata.cart || "[]");
      const deliveryInfo = {
        method: metadata.delivery_method,
        name: metadata.delivery_name,
        phone: metadata.delivery_phone,
        address: {
          street: metadata.delivery_street,
          city: metadata.delivery_city,
          postalCode: metadata.delivery_postal,
        },
      };

      await createOrder({
        userId: metadata.userId,
        cart,
        amount: session.amount_total,
        deliveryInfo,
        emailSource: session.customer_details?.email,
        source: "Checkout",
      });
    }

    else if (event.type === "payment_intent.succeeded") {
      const intent = event.data.object;
      const metadata = intent.metadata;

      const cart = JSON.parse(metadata.cart || "[]");
      const deliveryInfo = {
        method: metadata.delivery_method,
        name: metadata.delivery_name,
        phone: metadata.delivery_phone,
        address: {
          street: metadata.delivery_street,
          city: metadata.delivery_city,
          postalCode: metadata.delivery_postal,
        },
      };

      await createOrder({
        userId: metadata.userId,
        cart,
        amount: intent.amount,
        deliveryInfo,
        emailSource: intent.receipt_email,
        source: "Elements",
      });
    }

    else {
      console.log("⚠️ Ignored event type:", event.type);
    }

    res.status(200).json({ received: true });
  } catch (err) {
    console.error("❌ Webhook processing error:", err);
    res.status(500).json({ error: "Internal webhook error" });
  }
});

// 🔧 Тестовый роут
router.post("/webhook-test", express.raw({ type: "application/json" }), (req, res) => {
  console.log("🧪 /webhook-test hit");
  res.send("✅ Webhook test received");
});

module.exports = router;
