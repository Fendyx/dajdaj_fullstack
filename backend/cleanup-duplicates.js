const mongoose = require('mongoose');
const Order = require('./models/order');
require('dotenv').config();

async function cleanupDuplicates() {
  try {
    await mongoose.connect(process.env.DB_URI);
    console.log('✅ Connected to MongoDB');
    
    // Находим заказы с одинаковыми orderToken
    const duplicates = await Order.aggregate([
      {
        $group: {
          _id: "$orderToken",
          count: { $sum: 1 },
          ids: { $push: "$_id" },
          createdAt: { $push: "$createdAt" }
        }
      },
      {
        $match: {
          count: { $gt: 1 }
        }
      }
    ]);

    console.log(`🔍 Found ${duplicates.length} duplicate order tokens`);

    let deletedCount = 0;
    
    for (const dup of duplicates) {
      console.log(`\n🔄 Processing orderToken: ${dup._id}`);
      
      // Оставляем самый новый заказ, удаляем старые
      const orders = await Order.find({ orderToken: dup._id }).sort({ createdAt: -1 });
      
      console.log(`   Found ${orders.length} orders with this token`);
      
      for (let i = 1; i < orders.length; i++) {
        console.log(`   🗑️ Deleting duplicate order: ${orders[i]._id} (created: ${orders[i].createdAt})`);
        await Order.findByIdAndDelete(orders[i]._id);
        deletedCount++;
      }
      
      // Обновляем оставшийся заказ
      if (orders.length > 0) {
        const keptOrder = orders[0];
        console.log(`   ✅ Kept order: ${keptOrder._id} (created: ${keptOrder.createdAt})`);
      }
    }

    console.log(`\n🎉 Cleanup completed! Deleted ${deletedCount} duplicate orders`);
    
  } catch (error) {
    console.error('❌ Cleanup error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 MongoDB connection closed');
    process.exit(0);
  }
}

cleanupDuplicates();