import React, { useState, useEffect } from "react";
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
import AccordionItem from "./AccordionItem";
import { CardGallery } from "./components/CardGallery/CardGallery";
import "./UserProfile.css";

function ImageWithFallback({ src, alt }) {
  const [error, setError] = useState(false);
  return (
    <img
      src={!error ? src : "https://via.placeholder.com/150?text=Image+not+available"}
      alt={alt}
      onError={() => setError(true)}
    />
  );
}

export function UserProfile() {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language || "en";
  const auth = useSelector((state) => state.auth);
  const { token, name, email } = auth;

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  console.log("🔍 [UserProfile] auth:", auth);
  console.log("🔍 [UserProfile] token:", token);

  // Если токена нет → сразу редиректим на логин
  useEffect(() => {
    console.log("📦 [useEffect] token:", token);
    if (!token) {
      console.log("🚪 [useEffect] Redirecting to /login");
      navigate("/login");
    }
  }, [token, navigate]);

  // ---- 🔹 Все RTK Query запросы ----
  const {
    data: userProfile,
    isLoading: loadingProfile,
    refetch: refetchProfile,
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

  // ---- 🔹 Форсим обновление при смене токена ----
  useEffect(() => {
    if (token) {
      console.log("🔄 Token changed — refetching user data...");
      refetchProfile();
      refetchOrders();
      refetchDiscounts();
      refetchFavorites();
    }
  }, [token, refetchProfile, refetchOrders, refetchDiscounts, refetchFavorites]);

  // ---- 🔹 UI состояния ----
  const [expandedSection, setExpandedSection] = useState(null);
  const [showGallery, setShowGallery] = useState(false);

  useEffect(() => {
    if (location.state?.openSection === "favorites") setExpandedSection("favorites");
    if (location.state?.showGallery) setShowGallery(true);
  }, [location.state]);

  const hasAuthError =
    errorOrders?.originalStatus === 401 ||
    errorOrders?.originalStatus === 400 ||
    errorDiscounts?.originalStatus === 401 ||
    errorDiscounts?.originalStatus === 400 ||
    errorFavorites?.originalStatus === 401 ||
    errorFavorites?.originalStatus === 400;

  console.log("🛑 [UserProfile] hasAuthError:", hasAuthError);

  const handleReLogin = () => {
    dispatch(logoutUser());
    navigate("/login");
  };

  

  if (hasAuthError) {
    return (
      <div className="up-container">
        <div className="up-card">
          <div className="up-error-auth">
            <h3>🔐 {t("userProfile.authError")}</h3>
            <p>
              {t("userProfile.status")}:{" "}
              {errorOrders?.originalStatus ||
                errorDiscounts?.originalStatus ||
                errorFavorites?.originalStatus}
            </p>
            <p>
              {t("userProfile.error")}:{" "}
              {errorOrders?.data?.message ||
                errorDiscounts?.data?.message ||
                errorFavorites?.data?.message}
            </p>
            <p>{t("userProfile.loginAgain")}</p>
            <button className="up-login-btn" onClick={handleReLogin}>
              {t("userProfile.loginBtn")}
            </button>
            <button
              className="up-login-btn"
              onClick={() => {
                localStorage.removeItem("token");
                window.location.reload();
              }}
              style={{ marginTop: "10px", backgroundColor: "#666" }}
            >
              {t("userProfile.clearToken")}
            </button>
          </div>
        </div>
      </div>
    );
  }

    const handleLogOutProfile = () => {
      // 💥 сбрасываем кэш RTK Query и стейт при logout
      dispatch(userApi.util.resetApiState());
      dispatch(logoutUser());
      navigate("/login");
    };

    const handleEditProfile = (profileId) => {
      console.log(`Editing profile: ${profileId}`);
    };

    const handleAddNewProfile = () => {
      console.log("Adding new profile");
    };

    // 1️⃣ ДОБАВЛЯЕМ ФИЛЬТРАЦИЮ (перед return)
  // Оставляем только те, где статус НЕ pending (без учета регистра)
  const visibleOrders = orders?.filter(
    (order) => order.status?.toLowerCase() !== "pending"
  );

  return (
    <div className="up-container">
       <div className="up-greeting-text">
        <h1>
          <span className="wave-hand">👋</span> {t("userProfile.greetingTitle")}
        </h1>
        <p>{t("userProfile.greetingSubtitle", { name: name || t("userProfile.user") })}</p>
      </div>

      {loadingProfile ? (
  <div className="up-loading-state">
    <div className="up-loading-spinner"></div>
    <span>Loading profile...</span>
  </div>
) : (
  <CardGallery
    profiles={userProfile ? [userProfile] : []}
    onEditProfile={handleEditProfile}
    onLogOut={handleLogOutProfile}
    onAddNewProfile={handleAddNewProfile}
  />
)}



      <div className="up-card">
        <div className="up-header">
          <div className="up-avatar">
            <span>{name?.charAt(0)?.toUpperCase()}</span>
          </div>
          <div>
            <h2>{name}</h2>
            <p>{email}</p>
          </div>
        </div>

        <div className="up-accordion">
          {/* Orders */}
          <AccordionItem
          title={t("userProfile.orders")}
          // 2️⃣ ИСПОЛЬЗУЕМ visibleOrders ДЛЯ СЧЕТЧИКА
          count={loadingOrders ? "..." : visibleOrders?.length || 0}
        >
          {loadingOrders ? (
            <div className="up-loading-state">
              <div className="up-loading-spinner"></div>
              <span>{t("userProfile.loadingOrders")}</span>
            </div>
          ) : errorOrders ? (
             {/* ... (код ошибки без изменений) */}
          ) : visibleOrders && visibleOrders.length > 0 ? ( // 3️⃣ ПРОВЕРЯЕМ visibleOrders
            <div className="up-orders-list">
              {/* 4️⃣ РЕНДЕРИМ visibleOrders ВМЕСТО orders */}
              {visibleOrders.map((order) => (
                <div key={order._id} className="up-order-card">
                  <div className="up-order-header">
                    <span className="up-order-id">
                      {t("userProfile.order")} #{order._id}
                    </span>
                    <span className={`up-order-status ${order.status.toLowerCase()}`}>
                      {order.status}
                    </span>
                  </div>

                  <div className="up-order-details">
                    <span> {new Date(order.createdAt).toLocaleDateString()}</span>
                    <span className="up-order-total">{order.totalPrice} PLN</span>
                  </div>

                  {/* 5️⃣ УЛУЧШЕННАЯ СТРУКТУРА ТОВАРОВ */}
                  <div className="up-order-products-divider"></div>
                  <div className="up-order-products">
                    {order.products.map((p, idx) => (
                      <div key={idx} className="up-order-product">
                        <div className="up-product-img-wrapper">
                           {/* Используем fallback если картинки нет */}
                           <img src={p.image || "https://via.placeholder.com/50"} alt={p.name} />
                        </div>
                        <div className="up-order-product-info">
                          <span className="up-product-name">{p.name}</span>
                          <span className="up-product-meta">
                            {p.quantity} × {p.price} PLN
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="up-empty-state">
              <div className="up-empty-icon">📦</div>
              <p>{t("userProfile.noOrders")}</p>
              <p className="up-empty-description">{t("userProfile.ordersDesc")}</p>
            </div>
          )}
        </AccordionItem>


          {/* Discounts */}
          <AccordionItem
            title={t("userProfile.discounts")}
            count={loadingDiscounts ? "..." : discounts?.length || 0}
          >
            {loadingDiscounts ? (
              <div className="up-loading-state">
                <div className="up-loading-spinner"></div>
                <span>{t("userProfile.loadingDiscounts")}</span>
              </div>
            ) : errorDiscounts ? (
              <div>
                <p className="up-error-message">{t("userProfile.failedDiscounts")}</p>
                <p style={{ color: "#666", fontSize: "12px" }}>
                  {t("userProfile.status")}: {errorDiscounts?.originalStatus}
                  <br />
                  {t("userProfile.error")}: {errorDiscounts?.data?.message}
                </p>
              </div>
            ) : discounts && discounts.length > 0 ? (
              <div className="up-discounts-list">
                {discounts.map((discount, idx) => (
                  <div key={idx} className="up-discount-card">
                    <div className="up-discount-header">
                      <span className="up-discount-code">{discount.code}</span>
                      <span className="up-discount-value">{discount.value}% OFF</span>
                    </div>
                    <div className="up-discount-details">
                      <span>
                        {t("userProfile.expires")}:{" "}
                        {new Date(discount.expiresAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="up-empty-state">
                <div className="up-empty-icon">🎁</div>
                <p>{t("userProfile.noDiscounts")}</p>
                <p className="up-empty-description">
                  {t("userProfile.discountsDesc")}
                </p>
              </div>
            )}
          </AccordionItem>

          {/* Favorites */}
          <AccordionItem
            title={t("userProfile.favorites")}
            count={loadingFavorites ? "..." : favorites?.length || 0}
            isOpen={expandedSection === "favorites"}
          >
            {loadingFavorites ? (
              <div className="up-loading-state">
                <div className="up-loading-spinner"></div>
                <span>{t("userProfile.loadingFavorites")}</span>
              </div>
            ) : errorFavorites ? (
              <div>
                <p className="up-error-message">{t("userProfile.failedFavorites")}</p>
                <p style={{ color: "#666", fontSize: "12px" }}>
                  {t("userProfile.status")}: {errorFavorites?.originalStatus}
                  <br />
                  {t("userProfile.error")}: {errorFavorites?.data?.message}
                </p>
              </div>
            ) : favorites && favorites.length > 0 ? (
              <div className="up-favorites-grid">
                {favorites.map((product) => (
                  <div key={product.id} className="up-favorite-card">
                    <ImageWithFallback
                      src={product.image}
                      alt={product.name[currentLang]}
                    />
                    <div className="up-favorite-info">
                      <span className="up-favorite-name">
                        {product.name[currentLang]}
                      </span>
                      <span className="up-favorite-price">{product.price}pln</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="up-empty-state">
                <div className="up-empty-icon">❤️</div>
                <p>{t("userProfile.noFavorites")}</p>
                <p className="up-empty-description">
                  {t("userProfile.favoritesDesc")}
                </p>
              </div>
            )}
          </AccordionItem>
        </div>
      </div>
    </div>
  );
}
