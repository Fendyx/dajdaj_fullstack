import { useGetUserByIdQuery } from "../api/adminUsersApi";
import "./UserModal.css";

interface Props {
  userId: string;
  onClose: () => void;
}

export function UserModal({ userId, onClose }: Props) {
  const { data: user, isLoading } = useGetUserByIdQuery(userId);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div className="user-modal__backdrop" onClick={handleBackdropClick}>
      <div className="user-modal">
        <div className="user-modal__header">
          <h2 className="user-modal__title">User Details</h2>
          <button className="user-modal__close" onClick={onClose}>✕</button>
        </div>

        {isLoading ? (
          <div className="user-modal__loading">Loading...</div>
        ) : !user ? (
          <div className="user-modal__loading">User not found</div>
        ) : (
          <div className="user-modal__body">
            {/* Main info */}
            <section className="user-modal__section">
              <h3 className="user-modal__section-title">Account</h3>
              <div className="user-modal__grid">
                <div className="user-modal__field">
                  <span className="user-modal__label">MongoDB ID</span>
                  <span className="user-modal__value user-modal__mono">{user._id}</span>
                </div>
                <div className="user-modal__field">
                  <span className="user-modal__label">Client ID</span>
                  <span className="user-modal__value user-modal__mono">#{user.clientId}</span>
                </div>
                <div className="user-modal__field">
                  <span className="user-modal__label">Name</span>
                  <span className="user-modal__value">{user.name}</span>
                </div>
                <div className="user-modal__field">
                  <span className="user-modal__label">Email</span>
                  <span className="user-modal__value">{user.email}</span>
                </div>
                <div className="user-modal__field">
                  <span className="user-modal__label">Role</span>
                  <span className={`user-modal__role user-modal__role--${user.role}`}>
                    {user.role}
                  </span>
                </div>
                <div className="user-modal__field">
                  <span className="user-modal__label">Card Number</span>
                  <span className="user-modal__value user-modal__mono">
                    {user.cardNumber || "—"}
                  </span>
                </div>
                <div className="user-modal__field">
                  <span className="user-modal__label">Registered</span>
                  <span className="user-modal__value">
                    {new Date(user.registrationDate).toLocaleString("pl-PL")}
                  </span>
                </div>
                <div className="user-modal__field">
                  <span className="user-modal__label">GDPR Consent</span>
                  <span className="user-modal__value">
                    {user.gdprConsent?.accepted
                      ? `Accepted v${user.gdprConsent.version} — ${new Date(user.gdprConsent.acceptedAt || "").toLocaleDateString("pl-PL")}`
                      : "Not accepted"}
                  </span>
                </div>
              </div>
            </section>

            {/* Discounts */}
            <section className="user-modal__section">
              <h3 className="user-modal__section-title">
                Discounts ({user.discounts?.length || 0})
              </h3>
              {user.discounts?.length ? (
                <div className="user-modal__list">
                  {user.discounts.map((d, i) => (
                    <div key={i} className="user-modal__list-item">
                      <span className="user-modal__mono">{d.code}</span>
                      <span className="user-modal__badge">{d.value}%</span>
                      <span className="user-modal__muted">
                        Expires: {new Date(d.expiresAt).toLocaleDateString("pl-PL")}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <span className="user-modal__empty">No discounts</span>
              )}
            </section>

            {/* Delivery profiles */}
            <section className="user-modal__section">
              <h3 className="user-modal__section-title">
                Delivery Profiles ({user.deliveryDatas?.length || 0})
              </h3>
              {user.deliveryDatas?.length ? (
                <div className="user-modal__delivery-list">
                  {user.deliveryDatas.map((d, i) => (
                    <div key={i} className="user-modal__delivery-card">
                      <div className="user-modal__delivery-header">
                        <span className="user-modal__mono">Profile #{d.deliveryId}</span>
                        {user.defaultDeliveryId === d.deliveryId && (
                          <span className="user-modal__badge user-modal__badge--green">Default</span>
                        )}
                      </div>
                      <div className="user-modal__grid user-modal__grid--sm">
                        <div className="user-modal__field">
                          <span className="user-modal__label">Name</span>
                          <span className="user-modal__value">
                            {[d.personalData.name, d.personalData.surname].filter(Boolean).join(" ") || "—"}
                          </span>
                        </div>
                        <div className="user-modal__field">
                          <span className="user-modal__label">Phone</span>
                          <span className="user-modal__value">{d.personalData.phone || "—"}</span>
                        </div>
                        <div className="user-modal__field">
                          <span className="user-modal__label">Method</span>
                          <span className="user-modal__value">{d.delivery.method || "—"}</span>
                        </div>
                        <div className="user-modal__field">
                          <span className="user-modal__label">Address</span>
                          <span className="user-modal__value">{d.delivery.address || "—"}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <span className="user-modal__empty">No delivery profiles</span>
              )}
            </section>

            {/* Favorites */}
            <section className="user-modal__section">
              <h3 className="user-modal__section-title">
                Favorites ({user.favorites?.length || 0})
              </h3>
              {user.favorites?.length ? (
                <div className="user-modal__tags">
                  {user.favorites.map((f, i) => (
                    <span key={i} className="user-modal__tag">{f}</span>
                  ))}
                </div>
              ) : (
                <span className="user-modal__empty">No favorites</span>
              )}
            </section>
          </div>
        )}
      </div>
    </div>
  );
}