const jwt = require("jsonwebtoken");

function auth(req, res, next) {
  const authHeader = req.header("Authorization");
  if (!authHeader) return res.status(401).json({ message: "Access denied. Not authorized..." });

  const token = authHeader.split(" ")[1]; // Bearer TOKEN
  if (!token) return res.status(401).json({ message: "Access denied. Not authorized..." });

  try {
    // ИЗМЕНИТЕ НАЗВАНИЕ КЛЮЧА НА JWT_SECRET_KEY
    const jwtSecretKey = process.env.JWT_SECRET_KEY;
    if (!jwtSecretKey) {
      return res.status(500).json({ message: "JWT secret key not configured" });
    }
    
    const decoded = jwt.verify(token, jwtSecretKey);
    req.user = decoded;
    next();
  } catch (ex) {
    res.status(400).json({ message: "Invalid auth token..." });
  }
}

module.exports = auth;