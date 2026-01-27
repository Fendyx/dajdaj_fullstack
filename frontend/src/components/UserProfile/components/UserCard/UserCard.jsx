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

  // 👇 Безопасно достаем deliveryDatas[0], даже если массив пуст
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

  // 👇 Берем delivery и personalData из первой записи, если есть
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
                  <svg className="uc-button-icon" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34a.9959.9959 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
                  </svg>
                  Edit
                </button>
                <button
                  className="uc-card-button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onLogOut?.();
                  }}
                >
                  <svg className="uc-button-icon" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.59L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"/>
                  </svg>
                  Log Out
                </button>
              </div>

              <div className="uc-profile-info">
                {/* 1. Имя и Email (остались на месте) */}
                <div className="uc-flip-card-section">
                  <h2 className="uc-flip-user-name">{name} {surname}</h2>
                  <p className="uc-flip-user-email">{email}</p>
                </div>

                {/* 2. Телефон (перенесен с Back) */}
                {phone && (
                  <div className="uc-flip-card-section">
                    <p className="uc-flip-section-label">Contact Number</p>
                    <p className="uc-flip-section-value">{phone}</p>
                  </div>
                )}

                {/* 3. Информация о доставке (перенесена с Back) */}
                <div className="uc-flip-card-section">
                  <p className="uc-flip-section-label">Delivery Info</p>
                  <div className="uc-flip-section-value" style={{ fontSize: '0.9em' }}>
                    {delivery && (delivery.address || delivery.method) ? (
                      <>
                        {delivery.address && <div>{delivery.address}</div>}
                        {delivery.method && <div>Method: {delivery.method}</div>}
                      </>
                    ) : address ? (
                      <>
                        {address.street && <span>{address.street}, </span>}
                        {address.city && <span>{address.city}</span>}
                      </>
                    ) : (
                      <span>No delivery data</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="uc-flip-hint">
                <p className="uc-flip-hint-text">Tap to view Card ID & Date</p>
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

          {/* --- Back Side --- */}
          <div className="uc-card-back">
            <div className="uc-delivery-container">
              <h3 className="uc-back-title">Membership Details</h3>

              {/* 1. Card ID (перенесен с Front) */}
              <div className="uc-back-section">
                <p className="uc-back-label">Card ID</p>
                <p>{cardNumber}</p>
              </div>

              {/* 2. Member Since (перенесен с Front) */}
              <div className="uc-back-section">
                <p className="uc-back-label">Member since</p>
                <p>
                  {registrationDate && new Date(registrationDate).toLocaleDateString()}
                </p>
              </div>
              
              {/* Полный адрес (если нужно больше деталей на обороте) или можно оставить пустым */}
              {address && (address.postalCode || address.country) && (
                 <div className="uc-back-section">
                    <p className="uc-back-label">Region</p>
                    <p>{address.postalCode} {address.country}</p>
                 </div>
              )}

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