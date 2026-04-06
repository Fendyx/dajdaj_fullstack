//backend/models/Event.js
const mongoose = require('mongoose');

const EventSchema = new mongoose.Schema({
  event: { type: String, required: true, index: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  sessionId: { type: String, index: true },   // для анонимов
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', default: null },
  meta: { type: Object, default: {} },         // цена, категория, метод оплаты...
  source: { type: String, default: null },     // utm_source из URL
  medium: { type: String, default: null },     // utm_medium
  campaign: { type: String, default: null },   // utm_campaign
  createdAt: { type: Date, default: Date.now, index: true }
});

// Автоудаление через 90 дней (не засоряет БД)
EventSchema.index({ createdAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 90 });

module.exports = mongoose.model('Event', EventSchema);