import { useState, useMemo } from "react";
// Используем твои текущие иконки, чтобы не ставить новые библиотеки
import { FaCreditCard, FaBolt, FaChevronDown, FaLock, FaShieldAlt } from "react-icons/fa";
import GoogleApplePayButton from "./PaymentMethods/GoogleApplePayButton";
import { useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import "./PaymentFooter.css";

const PaymentFooter = ({ selected, paymentRequest, canMakePaymentResult }) => {
  const location = useLocation();
  const reduxCartItems = useSelector((state) => state.cart.cartItems);
  const [showDetails, setShowDetails] = useState(false);

  // --- ЛОГИКА РАСЧЕТА (Твоя оригинальная) ---
  const itemsToPurchase = useMemo(() => {
    if (location.state?.buyNowItem) {
      return [location.state.buyNowItem];
    }
    return reduxCartItems;
  }, [location.state, reduxCartItems]);

  const parsePrice = (value) => {
    if (typeof value === "number") return value;
    if (!value) return 0;
    const cleanString = value.toString().replace(",", ".").replace(/[^\d.]/g, "");
    return parseFloat(cleanString) || 0;
  };

  const cartTotal = itemsToPurchase.reduce((total, item) => {
    const price = parsePrice(item.price);
    const qty = Number(item.cartQuantity) || 1;
    return total + (price * qty);
  }, 0);

  const deliveryFee = 9.99; 
  const totalWithDelivery = (cartTotal + deliveryFee).toFixed(2);

  // Компонент для строк деталей (чтобы не дублировать код)
  const DetailRows = () => (
    <>
      <div className="pf-row">
        <span className="pf-row-label">Subtotal</span>
        <span className="pf-row-value">{cartTotal.toFixed(2)} PLN</span>
      </div>
      <div className="pf-row">
        <span className="pf-row-label">Shipping</span>
        <span className="pf-row-value">{deliveryFee.toFixed(2)} PLN</span>
      </div>
      {/* Если есть скидки или налоги, добавь их здесь */}
    </>
  );

  return (
    <>
      {/* Оверлей только для мобильной шторки */}
      {showDetails && <div className="pf-overlay" onClick={() => setShowDetails(false)} />}

      <div className={`payment-footer ${showDetails ? "expanded" : ""}`}>
        
        {/* --- MOBILE DETAILS (Выезжает снизу) --- */}
        {showDetails && (
          <div className="pf-details pf-mobile-only">
            <DetailRows />
            <div className="pf-divider"></div>
          </div>
        )}

        {/* --- DESKTOP DETAILS (Всегда видны на ПК) --- */}
        <div className="pf-details pf-desktop-only">
            <DetailRows />
            <div className="pf-divider"></div>
        </div>

        {/* --- MAIN BAR (Цена + Кнопки) --- */}
        <div className="pf-main-bar">
          
          {/* ЛЕВАЯ ЧАСТЬ: ИТОГО */}
          <div className="pf-total-info" onClick={() => setShowDetails(!showDetails)}>
            <div className="pf-total-header">
              <span className="pf-label">Total to pay</span>
              {/* Стрелка только на мобильном */}
              <div className="pf-chevron">
                <FaChevronDown style={{ transform: showDetails ? 'rotate(180deg)' : 'rotate(0)' }} />
              </div>
            </div>
            
            <div className="pf-total-amount">
              {totalWithDelivery} <span className="currency">PLN</span>
            </div>
            
            <div className="pf-micro-text">Tap for details</div>
          </div>

          {/* ПРАВАЯ ЧАСТЬ: КНОПКИ */}
          <div className="pf-actions">
            
            {selected === "blik" && (
              <button type="submit" form="payment-form" className="pf-btn blik-btn">
                <FaBolt /> 
                <span>Pay Now</span>
              </button>
            )}

            {selected === "card" && (
              <button type="submit" form="payment-form" className="pf-btn card-btn">
                <FaLock size={14} /> 
                <span>Pay Securely</span>
              </button>
            )}

            {/* Google / Apple Pay */}
            {(selected === "googlepay" || selected === "applepay") &&
              (canMakePaymentResult?.googlePay || canMakePaymentResult?.applePay) &&
              paymentRequest && (
                <div className="pf-wallet-wrapper">
                  <GoogleApplePayButton paymentRequest={paymentRequest} />
                </div>
              )}

            {/* Security Badge (Замок под кнопкой) */}
            <div className="pf-security">
              <FaShieldAlt size={10} />
              <span>SSL Encrypted Payment</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default PaymentFooter;