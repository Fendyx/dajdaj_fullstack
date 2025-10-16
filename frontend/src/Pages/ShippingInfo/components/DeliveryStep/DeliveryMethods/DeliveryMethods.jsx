import React from "react";
import { FiClock, FiTruck, FiZap, FiPackage } from "react-icons/fi";
import "./DeliveryMethods.css";

const deliveryMethods = [
  {
    id: "standard",
    name: "Standard Delivery",
    description: "Regular delivery during business hours",
    time: "45-60 min",
    price: 2.99,
    icon: FiPackage,
  },
  {
    id: "express",
    name: "Express Delivery", 
    description: "Priority delivery with real-time tracking",
    time: "25-35 min",
    price: 4.99,
    icon: FiTruck,
    isPopular: true,
  },
  {
    id: "flash",
    name: "Flash Delivery",
    description: "Ultra-fast delivery for urgent orders", 
    time: "15-20 min",
    price: 7.99,
    icon: FiZap,
    isFastest: true,
  },
];

export function DeliveryMethods({ selectedMethod, onMethodSelect }) {
  return (
    <div className="delivery-methods">
      <h3 className="delivery-methods-title">Choose Delivery Method</h3>
      
      <div className="radio-group">
        <div className="methods-list">
          {deliveryMethods.map((method) => {
            const IconComponent = method.icon;
            return (
              <div key={method.id} className="method-item">
                <input
                  type="radio"
                  value={method.id}
                  id={method.id}
                  checked={selectedMethod === method.id}
                  onChange={() => onMethodSelect(method.id)}
                  className="method-radio"
                />
                <label htmlFor={method.id} className="method-label">
                  <div className={`method-card ${selectedMethod === method.id ? 'method-card-selected' : ''}`}>
                    <div className="method-content">
                      <div className="method-icon-container">
                        <IconComponent className="method-icon" />
                      </div>
                      <div className="method-info">
                        <div className="method-header">
                          <span className="method-name">{method.name}</span>
                          {method.isPopular && (
                            <span className="badge badge-popular">Popular</span>
                          )}
                          {method.isFastest && (
                            <span className="badge badge-fastest">Fastest</span>
                          )}
                        </div>
                        <p className="method-description">{method.description}</p>
                        <div className="method-time">
                          <FiClock className="time-icon" />
                          <span>{method.time}</span>
                        </div>
                      </div>
                      <div className="method-price">
                        ${method.price.toFixed(2)}
                      </div>
                    </div>
                  </div>
                </label>
              </div>
            );
          })}
        </div>
      </div>

      {/* Delivery Info */}
      <div className="delivery-info">
        <div className="info-content">
          <div className="info-icon-container">
            <FiClock className="info-icon" />
          </div>
          <div className="info-text">
            <p className="info-main">Delivery times are estimates and may vary based on traffic and weather conditions.</p>
            <p className="info-secondary">All orders are tracked in real-time once dispatched.</p>
          </div>
        </div>
      </div>
    </div>
  );
}