import React from "react";
import { PaymentRequestButtonElement } from "@stripe/react-stripe-js";
import { FaLock, FaShieldAlt } from "react-icons/fa";
import "./PaymentFooter.css";

const PaymentFooter = ({
  selected,
  paymentRequest,
  onSubmit,
  amount, // Цена в ЦЕНТАХ (или грошах)
  disabled,
  isDesktop
}) => {
  
  // Определяем, нужно ли показывать кнопку кошелька (Google/Apple)
  // Важно: в PaymentMethods мы использовали ID "google_apple_pay" для обоих
  const isWalletPayment = (selected === "google_apple_pay") && paymentRequest;

  const formattedPrice = (amount / 100).toFixed(2);

  return (
    <div className={`payment-footer-container ${isDesktop ? 'desktop' : 'mobile'}`}>
      <div className="pf-content">
        
        {/* Левая часть: Итоговая сумма (только для мобильной версии, на десктопе кнопка широкая) */}
        {!isDesktop && (
          <div className="pf-total-section">
            <span className="pf-total-label">Total</span>
            <span className="pf-total-value">{formattedPrice} PLN</span>
          </div>
        )}

        {/* Правая часть: Действие */}
        <div className="pf-action-section">
          {isWalletPayment ? (
            <div className="pf-wallet-wrapper">
               {/* Кнопка Stripe сама рендерит "Pay with GPay/ApplePay" */}
               <PaymentRequestButtonElement
                options={{
                  paymentRequest,
                  style: {
                    paymentRequestButton: {
                      theme: 'dark',
                      height: '48px', // Высота как у обычной кнопки
                    },
                  },
                }}
              />
            </div>
          ) : (
            <button
              type="button" // Используем onClick вместо form submit для контроля
              className={`pf-submit-btn ${disabled ? 'disabled' : ''}`}
              onClick={onSubmit}
              disabled={disabled}
            >
              {disabled ? (
                "Processing..."
              ) : (
                <>
                  <FaLock size={12} style={{marginRight: '8px'}}/>
                  {/* На десктопе покажем просто Pay, на мобилке Pay */}
                  Pay {isDesktop ? `${formattedPrice} PLN` : "Now"}
                </>
              )}
            </button>
          )}
        </div>
      </div>
      
      {/* Безопасность (подпись внизу) */}
      <div className="pf-security-row">
         <FaShieldAlt size={10} />
         <span>Secure SSL Encrypted Payment</span>
      </div>
    </div>
  );
};

export default PaymentFooter;