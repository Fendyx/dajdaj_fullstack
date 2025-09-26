const express = require("express");
const Stripe = require("stripe");
const Order = require("../models/order");
const products = require("../products"); // массив всех товаров
require("dotenv").config();

const router = express.Router();
const stripe = Stripe(process.env.STRIPE_KEY);

router.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    const sig = req.headers["stripe-signature"];
    let event;

    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (err) {
      console.error("❌ Webhook signature verification failed:", err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      try {
        const userId = session.metadata.userId;
        const cart = JSON.parse(session.metadata.cart); // [{id, qty}]

        // Подтягиваем полные данные о товарах из products.js
        const productsFull = cart.map((item) => {
          const product = products.find((p) => p.id === item.id);
          return {
            name: product ? product.name.en : "Unknown",
            price: product ? product.price : 0,
            quantity: item.qty,
            image: product ? product.image : "",
          };
        });

        const order = new Order({
          userId,
          products: productsFull,
          totalPrice: session.amount_total / 100,
          status: "paid",
        });

        await order.save();
        console.log("✅ Order saved for user:", userId);
      } catch (err) {
        console.error("Ошибка сохранения заказа:", err);
      }
    }

    res.json({ received: true });
  }
);

module.exports = router;
