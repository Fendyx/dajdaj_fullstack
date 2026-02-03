// backend/middleware/trackVisit.js
const Visit = require("../models/Visit");
const jwt = require("jsonwebtoken"); // Если нужно достать ID юзера из токена вручную

const trackVisit = async (req, res, next) => {
  try {
    const ip = req.headers["x-forwarded-for"] || req.connection.remoteAddress;
    const userAgent = req.headers["user-agent"];
    
    // Пытаемся понять, авторизован ли юзер (не блокируя запрос, если токен просрочен)
    let userId = null;
    const token = req.header("x-auth-token");
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET); // Убедись, что ключ совпадает
        userId = decoded.user ? decoded.user.id : decoded._id; // Зависит от того, как ты формируешь токен
      } catch (e) {
        // Токен невалиден, считаем как гостя
      }
    }

    // Обновляем или создаем запись о визите
    // Логика: Если с этого IP сегодня уже заходили, обновляем lastActive и userId
    // Для "уникальных за всё время" лучше искать просто по IP, но чтобы считать "активных сейчас", нам важен update.
    
    await Visit.findOneAndUpdate(
      { ip: ip }, 
      { 
        lastActive: new Date(),
        userAgent: userAgent,
        userId: userId || undefined // Обновим user, если он залогинился
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    
  } catch (err) {
    console.error("Ошибка трекинга визита:", err.message);
    // Не роняем сервер из-за ошибки аналитики
  }
  next();
};

module.exports = trackVisit;