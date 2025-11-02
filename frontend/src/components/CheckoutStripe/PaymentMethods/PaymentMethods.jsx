import { FaCreditCard, FaGoogle, FaApple, FaBolt } from "react-icons/fa";
import GoogleApplePayButton from "./GoogleApplePayButton";
import BlikPayment from "./BlikPayment";
import CardPayment from "./CardPayment";

const PaymentMethods = ({
  selected,
  setSelected,
  paymentRequest,
  blikCode,
  setBlikCode,
  cardFields,
  handleCardFieldChange,
  handleCardFieldFocus,
  handleCardFieldBlur,
  canMakePaymentResult,
}) => {
  return (
    <div className="payment-card">
      {/* <div className="stripe-card-header">
        <h2 className="stripe-card-title">Payment Methods</h2>
      </div> */}

      <div className="stripe-card-content">
        <div className="stripe-radio-group">

          {/* Google Pay */}
          {canMakePaymentResult?.googlePay && (
            <div
              className={`stripe-radio-option ${
                selected === "googlepay" ? "stripe-option-selected" : ""
              }`}
              onClick={() => setSelected("googlepay")}
            >
              <input
                type="radio"
                name="payment"
                id="googlepay"
                checked={selected === "googlepay"}
                readOnly
              />
              <label htmlFor="googlepay" className="stripe-label">
                <div className="stripe-logo-box stripe-google">
                  <FaGoogle className="stripe-payment-icon" />
                </div>
                <span>Google Pay</span>
              </label>
            </div>
          )}

          {/* Apple Pay */}
          {canMakePaymentResult?.applePay && (
            <div
              className={`stripe-radio-option ${
                selected === "applepay" ? "stripe-option-selected" : ""
              }`}
              onClick={() => setSelected("applepay")}
            >
              <input
                type="radio"
                name="payment"
                id="applepay"
                checked={selected === "applepay"}
                readOnly
              />
              <label htmlFor="applepay" className="stripe-label">
                <div className="stripe-logo-box stripe-apple">
                  <FaApple className="stripe-payment-icon" />
                </div>
                <span>Apple Pay</span>
              </label>
            </div>
          )}

          {/* Unified PaymentRequestButton */}
          {/* {canMakePaymentResult?.googlePay || canMakePaymentResult?.applePay ? (
            <GoogleApplePayButton paymentRequest={paymentRequest} />
          ) : null} */}


          {/* BLIK */}
          <div
            className={`stripe-radio-option ${
              selected === "blik" ? "stripe-option-selected" : ""
            }`}
            onClick={() => setSelected("blik")}
          >
            <input
              type="radio"
              name="payment"
              id="blik"
              checked={selected === "blik"}
              readOnly
            />
            <label htmlFor="blik" className="stripe-label">
              <div className="stripe-logo-box stripe-blik">
                <FaBolt className="stripe-payment-icon" />
              </div>
              <span>BLIK</span>
            </label>
          </div>
          {selected === "blik" && (
            <BlikPayment blikCode={blikCode} setBlikCode={setBlikCode} />
          )}

          {/* Card */}
          <div className="stripe-radio-option-column">
            <div
              className={`stripe-radio-option ${
                selected === "card" ? "stripe-option-selected" : ""
              }`}
              onClick={() => setSelected("card")}
            >
              <input
                type="radio"
                name="payment"
                id="card"
                checked={selected === "card"}
                readOnly
              />
              <label htmlFor="card" className="stripe-label">
                <div className="stripe-logo-box stripe-card-icon">
                  <FaCreditCard className="stripe-payment-icon" />
                </div>
                <span>Credit / Debit Card</span>
              </label>
            </div>

            {selected === "card" && (
              <CardPayment
                cardFields={cardFields}
                handleCardFieldChange={handleCardFieldChange}
                handleCardFieldFocus={handleCardFieldFocus}
                handleCardFieldBlur={handleCardFieldBlur}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentMethods;
