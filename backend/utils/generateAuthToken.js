// backend/utils/generateAuthToken.js
const jwt = require("jsonwebtoken");

function generateAuthToken(user) {
  const jwtSecretKey = process.env.JWT_SECRET_KEY;
  if (!jwtSecretKey) throw new Error("JWT secret key not configured");

  return jwt.sign(
    {
      _id: user._id.toString(),
      name: user.name,
      email: user.email,
    },
    jwtSecretKey,
    { expiresIn: "7d" }
  );
}

module.exports = generateAuthToken;
