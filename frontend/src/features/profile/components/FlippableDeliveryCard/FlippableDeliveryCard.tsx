import { CreditCard, Star, Trash2 } from "lucide-react";
import "./FlippableDeliveryCard.css";

interface DeliveryData {
  deliveryId?: number;
  personalData?: { name?: string; surname?: string; email?: string; phone?: string };
  delivery?: { address?: string; method?: string };
}

interface FlippableDeliveryCardProps {
  deliveryData: DeliveryData;
  onEdit?: () => void;
  onSetDefault?: () => void; // логика живёт в CardGallery
  onDelete?: () => void;     // логика живёт в CardGallery
  isFlipped?: boolean;
  style?: React.CSSProperties;
  onClick?: (e: React.MouseEvent) => void;
  gradient?: { front?: string; back?: string };
}

export function FlippableDeliveryCard({
  deliveryData,
  onEdit,
  onSetDefault,
  onDelete,
  isFlipped = false,
  style,
  onClick,
  gradient,
}: FlippableDeliveryCardProps) {
  const name    = deliveryData?.personalData?.name    ?? "—";
  const surname = deliveryData?.personalData?.surname ?? "";
  const email   = deliveryData?.personalData?.email   ?? "—";
  const phone   = deliveryData?.personalData?.phone   ?? "—";
  const address = deliveryData?.delivery?.address     ?? "No address";
  const method  = deliveryData?.delivery?.method      ?? "—";

  return (
    <div className="uc-card-container" style={style} onClick={onClick}>
      <div className={`uc-flippable-card ${isFlipped ? "uc-flipped" : ""}`}>

        {/* ── FRONT ─────────────────────────────────────────── */}
        <div className="uc-card-front" style={{ background: gradient?.front }}>
          <div className="uc-flip-pattern">
            <div className="uc-flip-pattern-element-1" />
            <div className="uc-flip-pattern-element-2" />
            <div className="uc-flip-pattern-element-3" />
            <div className="uc-flip-pattern-element-4" />
            <div className="uc-flip-pattern-element-5" />
          </div>

          <div className="uc-flip-card-logo">
            <div className="uc-flip-logo-icon"><CreditCard size={20} /></div>
            <span className="uc-flip-logo-text">DajDaj</span>
          </div>

          <div className="uc-flip-card-content">
            <div className="uc-flip-card-top">
              <button
                className="uc-card-button"
                onClick={(e) => { e.stopPropagation(); onEdit?.(); }}
              >
                Edit
              </button>
              <button
                className="uc-card-button flex items-center gap-1"
                onClick={(e) => { e.stopPropagation(); onSetDefault?.(); }}
                title="Set as default"
              >
                <Star size={13} />
                Set default
              </button>
              <button
                className="uc-card-button uc-card-button--danger"
                onClick={(e) => { e.stopPropagation(); onDelete?.(); }}
                title="Delete profile"
              >
                <Trash2 size={13} />
              </button>
            </div>

            <div className="uc-profile-info">
              <div className="uc-flip-card-section">
                <h2 className="uc-flip-user-name">{name} {surname}</h2>
                <p className="uc-flip-user-email">{email}</p>
              </div>
              <div className="uc-flip-card-section">
                <p className="uc-flip-section-label">Phone</p>
                <p className="uc-flip-section-value">{phone}</p>
              </div>
              <div className="uc-flip-card-section">
                <p className="uc-flip-section-label">Address</p>
                <p className="uc-flip-section-value uc-address-truncate">{address}</p>
              </div>
              <div className="uc-flip-card-section">
                <p className="uc-flip-section-label">Method</p>
                <p className="uc-flip-section-value">{method}</p>
              </div>
            </div>
          </div>
        </div>

        {/* ── BACK ──────────────────────────────────────────── */}
        <div className="uc-card-back" style={{ background: gradient?.back }}>
          <div className="p-6 flex flex-col gap-4">
            <div>
              <p className="uc-back-label">Address</p>
              <p className="uc-back-value">{address}</p>
            </div>
            <div>
              <p className="uc-back-label">Method</p>
              <p className="uc-back-value">{method}</p>
            </div>
            <div>
              <p className="uc-back-label">Recipient</p>
              <p className="uc-back-value">{name} {surname}</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}