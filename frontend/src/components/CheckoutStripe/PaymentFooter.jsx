import { FaCreditCard, FaGoogle, FaApple, FaBolt } from "react-icons/fa";
import { PaymentRequestButtonElement } from "@stripe/react-stripe-js";
import { useSelector } from "react-redux";
import "./PaymentFooter.css";

const PaymentFooter = ({ selected, paymentRequest, blikCode, canMakePaymentResult }) => {
  // ✅ Получаем товары из Redux
  const cartItems = useSelector((state) => state.cart.cartItems);

  // ✅ Считаем сумму корзины
  const cartTotal = cartItems.reduce((total, item) => {
    return total + item.price * item.cartQuantity;
  }, 0);

  const deliveryFee = 9.99;
  const totalWithDelivery = (cartTotal + deliveryFee).toFixed(2);

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

      {/* Центральный блок — суммы */}
      <div className="payment-footer-summary">
        <div className="payment-summary-line">
          <span>Subtotal:</span>
          <span>{cartTotal.toFixed(2)} PLN</span>
        </div>
        <div className="payment-summary-line">
          <span>Delivery:</span>
          <span>{deliveryFee.toFixed(2)} PLN</span>
        </div>
        <div className="payment-summary-total">
          <strong>Total:</strong>
          <strong>{totalWithDelivery} PLN</strong>
        </div>
      </div>

      {/* Правый блок — кнопка оплаты */}
      <div className="payment-footer-actions">
        {selected === "blik" && (
          <button type="submit" className="payment-btn blik-btn">
            <FaBolt />
            Pay {totalWithDelivery} PLN
          </button>
        )}

        {selected === "card" && (
          <button type="submit" className="payment-btn card-btn">
            <FaCreditCard />
            Pay {totalWithDelivery} PLN
          </button>
        )}

        {(selected === "googlepay" || selected === "applepay") &&
          (canMakePaymentResult?.googlePay || canMakePaymentResult?.applePay) &&
          paymentRequest && (
            <PaymentRequestButtonElement
              key="payment-request-button"
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
