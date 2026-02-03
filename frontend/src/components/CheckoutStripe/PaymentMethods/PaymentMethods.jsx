import React from "react";
import { FaCreditCard, FaGoogle, FaApple, FaUniversity, FaShoppingBag } from "react-icons/fa";
import BlikPayment from "./BlikPayment"; // Убедись, что путь верный
import CardPayment from "./CardPayment"; // Убедись, что путь верный
import "./PaymentMethods.css"; 

const PaymentMethods = ({
  selected,
  setSelected,
  blikCode,
  setBlikCode,
  cardFields,
  handleCardFieldChange,
  handleCardFieldFocus,
  handleCardFieldBlur,
  canMakePaymentResult,
}) => {
  
  const renderOption = (id, label, icon, iconClass, children = null) => {
    const isSelected = selected === id;
    
    return (
      <div className={`pm-option-container ${isSelected ? "selected" : ""}`}>
        <div 
          className="pm-option-header" 
          onClick={() => setSelected(id)}
        >
          <div className="pm-label-group">
            <div className={`pm-radio-circle ${isSelected ? "active" : ""}`}>
               {isSelected && <div className="pm-radio-dot" />}
            </div>

            <div className={`pm-icon-box ${iconClass}`}>
              {icon}
            </div>
            
            <span className="pm-label-text">{label}</span>
          </div>

          {id === "card" && (
            <div className="pm-card-brands">
               <span className="brand-dot mastercard"></span>
               <span className="brand-dot visa"></span>
            </div>
          )}
        </div>

        {isSelected && children && (
          <div className="pm-option-content">
            {children}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="pm-container">
      {/* Google Pay */}
      {canMakePaymentResult?.googlePay && renderOption(
        "google_apple_pay", // ВАЖНО: ID должен совпадать с тем, что в StripePaymentForm
        "Google Pay", 
        <FaGoogle />, 
        "pm-google",
        <div className="pm-helper-text">
          Confirm payment via the button at the bottom of the screen.
        </div>
      )}

      {/* Apple Pay */}
      {canMakePaymentResult?.applePay && renderOption(
        "google_apple_pay", 
        "Apple Pay", 
        <FaApple />, 
        "pm-apple",
        <div className="pm-helper-text">
          Confirm payment via the button at the bottom of the screen.
        </div>
      )}

      {/* BLIK */}
      {renderOption(
        "blik", 
        "BLIK", 
        <img src="/blik.svg" alt="BLIK" className="pm-icon-img" />, 
        "pm-blik",
        <BlikPayment blikCode={blikCode} setBlikCode={setBlikCode} />
      )}

      {/* Credit Card */}
      {renderOption(
        "card", 
        "Credit or Debit Card", 
        <FaCreditCard />, 
        "pm-card",
        <CardPayment
          cardFields={cardFields}
          handleCardFieldChange={handleCardFieldChange}
          handleCardFieldFocus={handleCardFieldFocus}
          handleCardFieldBlur={handleCardFieldBlur}
        />
      )}

      {/* Przelewy24 */}
      {renderOption(
        "p24",
        "Przelewy24",
        <FaUniversity />, 
        "pm-p24",
        <div className="pm-helper-text">
          You will be redirected to your bank to complete the payment.
        </div>
      )}

      {/* Klarna */}
      {renderOption(
        "klarna",
        "Klarna - Pay Later",
        <FaShoppingBag />, 
        "pm-klarna",
        <div className="pm-helper-text">
          Buy now, pay later. You will be redirected to Klarna.
        </div>
      )}
    </div>
  );
};

export default PaymentMethods;