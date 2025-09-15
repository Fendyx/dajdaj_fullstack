const mongoose = require("mongoose");

// Счётчик для автоинкремента
const counterSchema = new mongoose.Schema({
  name: { type: String, required: true },
  value: { type: Number, default: 0 },
});
const Counter = mongoose.model("Counter", counterSchema);

const userSchema = new mongoose.Schema({
  clientId: { type: Number, unique: true }, // 👈 наш порядковый id

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

  address: {
    street: { type: String, default: "" },
    city: { type: String, default: "" },
    postalCode: { type: String, default: "" },
  },
  phoneNumber: { type: String, default: "" },
});

// Функция генерации случайных 4 цифр
function randomFourDigits() {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

// Перед сохранением генерируем clientId и cardNumber
userSchema.pre("save", async function (next) {
  if (this.isNew) {
    // --- генерируем clientId ---
    const counter = await Counter.findOneAndUpdate(
      { name: "users" },
      { $inc: { value: 1 } },
      { new: true, upsert: true }
    );

    this.clientId = counter.value;

    // --- генерируем cardNumber ---
    const prefix = "3333";
    const mid1 = randomFourDigits();
    const mid2 = randomFourDigits();
    const userIdPart = this.clientId.toString().padStart(4, "0");

    this.cardNumber = `${prefix} ${mid1} ${mid2} ${userIdPart}`;
  }

  next();
});

module.exports = mongoose.model("User", userSchema);
