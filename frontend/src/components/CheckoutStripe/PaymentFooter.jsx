import { useState, useMemo } from "react";
import { FaCreditCard, FaBolt, FaChevronDown, FaLock, FaShieldAlt, FaUniversity, FaShoppingBag } from "react-icons/fa";
import GoogleApplePayButton from "./PaymentMethods/GoogleApplePayButton";
import { useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import "./PaymentFooter.css";

const PaymentFooter = ({ selected, paymentRequest, canMakePaymentResult, disabled }) => {
  const location = useLocation();
  const reduxCartItems = useSelector((state) => state.cart.cartItems);
  const [showDetails, setShowDetails] = useState(false);

  // --- ЛОГИКА РАСЧЕТА ---
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
    </>
  );

  return (
    <>
      {showDetails && <div className="pf-overlay" onClick={() => setShowDetails(false)} />}

      <div className={`payment-footer ${showDetails ? "expanded" : ""}`}>
        
        {showDetails && (
          <div className="pf-details pf-mobile-only">
            <DetailRows />
            <div className="pf-divider"></div>
          </div>
        )}

        <div className="pf-details pf-desktop-only">
            <DetailRows />
            <div className="pf-divider"></div>
        </div>

        <div className="pf-main-bar">
          
          <div className="pf-total-info" onClick={() => setShowDetails(!showDetails)}>
            <div className="pf-total-header">
              <span className="pf-label">Total to pay</span>
              <div className="pf-chevron">
                <FaChevronDown style={{ transform: showDetails ? 'rotate(180deg)' : 'rotate(0)' }} />
              </div>
            </div>
            
            <div className="pf-total-amount">
              {totalWithDelivery} <span className="currency">PLN</span>
            </div>
            
            <div className="pf-micro-text">Tap for details</div>
          </div>

          <div className="pf-actions">
            
            {/* BLIK Button */}
            {selected === "blik" && (
              <button type="submit" form="payment-form" className="pf-btn blik-btn" disabled={disabled}>
                <FaBolt /> 
                <span>Pay with BLIK</span>
              </button>
            )}

            {/* Credit Card Button */}
            {selected === "card" && (
              <button type="submit" form="payment-form" className="pf-btn card-btn" disabled={disabled}>
                <FaLock size={14} /> 
                <span>Pay Securely</span>
              </button>
            )}

             {/* Przelewy24 Button */}
             {selected === "p24" && (
              <button type="submit" form="payment-form" className="pf-btn" style={{ backgroundColor: "#006b3a" }} disabled={disabled}>
                <FaUniversity size={14} /> 
                <span>Pay with Bank</span>
              </button>
            )}

            {/* Klarna Button */}
            {selected === "klarna" && (
              <button type="submit" form="payment-form" className="pf-btn" style={{ backgroundColor: "#FFB3C7", color: "black" }} disabled={disabled}>
                <FaShoppingBag size={14} /> 
                <span>Pay via Klarna</span>
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