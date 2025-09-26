const express = require("express");
const Stripe = require("stripe");
const Order = require("../models/order");
const products = require("../products"); // массив всех товаров
require("dotenv").config();

const stripe = Stripe(process.env.STRIPE_KEY);
const router = express.Router();

// ✅ Создание Checkout Session
router.post("/create-checkout-session", async (req, res) => {
  try {
    console.log("BODY:", req.body);

    if (!req.body.cartItems || !Array.isArray(req.body.cartItems)) {
      return res
        .status(400)
        .json({ error: "cartItems is required and must be an array" });
    }

    // Собираем line_items для Stripe из products.js
    const line_items = req.body.cartItems.map((item) => {
      const product = products.find((p) => p.id === item.id);
      if (!product) {
        throw new Error(`Product with id ${item.id} not found`);
      }

      return {
        price_data: {
          currency: "pln",
          product_data: {
            name: product.name.en, // или product.name.pl
            description: product.description.en,
            metadata: { id: product.id },
          },
          unit_amount: Math.round(product.price * 100),
        },
        quantity: item.qty,
      };
    });

    const session = await stripe.checkout.sessions.create({
      shipping_address_collection: { allowed_countries: ["PL"] },
      shipping_options: [
        {
          shipping_rate_data: {
            type: "fixed_amount",
            fixed_amount: { amount: 1500, currency: "pln" },
            display_name: "Inpost",
            delivery_estimate: {
              minimum: { unit: "business_day", value: 5 },
              maximum: { unit: "business_day", value: 7 },
            },
          },
        },
        {
          shipping_rate_data: {
            type: "fixed_amount",
            fixed_amount: { amount: 1500, currency: "pln" },
            display_name: "Poczta Polska",
            delivery_estimate: {
              minimum: { unit: "business_day", value: 5 },
              maximum: { unit: "business_day", value: 7 },
            },
          },
        },
        {
          shipping_rate_data: {
            type: "fixed_amount",
            fixed_amount: { amount: 1500, currency: "pln" },
            display_name: "DPD",
            delivery_estimate: {
              minimum: { unit: "business_day", value: 5 },
              maximum: { unit: "business_day", value: 7 },
            },
          },
        },
        {
          shipping_rate_data: {
            type: "fixed_amount",
            fixed_amount: { amount: 1500, currency: "pln" },
            display_name: "DHL",
            delivery_estimate: {
              minimum: { unit: "business_day", value: 5 },
              maximum: { unit: "business_day", value: 7 },
            },
          },
        },
        {
          shipping_rate_data: {
            type: "fixed_amount",
            fixed_amount: { amount: 1500, currency: "pln" },
            display_name: "ORLEN Paczka",
            delivery_estimate: {
              minimum: { unit: "business_day", value: 5 },
              maximum: { unit: "business_day", value: 7 },
            },
          },
        },
      ],
      phone_number_collection: { enabled: true },
      line_items,
      mode: "payment",
      locale: "pl",
      success_url: `${process.env.CLIENT_URL}/checkout-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_URL}/cart`,
      metadata: {
        userId: req.body.userId,
        cart: JSON.stringify(req.body.cartItems), // [{id:"1", qty:1}]
        cart_items_count: req.body.cartItems.length.toString(),
      },
    });

    res.send({ url: session.url });
  } catch (error) {
    console.error("Stripe error:", error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
