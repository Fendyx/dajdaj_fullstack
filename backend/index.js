const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const path = require("path");
const passport = require("passport");
require("dotenv").config();

// Импорт маршрутов
const register = require("./routes/register");
const login = require("./routes/login");
const stripe = require("./routes/stripe");
const profile = require("./routes/profile");
const products = require("./products"); // массив с объектами товаров с мультиязычными полями
const oauth = require("./routes/oauth");

const app = express();

// Настройки CORS
const corsOptions = {
  origin: process.env.CLIENT_URL,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  credentials: true,
};

// Middleware
app.use(cors(corsOptions));
app.options("*", cors(corsOptions));
app.use(express.json());

// Статические файлы (изображения товаров)
app.use("/images", express.static(path.join(__dirname, "images")));

// Маршруты API
app.use("/api/register", register);
app.use("/api/login", login);
app.use("/api/stripe", stripe);
app.use("/api/user", profile);

app.use(passport.initialize());
app.use("/api/oauth", oauth);

// Тестовая главная страница
app.get("/", (req, res) => {
  res.send("Добро пожаловать в API нашего интернет-магазина...");
});

// Маршрут для теста соединения от Furgonetka.pl
// Furgonetka.pl может использовать POST-запросы для проверки
app.post("/", (req, res) => {
  res.status(200).send("OK");
});

// ✅ Добавь сюда код для API Furgonetka.pl
// Этот маршрут будет обрабатывать вебхуки (уведомления) от Furgonetka.pl
app.post("/api/furgonetka/webhook", (req, res) => {
  // Проверка токена
  const receivedToken = req.headers['authorization']; // Или другой способ, согласно документации
  const expectedToken = process.env.FURGONETKA_WEBHOOK_TOKEN; // Тот, что ты сгенерировал

  if (receivedToken !== `Bearer ${expectedToken}`) {
    return res.status(403).json({ error: 'Unauthorized: Invalid token' });
  }

  // Обработка данных
  console.log("Получено уведомление от Furgonetka.pl:", req.body);
  
  res.status(200).send("OK");
});

// ✅ И, возможно, тебе потребуется настроить CORS для Furgonetka.pl
// Если Furgonetka.pl будет отправлять запросы с другого домена
// тебе нужно добавить его в список разрешенных
// const corsOptions = {
//   origin: [process.env.CLIENT_URL, 'https://www.furgonetka.pl'],
//   methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
//   credentials: true,
// };
// app.use(cors(corsOptions));

// ✅ Получение списка товаров с мультиязычностью
app.get("/products", (req, res) => {
  try {
    if (!products || products.length === 0) {
      return res.status(404).json({ message: "Товары не найдены" });
    }

    const lang = req.query.lang === "pl" ? "pl" : "en";

    const localizedProducts = products.map(product => ({
      id: product.id,
      name: product.name[lang],
      description: product.description[lang],
      descriptionProductPage: product.descriptionProductPage[lang], // ✅ новое поле
      price: product.price,
      image: product.image,
      category: product.category,
      isNew: product.isNew,
      isPopular: product.isPopular,
      phrases: product.phrases[lang],
      link: product.link // ✅ добавляем ссылку
    }));
    

    res.setHeader("Cache-Control", "public, max-age=3600");
    res.status(200).json(localizedProducts);
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
