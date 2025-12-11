import { useState } from "react";
import { FaCreditCard, FaGoogle, FaApple, FaBolt, FaChevronUp, FaChevronDown } from "react-icons/fa";
import { PaymentRequestButtonElement } from "@stripe/react-stripe-js";
import { useSelector } from "react-redux";
import "./PaymentFooter.css";

const PaymentFooter = ({ selected, paymentRequest, canMakePaymentResult }) => {
  const cartItems = useSelector((state) => state.cart.cartItems);
  const auth = useSelector((state) => state.auth);

  // Состояние для раскрытия деталей цены на мобильном
  const [showDetails, setShowDetails] = useState(false);

  // Считаем сумму
  const cartTotal = cartItems.reduce((total, item) => total + item.price * item.cartQuantity, 0);
  
  // ВАЖНО: Лучше брать стоимость доставки из стейта, если она там есть.
  // Пока оставим заглушку, но имей в виду.
  const deliveryFee = 9.99; 
  const totalWithDelivery = (cartTotal + deliveryFee).toFixed(2);

  return (
    <>
      {/* Затемнение фона при открытых деталях (для фокуса) */}
      {showDetails && <div className="pf-overlay" onClick={() => setShowDetails(false)} />}

      <div className={`payment-footer ${showDetails ? "expanded" : ""}`}>
        
        {/* Раскрывающаяся часть с деталями (Subtotal/Delivery) */}
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

        {/* Основная панель */}
        <div className="pf-main-bar">
          
          {/* Левая часть: Итого + Тоггл деталей */}
          <div className="pf-total-info" onClick={() => setShowDetails(!showDetails)}>
            <div className="pf-total-label">
              <span>Total</span>
              <div className="pf-chevron">
                {showDetails ? <FaChevronDown /> : <FaChevronUp />}
              </div>
            </div>
            <div className="pf-total-amount">{totalWithDelivery} PLN</div>
          </div>

          {/* Правая часть: Кнопка действия */}
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

            {(selected === "googlepay" || selected === "applepay") &&
              (canMakePaymentResult?.googlePay || canMakePaymentResult?.applePay) &&
              paymentRequest && (
                <div className="pf-wallet-btn-wrapper">
                  <PaymentRequestButtonElement
                    options={{ paymentRequest }}
                    style={{
                      paymentRequestButton: {
                        type: "default",
                        theme: "light",
                        height: "48px", // Делаем высоту под палец
                      },
                    }}
                  />
                </div>
              )}
          </div>
        </div>
      </div>
    </>
  );
};

export default PaymentFooter;