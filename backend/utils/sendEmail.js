const nodemailer = require('nodemailer');

// Транспорт через SMTP Zoho
const transporter = nodemailer.createTransport({
  host: 'smtp.zoho.eu',
  port: 465,
  secure: true, // SSL
  auth: {
    user: 'info@dajdaj.pl',
    pass: process.env.ZOHO_APP_PASSWORD, // НЕ обычный пароль!
  },
});

// Отправка письма
const mailOptions = {
  from: '"DAJDAJ" <info@dajdaj.pl>',
  to: 'customer@example.com',
  subject: 'Спасибо за заказ!',
  html: `
    <h1>Ваш заказ подтвержден</h1>
    <p>Спасибо за покупку, мы скоро отправим фигурку 🧸</p>
  `,
};

transporter.sendMail(mailOptions, (error, info) => {
  if (error) {
    return console.error('Ошибка отправки:', error);
  }
  console.log('Письмо отправлено:', info.response);
});
