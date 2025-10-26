// backend/middleware/auth.js
const jwt = require("jsonwebtoken");
const User = require("../models/user");

async function auth(req, res, next) {
  const authHeader = req.header("Authorization");
  if (!authHeader) {
    console.warn("⚠️ No Authorization header");
    return res.status(401).json({ message: "Access denied. Not authorized..." });
  }

  const token = authHeader.split(" ")[1];
  if (!token) {
    console.warn("⚠️ Token missing in Authorization header");
    return res.status(401).json({ message: "Access denied. Not authorized..." });
  }

  try {
    const jwtSecretKey = process.env.JWT_SECRET_KEY;
    if (!jwtSecretKey) {
      return res.status(500).json({ message: "JWT secret key not configured" });
    }

    const decoded = jwt.verify(token, jwtSecretKey);
    console.log("🔓 Decoded token:", decoded);

    const user = await User.findById(decoded._id);
    if (!user) {
      console.warn("⚠️ User not found in DB:", decoded._id);
      return res.status(404).json({ message: "Пользователь не найден" });
    }

    req.user = {
      _id: user._id.toString(), // 👈 гарантируем строку
      role: user.role,
    };

    console.log("✅ req.user set:", req.user);
    next();
  } catch (ex) {
    console.error("❌ Ошибка авторизации:", ex.message);
    res.status(401).json({ message: "Invalid auth token..." });
  }
}

module.exports = auth;
