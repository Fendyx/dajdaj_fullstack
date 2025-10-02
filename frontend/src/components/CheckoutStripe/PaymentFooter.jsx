import { FaCreditCard, FaGoogle, FaApple, FaBolt } from "react-icons/fa";
import { PaymentRequestButtonElement } from "@stripe/react-stripe-js";
import "./PaymentFooter.css";

const PaymentFooter = ({ selected, paymentRequest, blikCode }) => {
  return (
    <div className="payment-footer">
      {/* Левый блок — иконка + название метода */}
      <div className="payment-footer-info">
        {selected === "card" && <FaCreditCard />}
        {selected === "googlepay" && <FaGoogle />}
        {selected === "applepay" && <FaApple />}
        {selected === "blik" && <FaBolt />}
        <span className="payment-footer-method">
          {selected === "card" && "Credit / Debit Card"}
          {selected === "googlepay" && "Google Pay"}
          {selected === "applepay" && "Apple Pay"}
          {selected === "blik" && "BLIK"}
        </span>
      </div>

      {/* Правый блок — кнопка или Stripe PaymentRequestButton */}
      <div className="payment-footer-actions">
        {selected === "blik" && (
          <button type="submit" className="payment-btn blik-btn">
            <FaBolt />
            Pay with BLIK
          </button>
        )}

        {selected === "card" && (
          <button type="submit" className="payment-btn card-btn">
            <FaCreditCard />
            Pay Now
          </button>
        )}

        {(selected === "googlepay" || selected === "applepay") && paymentRequest && (
          <PaymentRequestButtonElement
            options={{ paymentRequest }}
            style={{
              paymentRequestButton: {
                type: "default",
                theme: "light",
                height: "44px",
              },
            }}
          />
        )}
      </div>
    </div>
  );
};

export default PaymentFooter;
