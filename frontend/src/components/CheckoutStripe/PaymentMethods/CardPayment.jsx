import { CardNumberElement, CardExpiryElement, CardCvcElement } from "@stripe/react-stripe-js";
import { FaCreditCard } from "react-icons/fa";

const CardPayment = ({
  cardFields,
  handleCardFieldChange,
  handleCardFieldFocus,
  handleCardFieldBlur,
}) => {
  return (
    <div className="stripe-card-form">
      <div className="stripe-form-group">
        <label htmlFor="cardNumber" className="stripe-label-with-icon">
          <FaCreditCard className="stripe-icon" />
          Card Number
        </label>
        <div
          className={`stripe-card-input-container ${
            cardFields.number.focused ? "stripe-card-input-focused" : ""
          } ${cardFields.number.complete ? "stripe-card-input-complete" : ""}`}
        >
          <CardNumberElement
            id="cardNumber"
            options={{
              showIcon: true,
              style: {
                base: {
                  fontSize: "16px",
                  color: "#374151",
                  "::placeholder": {
                    color: "#9CA3AF",
                  },
                },
              },
            }}
            className="stripe-card-input"
            onChange={handleCardFieldChange("number")}
            onFocus={handleCardFieldFocus("number")}
            onBlur={handleCardFieldBlur("number")}
          />
        </div>
      </div>

      <div className="stripe-card-grid">
        <div className="stripe-form-group">
          <label htmlFor="cardExpiry" className="stripe-label-with-icon">
            Expiry Date
          </label>
          <div
            className={`stripe-card-input-container ${
              cardFields.expiry.focused ? "stripe-card-input-focused" : ""
            } ${cardFields.expiry.complete ? "stripe-card-input-complete" : ""}`}
          >
            <CardExpiryElement
              id="cardExpiry"
              options={{
                style: {
                  base: {
                    fontSize: "16px",
                    color: "#374151",
                    "::placeholder": {
                      color: "#9CA3AF",
                    },
                  },
                },
              }}
              className="stripe-card-input"
              onChange={handleCardFieldChange("expiry")}
              onFocus={handleCardFieldFocus("expiry")}
              onBlur={handleCardFieldBlur("expiry")}
            />
          </div>
        </div>

        <div className="stripe-form-group">
          <label htmlFor="cardCvc" className="stripe-label-with-icon">
            CVC
          </label>
          <div
            className={`stripe-card-input-container ${
              cardFields.cvc.focused ? "stripe-card-input-focused" : ""
            } ${cardFields.cvc.complete ? "stripe-card-input-complete" : ""}`}
          >
            <CardCvcElement
              id="cardCvc"
              options={{
                style: {
                  base: {
                    fontSize: "16px",
                    color: "#374151",
                    "::placeholder": {
                      color: "#9CA3AF",
                    },
                  },
                },
              }}
              className="stripe-card-input"
              onChange={handleCardFieldChange("cvc")}
              onFocus={handleCardFieldFocus("cvc")}
              onBlur={handleCardFieldBlur("cvc")}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CardPayment;
