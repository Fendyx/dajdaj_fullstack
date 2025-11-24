import React, { useState } from "react";
import { FaMapMarkerAlt, FaTruck, FaBox, FaInfoCircle, FaChevronDown, FaChevronUp } from "react-icons/fa";
import "./CheckoutInfoSign.css";

export function CheckoutInfoSign() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="checkout-info-sign">
      <div 
        className="checkout-info-header toggle-header"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="icon-circle info">
          <FaInfoCircle />
        </div>
        <div className="checkout-header-text">
          <h3>How It Works</h3>
          <p>Follow these simple steps to complete your order</p>
        </div>
        {/* стрелочка только на мобильных */}
        <div className="toggle-arrow">
          {isOpen ? <FaChevronUp /> : <FaChevronDown />}
        </div>
      </div>

      {/* На десктопе всегда показываем, на мобилке скрываем/открываем */}
      <div className={`checkout-steps ${isOpen ? "open" : ""}`}>
        <div className="step">
          <div className="icon-circle">
            <FaMapMarkerAlt />
          </div>
          <div>
            <div className="step-title">
              <span className="step-number">1</span>
              <h4>Enter the Address</h4>
            </div>
            <p>Search and select your delivery address from recent locations or enter a new one</p>
          </div>
        </div>

        <div className="step">
          <div className="icon-circle">
            <FaTruck />
          </div>
          <div>
            <div className="step-title">
              <span className="step-number">2</span>
              <h4>Select Delivery Method</h4>
            </div>
            <p>Choose from Standard, Express, or Flash delivery based on your timing needs</p>
          </div>
        </div>

        <div className="step">
          <div className="icon-circle">
            <FaBox />
          </div>
          <div>
            <div className="step-title">
              <span className="step-number">3</span>
              <h4>Find Nearest Terminal</h4>
            </div>
            <p>We'll automatically locate the closest parcel terminal for convenient pickup</p>
          </div>
        </div>
      </div>

      {/* <div className="checkout-bottom-highlight">
        <div className="pulse-dot"></div>
        <p>Real-time tracking available for all delivery methods</p>
      </div> */}
    </div>
  );
}
