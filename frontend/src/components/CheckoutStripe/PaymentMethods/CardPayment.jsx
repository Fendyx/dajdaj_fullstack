import React from "react";
import { CardNumberElement, CardExpiryElement, CardCvcElement } from "@stripe/react-stripe-js";
import "./PaymentMethods.css"; // Подключаем новый файл стилей

// Стили внутри самого iframe Stripe, чтобы текст совпадал с твоим сайтом
const stripeElementOptions = {
  style: {
    base: {
      fontSize: "16px",
      color: "#1f2937",
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      "::placeholder": {
        color: "#9ca3af",
      },
      iconColor: "#6b7280",
    },
    invalid: {
      color: "#ef4444",
      iconColor: "#ef4444",
    },
  },
};

const CardPayment = ({
  handleCardFieldChange,
  // handleCardFieldFocus/Blur больше не нужны для стилей, 
  // так как CSS делает это автоматически через классы Stripe
}) => {
  return (
    <div className="pm-card-wrapper">
      
      {/* Номер карты */}
      <div style={{ marginBottom: "16px" }}>
        <label htmlFor="cardNumber" className="pm-input-label">
          Card Number
        </label>
        <CardNumberElement
          id="cardNumber"
          options={{ ...stripeElementOptions, showIcon: true }}
          onChange={handleCardFieldChange("number")}
        />
      </div>

      {/* Срок действия и CVC в один ряд */}
      <div className="pm-card-row">
        <div className="pm-col">
          <label htmlFor="cardExpiry" className="pm-input-label">
            Expiry Date
          </label>
          <CardExpiryElement
            id="cardExpiry"
            options={stripeElementOptions}
            onChange={handleCardFieldChange("expiry")}
          />
        </div>

        <div className="pm-col">
          <label htmlFor="cardCvc" className="pm-input-label">
            CVC
          </label>
          <CardCvcElement
            id="cardCvc"
            options={stripeElementOptions}
            onChange={handleCardFieldChange("cvc")}
          />
        </div>
      </div>
    </div>
  );
};

export default CardPayment;