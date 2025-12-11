import React, { useState, useEffect } from "react";
import { FiShoppingCart, FiHeart, FiCheck, FiStar } from "react-icons/fi";
import { FaHeart, FaStar } from "react-icons/fa"; // Используем FaStar для залитых звезд
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

  // Логика избранного
  const isOriginallyFavorited = favorites?.some((f) => f.id === product.id);
  const [isFavLocal, setIsFavLocal] = useState(isOriginallyFavorited);
  const [isAnimating, setIsAnimating] = useState(false);

  // Логика корзины
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
    if (isAdded) return; // Защита от двойного клика

    handleAddToCart(product);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  // Фейковый генератор звезд для визуализации (можно заменить на product.rating)
  const rating = product.rating || 4.5;
  const reviewsCount = product.reviewsCount || Math.floor(Math.random() * 150) + 10;

  // Логика скидки (визуальная симуляция, если нет в данных)
  const hasDiscount = product.oldPrice || product.price > 100; // Пример условия
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
        
        {/* Цена (самое важное) */}
        <div className="price-block">
          <span className="current-price">{product.price} zł</span>
          {oldPrice && <span className="old-price">{oldPrice} zł</span>}
        </div>

        {/* Название */}
        <h3 className="product-title" title={product.name}>{product.name}</h3>

        {/* Рейтинг */}
        <div className="rating-row">
          <FaStar className="star-icon filled" />
          <span className="rating-value">{rating}</span>
          <span className="reviews-count">({reviewsCount})</span>
        </div>

        {/* Кнопка (Прибита к низу) */}
        <div className="action-row">
          <button
            onClick={handleCartClick}
            className={`add-to-cart-btn ${isAdded ? "success" : ""}`}
            disabled={isAdded}
          >
            {isAdded ? (
              <>
                <FiCheck size={18} />
                <span>{t("Added")}</span>
              </>
            ) : (
              <>
                <FiShoppingCart size={18} />
                <span>{t("productGrid.actions.addToCart") || "Add"}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};