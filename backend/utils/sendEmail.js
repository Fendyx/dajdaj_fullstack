const nodemailer = require("nodemailer");
require("dotenv").config();

const transporter = nodemailer.createTransport({
  host: "smtp.zoho.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASS,
  },
});

const sendOrderEmail = async (order) => {
  const mailOptions = {
    from: `"Dajdaj Shop" <${process.env.EMAIL}>`,
    to: order.deliveryInfo.email,
    subject: `✅ Ваш заказ #${order._id} подтверждён`,
    html: `
      <h2>Спасибо за заказ, ${order.deliveryInfo.name}!</h2>
      <p>Метод доставки: ${order.deliveryInfo.method}</p>
      <p>Сумма: ${order.totalPrice} PLN</p>
      <ul>
        ${order.products.map(p => `<li>${p.name} x ${p.quantity}</li>`).join("")}
      </ul>
      <p>Телефон для связи: ${order.deliveryInfo.phone}</p>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("📧 Email sent:", info.response);
  } catch (err) {
    console.error("❌ Email error:", err.message);
  }
};

module.exports = sendOrderEmail;
