import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Package, ChevronRight, Truck, MapPin, Clock } from "lucide-react";
import { useGetUserOrdersQuery } from "@/services/userApi";
import { OrderDetailsDrawer } from "../../OrderDetailsDrawer/OrderDetailsDrawer";
import { EmptyState } from "@/components/ui/EmptyState";
import { Spinner } from "@/components/ui/Spinner/Spinner";
import "./OrderTab.css";

// Status config: color + label key
const STATUS_CONFIG: Record<string, { color: string; labelKey: string }> = {
  pending:    { color: "status-pending",    labelKey: "orders.status.pending" },
  processing: { color: "status-processing", labelKey: "orders.status.processing" },
  paid:       { color: "status-paid",       labelKey: "orders.status.paid" },
  shipping:   { color: "status-shipping",   labelKey: "orders.status.shipping" },
  delivered:  { color: "status-delivered",  labelKey: "orders.status.delivered" },
  canceled:   { color: "status-canceled",   labelKey: "orders.status.canceled" },
  failed:     { color: "status-failed",     labelKey: "orders.status.failed" },
};

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function OrdersTab() {
  const { t } = useTranslation();
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const navigate = useNavigate();

  const { data: orders, isLoading } = useGetUserOrdersQuery(undefined);

  const sortedOrders = useMemo(() => {
    if (!orders) return [];
    return [...orders].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [orders]);

  if (isLoading) return <Spinner text={t("orders.loading", "Loading orders...")} />;

  if (!sortedOrders.length) {
    return (
      <EmptyState
        icon={<Package size={48} strokeWidth={1.5} />}
        title={t("orders.empty.title", "No orders yet")}
        actionText={t("orders.empty.action", "Start Shopping")}
        onAction={() => navigate("/products")}
      />
    );
  }

  return (
    <>
      <div className="ot-list">
        {sortedOrders.map((order: any) => {
          const statusCfg = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;
          // Pick up to 3 product images
          const productImages: string[] = (order.products || [])
            .map((p: any) => {
              // Prefer personalOrder images if available
              if (p.personalOrderId?.images?.length) return p.personalOrderId.images[0];
              return p.image;
            })
            .filter(Boolean)
            .slice(0, 3);

          const productNames: string[] = (order.products || [])
            .map((p: any) => p.name)
            .filter(Boolean);

          const deliveryMethod = order.deliveryInfo?.method || "—";

          return (
            <div
              key={order._id}
              className="ot-card"
              onClick={() => setSelectedOrder(order)}
            >
              {/* ── LEFT: Product Images ── */}
              <div className="ot-images">
                {productImages.length > 0 ? (
                  productImages.map((img, i) => (
                    <div key={i} className="ot-img-wrap">
                      <img src={img} alt="" className="ot-img" />
                    </div>
                  ))
                ) : (
                  <div className="ot-img-placeholder">
                    <Package size={28} strokeWidth={1.2} />
                  </div>
                )}
                {(order.products?.length || 0) > 3 && (
                  <div className="ot-img-more">+{order.products.length - 3}</div>
                )}
              </div>

              {/* ── CENTER: Order Info ── */}
              <div className="ot-info">
                <div className="ot-header-row">
                  <span className="ot-order-num">
                    #{order.orderNumber || order._id.slice(-6).toUpperCase()}
                  </span>
                  <span className={`ot-status-badge ${statusCfg.color}`}>
                    {String(t(statusCfg.labelKey, order.status))}
                  </span>
                </div>

                <p className="ot-product-names" title={productNames.join(", ")}>
                  {productNames.join(", ") || t("orders.unknownProduct", "Product")}
                </p>

                <div className="ot-meta-row">
                  <span className="ot-meta-item">
                    <Clock size={13} />
                    {formatDate(order.createdAt)}
                  </span>
                  <span className="ot-meta-item">
                    <Truck size={13} />
                    {deliveryMethod}
                  </span>
                  {order.deliveryInfo?.address?.city && (
                    <span className="ot-meta-item">
                      <MapPin size={13} />
                      {order.deliveryInfo.address.city}
                    </span>
                  )}
                </div>
              </div>

              {/* ── RIGHT: Price + Arrow ── */}
              <div className="ot-right">
                <span className="ot-price">{order.totalPrice} <span className="ot-currency">PLN</span></span>
                <button className="ot-details-btn">
                  {t("orders.details", "Details")}
                  <ChevronRight size={15} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <OrderDetailsDrawer
        isOpen={!!selectedOrder}
        onClose={() => setSelectedOrder(null)}
        order={selectedOrder}
      />
    </>
  );
}