import React from "react";
import { FaCreditCard, FaGoogle, FaApple, FaBolt } from "react-icons/fa";
import BlikPayment from "./BlikPayment";
import CardPayment from "./CardPayment";
import "./PaymentMethods.css"; 
import GoogleApplePayButton from "./GoogleApplePayButton";

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
  paymentRequest, // <--- 1. ДОБАВЬТЕ ЭТУ СТРОКУ СЮДА
}) => {
  
  // Вспомогательная функция для рендера опции
  const renderOption = (id, label, icon, iconClass, children = null) => {
    // ... ваш код renderOption без изменений ...
    const isSelected = selected === id;
    
    return (
      <div className={`pm-option-container ${isSelected ? "selected" : ""}`}>
        <div className="pm-option-header" onClick={() => setSelected(id)}>
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
      <h3 className="pm-title">Choose payment method</h3>
      
      <div className="pm-list">
        
        {/* Google Pay */}
        {canMakePaymentResult?.googlePay && renderOption(
          "googlepay", 
          "Google Pay", 
          <FaGoogle />, 
          "pm-google",
          // Теперь paymentRequest доступен и ошибка исчезнет
          <GoogleApplePayButton paymentRequest={paymentRequest} />
        )}

        {/* Apple Pay */}
        {canMakePaymentResult?.applePay && renderOption(
          "applepay", 
          "Apple Pay", 
          <FaApple />, 
          "pm-apple",
          // Здесь тоже
          <GoogleApplePayButton paymentRequest={paymentRequest} />
        )}

        {/* BLIK */}
        {renderOption(
          "blik", 
          "BLIK", 
          <FaBolt />, 
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

      </div>
    </div>
  );
};

export default PaymentMethods;