import { useState } from "react";
import { useGetAllOrdersQuery, useUpdateOrderStatusMutation } from "../../slices/adminApi";
import { Card, CardHeader, CardContent, CardTitle } from "./ui/Card";
import  Badge  from "./ui/Badge";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "./ui/Table";
import  Button  from "./ui/Button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/Dialog";
import { Separator } from "./ui/Separator";
import {
  FiPackage,
  FiUser,
  FiMapPin,
  FiPhone,
  FiTruck,
  FiCalendar,
  FiHash,
} from "react-icons/fi";
import "./OrdersPage.css";

export default function OrdersPage() {
  const [activeTab, setActiveTab] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { data: orders = [], isLoading, error } = useGetAllOrdersQuery();
  const [updateOrderStatus] = useUpdateOrderStatusMutation();

  const tabs = ["all", "shipping", "canceled", "delivered", "paid"];
  const filteredOrders =
    activeTab === "all" ? orders : orders.filter((o) => o.status.toLowerCase() === activeTab);

  const handleChangeStatus = (orderId, status, e) => {
    e.stopPropagation();
    updateOrderStatus({ orderId, status });
  };

  const handleOrderClick = (order) => {
    setSelectedOrder(order);
    setIsDialogOpen(true);
  };

  const getStatusVariant = (status) => {
    const variants = {
      paid: "default",
      shipping: "secondary",
      delivered: "outline",
      canceled: "destructive",
    };
    return variants[status.toLowerCase()] || "default";
  };

  if (isLoading)
    return (
      <div className="orders-page">
        <div className="loading-state">Загрузка заказов...</div>
      </div>
    );

  if (error)
    return (
      <div className="orders-page">
        <div className="error-state">Ошибка при загрузке заказов</div>
      </div>
    );

  return (
    <div className="orders-page">
      <div className="orders-header">
        <div>
          <h1>Заказы</h1>
          <p className="orders-subtitle">Управление и отслеживание всех заказов клиентов</p>
        </div>
        <div className="orders-stats">
          <span className="stat-item">Всего: {orders.length}</span>
        </div>
      </div>

      <Card className="orders-card">
        <CardContent className="orders-content">
          <div className="orders-tabs">
            {tabs.map((tab) => (
              <Button
                key={tab}
                variant={activeTab === tab ? "default" : "ghost"}
                onClick={() => setActiveTab(tab)}
                className="tab-button"
              >
                {tab === "all"
                  ? "Все"
                  : tab === "shipping"
                  ? "Доставка"
                  : tab === "canceled"
                  ? "Отменён"
                  : tab === "delivered"
                  ? "Доставлен"
                  : "Оплачен"}
              </Button>
            ))}
          </div>

          <div className="orders-table-wrapper">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID заказа</TableHead>
                  <TableHead>Клиент</TableHead>
                  <TableHead>Товары</TableHead>
                  <TableHead>Статус</TableHead>
                  <TableHead>Дата</TableHead>
                  <TableHead>Сумма</TableHead>
                  <TableHead>Действия</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {filteredOrders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="empty-state">
                      Заказы не найдены
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredOrders.map((order) => (
                    <TableRow
                      key={order._id}
                      className="order-row"
                      onClick={() => handleOrderClick(order)}
                    >
                      <TableCell className="order-id">#{order._id.slice(-8)}</TableCell>
                      <TableCell>{order.userId?.email || "Неизвестно"}</TableCell>
                      <TableCell>
                        <div className="products-cell">
                          {order.products.slice(0, 2).map((p, i) => (
                            <div key={i} className="product-item">
                              {p.name} × {p.quantity}
                            </div>
                          ))}
                          {order.products.length > 2 && (
                            <div className="more-products">+{order.products.length - 2} еще</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusVariant(order.status)}>
                          {order.status === "paid"
                            ? "Оплачен"
                            : order.status === "shipping"
                            ? "Доставка"
                            : order.status === "delivered"
                            ? "Доставлен"
                            : order.status === "canceled"
                            ? "Отменён"
                            : order.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="date-cell">
                        {new Date(order.createdAt).toLocaleDateString("ru-RU")}
                      </TableCell>
                      <TableCell className="price-cell">{order.totalPrice} PLN</TableCell>
                      <TableCell>
                        <select
                          className="status-select"
                          value={order.status}
                          onChange={(e) =>
                            handleChangeStatus(order._id, e.target.value, e)
                          }
                          onClick={(e) => e.stopPropagation()}
                        >
                          <option value="paid">Оплачен</option>
                          <option value="shipping">Доставка</option>
                          <option value="delivered">Доставлен</option>
                          <option value="canceled">Отменён</option>
                        </select>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="order-details-modal">
          <DialogHeader>
            <DialogTitle>Детали заказа</DialogTitle>
          </DialogHeader>

          {selectedOrder && (
            <div className="order-details">
              <div className="detail-section">
                <div className="detail-item">
                  <div className="detail-icon">
                    <FiHash className="icon" />
                  </div>
                  <div className="detail-content">
                    <span className="detail-label">ID заказа</span>
                    <span className="detail-value">{selectedOrder._id}</span>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="detail-section">
                <div className="detail-item">
                  <div className="detail-icon">
                    <FiPackage className="icon" />
                  </div>
                  <div className="detail-content">
                    <span className="detail-label">Товары</span>
                    <div className="products-list">
                      {selectedOrder.products.map((product, index) => (
                        <div key={index} className="product-detail">
                          <span className="product-name">{product.name}</span>
                          <span className="product-quantity">× {product.quantity}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="detail-section">
                <div className="detail-item">
                  <div className="detail-icon">
                    <FiUser className="icon" />
                  </div>
                  <div className="detail-content">
                    <span className="detail-label">Заказчик</span>
                    <span className="detail-value">
                      {selectedOrder.shippingInfo?.firstName || ""}{" "}
                      {selectedOrder.shippingInfo?.lastName ||
                        selectedOrder.userId?.email ||
                        "Не указано"}
                    </span>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="detail-section">
                <div className="detail-item">
                  <div className="detail-icon">
                    <FiMapPin className="icon" />
                  </div>
                  <div className="detail-content">
                    <span className="detail-label">Адрес доставки</span>
                    <span className="detail-value">
                      {selectedOrder.shippingInfo?.address || "Не указан"}
                      {selectedOrder.shippingInfo?.city &&
                        `, ${selectedOrder.shippingInfo.city}`}
                      {selectedOrder.shippingInfo?.postalCode &&
                        `, ${selectedOrder.shippingInfo.postalCode}`}
                    </span>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="detail-section">
                <div className="detail-item">
                  <div className="detail-icon">
                    <FiPhone className="icon" />
                  </div>
                  <div className="detail-content">
                    <span className="detail-label">Номер телефона</span>
                    <span className="detail-value">
                      {selectedOrder.shippingInfo?.phone || "Не указан"}
                    </span>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="detail-section">
                <div className="detail-item">
                  <div className="detail-icon">
                    <FiTruck className="icon" />
                  </div>
                  <div className="detail-content">
                    <span className="detail-label">Метод доставки</span>
                    <span className="detail-value">
                      {selectedOrder.shippingMethod ||
                        selectedOrder.deliveryMethod ||
                        "Стандартная доставка"}
                    </span>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="detail-section">
                <div className="detail-item">
                  <div className="detail-icon">
                    <FiCalendar className="icon" />
                  </div>
                  <div className="detail-content">
                    <span className="detail-label">Дата создания заказа</span>
                    <span className="detail-value">
                      {new Date(selectedOrder.createdAt).toLocaleString("ru-RU", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="detail-total">
                <span className="total-label">Итого:</span>
                <span className="total-value">{selectedOrder.totalPrice} PLN</span>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
