import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import {
  X,
  Package,
  Truck,
  MapPin,
  Phone,
  Mail,
  User,
  Hash,
  CheckCircle2,
  Clock3,
  Circle,
} from "lucide-react";
import "./OrderDetailsDrawer.css";

interface OrderDetailsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  order: any;
}

// Status timeline steps (in order)
const STATUS_STEPS = ["pending", "processing", "paid", "shipping", "delivered"];

const STATUS_LABELS: Record<string, string> = {
  pending:    "Pending",
  processing: "Processing",
  paid:       "Paid",
  shipping:   "Shipping",
  delivered:  "Delivered",
  canceled:   "Canceled",
  failed:     "Failed",
};

function getStepIndex(status: string) {
  return STATUS_STEPS.indexOf(status);
}

function MapWidget({ address }: { address: string }) {
  // Build OpenStreetMap search URL — no API key needed
  const encoded = encodeURIComponent(address);
  const src = `https://www.openstreetmap.org/export/embed.html?bbox=&layer=mapnik&marker=&mlat=&mlon=&query=${encoded}`;
  // Use nominatim search embed trick via iframe
  const searchSrc = `https://nominatim.openstreetmap.org/search?q=${encoded}&format=json`;

  return (
    <div className="odd-map-wrapper">
      <iframe
        title="Delivery location"
        className="odd-map-iframe"
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        src={`https://maps.google.com/maps?q=${encoded}&t=&z=14&ie=UTF8&iwloc=&output=embed`}
        allowFullScreen
      />
      <div className="odd-map-overlay">
        <MapPin size={14} />
        <span>{address}</span>
      </div>
    </div>
  );
}

