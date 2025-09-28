import React from "react";
import "./SelectDeliveryMethod.css";
import { FlippableDeliveryCard } from "../../../../components/UserProfile/components/FlippableDeliveryCard/FlippableDeliveryCard";

export default function SelectDeliveryMethod() {
  return (
    <div className="shipping-card-wrapper">

      <div>
        <div className="radio-indicator">
          <button className="radio-button">
            <div className="radio-dot"></div>
          </button>
        </div>
        <FlippableDeliveryCard />
      </div>
    
      <div>
        <span className="se-">Choose different shipping info</span>
        <span>Proceed to payment</span>
      </div>

    </div>
  );
}
