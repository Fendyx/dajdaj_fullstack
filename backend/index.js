const express = require("express");
const cors = require("cors");
const axios = require("axios");
const mongoose = require("mongoose");
const path = require("path");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
require("dotenv").config();

console.log("🚀 Starting Dajdaj backend...");

// --- ИМПОРТЫ РОУТОВ ---
const register = require("./routes/register");
const login = require("./routes/login");
const stripeRoutes = require("./routes/stripe");
const stripeWebhook = require("./routes/webhook");
const profile = require("./routes/profile");
const oauth = require("./routes/oauth");
const paymentIntent = require("./routes/paymentIntent");
const orders = require("./routes/orders");
const adminUsers = require("./routes/adminUsers");
const personalOrders = require("./routes/personalOrders");
const analytics = require("./routes/analytics");
const upload = require("./routes/upload");
const productsRoute = require("./routes/products");
const adminProducts = require("./routes/adminProducts");
const categoriesRouter = require("./routes/categories");
const adminCategoriesRouter = require("./routes/adminCategories");

const app = express();

// 1. HELMET — заголовки безопасности
app.use(helmet());

// 2. CORS
const corsOptions = {
  origin: process.env.CLIENT_URL,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  credentials: true,
};
app.use(cors(corsOptions));
app.options("*", cors(corsOptions));
console.log("🌐 CORS configured for:", process.env.CLIENT_URL);

// 3. STRIPE WEBHOOK (до express.json — нужен Raw Body)
app.use("/api/stripe", stripeWebhook);
console.log("📡 Stripe webhook route mounted");

// 4. BODY PARSERS
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ limit: "1mb", extended: true }));
console.log("📦 Body parsers enabled (limit: 1mb)");

// 5. RATE LIMITING — только для auth роутов
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 минут
  max: 20,
  message: { message: "Слишком много попыток, попробуйте позже" },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use("/api/login", authLimiter);
app.use("/api/register", authLimiter);

// 6. STRIPE РОУТЫ
app.use("/api/stripe", paymentIntent);
app.use("/api/stripe", stripeRoutes);

// 7. СТАТИКА
app.use("/images", express.static(path.join(__dirname, "images")));

// 8. API РОУТЫ
app.use("/api/register", register);
app.use("/api/login", login);
app.use("/api/user", profile);
app.use("/api/oauth", oauth);
app.use("/api/orders", orders);
app.use("/api/users", adminUsers);
app.use("/api/personal-orders", personalOrders);
app.use("/api/analytics", analytics);
app.use("/api/upload", upload);
app.use("/api/products", productsRoute);
app.use("/api/admin/products", adminProducts);
app.use("/api/categories", categoriesRouter);
app.use("/api/admin/categories", adminCategoriesRouter);

// Root
app.get("/", (req, res) => {
  res.send("Добро пожаловать в API нашего интернет-магазина...");
});

// InPost points
app.get("/api/inpost-points", async (req, res) => {
  try {
    const { lat, lng, radius } = req.query;
    if (!lat || !lng) {
      return res.status(400).json({ message: "Не указаны координаты" });
    }

    const searchRadius = radius || 5000;
    const response = await axios.get("https://api-shipx-pl.easypack24.net/v1/points", {
      params: { type: "parcel_locker", status: "Operating", limit: 100, lat, lng, radius: searchRadius },
    });

    const filtered = (response.data.items || []).filter((p) => {
      if (!p.location?.latitude || !p.location?.longitude) return false;
      const R = 6371e3;
      const φ1 = (parseFloat(lat) * Math.PI) / 180;
      const φ2 = (parseFloat(p.location.latitude) * Math.PI) / 180;
      const Δφ = ((parseFloat(p.location.latitude) - parseFloat(lat)) * Math.PI) / 180;
      const Δλ = ((parseFloat(p.location.longitude) - parseFloat(lng)) * Math.PI) / 180;
      const a = Math.sin(Δφ / 2) ** 2 + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;
      const distance = R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
      return distance <= searchRadius;
    });

    res.json({ items: filtered });
  } catch (error) {
    console.error("❌ Ошибка InPost:", error.response?.data || error.message);
    res.status(500).json({ message: "Ошибка получения InPost точек" });
  }
});

// Geocode proxy
app.get("/api/geocode", async (req, res) => {
  const { address } = req.query;
  if (!address) return res.status(400).json({ message: "Не указан адрес" });

  try {
    const encoded = encodeURIComponent(address);
    const response = await axios.get(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encoded}&limit=5&addressdetails=1`,
      {
        headers: {
          "User-Agent": "DajdajApp/1.0 (contact@yourdomain.com)",
          "Referer": process.env.CLIENT_URL.replace(/\/$/, "") + "/",
        },
        timeout: 5000,
      }
    );
    res.json(response.data);
  } catch (error) {
    console.error("❌ Ошибка геокодирования:", error.message);
    res.status(500).json({ message: "Ошибка геокодирования" });
  }
});


// MongoDB
const uri = process.env.DB_URI;
const port = process.env.PORT || 5000;

mongoose
  .connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("✅ Успешное подключение к MongoDB..."))
  .catch((error) => console.error("❌ Ошибка подключения к MongoDB:", error.message));

app.listen(port, () => {
  console.log(`🟢 Сервер запущен на порту: ${port}...`);
});