export function OrderDetailsDrawer({ isOpen, onClose, order }: OrderDetailsDrawerProps) {
  const { t } = useTranslation();
  const drawerRef = useRef<HTMLDivElement>(null);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, onClose]);

  // Prevent body scroll when open
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  if (!order) return null;

  const currentStepIndex = getStepIndex(order.status);
  const isCanceledOrFailed = ["canceled", "failed"].includes(order.status);

  const deliveryAddress = order.deliveryInfo?.address
    ? [
        order.deliveryInfo.address.street,
        order.deliveryInfo.address.city,
        order.deliveryInfo.address.postalCode,
      ]
        .filter(Boolean)
        .join(", ")
    : null;

  return (
    <>
      {/* Backdrop */}
      <div
        className={`odd-backdrop ${isOpen ? "open" : ""}`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div
        ref={drawerRef}
        className={`odd-drawer ${isOpen ? "open" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-label={t("orders.drawer.title", "Order Details")}
      >
        {/* ── Header ── */}
        <div className="odd-header">
          <div>
            <p className="odd-header-label">{t("orders.drawer.title", "Order Details")}</p>
            <h2 className="odd-header-num">
              #{order.orderNumber || order._id?.slice(-6).toUpperCase()}
            </h2>
          </div>
          <button className="odd-close-btn" onClick={onClose} aria-label="Close">
            <X size={20} />
          </button>
        </div>

        {/* ── Scroll content ── */}
        <div className="odd-body">

          {/* Status Timeline */}
          {!isCanceledOrFailed ? (
            <section className="odd-section">
              <h3 className="odd-section-title">
                <Clock3 size={15} />
                {t("orders.drawer.status", "Order Status")}
              </h3>
              <div className="odd-timeline">
                {STATUS_STEPS.map((step, idx) => {
                  const done = idx < currentStepIndex;
                  const active = idx === currentStepIndex;
                  return (
                    <div key={step} className={`odd-step ${done ? "done" : ""} ${active ? "active" : ""}`}>
                      <div className="odd-step-icon">
                        {done ? (
                          <CheckCircle2 size={18} />
                        ) : active ? (
                          <Circle size={18} className="odd-active-dot" />
                        ) : (
                          <Circle size={18} />
                        )}
                      </div>
                      {idx < STATUS_STEPS.length - 1 && (
                        <div className={`odd-step-line ${done ? "done" : ""}`} />
                      )}
                      <span className="odd-step-label">
                        {t(`orders.status.${step}`, STATUS_LABELS[step])}
                      </span>
                    </div>
                  );
                })}
              </div>
            </section>
          ) : (
            <div className={`odd-status-banner ${order.status === "canceled" ? "canceled" : "failed"}`}>
              {t(`orders.status.${order.status}`, STATUS_LABELS[order.status])}
            </div>
          )}

          {/* Products */}
          <section className="odd-section">
            <h3 className="odd-section-title">
              <Package size={15} />
              {t("orders.drawer.products", "Products")}
            </h3>
            <div className="odd-products-list">
              {(order.products || []).map((p: any, i: number) => {
                const img = p.personalOrderId?.images?.[0] || p.image;
                return (
                  <div key={i} className="odd-product-row">
                    <div className="odd-product-img-wrap">
                      {img ? (
                        <img src={img} alt={p.name} className="odd-product-img" />
                      ) : (
                        <div className="odd-product-img-placeholder">
                          <Package size={20} strokeWidth={1.2} />
                        </div>
                      )}
                    </div>
                    <div className="odd-product-details">
                      <span className="odd-product-name">{p.name || t("orders.unknownProduct", "Product")}</span>
                      <span className="odd-product-qty">
                        {t("orders.drawer.qty", "Qty")}: {p.quantity || 1}
                      </span>
                    </div>
                    <span className="odd-product-price">{p.price} PLN</span>
                  </div>
                );
              })}
            </div>
            <div className="odd-total-row">
              <span>{t("orders.drawer.total", "Total")}</span>
              <span className="odd-total-price">{order.totalPrice} PLN</span>
            </div>
          </section>

          {/* Delivery Info */}
          {order.deliveryInfo && (
            <section className="odd-section">
              <h3 className="odd-section-title">
                <Truck size={15} />
                {t("orders.drawer.delivery", "Delivery Info")}
              </h3>
              <div className="odd-info-grid">
                {order.deliveryInfo.name && (
                  <div className="odd-info-item">
                    <User size={14} />
                    <span>{order.deliveryInfo.name}</span>
                  </div>
                )}
                {order.deliveryInfo.phone && (
                  <div className="odd-info-item">
                    <Phone size={14} />
                    <span>{order.deliveryInfo.phone}</span>
                  </div>
                )}
                {order.deliveryInfo.email && (
                  <div className="odd-info-item">
                    <Mail size={14} />
                    <span>{order.deliveryInfo.email}</span>
                  </div>
                )}
                {order.deliveryInfo.method && (
                  <div className="odd-info-item">
                    <Truck size={14} />
                    <span>{order.deliveryInfo.method}</span>
                  </div>
                )}
                {deliveryAddress && (
                  <div className="odd-info-item">
                    <MapPin size={14} />
                    <span>{deliveryAddress}</span>
                  </div>
                )}
              </div>

              {/* Map widget */}
              {deliveryAddress && (
                <MapWidget address={deliveryAddress} />
              )}
            </section>
          )}

          {/* Order Meta */}
          <section className="odd-section">
            <h3 className="odd-section-title">
              <Hash size={15} />
              {t("orders.drawer.meta", "Order Info")}
            </h3>
            <div className="odd-info-grid">
              <div className="odd-info-item">
                <span className="odd-meta-label">{t("orders.drawer.orderId", "Order ID")}:</span>
                <span className="odd-meta-mono">{order._id}</span>
              </div>
              <div className="odd-info-item">
                <span className="odd-meta-label">{t("orders.drawer.date", "Date")}:</span>
                <span>
                  {new Date(order.createdAt).toLocaleString(undefined, {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            </div>
          </section>

        </div>
      </div>
    </>
  );
}