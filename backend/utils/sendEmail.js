const nodemailer = require("nodemailer");
require("dotenv").config();

const transporter = nodemailer.createTransport({
  host: "smtp.zoho.eu", // ⚠️ Внимание: если ты в Европе, часто используется .eu, если нет — .com
  port: 465,
  secure: true, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL, // Твой info@dajdaj.pl
    pass: process.env.EMAIL_PASS, // ⚠️ Сюда нужно вставить App Password, а не обычный пароль
  },
});

const sendOrderEmail = async (order) => {
  // Проверка на всякий случай
  if (!order.deliveryInfo || !order.deliveryInfo.email) {
    console.log("❌ Email не отправлен: нет email адреса в заказе");
    return;
  }

  const mailOptions = {
    // Явно указываем отправителя
    from: `"Dajdaj Shop" <${process.env.EMAIL}>`, 
    to: order.deliveryInfo.email,
    subject: `✅ Ваш заказ #${order.orderNumber} подтверждён`, // Лучше использовать orderNumber, он красивее
    html: `
      <div style="font-family: Arial, sans-serif; color: #333;">
        <h2>Спасибо за покупку, ${order.deliveryInfo.name}!</h2>
        <p>Ваш заказ <strong>${order.orderNumber}</strong> успешно оплачен.</p>
        
        <h3>Состав заказа:</h3>
        <ul style="list-style: none; padding: 0;">
          ${order.products.map(p => `
            <li style="border-bottom: 1px solid #eee; padding: 10px 0;">
              <strong>${p.name}</strong> x ${p.quantity} <br>
              <span style="color: #888;">${p.price} PLN</span>
            </li>`).join("")}
        </ul>
        
        <h3>Итого: <strong>${order.totalPrice} PLN</strong></h3>
        
        <hr>
        <p>Адрес доставки: ${order.deliveryInfo.address.city}, ${order.deliveryInfo.address.street}</p>
        <p>Если возникнут вопросы, ответьте на это письмо.</p>
      </div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("📧 Email sent successfully:", info.messageId);
    return true;
  } catch (err) {
    console.error("❌ Nodemailer Error:", err);
    return false;
  }
};

module.exports = sendOrderEmail;