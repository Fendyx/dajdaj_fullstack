// backend/migrateUsers.js
const mongoose = require("mongoose");
const User = require("./models/user"); // путь к модели User
const Counter = require("./models/counter"); // путь к модели Counter, если есть

function randomFourDigits() {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

async function migrateUsers() {
  await mongoose.connect("mongodb+srv://admin:4728Andrey!@cluster0.vsyhpdc.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"); // замени на свою БД

  const users = await User.find().sort({ _id: 1 }); // сортируем по дате создания
  let clientId = 0;

  for (const user of users) {
    clientId++;

    user.clientId = clientId;
    user.registrationDate = user._id.getTimestamp();

    const prefix = "3333";
    const mid1 = randomFourDigits();
    const mid2 = randomFourDigits();
    const userIdPart = clientId.toString().padStart(4, "0");
    user.cardNumber = `${prefix} ${mid1} ${mid2} ${userIdPart}`;

    if (!user.address) user.address = { street: "", city: "", postalCode: "" };
    if (!user.phoneNumber) user.phoneNumber = "";

    await user.save();
  }

  await Counter.findOneAndUpdate(
    { name: "users" },
    { $set: { value: clientId } },
    { upsert: true }
  );

  console.log("✅ Миграция завершена");
  process.exit();
}

migrateUsers();
