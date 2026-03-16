import type { Order } from "../api/adminOrdersApi";
import { resolveImage } from "../../utils/resolveImage";
import "./OrderModal.css";

interface Props {
  order: Order;
  onClose: () => void;
}

const STATUS_LABELS: Record<Order["status"], string> = {
  pending: "Pending", processing: "Processing", paid: "Paid",
  shipping: "Shipping", delivered: "Delivered", canceled: "Canceled", failed: "Failed",
};

export function OrderModal({ order, onClose }: Props) {
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div className="order-modal__backdrop" onClick={handleBackdropClick}>
      <div className="order-modal">
        {/* Header */}
        <div className="order-modal__header">
          <div>
            <h2 className="order-modal__title">
              {order.orderNumber || order._id.slice(-6).toUpperCase()}
            </h2>
            <span className={`order-modal__status order-modal__status--${order.status}`}>
              {STATUS_LABELS[order.status]}
            </span>
          </div>
          <button className="order-modal__close" onClick={onClose}>✕</button>
        </div>

        <div className="order-modal__body">
          {/* IDs */}
          <section className="order-modal__section">
            <h3 className="order-modal__section-title">Identifiers</h3>
            <div className="order-modal__grid">
              <div className="order-modal__field">
                <span className="order-modal__label">Order ID</span>
                <span className="order-modal__value order-modal__mono">{order._id}</span>
              </div>
              <div className="order-modal__field">
                <span className="order-modal__label">Order Token</span>
                <span className="order-modal__value order-modal__mono">{order.orderToken}</span>
              </div>
              {order.paymentIntentId && (
                <div className="order-modal__field">
                  <span className="order-modal__label">Payment Intent</span>
                  <span className="order-modal__value order-modal__mono">{order.paymentIntentId}</span>
                </div>
              )}
              <div className="order-modal__field">
                <span className="order-modal__label">Created At</span>
                <span className="order-modal__value">
                  {new Date(order.createdAt).toLocaleString("pl-PL")}
                </span>
              </div>
            </div>
          </section>

          {/* Client */}
          <section className="order-modal__section">
            <h3 className="order-modal__section-title">Client</h3>
            <div className="order-modal__grid">
              <div className="order-modal__field">
                <span className="order-modal__label">User ID</span>
                <span className="order-modal__value order-modal__mono">
                  {order.userId?._id || "Guest"}
                </span>
              </div>
              <div className="order-modal__field">
                <span className="order-modal__label">Email</span>
                <span className="order-modal__value">
                  {order.userId?.email || order.deliveryInfo?.email || "—"}
                </span>
              </div>
              <div className="order-modal__field">
                <span className="order-modal__label">Name</span>
                <span className="order-modal__value">
                  {order.userId?.name || order.deliveryInfo?.name || "—"}
                </span>
              </div>
            </div>
          </section>

          {/* Delivery */}
          {order.deliveryInfo && (
            <section className="order-modal__section">
              <h3 className="order-modal__section-title">Delivery</h3>
              <div className="order-modal__grid">
                <div className="order-modal__field">
                  <span className="order-modal__label">Method</span>
                  <span className="order-modal__value">{order.deliveryInfo.method || "—"}</span>
                </div>
                <div className="order-modal__field">
                  <span className="order-modal__label">Name</span>
                  <span className="order-modal__value">{order.deliveryInfo.name || "—"}</span>
                </div>
                <div className="order-modal__field">
                  <span className="order-modal__label">Phone</span>
                  <span className="order-modal__value">{order.deliveryInfo.phone || "—"}</span>
                </div>
                <div className="order-modal__field">
                  <span className="order-modal__label">Address</span>
                  <span className="order-modal__value">
                    {[
                      order.deliveryInfo.address?.street,
                      order.deliveryInfo.address?.city,
                      order.deliveryInfo.address?.postalCode,
                    ]
                      .filter(Boolean)
                      .join(", ") || "—"}
                  </span>
                </div>
              </div>
            </section>
          )}

          {/* Products */}
          <section className="order-modal__section">
            <h3 className="order-modal__section-title">Products</h3>
            <div className="order-modal__products">
              {order.products.map((p, i) => (
                <div key={i} className="order-modal__product">
                  {p.image && (
                    <img
                      src={resolveImage(p.image)}
                      alt={p.name}
                      className="order-modal__product-img"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                    />
                  )}
                  <div className="order-modal__product-info">
                    <span className="order-modal__product-name">{p.name}</span>
                    {p.personalOrderId && (
                      <span className="order-modal__product-personal">Custom order</span>
                    )}
                  </div>
                  <div className="order-modal__product-right">
                    <span className="order-modal__product-qty">× {p.quantity}</span>
                    <span className="order-modal__product-price">{p.price * p.quantity} zł</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="order-modal__total">
              <span>Total</span>
              <span>{order.totalPrice} zł</span>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}