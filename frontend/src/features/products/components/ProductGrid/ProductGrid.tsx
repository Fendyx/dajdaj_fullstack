import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useGetAllProductsQuery } from "@/services/productsApi";
import { useGetCategoriesQuery } from "@/services/categoriesApi";
import { useGetUserFavoritesQuery, useAddFavoriteMutation, useRemoveFavoriteMutation } from "@/services/userApi";
import { useProductActions } from "@/hooks/useProductActions";
import { HeroPersonalFigurine } from "@/features/products/components/HeroPersonalFigurine/HeroPersonalFigurine";
import { CategorySection } from "@/features/products/components/CategorySection/CategorySection";
import { PersonalizationModal } from "@/features/products/components/PersonalizationModal/PersonalizationModal";
import { Spinner } from "@/components/ui/Spinner/Spinner";
import "./ProductGrid.css";

export function ProductGrid() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  const { data: products = [], isLoading: productsLoading, error: productsError } =
    useGetAllProductsQuery(i18n.language);

  // Category configs come from the DB — layout, columns, showCount are all controlled there
  const { data: categoryConfigs = [], isLoading: catsLoading } = useGetCategoriesQuery();

  const { data: favorites = [], refetch } = useGetUserFavoritesQuery();
  const [addFavorite] = useAddFavoriteMutation();
  const [removeFavorite] = useRemoveFavoriteMutation();

  const { selectedProduct, isModalOpen, setIsModalOpen, handleAddToCart, confirmPersonalization } =
    useProductActions();

  const toggleFavorite = async (slug: string) => {
    try {
      if (favorites.find((p: any) => p.slug === slug)) {
        await removeFavorite(slug).unwrap();
      } else {
        await addFavorite(slug).unwrap();
      }
      refetch();
    } catch (err) {
      console.error(err);
    }
  };

  const isLoading = productsLoading || catsLoading;

  if (isLoading) return <Spinner text={t("productGrid.loading")} />;
  if (productsError) return <p className="pr-gr-error-text">{t("productGrid.error")}</p>;

  const heroProduct = products.find((p: any) => p.slug === "personal-figurine");

  return (
    <div className="pr-gr-container">
      {heroProduct && (
        <HeroPersonalFigurine
          heroProduct={heroProduct}
          handleHeroClick={() => navigate(`/products/${heroProduct.slug}`)}
        />
      )}

      <div className="pr-gr-categories-wrapper">
        {categoryConfigs.map((cat) => (
          <CategorySection
            key={cat.slug}
            title={cat.name[i18n.language as "en" | "pl"] ?? cat.name.en}
            products={products.filter((p: any) => p.category === cat.slug)}
            layout={cat.layout}
            columns={cat.columns}
            showCount={cat.showCount}
            mobileColumns={cat.mobileColumns ?? 2}  // NEW
            favorites={favorites}
            onAddToCart={handleAddToCart}
            onToggleFavorite={toggleFavorite}
          />
        ))}
      </div>

      {isModalOpen && selectedProduct && (
        <PersonalizationModal
          product={selectedProduct}
          onClose={() => setIsModalOpen(false)}
          onConfirm={confirmPersonalization}
        />
      )}
    </div>
  );
}