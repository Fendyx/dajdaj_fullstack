import { useState } from "react";
import { useTranslation } from "react-i18next";
import { ShoppingCart, Heart, Check } from "lucide-react";
import type { Product } from "@/types/product";
import "./ProductCard.css";

interface ProductCardProps {
  product: Product;
  favorites: any[];
  toggleFavorite: (slug: string) => void;
  handleAddToCart: (product: Product) => void;
  handleViewProduct: (product: Product) => void;
}

export const ProductCard = ({
  product,
  favorites,
  toggleFavorite,
  handleAddToCart,
  handleViewProduct,
}: ProductCardProps) => {
  const { t } = useTranslation();

  const isFavorited = favorites?.some((f) => f.slug === product.slug);

  const [isAnimating, setIsAnimating] = useState(false);
  const [isAdded, setIsAdded] = useState(false);

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 300);
    toggleFavorite(product.slug);
  };

  const handleCartClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isAdded) return;
    handleAddToCart(product);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  const hasDiscount = !!product.oldPrice;
  const discountPercent = product.oldPrice
    ? Math.round((1 - product.price / product.oldPrice) * 100)
    : null;

  return (
    <div className="product-card" onClick={() => handleViewProduct(product)}>

      {/* --- ИЗОБРАЖЕНИЕ --- */}
      <div className="product-image-wrapper">
        <div className="badges-container">
          {product.isNew && <span className="badge badge-new">NEW</span>}
          {hasDiscount && discountPercent && (
            <span className="badge badge-sale">-{discountPercent}%</span>
          )}
        </div>

        <button
          className={`fav-btn ${isFavorited ? "active" : ""} ${isAnimating ? "pop" : ""}`}
          onClick={handleFavoriteClick}
          aria-label="Toggle Favorite"
        >
          <Heart
            size={20}
            fill={isFavorited ? "currentColor" : "none"}
            className={isFavorited ? "text-red-500" : ""}
          />
        </button>

        <img src={product.image} alt={product.name} className="product-img" />
      </div>

      {/* --- ИНФОРМАЦИЯ --- */}
      <div className="product-details">
        <h3 className="product-title" title={product.name}>
          {product.name}
        </h3>

        <div className="spacer"></div>

        <div className="price-block">
          <span className="current-price">{product.price} zł</span>
          {product.oldPrice && (
            <span className="old-price">{product.oldPrice} zł</span>
          )}
        </div>

        <button
          onClick={handleCartClick}
          className={`add-to-cart-btn ${isAdded ? "success" : ""}`}
          disabled={isAdded}
        >
          {isAdded ? (
            <>
              <Check size={16} />
              <span>{t("productGrid.actions.added", "Dodano")}</span>
            </>
          ) : (
            <>
              <ShoppingCart size={16} />
              <span>{t("productGrid.actions.addToCart", "Do koszyka")}</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};