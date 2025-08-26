const Order = require("../models/order");

// после успешного платежа
await Order.create({
  userId: user._id,
  products: cartItems.map(item => ({
    name: item.name,
    price: item.price,
    quantity: item.quantity,
    image: item.image
  })),
  totalPrice: amount / 100
});
