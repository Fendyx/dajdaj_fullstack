import React, { useState } from "react";
import "./ProductDetails.css";
import { useDispatch } from "react-redux";
import { addToCart } from "../slices/cartSlice";
import { useTranslation } from "react-i18next";
import { useLocation } from "react-router-dom";
import { useGetAllProductsQuery } from "../slices/productsApi";
import { PersonalizationModal } from "../components/PersonalizationModal/PersonalizationModal";
import { FaShoppingCart, FaStar, FaCube, FaChevronDown } from "react-icons/fa";

export function ProductDetails() {
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

  // Логи для дебага
  console.log("URL slug:", slug);
  console.log("All product links:", products.map(p => p.link));
  console.log("Found product:", product);

  if (isLoading) {
    return (
      <div className="prod-loading">
        <FaCube className="prod-loading-icon" />
        <p>Загрузка продукта...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="prod-not-found">
        <p>Продукт не найден</p>
      </div>
    );
  }

  // Открыть модалку персонализации
  const handleAddToCartClick = () => {
    setShowModal(true);
  };

  // Подтверждение персонализации
  const handleConfirmPersonalization = (personalizedData) => {
    const productWithPersonalization = {
      ...product,
      ...personalizedData,
    };
    dispatch(addToCart(productWithPersonalization));
    setShowModal(false);
  };

  const toggleAccordion = (value) =>
    setOpenAccordion(openAccordion === value ? null : value);

  return (
    <div className="prod-page">
      <div className="prod-container">
        {/* === Правая часть: Информация о товаре === */}
        <div className="prod-info">
          <div className="prod-header">
            <h1 className="prod-title">{product.name || "Без названия"}</h1>
            <p className="prod-description">
              {product.descriptionProductPage || "Описание отсутствует"}
            </p>
          </div>

          {product.price && (
            <div className="prod-price">{product.price} PLN</div>
          )}

          <button className="prod-add-btn" onClick={handleAddToCartClick}>
            <FaShoppingCart className="prod-cart-icon" />
            <span>{t("productDetails.addToCart") || "Добавить в корзину"}</span>
          </button>

          {/* === Аккордеоны === */}
          <div className="prod-accordion">
            {/* --- О продукте --- */}
            <div className="prod-accordion-item">
              <button
                className="prod-accordion-trigger"
                onClick={() => toggleAccordion("about")}
              >
                <span>О продукте</span>
                <FaChevronDown
                  className={`prod-accordion-icon ${
                    openAccordion === "about" ? "prod-accordion-icon-open" : ""
                  }`}
                />
              </button>
              <div
                className={`prod-accordion-content ${
                  openAccordion === "about" ? "prod-accordion-content-open" : ""
                }`}
              >
                <div className="prod-accordion-inner">
                  <div className="prod-row">
                    <span>Материал:</span>
                    <span className="prod-row-value">
                      {product.material || "Premium Quality"}
                    </span>
                  </div>
                  <div className="prod-row">
                    <span>Доставка:</span>
                    <span className="prod-row-value">2–3 дня</span>
                  </div>
                  <div className="prod-row prod-row-last">
                    <span>Гарантия:</span>
                    <span className="prod-row-value">12 месяцев</span>
                  </div>
                </div>
              </div>
            </div>

            {/* --- Отзывы --- */}
            <div className="prod-accordion-item">
              <button
                className="prod-accordion-trigger"
                onClick={() => toggleAccordion("reviews")}
              >
                <span>Отзывы ({product.reviews?.length || 0})</span>
                <FaChevronDown
                  className={`prod-accordion-icon ${
                    openAccordion === "reviews"
                      ? "prod-accordion-icon-open"
                      : ""
                  }`}
                />
              </button>
              <div
                className={`prod-accordion-content ${
                  openAccordion === "reviews"
                    ? "prod-accordion-content-open"
                    : ""
                }`}
              >
                <div className="prod-accordion-inner">
                  {product.reviews?.length ? (
                    product.reviews.map((review, idx) => (
                      <div
                        key={review.id || idx}
                        className={`prod-review ${
                          idx === product.reviews.length - 1
                            ? "prod-review-last"
                            : ""
                        }`}
                      >
                        <div className="prod-review-header">
                          <div>
                            <p className="prod-username">
                              {review.username || "Аноним"}
                            </p>
                            <p className="prod-date">
                              Зарегистрирован:{" "}
                              {review.registeredDate || "—"}
                            </p>
                          </div>
                          <div className="prod-stars">
                            {[...Array(5)].map((_, i) => (
                              <FaStar
                                key={i}
                                className={`prod-star ${
                                  i < review.rating ? "prod-star-filled" : ""
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                        <p className="prod-comment">
                          {review.comment || "Без комментария"}
                        </p>
                      </div>
                    ))
                  ) : (
                    <p className="prod-no-reviews">Пока нет отзывов</p>
                  )}
                </div>
              </div>
            </div>
          </div>
          {/* === /Аккордеоны === */}
        </div>
      </div>

      {/* Модалка персонализации */}
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