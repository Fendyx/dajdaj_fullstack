// frontend/src/components/UserProfile/UserProfile.jsx
import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";

import {
  useGetUserOrdersQuery,
  useGetUserDiscountsQuery,
  useGetUserFavoritesQuery,
} from "../../slices/userApi";
import { logoutUser } from "../../slices/authSlice";
import AccordionItem from "./AccordionItem";
import "./UserProfile.css";

function ImageWithFallback({ src, alt }) {
  const [error, setError] = useState(false);

  return (
    <img
      src={
        !error
          ? src
          : "https://via.placeholder.com/150?text=Image+not+available"
      }
      alt={alt}
      onError={() => setError(true)}
    />
  );
}

export function UserProfile() {
  const { token, name, email } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const {
    data: orders,
    isLoading: loadingOrders,
    error: errorOrders,
  } = useGetUserOrdersQuery();
  const {
    data: discounts,
    isLoading: loadingDiscounts,
    error: errorDiscounts,
  } = useGetUserDiscountsQuery();
  const {
    data: favorites,
    isLoading: loadingFavorites,
    error: errorFavorites,
  } = useGetUserFavoritesQuery();

  const location = useLocation();
  const [expandedSection, setExpandedSection] = useState(null);

useEffect(() => {
  // Если пришёл state от NavBar с openSection = "favorites"
  if (location.state?.openSection === "favorites") {
    setExpandedSection("favorites");
  }
}, [location.state]);


  // Отладка
  useEffect(() => {
    console.log("Token:", token);
    console.log("Orders error:", errorOrders);
    console.log("Discounts error:", errorDiscounts);
    console.log("Favorites error:", errorFavorites);

    if (errorOrders) {
      console.log("Orders error data:", errorOrders.data);
      console.log("Orders error status:", errorOrders.status);
      console.log("Orders error originalStatus:", errorOrders.originalStatus);
    }
    if (errorDiscounts) {
      console.log("Discounts error data:", errorDiscounts.data);
    }
    if (errorFavorites) {
      console.log("Favorites error data:", errorFavorites.data);
    }
  }, [token, errorOrders, errorDiscounts, errorFavorites]);

  // Проверка ошибок аутентификации
  const hasAuthError =
    errorOrders?.originalStatus === 401 ||
    errorOrders?.originalStatus === 400 ||
    errorDiscounts?.originalStatus === 401 ||
    errorDiscounts?.originalStatus === 400 ||
    errorFavorites?.originalStatus === 401 ||
    errorFavorites?.originalStatus === 400;

  const handleReLogin = () => {
    dispatch(logoutUser());
    navigate("/login");
  };

  // Если ошибка авторизации — отдельный экран
  if (hasAuthError) {
    return (
      <div className="up-container">
        <div className="up-card">
          <div className="up-error-auth">
            <h3>🔐 Authentication Error</h3>
            <p>
              Status:{" "}
              {errorOrders?.originalStatus ||
                errorDiscounts?.originalStatus ||
                errorFavorites?.originalStatus}
            </p>
            <p>
              Error:{" "}
              {errorOrders?.data ||
                errorDiscounts?.data ||
                errorFavorites?.data}
            </p>
            <p>Please log in again.</p>
            <button className="up-login-btn" onClick={handleReLogin}>
              Login Again
            </button>
            <button
              className="up-login-btn"
              onClick={() => {
                localStorage.removeItem("token");
                window.location.reload();
              }}
              style={{ marginTop: "10px", backgroundColor: "#666" }}
            >
              Clear Token & Reload
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Основной UI (как в старом коде)
  return (
    <div className="up-container">
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
            title="My Orders"
            count={loadingOrders ? "..." : orders?.length || 0}
          >
            {loadingOrders ? (
              <div className="up-loading-state">
                <div className="up-loading-spinner"></div>
                <span>Loading orders...</span>
              </div>
            ) : errorOrders ? (
              <div>
                <p className="up-error-message">Failed to load orders</p>
                <p style={{ color: "#666", fontSize: "12px" }}>
                  Status: {errorOrders.originalStatus}
                  <br />
                  Error: {errorOrders.data}
                </p>
              </div>
            ) : orders && orders.length > 0 ? (
              <div className="up-orders-list">
                {orders.map((order) => (
                  <div key={order._id} className="up-order-card">
                    <div className="up-order-header">
                      <span className="up-order-id">Order #{order._id}</span>
                      <span
                        className={`up-order-status ${order.status.toLowerCase()}`}
                      >
                        {order.status}
                      </span>
                    </div>
                    <div className="up-order-details">
                      <span>
                        {new Date(order.createdAt).toLocaleDateString()}
                      </span>
                      <span>${order.totalAmount.toFixed(2)}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="up-empty-state">
                <div className="up-empty-icon">📦</div>
                <p>No orders yet</p>
                <p className="up-empty-description">
                  Your order history will appear here
                </p>
              </div>
            )}
          </AccordionItem>

          {/* Discounts */}
          <AccordionItem
            title="My Discounts"
            count={loadingDiscounts ? "..." : discounts?.length || 0}
          >
            {loadingDiscounts ? (
              <div className="up-loading-state">
                <div className="up-loading-spinner"></div>
                <span>Loading discounts...</span>
              </div>
            ) : errorDiscounts ? (
              <div>
                <p className="up-error-message">Failed to load discounts</p>
                <p style={{ color: "#666", fontSize: "12px" }}>
                  Status: {errorDiscounts.originalStatus}
                  <br />
                  Error: {errorDiscounts.data}
                </p>
              </div>
            ) : discounts && discounts.length > 0 ? (
              <div className="up-discounts-list">
                {discounts.map((discount, idx) => (
                  <div key={idx} className="up-discount-card">
                    <div className="up-discount-header">
                      <span className="up-discount-code">{discount.code}</span>
                      <span className="up-discount-value">
                        {discount.value}% OFF
                      </span>
                    </div>
                    <div className="up-discount-details">
                      <span>
                        Expires:{" "}
                        {new Date(discount.expiresAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="up-empty-state">
                <div className="up-empty-icon">🎁</div>
                <p>No discounts available</p>
                <p className="up-empty-description">
                  Active discounts will appear here
                </p>
              </div>
            )}
          </AccordionItem>

          {/* Favorites */}
          <AccordionItem
            title="My Favorites"
            count={loadingFavorites ? "..." : favorites?.length || 0}
            isOpen={expandedSection === "favorites"}
          >
            {loadingFavorites ? (
              <div className="up-loading-state">
                <div className="up-loading-spinner"></div>
                <span>Loading favorites...</span>
              </div>
            ) : errorFavorites ? (
              <div>
                <p className="up-error-message">Failed to load favorites</p>
                <p style={{ color: "#666", fontSize: "12px" }}>
                  Status: {errorFavorites.originalStatus}
                  <br />
                  Error: {errorFavorites.data}
                </p>
              </div>
            ) : favorites && favorites.length > 0 ? (
              <div className="up-favorites-grid">
                {favorites.map((product) => (
                  <div key={product.id} className="up-favorite-card">
                    <ImageWithFallback src={product.image} alt={product.name} />
                    <div className="up-favorite-info">
                      <span className="up-favorite-name">{product.name}</span>
                      <span className="up-favorite-price">
                        ${product.price}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="up-empty-state">
                <div className="up-empty-icon">❤️</div>
                <p>No favorites yet</p>
                <p className="up-empty-description">
                  Add products to favorites to see them here
                </p>
              </div>
            )}
          </AccordionItem>
        </div>
      </div>
    </div>
  );
}
