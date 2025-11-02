// backend/models/order.js
const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: false },

  // короткий токен для безопасного доступа к заказу
  orderToken: { type: String, unique: true, index: true, required: true },

  // связь с Stripe PaymentIntent или Checkout Session
  paymentIntentId: { type: String, index: { unique: true, sparse: true } },

  // человеко-читаемый номер заказа
  orderNumber: { type: String },

  products: [
    {
      name: String,
      price: Number,
      quantity: Number,
      image: String,
    },
  ],

  totalPrice: { type: Number, required: true },

  status: {
    type: String,
    default: "pending",
    enum: ["pending", "paid", "shipping", "delivered", "canceled"],
  },

  createdAt: { type: Date, default: Date.now },

  deliveryInfo: {
    method: String,
    name: String,
    phone: String,
    address: {
      street: String,
      city: String,
      postalCode: String,
    },
    email: String,
  },
});

module.exports = mongoose.model("Order", orderSchema);