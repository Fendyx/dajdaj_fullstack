import { useState } from "react";
import { FaCreditCard, FaBolt, FaChevronUp, FaChevronDown } from "react-icons/fa";
// Используем наш исправленный компонент кнопки
import GoogleApplePayButton from "./PaymentMethods/GoogleApplePayButton";
import { useSelector } from "react-redux";
import "./PaymentFooter.css";

const PaymentFooter = ({ selected, paymentRequest, canMakePaymentResult }) => {
  const cartItems = useSelector((state) => state.cart.cartItems);

  const [showDetails, setShowDetails] = useState(false);

  // Считаем сумму правильно, используя цены товаров
  const cartTotal = cartItems.reduce((total, item) => total + (item.price * item.cartQuantity), 0);
  const deliveryFee = 9.99; 
  const totalWithDelivery = (cartTotal + deliveryFee).toFixed(2);

  return (
    <>
      {showDetails && <div className="pf-overlay" onClick={() => setShowDetails(false)} />}

      <div className={`payment-footer ${showDetails ? "expanded" : ""}`}>
        
        {showDetails && (
          <div className="pf-details">
            <div className="pf-row">
              <span>Subtotal</span>
              <span>{cartTotal.toFixed(2)} PLN</span>
            </div>
            <div className="pf-row">
              <span>Shipping</span>
              <span>{deliveryFee.toFixed(2)} PLN</span>
            </div>
            <div className="pf-divider"></div>
          </div>
        )}

        <div className="pf-main-bar">
          
          <div className="pf-total-info" onClick={() => setShowDetails(!showDetails)}>
            <div className="pf-total-label">
              <span>Total</span>
              <div className="pf-chevron">
                {showDetails ? <FaChevronDown /> : <FaChevronUp />}
              </div>
            </div>
            <div className="pf-total-amount">{totalWithDelivery} PLN</div>
          </div>

          <div className="pf-actions">
            {selected === "blik" && (
              <button type="submit" form="payment-form" className="pf-btn blik-btn">
                <span className="btn-icon"><FaBolt /></span>
                <span>Pay</span>
              </button>
            )}

            {selected === "card" && (
              <button type="submit" form="payment-form" className="pf-btn card-btn">
                <span className="btn-icon"><FaCreditCard /></span>
                <span>Pay</span>
              </button>
            )}

            {/* Рендерим кнопку ТОЛЬКО здесь, чтобы избежать конфликтов */}
            {(selected === "googlepay" || selected === "applepay") &&
              (canMakePaymentResult?.googlePay || canMakePaymentResult?.applePay) &&
              paymentRequest && (
                <div className="pf-wallet-btn-wrapper" style={{ width: "100%" }}>
                  <GoogleApplePayButton paymentRequest={paymentRequest} />
                </div>
              )}
          </div>
        </div>
      </div>
    </>
  );
};

export default PaymentFooter;