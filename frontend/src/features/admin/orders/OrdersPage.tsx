import { useState } from "react";
import { useGetAllOrdersQuery, useUpdateOrderStatusMutation } from "./api/adminOrdersApi";
import type { Order } from "./api/adminOrdersApi";
import { OrderModal } from "./components/OrderModal";
import "./OrdersPage.css";

const STATUS_OPTIONS: Order["status"][] = [
  "pending", "processing", "paid", "shipping", "delivered", "canceled", "failed",
];

const STATUS_LABELS: Record<Order["status"], string> = {
  pending: "Pending",
  processing: "Processing",
  paid: "Paid",
  shipping: "Shipping",
  delivered: "Delivered",
  canceled: "Canceled",
  failed: "Failed",
};

export function OrdersPage() {
  const { data: orders = [], isLoading, isError } = useGetAllOrdersQuery();
  const [updateStatus] = useUpdateOrderStatusMutation();
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const handleStatusChange = async (orderId: string, status: Order["status"]) => {
    await updateStatus({ orderId, status });
  };

  if (isLoading) return <div className="admin-loading">Loading orders...</div>;
  if (isError) return <div className="admin-error">Failed to load orders</div>;

  return (
    <div className="orders-page">
      <div className="orders-page__header">
        <h1 className="orders-page__title">Orders</h1>
        <span className="orders-page__count">{orders.length}</span>
      </div>

      <div className="orders-table-wrapper">
        <table className="orders-table">
          <thead>
            <tr>
              <th>Order #</th>
              <th>Client</th>
              <th>Products</th>
              <th>Date</th>
              <th>Total</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order._id} onClick={() => setSelectedOrder(order)} className="orders-table__row">
                <td>
                  <span className="orders-table__order-num">
                    {order.orderNumber || order._id.slice(-6).toUpperCase()}
                  </span>
                </td>
                <td>
                  <span className="orders-table__email">
                    {order.userId?.email || order.deliveryInfo?.email || "Guest"}
                  </span>
                </td>
                <td>
                  <span className="orders-table__products">
                    {order.products.map((p) => p.name).join(", ")}
                  </span>
                </td>
                <td>
                  <span className="orders-table__date">
                    {new Date(order.createdAt).toLocaleDateString("pl-PL")}
                  </span>
                </td>
                <td>
                  <span className="orders-table__total">{order.totalPrice} zł</span>
                </td>
                <td>
                  <span className={`orders-table__status orders-table__status--${order.status}`}>
                    {STATUS_LABELS[order.status]}
                  </span>
                </td>
                <td onClick={(e) => e.stopPropagation()}>
                  <select
                    className="orders-table__select"
                    value={order.status}
                    onChange={(e) =>
                      handleStatusChange(order._id, e.target.value as Order["status"])
                    }
                  >
                    {STATUS_OPTIONS.map((s) => (
                      <option key={s} value={s}>
                        {STATUS_LABELS[s]}
                      </option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedOrder && (
        <OrderModal order={selectedOrder} onClose={() => setSelectedOrder(null)} />
      )}
    </div>
  );
}