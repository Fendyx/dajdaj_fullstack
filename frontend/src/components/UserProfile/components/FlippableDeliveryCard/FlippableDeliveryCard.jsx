import "./FlippableDeliveryCard.css";
import { useSelector } from "react-redux";
import EditProfileModal from "../../../EditProfileModal/EditProfileModal";
import { useState } from "react";

export function FlippableDeliveryCard({
  profile,
  onEdit,
  onLogOut,
  isFlipped = false,
  style,
  onClick,
  gradient
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const auth = useSelector((state) => state.auth);
  const data = profile || auth;

  if (!data) return null;

  // ВОЗВРАЩЕНА СТАРАЯ ЛОГИКА
  const {
    name,
    email,
    delivery,
    personalData,
    address,
    phoneNumber,
    cardNumber,
    registrationDate
  } = data;

  const phone = personalData?.phone || phoneNumber;

  return (
    <>
      <div className="uc-card-container" style={style}>
        <div
          className={`uc-flippable-card ${isFlipped ? "uc-flipped" : ""}`}
          onClick={onClick}
        >
          {/* --- Front Side (Стилизация под UserCard) --- */}
          <div className="uc-card-front" style={{ background: gradient?.front }}>
            <div className="uc-flip-pattern">
              <div className="uc-flip-pattern-element-1"></div>
              <div className="uc-flip-pattern-element-2"></div>
              <div className="uc-flip-pattern-element-3"></div>
              <div className="uc-flip-pattern-element-4"></div>
              <div className="uc-flip-pattern-element-5"></div>
            </div>

            <div className="uc-flip-card-logo">
              <div className="uc-flip-logo-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z"/>
                </svg>
              </div>
              <span className="uc-flip-logo-text">DajDaj</span>
            </div>

            <div className="uc-flip-card-content">
              {/* Кнопки управления */}
              <div className="uc-flip-card-top">
                <button
                  className="uc-card-button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsModalOpen(true);
                  }}
                >
                  Edit
                </button>
                <button
                  className="uc-card-button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onLogOut?.();
                  }}
                >
                  Log Out
                </button>
              </div>

              <div className="uc-profile-info">
                {/* 1. Имя и Email */}
                <div className="uc-flip-card-section">
                  <h2 className="uc-flip-user-name">{name}</h2>
                  <p className="uc-flip-user-email">{email}</p>
                </div>

                {/* 2. Телефон (как в UserCard) */}
                {phone && (
                  <div className="uc-flip-card-section">
                    <p className="uc-flip-section-label">Contact Number</p>
                    <p className="uc-flip-section-value">{phone}</p>
                  </div>
                )}

                {/* 3. Информация о доставке с обрезкой текста */}
                <div className="uc-flip-card-section">
                  <p className="uc-flip-section-label">Delivery Info</p>
                  <div className="uc-flip-section-value uc-address-truncate">
                    {delivery ? (
                      <>
                        <span>{delivery.address}</span>
                        {delivery.method && <div className="uc-method-tag">Method: {delivery.method}</div>}
                      </>
                    ) : address ? (
                      <span>{address.street}, {address.city}</span>
                    ) : (
                      "No delivery data"
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="uc-card-styling">
              <div className="uc-styling-dots">
                <div className="uc-styling-dot"></div>
                <div className="uc-styling-dot"></div>
                <div className="uc-styling-dot"></div>
              </div>
            </div>
          </div>

          {/* --- Back Side (Полные данные) --- */}
          <div className="uc-card-back" style={{ background: gradient?.back }}>
            <div className="uc-delivery-container">
              <h3 className="uc-back-title">Delivery Details</h3>
              <div className="uc-back-section">
                <p className="uc-back-label">Full Address:</p>
                <p className="uc-full-address-text">
                  {delivery?.address || `${address?.street || ''} ${address?.city || ''}`}
                </p>
              </div>
              <div className="uc-back-section">
                <p className="uc-back-label">Method:</p>
                <p>{delivery?.method || "Not specified"}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <EditProfileModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}