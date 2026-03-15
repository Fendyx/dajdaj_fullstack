import {
  User,
  Mail,
  Phone,
  MapPin,
  Building2,
  Mailbox,
  Truck,
  PackageOpen,
} from "lucide-react";
import "./DeliverySection.css";

interface DeliveryFormData {
  email?: string;
  phone?: string;
  name?: string;
  surname?: string;
  address?: string;
  city?: string;
  postal_code?: string;
  method?: string;
}

interface DeliverySectionProps {
  formData: DeliveryFormData;
  onChange: (e: any) => void;
  token?: string | null;
  userProfile?: any;
  selectedCard?: any;
  onSelectCard?: (card: any) => void;
}

export const DeliverySection = ({ formData, onChange }: DeliverySectionProps) => {
  const deliveryOptions = [
    {
      id: "inpost",
      label: "InPost Paczkomaty 24/7",
      time: "1–2 business days",
      price: "Free",
      icon: <PackageOpen size={22} />,
    },
    {
      id: "courier",
      label: "Courier DPD / DHL",
      time: "Next day delivery",
      price: "PLN 15.00",
      icon: <Truck size={22} />,
    },
  ];

  const handleDeliverySelect = (methodId: string) => {
    onChange({ target: { name: "method", value: methodId } });
  };

  return (
    <div className="shipping-form-container">

      {/* ── CONTACT INFO ─────────────────────────────── */}
      <div className="form-section">
        <h3 className="form-section-title">Contact Information</h3>
        <div className="form-grid">

          <div className="form-group full-width">
            <label className="form-label" htmlFor="email">Email Address</label>
            <div className="input-wrapper">
              <input
                id="email"
                type="email"
                name="email"
                placeholder="you@example.com"
                value={formData.email || ""}
                onChange={onChange}
                required
              />
              <Mail className="input-icon" size={17} />
            </div>
          </div>

          <div className="form-group full-width">
            <label className="form-label" htmlFor="phone">Phone Number</label>
            <div className="input-wrapper">
              <input
                id="phone"
                type="tel"
                name="phone"
                placeholder="+48 000 000 000"
                value={formData.phone || ""}
                onChange={onChange}
                required
              />
              <Phone className="input-icon" size={17} />
            </div>
          </div>

        </div>
      </div>

      {/* ── SHIPPING ADDRESS ─────────────────────────── */}
      <div className="form-section">
        <h3 className="form-section-title">Shipping Address</h3>
        <div className="form-grid">

          <div className="form-group">
            <label className="form-label" htmlFor="name">First Name</label>
            <div className="input-wrapper">
              <input
                id="name"
                type="text"
                name="name"
                placeholder="John"
                value={formData.name || ""}
                onChange={onChange}
                required
              />
              <User className="input-icon" size={17} />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="surname">Last Name</label>
            <div className="input-wrapper">
              <input
                id="surname"
                type="text"
                name="surname"
                placeholder="Doe"
                value={formData.surname || ""}
                onChange={onChange}
                required
              />
            </div>
          </div>

          <div className="form-group full-width">
            <label className="form-label" htmlFor="address">Street Address</label>
            <div className="input-wrapper">
              <input
                id="address"
                type="text"
                name="address"
                placeholder="Ul. Złota 44/2"
                value={formData.address || ""}
                onChange={onChange}
                required
              />
              <MapPin className="input-icon" size={17} />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="city">City</label>
            <div className="input-wrapper">
              <input
                id="city"
                type="text"
                name="city"
                placeholder="Warsaw"
                value={formData.city || ""}
                onChange={onChange}
                required
              />
              <Building2 className="input-icon" size={17} />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="postal_code">Postal Code</label>
            <div className="input-wrapper">
              <input
                id="postal_code"
                type="text"
                name="postal_code"
                placeholder="00-001"
                value={formData.postal_code || ""}
                onChange={onChange}
                required
              />
              <Mailbox className="input-icon" size={17} />
            </div>
          </div>

        </div>
      </div>

      {/* ── DELIVERY METHOD ──────────────────────────── */}
      <div className="form-section">
        <h3 className="form-section-title">Delivery Method</h3>
        <div className="delivery-options-grid">
          {deliveryOptions.map((option) => (
            <div
              key={option.id}
              className={`delivery-card${formData.method === option.id ? " selected" : ""}`}
              onClick={() => handleDeliverySelect(option.id)}
            >
              <div className="delivery-card-icon">{option.icon}</div>

              <div className="delivery-card-info">
                <span className="delivery-name">{option.label}</span>
                <span className="delivery-time">{option.time}</span>
              </div>

              <span className="delivery-price">{option.price}</span>

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