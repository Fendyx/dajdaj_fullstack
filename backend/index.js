const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config();

// Импорт маршрутов
const register = require("./routes/register");
const login = require("./routes/login");
const stripe = require("./routes/stripe");
const products = require("./products");


const app = express();

// Настройки CORS
const corsOptions = {
  origin: process.env.CLIENT_URL,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  credentials: true,
};


// Middleware
app.use(cors(corsOptions)); // сначала CORS
app.options("*", cors(corsOptions)); // поддержка preflight-запросов
app.use(express.json()); // парсер JSON

// Статические файлы (изображения товаров)
app.use("/images", express.static(path.join(__dirname, "images")));

// Маршруты API
app.use("/api/register", register);
app.use("/api/login", login);
app.use("/api/stripe", stripe);

// Тестовая главная страница
app.get("/", (req, res) => {
  res.send("Добро пожаловать в API нашего интернет-магазина...");
});

// Получение списка товаров (ИСПРАВЛЕННАЯ ВЕРСИЯ)
app.get("/products", (req, res) => {
  try {
    if (!products || products.length === 0) {
      return res.status(404).json({ message: "Товары не найдены" });
    }
    // Устанавливаем заголовки кэширования
    res.setHeader('Cache-Control', 'public, max-age=3600'); // Кэш на 1 час
    // Отправляем данные в формате JSON
    res.status(200).json(products);
  } catch (error) {
    console.error("Ошибка при получении товаров:", error);
    res.status(500).json({ message: "Ошибка сервера при загрузке товаров" });
  }
});

// Подключение к MongoDB
const uri = process.env.DB_URI;
const port = process.env.PORT || 5000;

mongoose
  .connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ Успешное подключение к MongoDB..."))
  .catch((error) => console.error("❌ Ошибка подключения к MongoDB:", error.message));

// Запуск сервера
app.listen(port, () => {
  console.log(`🟢 Сервер запущен на порту: ${port}...`);
});