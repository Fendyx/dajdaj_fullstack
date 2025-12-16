import React from "react";
import {
  FaUser,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaCity,
  FaMailBulk,
  FaTruck,
  FaBoxOpen
} from "react-icons/fa";
import "./PersonalInformationForm.css";

const PersonalInformationForm = ({ formData, handleChange }) => {
  
  // Варианты доставки (можно вынести в пропсы или конфиг)
  const deliveryOptions = [
    {
      id: "inpost",
      label: "InPost Paczkomaty 24/7",
      time: "1-2 business days",
      price: "Free", // или логика цены
      icon: <FaBoxOpen />
    },
    {
      id: "courier",
      label: "Courier DPD/DHL",
      time: "Next day delivery",
      price: "PLN 15.00",
      icon: <FaTruck />
    }
  ];

  // Хелпер для обработки клика по карточке доставки
  const handleDeliverySelect = (methodId) => {
    // Эмулируем событие change для родительского стейта
    handleChange({
      target: { name: "method", value: methodId }
    });
  };

  return (
    <div className="shipping-form-container">
      
      {/* SECTION: CONTACT INFO */}
      <div className="form-section">
        <h3 className="form-section-title">Contact Information</h3>
        <div className="form-grid">
          <div className="form-group full-width">
            <label className="form-label">Email Address</label>
            <div className="input-wrapper">
              <FaEnvelope className="input-icon" />
              <input
                type="email"
                name="email"
                placeholder="you@example.com"
                value={formData.email || ""}
                onChange={handleChange}
                required
              />
            </div>
          </div>
          
          <div className="form-group full-width">
             <label className="form-label">Phone Number</label>
             <div className="input-wrapper">
              <FaPhone className="input-icon" />
              <input
                type="tel"
                name="phone"
                placeholder="+48 000 000 000"
                value={formData.phone || ""}
                onChange={handleChange}
                required
              />
            </div>
          </div>
        </div>
      </div>

      {/* SECTION: SHIPPING ADDRESS */}
      <div className="form-section">
        <h3 className="form-section-title">Shipping Address</h3>
        <div className="form-grid">
          
          {/* First & Last Name */}
          <div className="form-group">
            <label className="form-label">First Name</label>
            <div className="input-wrapper">
              <FaUser className="input-icon" />
              <input
                type="text"
                name="name"
                placeholder="John"
                value={formData.name || ""}
                onChange={handleChange}
                required
              />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Last Name</label>
            <div className="input-wrapper">
               {/* Иконку можно не дублировать для чистоты */}
              <input
                type="text"
                name="surname" // или lastName в зависимости от твоего стейта
                placeholder="Doe"
                value={formData.surname || ""}
                onChange={handleChange}
                required
                style={{ paddingLeft: '1rem' }} // Убираем отступ под иконку
              />
            </div>
          </div>

          {/* Address Line 1 */}
          <div className="form-group full-width">
            <label className="form-label">Street Address</label>
            <div className="input-wrapper">
              <FaMapMarkerAlt className="input-icon" />
              <input
                type="text"
                name="address" // Желательно разбить на line1 в будущем
                placeholder="Ul. Złota 44/2"
                value={formData.address || ""}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {/* City & Zip */}
          <div className="form-group">
            <label className="form-label">City</label>
            <div className="input-wrapper">
              <FaCity className="input-icon" />
              <input
                type="text"
                name="city" // Добавь это поле в стейт родителя
                placeholder="Warsaw"
                value={formData.city || ""}
                onChange={handleChange}
                required
              />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Postal Code</label>
            <div className="input-wrapper">
              <FaMailBulk className="input-icon" />
              <input
                type="text"
                name="postal_code" // Добавь это поле в стейт родителя
                placeholder="00-001"
                value={formData.postal_code || ""}
                onChange={handleChange}
                required
              />
            </div>
          </div>
        </div>
      </div>

      {/* SECTION: DELIVERY METHOD */}
      <div className="form-section">
        <h3 className="form-section-title">Delivery Method</h3>
        <div className="delivery-options-grid">
          {deliveryOptions.map((option) => (
            <div
              key={option.id}
              className={`delivery-card ${formData.method === option.id ? "selected" : ""}`}
              onClick={() => handleDeliverySelect(option.id)}
            >
              <div className="delivery-card-icon">
                {option.icon}
              </div>
              <div className="delivery-card-info">
                <span className="delivery-name">{option.label}</span>
                <span className="delivery-time">{option.time}</span>
              </div>
              <div className="delivery-price">
                {option.price}
              </div>
              {/* Radio Circle Indicator */}
              <div className="radio-circle">
                {formData.method === option.id && <div className="radio-dot" />}
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};

export default PersonalInformationForm;