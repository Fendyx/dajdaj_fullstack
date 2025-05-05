const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config();

const register = require("./routes/register");
const login = require("./routes/login");
const stripe = require("./routes/stripe");
const products = require("./products");

const app = express();

// CORS настройки
const corsOptions = {
  origin: "CLIENT_URL = https://dajdaj-fullstack-frontend.onrender.com", // твой фронтенд
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  credentials: true,
};

app.use(cors(corsOptions)); // сначала CORS
app.options("*", cors(corsOptions)); // поддержка preflight

app.use(express.json()); // затем JSON парсер

// 📁 Статические файлы (например, изображения товаров)
app.use("/images", express.static(path.join(__dirname, "images")));

// 📦 Маршруты API
app.use("/api/register", register);
app.use("/api/login", login);
app.use("/api/stripe", stripe);

// 🌐 Тестовая домашняя страница
app.get("/", (req, res) => {
  res.send("Welcome to our online shop API...");
});

// 🛍️ Получить список товаров
app.get("/products", (req, res) => {
  res.send(products);
});

// 🛢️ Подключение к базе данных
const uri = process.env.DB_URI;
const port = process.env.PORT || 5000;

mongoose
  .connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ MongoDB connection established..."))
  .catch((error) => console.error("❌ MongoDB connection failed:", error.message));

// 🚀 Запуск сервера
app.listen(port, () => {
  console.log(`🟢 Server running on port: ${port}...`);
});



