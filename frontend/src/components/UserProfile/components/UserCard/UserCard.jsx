import { useSelector } from "react-redux";
import EditProfileModal from "../../../EditProfileModal/EditProfileModal";
import { useState } from "react";

export function UserCard({
  profile,
  onEdit,
  onLogOut,
  isFlipped = false,
  style,
  onClick
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const auth = useSelector((state) => state.auth);
  const data = profile || auth;

  if (!data) {
    console.warn("⚠️ UserCard: profile/auth data is null");
    return null;
  }

  const firstDelivery = Array.isArray(data.deliveryDatas)
    ? data.deliveryDatas[0] || {}
    : {};

  const {
    name,
    surname,
    email,
    cardNumber,
    registrationDate,
    address,
    phoneNumber,
  } = data;

  const delivery = firstDelivery.delivery || {};
  const personalData = firstDelivery.personalData || {};
  const phone = personalData.phone || phoneNumber;

  return (
    <>
      <div className="uc-card-container" style={style}>
        <div
          className={`uc-flippable-card ${isFlipped ? "uc-flipped" : ""}`}
          onClick={onClick}
        >
          {/* --- Front Side --- */}
          <div className="uc-card-front">
            {/* ... (паттерны и логотип остаются без изменений) ... */}
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
                <div className="uc-flip-card-section">
                  <h2 className="uc-flip-user-name">{name} {surname}</h2>
                  <p className="uc-flip-user-email">{email}</p>
                </div>

                {phone && (
                  <div className="uc-flip-card-section">
                    <p className="uc-flip-section-label">Contact Number</p>
                    <p className="uc-flip-section-value">{phone}</p>
                  </div>
                )}

                <div className="uc-flip-card-section">
                  <p className="uc-flip-section-label">Delivery Info</p>
                  {/* Добавлен класс uc-address-truncate для трех точек */}
                  <div className="uc-flip-section-value uc-address-truncate" style={{ fontSize: '0.9em' }}>
                    {delivery && (delivery.address || delivery.method) ? (
                      <>
                        {delivery.address && <span>{delivery.address}</span>}
                        {delivery.method && <div className="uc-method-info">Method: {delivery.method}</div>}
                      </>
                    ) : address ? (
                      <span>{address.street}, {address.city}</span>
                    ) : (
                      <span>No delivery data</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* --- Back Side --- */}
          <div className="uc-card-back">
            <div className="uc-delivery-container">
              <h3 className="uc-back-title">Details & Address</h3>

              {/* Показываем ПОЛНЫЙ адрес здесь, без обрезки */}
              <div className="uc-back-section">
                <p className="uc-back-label">Full Delivery Address</p>
                <p className="uc-full-address-text">
                   {delivery.address || (address ? `${address.street}, ${address.city}` : "No address provided")}
                </p>
              </div>

              <div className="uc-back-section">
                <p className="uc-back-label">Card ID</p>
                <p className="uc-back-value">{cardNumber}</p>
              </div>

              <div className="uc-back-section">
                <p className="uc-back-label">Member since</p>
                <p className="uc-back-value">
                  {registrationDate && new Date(registrationDate).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
          
        </div>
      </div>

      {!onEdit && (
        <EditProfileModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </>
  );
}