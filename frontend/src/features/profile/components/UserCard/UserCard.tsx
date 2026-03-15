import { CreditCard } from "lucide-react";

interface DeliveryData {
  deliveryId?: number;
  personalData?: { name?: string; surname?: string; email?: string; phone?: string };
  delivery?: { address?: string; method?: string };
}

interface UserAccount {
  cardNumber?: string;
  registrationDate?: string;
  email?: string;
}

interface UserCardProps {
  deliveryData?: DeliveryData | null; // null = юзер ещё не добавил профиль
  user?: UserAccount;
  accountName?: string; // имя из регистрации — показывается пока нет deliveryData
  onEdit?: () => void;
  onLogOut?: () => void;
  isFlipped?: boolean;
  style?: React.CSSProperties;
  onClick?: (e: React.MouseEvent) => void;
}

export function UserCard({
  deliveryData,
  user,
  accountName,
  onEdit,
  onLogOut,
  isFlipped = false,
  style,
  onClick,
}: UserCardProps) {
  // Если профиля доставки нет — показываем имя аккаунта
  const name     = deliveryData?.personalData?.name    ?? accountName ?? "—";
  const surname  = deliveryData?.personalData?.surname ?? "";
  const email    = deliveryData?.personalData?.email   ?? user?.email ?? "—";
  const phone    = deliveryData?.personalData?.phone   ?? "—";
  const address  = deliveryData?.delivery?.address     ?? "No address added";
  const method   = deliveryData?.delivery?.method      ?? "—";

  const cardNumber  = user?.cardNumber ?? "—";
  const memberSince = user?.registrationDate
    ? new Date(user.registrationDate).toLocaleDateString("en-GB", { month: "short", year: "numeric" })
    : "—";

  return (
    <div className="uc-card-container" style={style} onClick={onClick}>
      <div className={`uc-flippable-card ${isFlipped ? "uc-flipped" : ""}`}>

        {/* ── FRONT ─────────────────────────────────────────── */}
        <div className="uc-card-front">
          <div className="uc-flip-pattern">
            <div className="uc-flip-pattern-element-1" />
            <div className="uc-flip-pattern-element-2" />
            <div className="uc-flip-pattern-element-3" />
          </div>

          <div className="uc-flip-card-logo">
            <div className="uc-flip-logo-icon"><CreditCard size={20} /></div>
            <span className="uc-flip-logo-text">DajDaj</span>
          </div>

          <div className="uc-flip-card-content">
            <div className="uc-flip-card-top">
              <button className="uc-card-button" onClick={(e) => { e.stopPropagation(); onEdit?.(); }}>
                {!deliveryData ? "Add address" : "Edit"}
              </button>
              <button className="uc-card-button" onClick={(e) => { e.stopPropagation(); onLogOut?.(); }}>
                Log Out
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
        <div className="uc-card-back">
          <div className="p-6 flex flex-col gap-4">
            <div>
              <p className="uc-back-label">Card Number</p>
              <p className="uc-back-value font-mono tracking-widest">{cardNumber}</p>
            </div>
            <div>
              <p className="uc-back-label">Address</p>
              <p className="uc-back-value">{address}</p>
            </div>
            <div>
              <p className="uc-back-label">Method</p>
              <p className="uc-back-value">{method}</p>
            </div>
            <div>
              <p className="uc-back-label">Member Since</p>
              <p className="uc-back-value">{memberSince}</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}