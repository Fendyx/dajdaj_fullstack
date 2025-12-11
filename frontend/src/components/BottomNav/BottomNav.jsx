import React, { useEffect, useState } from "react";
import "./BottomNav.css";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { FaHome, FaUser, FaShoppingCart } from "react-icons/fa";
import { useSelector, useDispatch } from "react-redux";
import { getTotals, addToCart } from "../../slices/cartSlice";
import { useUI } from "../../context/UIContext";
import { useTranslation } from "react-i18next";
import { useGetAllProductsQuery } from "../../slices/productsApi";
import { PersonalizationModal } from "../PersonalizationModal/PersonalizationModal";

const BottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const cart = useSelector((state) => state.cart);
  const { isMenuOpen } = useUI(); // убрали isModalOpen
  const { t, i18n } = useTranslation();

  const [showModal, setShowModal] = useState(false);
  const [currentProduct, setCurrentProduct] = useState(null);

  // Загружаем все продукты
  const { data: products = [] } = useGetAllProductsQuery(i18n.language);

  useEffect(() => {
    dispatch(getTotals());
  }, [cart.cartItems, dispatch]);

  if (isMenuOpen) return null; // скрываем только меню

  // Определяем, на странице продукта ли мы
  const isProductPage = location.pathname.startsWith("/products/");
  const slug = isProductPage ? location.pathname.split("/products/")[1] : null;

  // Находим продукт по slug
  const product = products.find((p) => p.link?.endsWith(slug));

  // Кнопка Купить
  const handleBuyClick = () => {
    if (!product) return;
    setCurrentProduct(product);
    setShowModal(true);
  };

  // Подтверждение персонализации
  const handleConfirmPersonalization = (personalizedData) => {
    const productWithPersonalization = {
      ...currentProduct,
      ...personalizedData,
    };
    dispatch(addToCart(productWithPersonalization));
    setShowModal(false);
    navigate("/cart");
  };

  return (
    <div className="bottom-nav-container">
      {/* Основной навбар */}
      <div className="bottom-nav">
        <Link
          to="/"
          className={`nav-item ${location.pathname === "/" ? "active" : ""}`}
        >
          <FaHome className="nav-icon" />
          <span>{t("bottomNav.home")}</span>
        </Link>

        <Link
          to="/profile"
          className={`nav-item ${location.pathname === "/profile" ? "active" : ""}`}
        >
          <FaUser className="nav-icon" />
          <span>{t("bottomNav.profile")}</span>
        </Link>

        <Link
          to="/cart"
          className={`nav-item ${location.pathname === "/cart" ? "active" : ""}`}
        >
          <div className="cart-wrapper">
            <FaShoppingCart className="nav-icon" />
            {cart.cartTotalQuantity > 0 && (
              <span className="cart-badge">{cart.cartTotalQuantity}</span>
            )}
          </div>
          <span>{t("bottomNav.cart")}</span>
        </Link>
      </div>

      {/* Кнопка Купить */}
      {/* {isProductPage && product && (
        <button className="buy-button-bottom-nav" onClick={handleBuyClick}>
          {t("bottomNav.buyNow")}
        </button>
      )} */}

      {/* Модалка персонализации */}
      {/* {showModal && currentProduct && (
        <PersonalizationModal
          product={currentProduct}
          onClose={() => setShowModal(false)}
          onConfirm={handleConfirmPersonalization}
        />
      )} */}
    </div>
  );
};

export default BottomNav;
