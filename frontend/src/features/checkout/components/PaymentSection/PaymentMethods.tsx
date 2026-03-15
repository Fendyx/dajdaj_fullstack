import React from "react";
import { CreditCard, Smartphone, Landmark, ShoppingBag } from "lucide-react";

import { BlikPayment } from "./BlikPayment";
import { CardPayment } from "./CardPayment";

import "./PaymentMethods.css";

interface PaymentMethodsProps {
  selected: string;
  onSelect: (id: string) => void;
  blikCode?: string;
  setBlikCode?: (code: string) => void;
  cardFields?: any;
  handleCardFieldChange?: (field: "number" | "expiry" | "cvc") => any;
  canMakePaymentResult?: { applePay?: boolean; googlePay?: boolean } | null;
}

export const PaymentMethods = ({
  selected,
  onSelect,
  blikCode = "",
  setBlikCode = () => {},
  handleCardFieldChange = () => () => {},
  canMakePaymentResult,
}: PaymentMethodsProps) => {

  const renderOption = (
    id: string,
    label: string,
    icon: React.ReactNode,
    iconClass: string,
    children: React.ReactNode = null
  ) => {
    const isSelected = selected === id;

    return (
      <div className={`pm-option${isSelected ? " pm-option--selected" : ""}`} key={id}>
        <div className="pm-option__header" onClick={() => onSelect(id)}>
          <div className="pm-option__left">
            <div className={`pm-radio${isSelected ? " pm-radio--active" : ""}`}>
              {isSelected && <div className="pm-radio__dot" />}
            </div>
            <div className={`pm-icon ${iconClass}`}>
              {icon}
            </div>
            <span className="pm-option__label">{label}</span>
          </div>

          {id === "card" && (
            <div className="pm-card-brands">
              <span className="pm-brand pm-brand--mastercard" />
              <span className="pm-brand pm-brand--visa" />
            </div>
          )}
        </div>

        {isSelected && children && (
          <div className="pm-option__content">
            {children}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="pm-container">
      <h3 className="pm-container__title">Payment Method</h3>

      {canMakePaymentResult?.googlePay && renderOption(
        "google_apple_pay",
        "Google Pay",
        <Smartphone size={20} />,
        "pm-icon--google",
        <p className="pm-helper">Confirm payment via the button below.</p>
      )}

      {canMakePaymentResult?.applePay && renderOption(
        "apple_pay",
        "Apple Pay",
        <Smartphone size={20} />,
        "pm-icon--apple",
        <p className="pm-helper">Confirm payment via the button below.</p>
      )}

      {renderOption(
        "blik",
        "BLIK",
        <img src="/blik.svg" alt="BLIK" className="pm-icon__img" />,
        "pm-icon--blik",
        <BlikPayment blikCode={blikCode} setBlikCode={setBlikCode} />
      )}

      {renderOption(
        "card",
        "Credit or Debit Card",
        <CreditCard size={20} />,
        "pm-icon--card",
        <CardPayment handleCardFieldChange={handleCardFieldChange} />
      )}

      {renderOption(
        "p24",
        "Przelewy24",
        <Landmark size={20} />,
        "pm-icon--p24",
        <p className="pm-helper">You will be redirected to your bank to complete the payment.</p>
      )}

      {renderOption(
        "klarna",
        "Klarna — Pay Later",
        <ShoppingBag size={20} />,
        "pm-icon--klarna",
        <p className="pm-helper">Buy now, pay later. You will be redirected to Klarna.</p>
      )}
    </div>
  );
};

export default PaymentMethods;