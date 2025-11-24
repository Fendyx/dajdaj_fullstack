import React from "react";
import { FiShoppingCart } from "react-icons/fi";
import { useTranslation } from "react-i18next";

export const ProductCard = ({
  product,
  favorites,
  toggleFavorite,
  handleBuyNow,
  handleViewProduct
}) => {
  const { i18n, t } = useTranslation();

  return (
    <div className="product-card">
      <div className="product-image-container">
        <img
          src={product.image}
          alt={product.name}
          className="product-image"
          onClick={() => handleViewProduct(product)}
          style={{ cursor: "pointer" }}
        />

        <div className="badges">
          {product.isNew && <span className="badge new">{t("productGrid.badges.new")}</span>}
          {product.isPopular && <span className="badge popular">{t("productGrid.badges.popular")}</span>}
        </div>

        <button
          className={`favorite ${favorites?.find(f => f.id === product.id) ? "favorited" : ""}`}
          onClick={(e) => { 
            e.stopPropagation(); 
            toggleFavorite(product.id); 
          }}
        >
          ♥
        </button>
      </div>

      <div className="product-info">
        <h3>{product.name}</h3>
        <p>{product.description}</p>

        <div className="product-footer">
          <span className="price">{product.price} pln</span>

          <button onClick={() => handleBuyNow(product)} className="product-cart-btn">
            <FiShoppingCart size={18} />
            <span>{t("productGrid.actions.buyNow")}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
