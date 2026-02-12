import React, { useState, useEffect } from "react";
import { FiShoppingCart, FiHeart, FiCheck } from "react-icons/fi";
import { FaHeart, FaStar } from "react-icons/fa";
import { useTranslation } from "react-i18next";
import "./ProductCard.css";

export const ProductCard = ({
  product,
  favorites,
  toggleFavorite,
  handleAddToCart,
  handleViewProduct
}) => {
  const { t } = useTranslation();

  // --- Логика (оставил без изменений) ---
  const isOriginallyFavorited = favorites?.some((f) => f.id === product.id);
  const [isFavLocal, setIsFavLocal] = useState(isOriginallyFavorited);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isAdded, setIsAdded] = useState(false);

  useEffect(() => {
    setIsFavLocal(isOriginallyFavorited);
  }, [isOriginallyFavorited]);

  const handleFavoriteClick = (e) => {
    e.stopPropagation();
    setIsFavLocal(!isFavLocal);
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 300);
    toggleFavorite(product.id);
  };

  const handleCartClick = (e) => {
    e.stopPropagation();
    if (isAdded) return;
    handleAddToCart(product);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  // Данные для отображения
  const rating = product.rating || 4.5;
  const reviewsCount = product.reviewsCount || Math.floor(Math.random() * 150) + 10;
  const hasDiscount = product.oldPrice || product.price > 100;
  const oldPrice = product.oldPrice || (hasDiscount ? (product.price * 1.2).toFixed(2) : null);

  return (
    <div className="product-card" onClick={() => handleViewProduct(product)}>
      
      {/* --- ИЗОБРАЖЕНИЕ --- */}
      <div className="product-image-wrapper">
        <div className="badges-container">
          {product.isNew && <span className="badge badge-new">NEW</span>}
          {hasDiscount && <span className="badge badge-sale">-20%</span>}
        </div>

        <button
          className={`fav-btn ${isFavLocal ? "active" : ""} ${isAnimating ? "pop" : ""}`}
          onClick={handleFavoriteClick}
        >
          {isFavLocal ? <FaHeart /> : <FiHeart />}
        </button>

        <img src={product.image} alt={product.name} className="product-img" />
      </div>

      {/* --- ИНФОРМАЦИЯ --- */}
      <div className="product-details">
        
        {/* 1. Название (теперь сверху для легкости чтения) */}
        <h3 className="product-title" title={product.name}>
          {product.name}
        </h3>

        {/* 2. Рейтинг (мелкий и аккуратный) */}
        <div className="rating-row">
          <div className="stars">
            <FaStar className="star-icon filled" size={12} />
            <span className="rating-value">{rating}</span>
          </div>
          <span className="reviews-count">{reviewsCount} отзыва</span>
        </div>

        {/* Разделитель (пустое место), чтобы прибить цену и кнопку к низу */}
        <div className="spacer"></div>

        {/* 3. Блок цены */}
        <div className="price-block">
          <span className="current-price">{product.price} zł</span>
          {oldPrice && <span className="old-price">{oldPrice} zł</span>}
        </div>

        {/* 4. Кнопка (Outline стиль) */}
        <button
          onClick={handleCartClick}
          className={`add-to-cart-btn ${isAdded ? "success" : ""}`}
          disabled={isAdded}
        >
          {isAdded ? (
            <>
              <FiCheck size={16} />
              <span>{t("Added") || "Added"}</span>
            </>
          ) : (
            <>
              <FiShoppingCart size={16} />
              <span>{t("productGrid.actions.addToCart") || "В корзину"}</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};