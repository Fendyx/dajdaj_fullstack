const jwt = require("jsonwebtoken");
const User = require("../models/user");

async function auth(req, res, next) {
  const authHeader = req.header("Authorization");
  if (!authHeader) {
    return res.status(401).json({ message: "Access denied. Not authorized..." });
  }

  const token = authHeader.split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "Access denied. Not authorized..." });
  }

  try {
    const jwtSecretKey = process.env.JWT_SECRET_KEY;
    if (!jwtSecretKey) {
      return res.status(500).json({ message: "JWT secret key not configured" });
    }

    const decoded = jwt.verify(token, jwtSecretKey);
    const user = await User.findById(decoded._id);

    if (!user) {
      return res.status(404).json({ message: "Пользователь не найден" });
    }

    req.user = {
      _id: user._id.toString(),
      role: user.role,
    };

    next();
  } catch (ex) {
    res.status(401).json({ message: "Invalid auth token..." });
  }
}

module.exports = auth;