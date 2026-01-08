import React, { useState } from "react";
import "./ProductDetails.css";
import { useDispatch, useSelector } from "react-redux";
import { addToCart } from "../slices/cartSlice";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate } from "react-router-dom";
import { useGetAllProductsQuery } from "../slices/productsApi";
import { PersonalizationModal } from "../components/PersonalizationModal/PersonalizationModal";

// Импортируем иконки для маркетинговых триггеров
import { 
  FaShoppingCart, FaStar, FaCube, FaChevronDown, FaImage, FaCreditCard,
  FaTruck, FaShieldAlt, FaCheckCircle, // Иконки преимуществ (USP)
  FaLock, FaCcVisa, FaCcMastercard, FaCcPaypal // Иконки доверия и оплаты
} from "react-icons/fa";

export function ProductDetails({ show3D, on3DToggle }) {
  const { t, i18n } = useTranslation();
  const dispatch = useDispatch();
  const location = useLocation();
  const navigate = useNavigate();
  const auth = useSelector((state) => state.auth);

  // 1. Загружаем продукты из API (Source of Truth)
  const { data: products = [], isLoading } = useGetAllProductsQuery(i18n.language);

  // 2. Определяем slug и находим продукт
  const slug = location.pathname.split("/products/")[1];
  // Если slug нет (например, мы на кастомной странице), берем пропс или ищем иначе. 
  // Но для универсальности оставим поиск.
  const product = !isLoading ? products.find((p) => p.link?.endsWith(slug)) : null;

  const [showModal, setShowModal] = useState(false);
  const [openAccordion, setOpenAccordion] = useState("about"); // "about" открыт по умолчанию для SEO текста

  // --- ЛОГИКА РЕЙТИНГА (Social Proof) ---
  const calculateRating = () => {
    if (!product?.reviews || product.reviews.length === 0) return 5;
    const total = product.reviews.reduce((acc, review) => acc + review.rating, 0);
    return (total / product.reviews.length).toFixed(1);
  };
  const rating = calculateRating();
  const reviewCount = product?.reviews?.length || 0;

  // --- ЛОГИКА ЗАГРУЗКИ ---
  if (isLoading) {
    return (
      <div className="prod-loading">
        <FaCube className="prod-loading-icon" />
        <p>{t("productDetails.loadingProduct", "Loading product...")}</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="prod-not-found">
        <p>{t("productDetails.notFound", "Product not found")}</p>
      </div>
    );
  }

  // --- ОБРАБОТЧИКИ ---
  const handleAddToCartClick = () => setShowModal(true);

  const handleConfirmPersonalization = (personalizedData) => {
    dispatch(addToCart({ ...product, ...personalizedData }));
    setShowModal(false);
  };

  const handlePayNow = () => {
    // Формируем объект покупки на основе РЕАЛЬНЫХ данных из базы
    const buyNowItem = {
      ...product,
      id: product._id || product.id,
      qty: 1
    };

    // 1. Проверка авторизации
    if (!auth._id) {
      navigate(`/login?redirect=${location.pathname}`);
      return;
    }

    // 2. Проверка адреса доставки
    const deliveryList = auth.deliveryDatas || [];
    if (deliveryList.length === 0) {
      navigate("/shipping-info", { 
        state: { 
          fromPayNow: true,
          productToBuy: buyNowItem 
        } 
      });
      return;
    }

    // 3. Переход на чекаут
    navigate("/checkout-stripe", {
      state: {
        buyNowItem: buyNowItem
      }
    });
  };

  const toggleAccordion = (value) =>
    setOpenAccordion(openAccordion === value ? null : value);

  // Скролл к отзывам при клике на звезды
  const scrollToReviews = () => {
    setOpenAccordion("reviews");
    const element = document.getElementById("reviews-section");
    if(element) element.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="prod-page">
      <div className="prod-container">
        <div className="prod-info">
          
          {/* --- ЗАГОЛОВОК И РЕЙТИНГ --- */}
          <div className="prod-header">
            <h1 className="prod-title">{product.name || t("productDetails.noName", "No Name")}</h1>
            
            {/* SOCIAL PROOF: Рейтинг сразу под заголовком */}
            <div className="prod-rating-summary" onClick={scrollToReviews}>
              <div className="prod-stars-row">
                 {[...Array(5)].map((_, i) => (
                    <FaStar key={i} className={`prod-star ${i < Math.round(rating) ? "prod-star-filled" : ""}`} />
                  ))}
              </div>
              <span className="prod-rating-text">{rating} / 5.0 ({reviewCount} {t("productDetails.reviewsCount", "reviews")})</span>
            </div>

            <p className="prod-description">
              {product.descriptionProductPage || t("productDetails.noDescription", "No description available.")}
            </p>
          </div>

          {/* --- ЦЕНА И СТАТУС --- */}
          <div className="prod-price-section">
             {product.price && <div className="prod-price">{product.price} PLN</div>}
             <div className="prod-stock-badge">
                <span className="stock-dot"></span>
                {t("productDetails.inStock", "In Stock & Ready to Ship")}
             </div>
          </div>

          {/* --- USP (УНИКАЛЬНЫЕ ПРЕИМУЩЕСТВА) --- */}
          <div className="prod-usp-grid">
            <div className="prod-usp-item">
               <FaTruck className="usp-icon"/>
               <span>Fast Delivery<br/>2-3 Days</span>
            </div>
            <div className="prod-usp-item">
               <FaShieldAlt className="usp-icon"/>
               <span>Premium<br/>Warranty</span>
            </div>
            <div className="prod-usp-item">
               <FaCheckCircle className="usp-icon"/>
               <span>Top Quality<br/>Material</span>
            </div>
          </div>

          {/* --- КНОПКА 3D --- */}
          <button className="three-d-button" onClick={on3DToggle}>
            {show3D ? (
              <>
                <FaImage className="three-d-icon" />
                <span>{t("productDetails.showPhotos", "Show photos")}</span>
              </>
            ) : (
              <>
                <FaCube className="three-d-icon" />
                <span>{t("productDetails.view3D", "View 3D Model")}</span>
              </>
            )}
          </button>

          {/* --- STICKY ACTIONS (КНОПКИ ПОКУПКИ) --- */}
          <div className="prod-actions-sticky">
            <button className="prod-add-btn" onClick={handleAddToCartClick}>
              <FaShoppingCart className="prod-cart-icon" />
              <span>{t("productDetails.addToCart", "Add to Cart")}</span>
            </button>

            <button className="prod-buy-now-btn" onClick={handlePayNow}>
              <FaCreditCard className="prod-cart-icon" />
              <span>{t("productDetails.payNow", "Pay Now")}</span>
            </button>
          </div>

          {/* --- TRUST BADGES (ИКОНКИ ОПЛАТЫ) --- */}
          <div className="prod-trust-badges">
             <div className="prod-secure-text">
                <FaLock className="secure-icon" /> 
                <span>Guaranteed Safe & Secure Checkout</span>
             </div>
             <div className="prod-payment-icons">
               <FaCcVisa />
               <FaCcMastercard />
               <FaCcPaypal />
             </div>
          </div>

          {/* --- АККОРДЕОНЫ --- */}
          <div className="prod-accordion">
            <div className="prod-accordion-item">
              <button
                className="prod-accordion-trigger"
                onClick={() => toggleAccordion("about")}
              >
                <span>{t("productDetails.about", "About Product")}</span>
                <FaChevronDown className={`prod-accordion-icon ${openAccordion === "about" ? "prod-accordion-icon-open" : ""}`} />
              </button>
              <div className={`prod-accordion-content ${openAccordion === "about" ? "prod-accordion-content-open" : ""}`}>
                <div className="prod-accordion-inner">
                  <div className="prod-row">
                    <span>{t("productDetails.material", "Material")}:</span>
                    <span className="prod-row-value">{product.material || "Premium Quality"}</span>
                  </div>
                  <div className="prod-row">
                    <span>{t("productDetails.delivery", "Delivery")}:</span>
                    <span className="prod-row-value">{t("productDetails.deliveryTime", "2–3 days")}</span>
                  </div>
                  <div className="prod-row prod-row-last">
                    <span>{t("productDetails.warranty", "Warranty")}:</span>
                    <span className="prod-row-value">{t("productDetails.warrantyPeriod", "12 months")}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="prod-accordion-item" id="reviews-section">
              <button
                className="prod-accordion-trigger"
                onClick={() => toggleAccordion("reviews")}
              >
                <span>
                  {t("productDetails.reviews", "Reviews")} ({reviewCount})
                </span>
                <FaChevronDown className={`prod-accordion-icon ${openAccordion === "reviews" ? "prod-accordion-icon-open" : ""}`} />
              </button>
              <div className={`prod-accordion-content ${openAccordion === "reviews" ? "prod-accordion-content-open" : ""}`}>
                <div className="prod-accordion-inner">
                  {product.reviews?.length ? (
                    product.reviews.map((review, idx) => (
                      <div key={review.id || idx} className={`prod-review ${idx === product.reviews.length - 1 ? "prod-review-last" : ""}`}>
                        <div className="prod-review-header">
                          <div>
                            <p className="prod-username">{review.username || t("productDetails.anonymous", "Anonymous")}</p>
                            <p className="prod-date">{review.registeredDate || ""}</p>
                          </div>
                          <div className="prod-stars">
                            {[...Array(5)].map((_, i) => (
                              <FaStar key={i} className={`prod-star ${i < review.rating ? "prod-star-filled" : ""}`} />
                            ))}
                          </div>
                        </div>
                        <p className="prod-comment">{review.comment || t("productDetails.noComment", "No comment")}</p>
                      </div>
                    ))
                  ) : (
                    <p className="prod-no-reviews">{t("productDetails.noReviews", "No reviews yet. Be the first!")}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showModal && (
        <PersonalizationModal
          product={product}
          onClose={() => setShowModal(false)}
          onConfirm={handleConfirmPersonalization}
        />
      )}
    </div>
  );
}