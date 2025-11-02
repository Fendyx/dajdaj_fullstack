const mongoose = require('mongoose');
const Order = require('./models/order');
require('dotenv').config();

async function cleanupOldPendingOrders() {
  try {
    await mongoose.connect(process.env.DB_URI);
    console.log('✅ Connected to MongoDB');
    
    // Удаляем pending заказы старше 24 часов
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    
    const result = await Order.deleteMany({
      status: "pending",
      createdAt: { $lt: twentyFourHoursAgo }
    });
    
    console.log(`🗑️ Deleted ${result.deletedCount} old pending orders (older than 24 hours)`);
    
  } catch (error) {
    console.error('❌ Cleanup error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 MongoDB connection closed');
    process.exit(0);
  }
}

cleanupOldPendingOrders();