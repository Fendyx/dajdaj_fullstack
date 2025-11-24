import React, { useState } from "react";
import "./ProductDetails.css";
import { useDispatch } from "react-redux";
import { addToCart } from "../slices/cartSlice";
import { useTranslation } from "react-i18next";
import { useLocation } from "react-router-dom";
import { useGetAllProductsQuery } from "../slices/productsApi";
import { PersonalizationModal } from "../components/PersonalizationModal/PersonalizationModal";
import { FaShoppingCart, FaStar, FaCube, FaChevronDown, FaImage } from "react-icons/fa";

export function ProductDetails({ show3D, on3DToggle }) {
  const { t, i18n } = useTranslation();
  const dispatch = useDispatch();
  const location = useLocation();

  // Загружаем продукты
  const { data: products = [], isLoading } = useGetAllProductsQuery(i18n.language);

  // Определяем slug из URL
  const slug = location.pathname.split("/products/")[1];

  // Ищем продукт только после загрузки
  const product = !isLoading ? products.find((p) => p.link?.endsWith(slug)) : null;

  const [showModal, setShowModal] = useState(false);
  const [openAccordion, setOpenAccordion] = useState(null);

  if (isLoading) {
    return (
      <div className="prod-loading">
        <FaCube className="prod-loading-icon" />
        <p>{t("productDetails.loadingProduct", "Загрузка продукта...")}</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="prod-not-found">
        <p>{t("productDetails.notFound", "Продукт не найден")}</p>
      </div>
    );
  }

  const handleAddToCartClick = () => setShowModal(true);

  const handleConfirmPersonalization = (personalizedData) => {
    dispatch(addToCart({ ...product, ...personalizedData }));
    setShowModal(false);
  };

  const toggleAccordion = (value) =>
    setOpenAccordion(openAccordion === value ? null : value);

  return (
    <div className="prod-page">
      <div className="prod-container">
        <div className="prod-info">
          <div className="prod-header">
            <h1 className="prod-title">{product.name || t("productDetails.noName", "Без названия")}</h1>
            <p className="prod-description">
              {product.descriptionProductPage || t("productDetails.noDescription", "Описание отсутствует")}
            </p>
          </div>

          {product.price && <div className="prod-price">{product.price} PLN</div>}

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

          <button className="prod-add-btn" onClick={handleAddToCartClick}>
            <FaShoppingCart className="prod-cart-icon" />
            <span>{t("productDetails.addToCart", "Добавить в корзину")}</span>
          </button>

          {/* Аккордеоны */}
          <div className="prod-accordion">
            {/* О продукте */}
            <div className="prod-accordion-item">
              <button
                className="prod-accordion-trigger"
                onClick={() => toggleAccordion("about")}
              >
                <span>{t("productDetails.about", "О продукте")}</span>
                <FaChevronDown className={`prod-accordion-icon ${openAccordion === "about" ? "prod-accordion-icon-open" : ""}`} />
              </button>
              <div className={`prod-accordion-content ${openAccordion === "about" ? "prod-accordion-content-open" : ""}`}>
                <div className="prod-accordion-inner">
                  <div className="prod-row">
                    <span>{t("productDetails.material", "Материал")}:</span>
                    <span className="prod-row-value">{product.material || t("productDetails.premiumQuality", "Premium Quality")}</span>
                  </div>
                  <div className="prod-row">
                    <span>{t("productDetails.delivery", "Доставка")}:</span>
                    <span className="prod-row-value">{t("productDetails.deliveryTime", "2–3 дня")}</span>
                  </div>
                  <div className="prod-row prod-row-last">
                    <span>{t("productDetails.warranty", "Гарантия")}:</span>
                    <span className="prod-row-value">{t("productDetails.warrantyPeriod", "12 месяцев")}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Отзывы */}
            <div className="prod-accordion-item">
              <button
                className="prod-accordion-trigger"
                onClick={() => toggleAccordion("reviews")}
              >
                <span>
                  {t("productDetails.reviews", "Отзывы")} ({product.reviews?.length || 0})
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
                            <p className="prod-username">{review.username || t("productDetails.anonymous", "Аноним")}</p>
                            <p className="prod-date">{t("productDetails.registered", "Зарегистрирован")}: {review.registeredDate || "—"}</p>
                          </div>
                          <div className="prod-stars">
                            {[...Array(5)].map((_, i) => (
                              <FaStar key={i} className={`prod-star ${i < review.rating ? "prod-star-filled" : ""}`} />
                            ))}
                          </div>
                        </div>
                        <p className="prod-comment">{review.comment || t("productDetails.noComment", "Без комментария")}</p>
                      </div>
                    ))
                  ) : (
                    <p className="prod-no-reviews">{t("productDetails.noReviews", "Пока нет отзывов")}</p>
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
