const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  // Может быть null, если покупает гость
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: false },

  // Короткий токен для доступа по ссылке
  orderToken: { type: String, unique: true, index: true, required: true },

  // ID транзакции из Stripe
  paymentIntentId: { type: String, index: { unique: true, sparse: true } },

  // Человеко-читаемый номер (ORD-2025...)
  orderNumber: { type: String },

  products: [
    {
      id: String,       // ID товара
      name: String,
      price: Number,
      quantity: Number,
      image: String,    // Превью (путь к заглушке)
      
      // ✅ НОВОЕ ПОЛЕ: Ссылка на коллекцию personalOrders (для кастомных товаров)
      personalOrderId: { type: mongoose.Schema.Types.ObjectId, ref: "PersonalOrder" }
    },
  ],

  totalPrice: { type: Number, required: true },

  status: {
    type: String,
    default: "pending",
    enum: ["pending", "processing", "paid", "shipping", "delivered", "canceled", "failed"],
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