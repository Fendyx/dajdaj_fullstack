import { CardNumberElement, CardExpiryElement, CardCvcElement } from "@stripe/react-stripe-js";
import { type StripeElementChangeEvent } from "@stripe/stripe-js";
import "./PaymentMethods.css";

interface CardPaymentProps {
  handleCardFieldChange: (
    field: "number" | "expiry" | "cvc"
  ) => (event: StripeElementChangeEvent) => void;
}

const stripeElementOptions = {
  style: {
    base: {
      fontSize: "15px",
      color: "#111827",
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      "::placeholder": { color: "#9ca3af" },
      iconColor: "#6b7280",
    },
    invalid: {
      color: "#ef4444",
      iconColor: "#ef4444",
    },
  },
};

export const CardPayment = ({ handleCardFieldChange }: CardPaymentProps) => {
  return (
    <div className="pm-card-wrapper">

      <div>
        <label htmlFor="cardNumber" className="pm-input-label">
          Card Number
        </label>
        <div className="pm-stripe-field">
          <CardNumberElement
            id="cardNumber"
            options={{ ...stripeElementOptions, showIcon: true }}
            onChange={handleCardFieldChange("number")}
          />
        </div>
      </div>

      <div className="pm-card-row">
        <div>
          <label htmlFor="cardExpiry" className="pm-input-label">
            Expiry Date
          </label>
          <div className="pm-stripe-field">
            <CardExpiryElement
              id="cardExpiry"
              options={stripeElementOptions}
              onChange={handleCardFieldChange("expiry")}
            />
          </div>
        </div>

        <div>
          <label htmlFor="cardCvc" className="pm-input-label">
            CVC
          </label>
          <div className="pm-stripe-field">
            <CardCvcElement
              id="cardCvc"
              options={stripeElementOptions}
              onChange={handleCardFieldChange("cvc")}
            />
          </div>
        </div>
      </div>

    </div>
  );
};