import React from "react";
import { CheckoutInfoSign } from "./CheckoutInfoSign/CheckoutInfoSign";
import { AddressSearch } from "./AddressSearch/AddressSearch";
import { DeliveryMethods } from "./DeliveryMethods/DeliveryMethods";
import { OrderSummary } from "./OrderSummary/OrderSummary";
import Maps from "./Maps";
import "./DeliveryStep.css"

export default function DeliveryStep({
  selectedAddress,
  selectedMethod,
  onAddressChange,
  onMethodChange,
  onBack,
  onPlaceOrder,
  personalData,
  delivery
}) {
  return (
    <div className="checkouttest-container">
      <CheckoutInfoSign />
      <div className="panels-container">
        <div className="left-panel">
          <AddressSearch
            selectedAddress={selectedAddress}
            onAddressSelect={onAddressChange}
          />
          <div className="map-container">
            <span className="address-search-label">Delivery location</span>
            <Maps selectPosition={selectedAddress} />
          </div>
          <DeliveryMethods
            selectedMethod={selectedMethod}
            onMethodSelect={onMethodChange}
          />
        </div>
        <div className="right-panel">
          <OrderSummary 
            personalData={personalData}
            delivery={delivery}
            onPlaceOrder={onPlaceOrder}
            onBack={onBack}
          />
        </div>
      </div>
    </div>
  );
}
