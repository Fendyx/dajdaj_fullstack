import React, { useState, useEffect, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";

import {
  useGetUserOrdersQuery,
  useGetUserDiscountsQuery,
  useGetUserFavoritesQuery,
  useGetUserProfileQuery,
  userApi,
} from "../../slices/userApi";
import { logoutUser } from "../../slices/authSlice";

import { CardGallery } from "./components/CardGallery/CardGallery";
// 👇 Импортируем нашу новую модалку (проверь путь!)
import { OrderDetailsDrawer } from "../OrderDetailsDrawer/OrderDetailsDrawer";

import "./UserProfile.css";

// --- Вспомогательные компоненты ---

function ImageWithFallback({ src, alt, className }) {
  const [error, setError] = useState(false);
  return (
    <img
      className={className}
      src={!error && src ? src : "https://via.placeholder.com/150?text=No+Image"}
      alt={alt}
      onError={() => setError(true)}
    />
  );
}

const TabButton = ({ active, label, icon, onClick, count }) => (
  <button className={`up-tab-btn ${active ? "active" : ""}`} onClick={onClick}>
    <span className="tab-icon">{icon}</span>
    <span className="tab-label">{label}</span>
    {count > 0 && <span className="tab-count">{count}</span>}
  </button>
);

export function UserProfile() {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language || "en";
  
  const auth = useSelector((state) => state.auth);
  const { token, name, email } = auth;

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const [activeTab, setActiveTab] = useState("orders");
  
  // 👇 Состояние для выбранного заказа (для модалки)
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    if (!token) navigate("/login");
  }, [token, navigate]);

  const { 
    data: userProfile, 
    isLoading: loadingProfile, 
    refetch: refetchProfile 
  } = useGetUserProfileQuery(undefined, { skip: !token });
  
  const {
    data: orders,
    isLoading: loadingOrders,
    error: errorOrders,
    refetch: refetchOrders,
  } = useGetUserOrdersQuery(undefined, { skip: !token });

  const {
    data: discounts,
    isLoading: loadingDiscounts,
    error: errorDiscounts,
    refetch: refetchDiscounts,
  } = useGetUserDiscountsQuery(undefined, { skip: !token });

  const {
    data: favorites,
    isLoading: loadingFavorites,
    error: errorFavorites,
    refetch: refetchFavorites,
  } = useGetUserFavoritesQuery(undefined, { skip: !token });

  useEffect(() => {
    if (token) {
      refetchProfile();
      refetchOrders();
      refetchDiscounts();
      refetchFavorites();
    }
  }, [token, refetchProfile, refetchOrders, refetchDiscounts, refetchFavorites]);

  useEffect(() => {
    if (location.state?.openSection) setActiveTab(location.state.openSection);
  }, [location.state]);

  const sortedOrders = useMemo(() => {
    if (!orders) return [];
    return [...orders].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [orders]);

  // --- Handlers ---
  const handleLogout = () => {
    dispatch(userApi.util.resetApiState());
    dispatch(logoutUser());
    navigate("/login");
  };

  const handleGoShopping = () => navigate("/products");

  const handleEditProfile = (id) => console.log("Edit profile:", id);
  const handleAddNewProfile = () => console.log("Add new profile");

  // 👇 Обработчик открытия модалки
  const handleOrderClick = (order) => {
    setSelectedOrder(order);
  };

  // 👇 Обработчик закрытия модалки
  const handleCloseModal = () => {
    setSelectedOrder(null);
  };

  const hasAuthError = errorOrders?.originalStatus === 401 || errorOrders?.originalStatus === 400;

  if (hasAuthError) {
    return (
      <div className="up-container">
        <div className="up-error-auth">
          <h3>🔐 {t("userProfile.authError")}</h3>
          <button className="up-login-btn" onClick={handleLogout}>{t("userProfile.loginBtn")}</button>
        </div>
      </div>
    );
  }

  return (
    <div className="up-container">
      {/* Приветствие */}
      <div className="up-greeting-section">
        <div className="up-text-content">
          <h1>{t("userProfile.greetingTitle")} <span className="wave-hand">👋</span></h1>
          <p className="up-subtitle">{t("userProfile.greetingSubtitle", { name: name || "User" })}</p>
          <p className="up-email">{email}</p>
        </div>
        <button onClick={handleLogout} className="up-logout-mini-btn">
          {t("userProfile.logout")}
        </button>
      </div>

      {/* Галерея профилей */}
      <div className="up-gallery-wrapper">
        {loadingProfile ? (
          <div className="up-loading-state" style={{ height: "150px" }}>
            <div className="up-spinner"></div>
            <span style={{ marginLeft: "10px" }}>Loading profiles...</span>
          </div>
        ) : (
          <CardGallery
            profiles={userProfile ? [userProfile] : []}
            onEditProfile={handleEditProfile}
            onLogOut={handleLogout}
            onAddNewProfile={handleAddNewProfile}
          />
        )}
      </div>

      {/* Dashboard */}
      <div className="up-dashboard">
        <div className="up-tabs-header">
          <TabButton 
            active={activeTab === "orders"} 
            onClick={() => setActiveTab("orders")} 
            label={t("userProfile.orders")}
            icon="📦"
            count={loadingOrders ? 0 : sortedOrders?.length}
          />
          <TabButton 
            active={activeTab === "favorites"} 
            onClick={() => setActiveTab("favorites")} 
            label={t("userProfile.favorites")}
            icon="❤️"
            count={loadingFavorites ? 0 : favorites?.length}
          />
          <TabButton 
            active={activeTab === "discounts"} 
            onClick={() => setActiveTab("discounts")} 
            label={t("userProfile.discounts")}
            icon="🎫"
            count={loadingDiscounts ? 0 : discounts?.length}
          />
        </div>

        <div className="up-tab-content">
          {/* ORDERS */}
          {activeTab === "orders" && (
            <div className="up-fade-in">
              {loadingOrders ? (
                <div className="up-loading-state"><div className="up-spinner"></div> Loading...</div>
              ) : sortedOrders?.length > 0 ? (
                <div className="up-orders-list">
                  {sortedOrders.map((order) => (
                    <div 
                      key={order._id} 
                      className="up-order-card"
                      // 👇 Добавили onClick и стиль курсора
                      onClick={() => handleOrderClick(order)}
                      style={{ cursor: "pointer" }}
                    >
                      <div className="up-order-header">
                        <div className="up-order-meta">
                          <span className="up-order-id">#{order._id.slice(-6).toUpperCase()}</span>
                          <span className="up-order-date">{new Date(order.createdAt).toLocaleDateString()}</span>
                        </div>
                        <span className={`up-status-badge ${order.status.toLowerCase()}`}>{order.status}</span>
                      </div>
                      <div className="up-order-products-preview">
                        {order.products.map((p, idx) => {
                          const finalImage = p.personalOrderId?.images?.[0] || p.image;

                          return (
                            <div key={idx} className="up-mini-product">
                              <ImageWithFallback src={finalImage} alt={p.name} />
                              <div className="up-mini-info">
                                <span className="name">{p.name}</span>
                                <span className="qty">x{p.quantity}</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      <div className="up-order-footer">
                        <span className="up-total-label">Total:</span>
                        <span className="up-total-price">{order.totalPrice} PLN</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="up-empty-state">
                  <div className="up-empty-icon">📦</div>
                  <h3>{t("userProfile.noOrders")}</h3>
                  <button className="up-cta-btn" onClick={handleGoShopping}>{t("userProfile.goShopping")}</button>
                </div>
              )}
            </div>
          )}

          {/* FAVORITES */}
          {activeTab === "favorites" && (
            <div className="up-fade-in">
              {loadingFavorites ? (
                <div className="up-loading-state"><div className="up-spinner"></div> Loading...</div>
              ) : favorites?.length > 0 ? (
                <div className="up-favorites-grid">
                  {favorites.map((product) => (
                    <div key={product.id} className="up-favorite-card" onClick={() => navigate(`/product/${product.id}`)}>
                      <div className="up-fav-img-wrapper">
                        <ImageWithFallback src={product.image} alt={product.name[currentLang]} />
                      </div>
                      <div className="up-fav-info">
                        <span className="up-fav-name">{product.name[currentLang]}</span>
                        <span className="up-fav-price">{product.price} PLN</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="up-empty-state">
                  <div className="up-empty-icon">❤️</div>
                  <h3>{t("userProfile.noFavorites")}</h3>
                  <button className="up-cta-btn" onClick={handleGoShopping}>{t("userProfile.findFavorites")}</button>
                </div>
              )}
            </div>
          )}

          {/* DISCOUNTS */}
          {activeTab === "discounts" && (
            <div className="up-fade-in">
              {loadingDiscounts ? (
                <div className="up-loading-state"><div className="up-spinner"></div> Loading...</div>
              ) : discounts?.length > 0 ? (
                <div className="up-discounts-grid">
                  {discounts.map((discount, idx) => (
                    <div key={idx} className="up-discount-ticket">
                      <div className="up-discount-left">
                        <span className="up-discount-amount">{discount.value}%</span>
                        <span className="up-discount-label">OFF</span>
                      </div>
                      <div className="up-discount-right">
                        <span className="up-code-value">{discount.code}</span>
                        <span className="up-expires">Exp: {new Date(discount.expiresAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="up-empty-state">
                  <div className="up-empty-icon">🎫</div>
                  <h3>{t("userProfile.noDiscounts")}</h3>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 👇 Модальное окно деталей заказа */}
      <OrderDetailsDrawer 
        isOpen={!!selectedOrder} 
        onClose={handleCloseModal} 
        order={selectedOrder} 
      />
    </div>
  );
}