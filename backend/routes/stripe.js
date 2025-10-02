const express = require("express");
const Stripe = require("stripe");
const Order = require("../models/order");
const products = require("../products");
require("dotenv").config();

const stripe = Stripe(process.env.STRIPE_KEY);
const router = express.Router();

// 🔍 Разбор адреса из строки
function parseAddress(rawAddress) {
  if (!rawAddress || typeof rawAddress !== "string") return {};

  const parts = rawAddress.split(",").map(p => p.trim()).filter(Boolean);

  const postalCode = parts.at(-2) || "";
  const city = parts.at(-4) || "";
  const street = parts.slice(0, 2).reverse().join(" "); // "Armii Krajowej 7"

  return { street, city, postalCode };
}

// ✅ Создание Checkout Session
router.post("/create-checkout-session", async (req, res) => {
  try {
    console.log("BODY:", req.body);

    const { cartItems, userId, deliveryInfo } = req.body;
    console.log("📦 Raw delivery address from frontend:", deliveryInfo?.address);

    if (!cartItems || !Array.isArray(cartItems)) {
      return res
        .status(400)
        .json({ error: "cartItems is required and must be an array" });
    }

    const line_items = cartItems.map((item) => {
      const product = products.find((p) => p.id === item.id);
      if (!product) {
        throw new Error(`Product with id ${item.id} not found`);
      }

      return {
        price_data: {
          currency: "pln",
          product_data: {
            name: product.name.en,
            description: product.description.en,
            metadata: { id: product.id },
          },
          unit_amount: Math.round(product.price * 100),
        },
        quantity: item.qty,
      };
    });

    const parsedAddress = parseAddress(deliveryInfo?.address || "");

    // ✅ Создание временного Customer для предзаполнения данных
    const customer = await stripe.customers.create({
      name: `${deliveryInfo?.name} ${deliveryInfo?.surname}`,
      email: deliveryInfo?.email,
      phone: deliveryInfo?.phone,
      address: {
        line1: parsedAddress.street,
        city: parsedAddress.city,
        postal_code: parsedAddress.postalCode,
        country: "PL",
      },
    });

    const session = await stripe.checkout.sessions.create({
      customer: customer.id,
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
        userId,
        cart: JSON.stringify(cartItems),
        cart_items_count: cartItems.length.toString(),
        delivery_method: deliveryInfo?.method || "",
        delivery_name: `${deliveryInfo?.name} ${deliveryInfo?.surname}`,
        delivery_phone: deliveryInfo?.phone || "",
        delivery_street: parsedAddress.street || "",
        delivery_city: parsedAddress.city || "",
        delivery_postal: parsedAddress.postalCode || "",
      },
    });

    res.send({ url: session.url });
  } catch (error) {
    console.error("Stripe error:", error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
