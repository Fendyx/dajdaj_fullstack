import React, { useState, useEffect } from "react";
import { FiShoppingCart, FiHeart, FiCheck } from "react-icons/fi"; // Added FiCheck
import { FaHeart } from "react-icons/fa";
import { useTranslation } from "react-i18next";
import "./ProductCard.css";

export const ProductCard = ({
  product,
  favorites,
  toggleFavorite,
  handleAddToCart, // RENAMED: Was handleBuyNow
  handleViewProduct
}) => {
  const { t } = useTranslation();

  // 1. Favorites Logic
  const isOriginallyFavorited = favorites?.some((f) => f.id === product.id);
  const [isFavLocal, setIsFavLocal] = useState(isOriginallyFavorited);
  const [isAnimating, setIsAnimating] = useState(false);

  // 2. NEW: Add to Cart Logic (Visual Feedback)
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

  // NEW: Handle Cart Click
  const handleCartClick = (e) => {
    e.stopPropagation();
    
    // 1. Call the function passed from parent
    handleAddToCart(product);

    // 2. Show visual feedback (Green checkmark)
    setIsAdded(true);
    
    // 3. Reset button after 2 seconds
    setTimeout(() => setIsAdded(false), 2000);
  };

  return (
    <div className="product-card" onClick={() => handleViewProduct(product)}>
      <div className="product-image-container">
        <img
          src={product.image}
          alt={product.name}
          className="product-image"
        />

        <div className="badges">
          {product.isNew && (
            <span className="badge new">{t("productGrid.badges.new")}</span>
          )}
          {product.isPopular && (
            <span className="badge popular">{t("productGrid.badges.popular")}</span>
          )}
        </div>

        <button
          className={`favorite-btn ${isFavLocal ? "active" : ""} ${isAnimating ? "animating" : ""}`}
          onClick={handleFavoriteClick}
          aria-label="Add to favorites"
        >
          {isFavLocal ? (
            <FaHeart className="heart-icon filled" />
          ) : (
            <FiHeart className="heart-icon outline" />
          )}
        </button>
      </div>

      <div className="product-info">
        <div>
           <h3>{product.name}</h3>
           <p>{product.description}</p>
        </div>

        <div className="product-footer">
          <span className="price">{product.price} PLN</span>

          {/* UPDATED BUTTON */}
          <button
            onClick={handleCartClick}
            className={`product-cart-btn ${isAdded ? "added-success" : ""}`}
            disabled={isAdded} // Prevent double clicking while "Added" is shown
            style={{ 
              backgroundColor: isAdded ? "#4CAF50" : "", 
              borderColor: isAdded ? "#4CAF50" : "" 
            }}
          >
            {isAdded ? (
              <>
                <FiCheck size={18} color="white" />
                <span style={{ color: "white" }}>{t("Added")}</span> 
              </>
            ) : (
              <>
                <FiShoppingCart size={18} />
                {/* Change translation key if needed, or hardcode "Add to Cart" */}
                <span>{t("productGrid.actions.addToCart") || "Add to Cart"}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};