import "./styles.css";

export function DeliveryProfileCard({ profile, onEdit }) {
  return (
    <div className="uc-delivery-card">
      <div className="uc-card-pattern">
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
        <div className="uc-card-top">
          <button className="uc-card-button" onClick={onEdit}>
            <svg className="uc-button-icon" viewBox="0 0 24 24" fill="currentColor">
              <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34a.9959.9959 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
            </svg>
            Edit Profile
          </button>
        </div>

        <div className="uc-delivery-grid">
          <div className="uc-flip-card-bottom">
            <div className="uc-flip-card-section">
              <p className="uc-flip-section-label">Card ID</p>
              <p className="uc-flip-section-value">{profile.cardNumber}</p>
            </div>

            <div className="uc-flip-card-section">
              <h2 className="uc-flip-user-name">{profile.fullName}</h2>
              <p className="uc-flip-user-email">{profile.email}</p>
            </div>

            <div className="uc-flip-card-section">
              <p className="uc-flip-section-label">Member since</p>
              <p className="uc-flip-section-value">{profile.registrationDate}</p>
            </div>
          </div>

          <div className="uc-delivery-address">
            <div className="uc-address-header">
              <svg className="uc-address-icon" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
              </svg>
              <p className="uc-flip-section-label">Delivery Address</p>
            </div>
            <div className="uc-address-content">
              <p>{profile.address.street}</p>
              <p>{profile.address.city}</p>
              <p>{profile.address.postalCode}</p>
              <p>{profile.address.country}</p>
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
  );
}
