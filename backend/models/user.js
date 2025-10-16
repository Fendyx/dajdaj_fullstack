// backend/models/user.js
const mongoose = require("mongoose");

const counterSchema = new mongoose.Schema({
  name: { type: String, required: true },
  value: { type: Number, default: 0 },
});
const Counter = mongoose.model("Counter", counterSchema);

// 👇 схема для данных доставки
const deliveryDataSchema = new mongoose.Schema({
  deliveryId: { type: Number, required: true },
  personalData: {
    name: String,
    surname: String,
    email: String,
    phone: String,
  },
  delivery: {
    address: String,
    method: String,
  },
});

const userSchema = new mongoose.Schema({
  clientId: { type: Number, unique: true },

  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },

  discounts: [
    {
      code: String,
      value: Number,
      expiresAt: Date,
    },
  ],

  favorites: {
    type: [String],
    default: [],
  },

  cardNumber: { type: String, unique: true },
  registrationDate: { type: Date, default: Date.now },

  // 👇 новый массив
  deliveryDatas: {
    type: [deliveryDataSchema],
    default: [],
  },
  role: {
    type: String,
    enum: ["user", "admin", "superadmin"],
    default: "user",
  },
});

function randomFourDigits() {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

userSchema.pre("save", async function (next) {
  if (this.isNew) {
    const counter = await Counter.findOneAndUpdate(
      { name: "users" },
      { $inc: { value: 1 } },
      { new: true, upsert: true }
    );
    this.clientId = counter.value;

    const prefix = "3333";
    const mid1 = randomFourDigits();
    const mid2 = randomFourDigits();
    const userIdPart = this.clientId.toString().padStart(4, "0");
    this.cardNumber = `${prefix} ${mid1} ${mid2} ${userIdPart}`;
  }
  next();
});

module.exports = mongoose.model("User", userSchema);
