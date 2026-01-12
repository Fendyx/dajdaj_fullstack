import React from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import "./OrderDetailsDrawer.css";

// Фикс для иконок Leaflet (стандартная проблема с webpack)
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

// --- Вспомогательная функция для статусов ---
const getStatusInfo = (status) => {
  const s = status?.toLowerCase() || "";
  if (s === "pending" || s === "processing") return { percent: 25, color: "#f1c40f", label: "Оформлен / Сборка" };
  if (s === "shipped" || s === "in_transit") return { percent: 70, color: "#3498db", label: "В пути" };
  if (s === "delivered") return { percent: 100, color: "#2ecc71", label: "Доставлен" };
  if (s === "cancelled") return { percent: 100, color: "#e74c3c", label: "Отменен" };
  return { percent: 10, color: "#ccc", label: status };
};

export const OrderDetailsDrawer = ({ isOpen, onClose, order }) => {
  if (!isOpen || !order) return null;

  const statusInfo = getStatusInfo(order.status);
  
  // Предполагаем, что админ добавляет эти данные. 
  // Если их нет - считаем, что заказ еще не отправлен.
  const hasDeliveryInfo = order.deliveryPoint && order.deliveryPoint.address;
  const hasCoordinates = order.deliveryPoint?.lat && order.deliveryPoint?.lng;

  return (
    <div className="odd-overlay" onClick={onClose}>
      <div 
        className="odd-drawer" 
        onClick={(e) => e.stopPropagation()} // Чтобы клик по меню не закрывал его
      >
        {/* 1. Ручка (Handle) */}
        <div className="odd-handle-wrapper">
          <div className="odd-handle"></div>
        </div>

        <div className="odd-content">
          {/* Заголовок */}
          <div className="odd-header">
            <h3>Заказ #{order._id.slice(-6).toUpperCase()}</h3>
            <button className="odd-close-btn" onClick={onClose}>✕</button>
          </div>

          {/* 2. Прогресс бар (Статус) */}
          <div className="odd-section">
            <div className="odd-status-label">
              <span>Статус: <b>{statusInfo.label}</b></span>
              <span>{statusInfo.percent}%</span>
            </div>
            <div className="odd-progress-bg">
              <div 
                className="odd-progress-fill" 
                style={{ width: `${statusInfo.percent}%`, backgroundColor: statusInfo.color }}
              ></div>
            </div>
          </div>

          {/* 3. Логика Доставки (Пачкомат) */}
          <div className="odd-section odd-delivery-box">
            <h4>🚚 Информация о доставке</h4>
            
            {hasDeliveryInfo ? (
              <div className="odd-delivery-active">
                <div className="odd-info-row">
                  <span className="odd-label">Пункт выдачи:</span>
                  <span className="odd-value big">{order.deliveryPoint.name || "InPost Paczkomat"}</span>
                </div>
                <div className="odd-info-row">
                  <span className="odd-label">Адрес:</span>
                  <span className="odd-value">{order.deliveryPoint.address}</span>
                </div>
                {/* Трек-номер */}
                {order.trackingNumber && (
                    <div className="odd-tracking">
                        <span>Трек-номер: {order.trackingNumber}</span>
                        <button onClick={() => navigator.clipboard.writeText(order.trackingNumber)}>Копировать</button>
                    </div>
                )}
              </div>
            ) : (
              <div className="odd-delivery-waiting">
                <div className="odd-icon-box">📦</div>
                <p>
                  Мы упаковываем ваш заказ. Как только курьер заберет посылку, 
                  здесь появится точный адрес пачкомата и карта.
                </p>
              </div>
            )}
          </div>

          {/* 4. Карта (Только если есть координаты) */}
          {hasDeliveryInfo && hasCoordinates && (
            <div className="odd-map-container">
               <MapContainer 
                  center={[order.deliveryPoint.lat, order.deliveryPoint.lng]} 
                  zoom={15} 
                  scrollWheelZoom={false} 
                  style={{ height: "100%", width: "100%" }}
                >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <Marker position={[order.deliveryPoint.lat, order.deliveryPoint.lng]}>
                  <Popup>
                    {order.deliveryPoint.name} <br /> {order.deliveryPoint.address}
                  </Popup>
                </Marker>
              </MapContainer>
            </div>
          )}

          {/* 5. Детали заказа (Товары и адрес юзера) */}
          <div className="odd-section">
            <h4>📦 Состав заказа</h4>
            <div className="odd-products-list">
              {order.products.map((p, idx) => {
                 const img = p.personalOrderId?.images?.[0] || p.image || "https://via.placeholder.com/50";
                 return (
                  <div key={idx} className="odd-product-item">
                    <img src={img} alt={p.name} />
                    <div className="odd-prod-info">
                      <div className="odd-prod-name">{p.name}</div>
                      <div className="odd-prod-meta">{p.quantity} шт. x {p.price} PLN</div>
                    </div>
                  </div>
                 )
              })}
            </div>
            
            <div className="odd-user-address">
                <small>Ваши данные: {order.shippingAddress?.address || "Адрес не указан"}</small>
            </div>
          </div>

          {/* Пустое пространство внизу для удобства скролла на мобильных */}
          <div style={{height: "50px"}}></div> 
        </div>
      </div>
    </div>
  );
};