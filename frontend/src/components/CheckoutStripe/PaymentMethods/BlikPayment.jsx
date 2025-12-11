import React from "react";
import "./PaymentMethods.css"; // Подключаем новый файл стилей
// Иконка тут не обязательна, так как она уже есть в заголовке метода оплаты,
// но если хочешь оставить в лейбле — можно. Я сделал дизайн чище.

const BlikPayment = ({ blikCode, setBlikCode }) => {
  return (
    <div className="pm-blik-wrapper">
      <label htmlFor="blikCode" className="pm-input-label">
        BLIK Code (6 digits)
      </label>
      <input
        id="blikCode"
        type="text"
        inputMode="numeric"
        placeholder="000 000"
        value={blikCode}
        onChange={(e) => {
          // Разрешаем только цифры
          const val = e.target.value.replace(/\D/g, "");
          setBlikCode(val);
        }}
        maxLength={6}
        autoComplete="one-time-code"
        required
      />
      <p style={{ fontSize: "0.8rem", color: "#6b7280", marginTop: "8px" }}>
        Open your banking app to generate the code.
      </p>
    </div>
  );
};

export default BlikPayment;