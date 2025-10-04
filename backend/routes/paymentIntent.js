const express = require("express");
const Stripe = require("stripe");
const products = require("../products");
const auth = require("../middleware/auth");
require("dotenv").config();

const router = express.Router();
const stripe = Stripe(process.env.STRIPE_KEY);

// 🔧 Парсинг адреса из строки
function parseAddress(rawAddress) {
  if (!rawAddress || typeof rawAddress !== "string") return {};
  const parts = rawAddress.split(",").map(p => p.trim()).filter(Boolean);
  const postalCode = parts.at(-2) || "";
  const city = parts.at(-4) || "";
  const street = parts.slice(0, 2).reverse().join(" ");
  return { street, city, postalCode };
}

// ✅ Создание PaymentIntent с авторизацией
router.post("/create-payment-intent", auth, async (req, res) => {
  try {
    console.log("📨 Incoming request to /create-payment-intent");
    console.log("🧾 Raw body:", JSON.stringify(req.body, null, 2));
    console.log("🌐 Request headers:", req.headers);
    console.log("📍 Request IP:", req.ip);

    const { cartItems, deliveryInfo } = req.body;
    const userId = req.user?._id;

    if (!userId || userId.length !== 24) {
      console.warn("⚠️ Invalid or missing userId from token");
      return res.status(401).json({ error: "Unauthorized or invalid userId" });
    }

    if (!Array.isArray(cartItems) || cartItems.length === 0) {
      console.warn("⚠️ cartItems is missing or empty");
      return res.status(400).json({ error: "Missing or empty cartItems" });
    }

    const totalAmount = cartItems.reduce((sum, item) => {
      const product = products.find(p => p.id === item.id);
      if (!product) {
        console.warn("⚠️ Unknown product ID:", item.id);
      }
      return sum + (product ? product.price * item.qty : 0);
    }, 0);

    console.log("💰 Calculated total amount:", totalAmount);

    const parsed = parseAddress(deliveryInfo?.address || "");
    console.log("📦 Parsed address:", parsed);

    const paymentMethodTypes = ["card", "blik"];
    console.log("📥 Requested payment_method_types:", paymentMethodTypes);

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(totalAmount * 100),
      currency: "pln",
      payment_method_types: paymentMethodTypes,
      metadata: {
        userId,
        delivery_name: `${deliveryInfo?.name} ${deliveryInfo?.surname}`,
        delivery_phone: deliveryInfo?.phone || "",
        delivery_method: deliveryInfo?.method || "",
        delivery_street: parsed.street || "",
        delivery_city: parsed.city || "",
        delivery_postal: parsed.postalCode || "",
        cart: JSON.stringify(cartItems),
      },
    });

    console.log("✅ PaymentIntent created:", paymentIntent.id);
    console.log("🔑 Returning clientSecret:", paymentIntent.client_secret);
    res.send({ clientSecret: paymentIntent.client_secret });
  } catch (err) {
    console.error("❌ PaymentIntent error:", err);
    res.status(500).json({ error: err.message });
  }
});

// 🔧 Тестовый роут
router.get("/test", (req, res) => {
  console.log("🧪 /create-payment-intent test route hit");
  res.send("✅ /create-payment-intent route is alive and responding");
});

module.exports = router;
