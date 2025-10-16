import React from "react";
import { FiCreditCard, FiArrowRight } from "react-icons/fi";
import "./OrderSummary.css";

export function OrderSummary({ personalData, delivery, onPlaceOrder, onBack }) {
  const handlePlaceOrder = () => {
    if (delivery?.address?.address && delivery?.method && onPlaceOrder) {
      onPlaceOrder();
    }
  };

  return (
    <div className="order-summary">
      <div className="order-summary-card">
        <h2 className="order-summary-title">Order Summary</h2>

        {/* Personal Data */}
        <div className="order-section">
          <h3 className="section-title">Personal Information</h3>
          <p><strong>Name:</strong> {personalData.name} {personalData.surname}</p>
          <p><strong>Email:</strong> {personalData.email}</p>
          <p><strong>Phone:</strong> {personalData.phone}</p>
        </div>

        <div className="separator"></div>

        {/* Delivery Data */}
        <div className="order-section">
          <h3 className="section-title">Delivery</h3>
          <p><strong>Address:</strong> {delivery?.address?.address}</p>
          <p><strong>Method:</strong> {delivery?.method}</p>
        </div>

        <div className="separator"></div>

        {/* Buttons */}
        <div className="order-summary-actions">
          <button 
            onClick={onBack} 
            className="btn btn-secondary"
          >
            Wstecz
          </button>
          <button 
            onClick={handlePlaceOrder}
            className="place-order-btn"
            disabled={!delivery?.address?.address || !delivery?.method}
          >
            <FiCreditCard className="btn-icon" />
            Place Order
            <FiArrowRight className="btn-icon" />
          </button>
        </div>

        {/* Payment Info */}
        <p className="payment-info">
          You'll be redirected to payment processing
        </p>
      </div>
    </div>
  );
}
