import React, { useState } from "react";
import "./ProductDetails.css";
import { useDispatch } from "react-redux";
import { addToCart } from "../slices/cartSlice";
import { useTranslation } from "react-i18next";
import { useLocation } from "react-router-dom";
import { useGetAllProductsQuery } from "../slices/productsApi";
import { PersonalizationModal } from "../components/PersonalizationModal/PersonalizationModal";

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

  // Логи для дебага
  console.log("URL slug:", slug);
  console.log("All product links:", products.map(p => p.link));
  console.log("Found product:", product);

  if (isLoading) return <div className="loading">{t("loading") || "Loading..."}</div>;
  if (!product) return <div className="not-found">{t("notFound") || "Product not found"}</div>;

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

  return (
    <div className="product-details">
      {/* Product Info */}
      <h1 className="product-title">{product.name}</h1>
      <p className="product-description">{product.descriptionProductPage}</p>
      {product.price && <div className="product-price">{product.price} pln</div>}

      {/* Add to Cart Button */}
      <button className="buy-button" onClick={handleAddToCartClick}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="icon"
        >
          <circle cx="9" cy="21" r="1"></circle>
          <circle cx="20" cy="21" r="1"></circle>
          <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
        </svg>
        <span>{t("productDetails.addToCart") || "Add to Cart"}</span>
      </button>

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
