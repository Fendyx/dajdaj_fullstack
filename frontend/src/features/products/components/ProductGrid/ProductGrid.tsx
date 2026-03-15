import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useGetAllProductsQuery } from '@/services/productsApi';
import { useGetUserFavoritesQuery, useAddFavoriteMutation, useRemoveFavoriteMutation } from '@/services/userApi';
import { useProductActions } from '@/hooks/useProductActions';
import { HeroPersonalFigurine } from '@/features/products/components/HeroPersonalFigurine/HeroPersonalFigurine';
import { CategorySection } from '@/features/products/components/CategorySection/CategorySection';
import { PersonalizationModal } from '@/features/products/components/PersonalizationModal/PersonalizationModal';
import { Spinner } from '@/components/ui/Spinner/Spinner';
import './ProductGrid.css';

export function ProductGrid() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  const { data: products = [], isLoading, error } = useGetAllProductsQuery(i18n.language);
  const { data: favorites = [], refetch } = useGetUserFavoritesQuery();
  const [addFavorite] = useAddFavoriteMutation();
  const [removeFavorite] = useRemoveFavoriteMutation();

  const { selectedProduct, isModalOpen, setIsModalOpen, handleAddToCart, confirmPersonalization } = useProductActions();

  // Фильтруем по category (задаётся в БД)
  const heroProduct = products.find((p: any) => p.slug === 'personal-figurine');

  const categories = [
    { name: 'Figurines',     items: products.filter((p: any) => p.category === 'figurines') },
    { name: 'Interior maps', items: products.filter((p: any) => p.category === 'maps') },
    { name: 'Puzzles',       items: products.filter((p: any) => p.category === 'puzzles') },
    { name: 'Gifts',         items: products.filter((p: any) => p.category === 'gifts') },
  ];

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

  if (isLoading) return <Spinner text={t("productGrid.loading")} />;
  if (error) return <p className="pr-gr-error-text">{t("productGrid.error")}</p>;

  return (
    <div className="pr-gr-container">

      {heroProduct && (
        <HeroPersonalFigurine
          heroProduct={heroProduct}
          handleHeroClick={() => navigate(`/products/${heroProduct.slug}`)}
        />
      )}

      <div className="pr-gr-categories-wrapper">
        {categories.map(category => (
          <CategorySection
            key={category.name}
            title={category.name}
            products={category.items}
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