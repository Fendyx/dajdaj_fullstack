import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useDispatch } from "react-redux";
import { Heart } from "lucide-react";
import {
  useGetUserFavoritesQuery,
  useAddFavoriteMutation,
  useRemoveFavoriteMutation,
} from "@/services/userApi";
import { addToCart } from "@/features/cart/cartSlice";
import { ProductCard } from "@/components/ui/ProductCard/ProductCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { Spinner } from "@/components/ui/Spinner/Spinner";
import "./FavoritesTab.css";

/**
 * Normalizes a product from the favorites API.
 * 
 * The backend /user/favorites returns raw products from products.js
 * where fields like `name`, `description`, `phrases` can be objects
 * like { en: "...", pl: "..." } instead of plain strings.
 *
 * This function extracts the correct locale string.
 */
function normalizeProduct(product: any, lang: string): any {
  const pickLocale = (field: any): string => {
    if (typeof field === "string") return field;
    if (field && typeof field === "object") {
      return field[lang] || field["en"] || field["pl"] || "";
    }
    return "";
  };

  return {
    ...product,
    name: pickLocale(product.name),
    description: pickLocale(product.description),
    descriptionProductPage: pickLocale(product.descriptionProductPage),
    material: pickLocale(product.material),
    // phrases is an array of localized strings
    phrases: Array.isArray(product.phrases)
      ? product.phrases.map((p: any) => pickLocale(p))
      : product.phrases,
  };
}

export function FavoritesTab() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language || "en";
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { data: favorites, isLoading, refetch } = useGetUserFavoritesQuery();
  const [addFavorite] = useAddFavoriteMutation();
  const [removeFavorite] = useRemoveFavoriteMutation();

  if (isLoading) return <Spinner />;

  if (!favorites || favorites.length === 0) {
    return (
      <EmptyState
        icon={<Heart size={48} strokeWidth={1.5} />}
        title={t("userProfile.noFavorites", "No favorites yet")}
        actionText={t("userProfile.findFavorites", "Discover Products")}
        onAction={() => navigate("/products")}
      />
    );
  }

  // Normalize all products once
  const normalizedFavorites = favorites.map((p: any) => normalizeProduct(p, lang));

  const toggleFavorite = async (productId: string | number) => {
    try {
      if (favorites.find((p: any) => p.id === productId)) {
        await removeFavorite(productId).unwrap();
      } else {
        await addFavorite(productId).unwrap();
      }
      refetch();
    } catch (err) {
      console.error("Favorites error:", err);
    }
  };

  const handleAddToCart = (product: any) => {
    dispatch(addToCart(product));
  };

  const handleViewProduct = (product: any) => {
    navigate(`/product/${product.id}`);
    window.scrollTo(0, 0);
  };

  return (
    <div className="ft-grid">
      {normalizedFavorites.map((product: any) => (
        <ProductCard
          key={product.id}
          product={product}
          favorites={normalizedFavorites}
          toggleFavorite={toggleFavorite}
          handleAddToCart={handleAddToCart}
          handleViewProduct={handleViewProduct}
        />
      ))}
    </div>
  );
}