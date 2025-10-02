const express = require("express");
const Stripe = require("stripe");
const products = require("../products");
require("dotenv").config();

const router = express.Router();
const stripe = Stripe(process.env.STRIPE_KEY);

function parseAddress(rawAddress) {
  if (!rawAddress || typeof rawAddress !== "string") return {};
  const parts = rawAddress.split(",").map(p => p.trim()).filter(Boolean);
  const postalCode = parts.at(-2) || "";
  const city = parts.at(-4) || "";
  const street = parts.slice(0, 2).reverse().join(" ");
  return { street, city, postalCode };
}

router.post("/create-payment-intent", async (req, res) => {
  try {
    const { cartItems, userId, deliveryInfo } = req.body;

    const totalAmount = cartItems.reduce((sum, item) => {
      const product = products.find(p => p.id === item.id);
      return sum + (product ? product.price * item.qty : 0);
    }, 0);

    const parsed = parseAddress(deliveryInfo?.address || "");

    const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(totalAmount * 100),
        currency: "pln",
        payment_method_types: ["card", "blik"], // 👈 добавлено
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

    res.send({ clientSecret: paymentIntent.client_secret });
  } catch (err) {
    console.error("❌ PaymentIntent error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
