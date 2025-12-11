const express = require("express");
const cors = require("cors");
const axios = require("axios");
const mongoose = require("mongoose");
const path = require("path");
const passport = require("passport");
require("dotenv").config();

console.log("🚀 Starting Dajdaj backend...");

const register = require("./routes/register");
const login = require("./routes/login");
const stripeRoutes = require("./routes/stripe");
const stripeWebhook = require("./routes/webhook");
const profile = require("./routes/profile");
const products = require("./products"); // <-- Ваш массив продуктов
const oauth = require("./routes/oauth");
const paymentIntent = require("./routes/paymentIntent");
const orders = require("./routes/orders");
const adminUsers = require("./routes/adminUsers");

const app = express();

// CORS
const corsOptions = {
  origin: process.env.CLIENT_URL,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  credentials: true,
};
app.use(cors(corsOptions));
app.options("*", cors(corsOptions));
console.log("🌐 CORS configured for:", process.env.CLIENT_URL);

// Webhook BEFORE express.json
app.use("/api/stripe", stripeWebhook);
console.log("📡 Stripe webhook route mounted");

// JSON parser
app.use(express.json());
console.log("📦 express.json middleware enabled");

// Stripe routes
app.use("/api/stripe", paymentIntent);
console.log("💳 Stripe paymentIntent route mounted");

app.use("/api/stripe", stripeRoutes);
console.log("🧾 Stripe checkout-session route mounted");

// Static files
app.use("/images", express.static(path.join(__dirname, "images")));
console.log("🖼️ Static image route mounted");

// API routes
app.use("/api/register", register);
app.use("/api/login", login);
app.use("/api/user", profile);
app.use("/api/oauth", oauth);
app.use("/api/orders", orders); 
app.use("/api/users", adminUsers);
console.log("📦 Admin users routes mounted");

console.log("📦 Orders routes mounted");
console.log("🔐 Auth routes mounted");

// Root test
app.get("/", (req, res) => {
  console.log("📥 GET / hit");
  res.send("Добро пожаловать в API нашего интернет-магазина...");
});

// InPost points
app.get("/api/inpost-points", async (req, res) => {
  console.log("📥 GET /api/inpost-points", req.query);
  try {
    const { lat, lng, radius } = req.query;
    if (!lat || !lng) {
      return res.status(400).json({ message: "Не указаны координаты" });
    }

    const searchRadius = radius || 5000;
    const response = await axios.get("https://api-shipx-pl.easypack24.net/v1/points", {
      params: {
        type: "parcel_locker",
        status: "Operating",
        limit: 100,
        lat,
        lng,
        radius: searchRadius,
      },
    });

    const filtered = (response.data.items || []).filter((p) => {
      if (!p.location?.latitude || !p.location?.longitude) return false;

      const R = 6371e3;
      const φ1 = (parseFloat(lat) * Math.PI) / 180;
      const φ2 = (parseFloat(p.location.latitude) * Math.PI) / 180;
      const Δφ = ((parseFloat(p.location.latitude) - parseFloat(lat)) * Math.PI) / 180;
      const Δλ = ((parseFloat(p.location.longitude) - parseFloat(lng)) * Math.PI) / 180;

      const a =
        Math.sin(Δφ / 2) ** 2 +
        Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;
      const distance = R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));

      return distance <= searchRadius;
    });

    res.json({ items: filtered });
  } catch (error) {
    console.error("❌ Ошибка получения InPost точек:", error.response?.data || error.message);
    res.status(500).json({ message: "Ошибка получения InPost точек" });
  }
});

// Geocode proxy
app.get("/api/geocode", async (req, res) => {
  console.log("📥 GET /api/geocode", req.query);
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
    console.error("❌ Ошибка геокодирования:", error.response?.status, error.message);
    res.status(500).json({ message: "Ошибка геокодирования" });
  }
});

// Products: GET /products (Возвращает ВСЕ продукты)
app.get("/products", (req, res) => {
  console.log("📥 GET /products");
  try {
    if (!products || products.length === 0) {
      return res.status(404).json({ message: "Товары не найдены" });
    }

    const lang = req.query.lang === "pl" ? "pl" : "en";
    const localizedProducts = products.map((product) => ({
      id: product.id,
      slug: product.slug, // Добавляем slug
      name: product.name[lang],
      description: product.description[lang],
      descriptionProductPage: product.descriptionProductPage[lang],
      price: product.price,
      image: product.image,
      category: product.category,
      isNew: product.isNew,
      isPopular: product.isPopular,
      phrases: product.phrases[lang],
      link: product.link,
    }));

    res.setHeader("Cache-Control", "public, max-age=3600");
    res.status(200).json(localizedProducts);
  } catch (error) {
    console.error("❌ Ошибка при получении товаров:", error);
    res.status(500).json({ message: "Ошибка сервера при загрузке товаров" });
  }
});


// -------------------------------------------------------------------
// 🚀 НОВЫЙ МАРШРУТ: GET /api/products/slug/:slugName (Возвращает ОДИН продукт по SLUG)
app.get("/api/products/slug/:slugName", (req, res) => {
    const slugName = req.params.slugName; 
    console.log(`📥 GET /api/products/slug/${slugName}`);

    if (!slugName) {
        return res.status(400).json({ message: "Slug продукта не предоставлен." });
    }

    try {
        // 1. Ищем продукт в массиве по полю 'slug'
        const product = products.find(p => p.slug === slugName);

        if (!product) {
            return res.status(404).json({ 
                message: `Продукт с slug '${slugName}' не найден.`,
                success: false
            });
        }
        
        // 2. Локализация найденного продукта
        const lang = req.query.lang === "pl" ? "pl" : "en";
        const localizedProduct = {
            id: product.id,
            slug: product.slug,
            name: product.name[lang],
            description: product.description[lang],
            descriptionProductPage: product.descriptionProductPage[lang],
            price: product.price,
            image: product.image,
            category: product.category,
            isNew: product.isNew,
            isPopular: product.isPopular,
            phrases: product.phrases[lang],
            link: product.link,
            // Дополнительные поля (например, 3D модель, если есть)
            threeDModelSrc: product.threeDModelSrc || null, 
            // ... другие поля
        };

        // 3. Возвращаем продукт
        res.status(200).json(localizedProduct);

    } catch (error) {
        console.error("❌ Ошибка при получении продукта по slug:", error);
        res.status(500).json({ message: "Ошибка сервера при загрузке продукта по slug" });
    }
});
// -------------------------------------------------------------------


// MongoDB
const uri = process.env.DB_URI;
const port = process.env.PORT || 5000;

mongoose
  .connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("✅ Успешное подключение к MongoDB..."))
  .catch((error) => console.error("❌ Ошибка подключения к MongoDB:", error.message));

  app.get("/test-email", async (req, res) => {
    const sendOrderEmail = require("./utils/sendEmail");
  
    const mockOrder = {
      _id: "TEST123",
      deliveryInfo: {
        name: "Test User",
        method: "InPost",
        phone: "+48 123 456 789",
        email: process.env.EMAIL,
      },
      totalPrice: 99,
      products: [
        { name: "Test Product", quantity: 1 },
        { name: "Another Item", quantity: 2 },
      ],
    };
  
    try {
      await sendOrderEmail(mockOrder);
      res.send("✅ Test email sent");
    } catch (err) {
      console.error("❌ Test email error:", err.message);
      res.status(500).send("Email failed");
    }
  });  

// Start server
app.listen(port, () => {
  console.log(`🟢 Сервер запущен на порту: ${port}...`);
});