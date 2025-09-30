import "./FlippableDeliveryCard.css";
import { useSelector } from "react-redux";
import EditProfileModal from "../../../EditProfileModal/EditProfileModal";

export function FlippableDeliveryCard({
  profile,
  onEdit,
  onLogOut,
  isFlipped = false,
  style,
  onClick
}) {
  const auth = useSelector((state) => state.auth);
  const data = profile || auth;

  if (!data) {
    console.warn("⚠️ FlippableDeliveryCard: profile/auth data is null");
    return null;
  }

  const {
    name,
    email,
    cardNumber,
    registrationDate,
    delivery,
    personalData,
    address,
    phoneNumber
  } = data;

  const phone = personalData?.phone || phoneNumber;

  return (
    <>
      <div className="uc-card-container" style={style}>
        <div
          className={`uc-flippable-card ${isFlipped ? "uc-flipped" : ""}`}
          onClick={onClick}
        >
          {/* Front Side */}
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
              <div className="uc-profile-info">
                <div className="uc-flip-card-section">
                  <h2 className="uc-flip-user-name">{name}</h2>
                  <p className="uc-flip-user-email">{email}</p>
                </div>
              </div>

              <div className="uc-flip-hint">
                <p className="uc-flip-hint-text">Tap to view delivery details</p>
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

          {/* Back Side */}
          <div className="uc-card-back">
            <div className="uc-delivery-container">
              <h3 className="uc-back-title">Delivery Details</h3>
              {delivery ? (
                <>
                  <p><strong>Address:</strong> {delivery.address}</p>
                  <p><strong>Method:</strong> {delivery.method}</p>
                </>
              ) : (
                <div className="uc-back-section">
                  <p className="uc-back-label">Address:</p>
                  <p>{address?.street}</p>
                  <p>{address?.city}</p>
                  <p>{address?.postalCode}</p>
                  {address?.country && <p>{address.country}</p>}
                </div>
              )}
              {phone && (
                <div className="uc-back-section">
                  <p className="uc-back-label">Contact Number:</p>
                  <p>{phone}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Edit modal fallback */}
      {!onEdit && (
        <EditProfileModal
          isOpen={false}
          onClose={() => {}}
        />
      )}
    </>
  );
}
