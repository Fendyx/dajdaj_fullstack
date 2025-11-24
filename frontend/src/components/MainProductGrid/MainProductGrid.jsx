import React, { useState } from 'react';
import { useGetAllProductsQuery } from '../../slices/productsApi';
import { 
  useGetUserFavoritesQuery, 
  useAddFavoriteMutation, 
  useRemoveFavoriteMutation 
} from '../../slices/userApi';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { addToCart } from '../../slices/cartSlice';
import { logoutUser } from '../../slices/authSlice';
import { PersonalizationModal } from '../PersonalizationModal/PersonalizationModal';
import { ProductCard } from '../ProductCard/ProductCard';
import { useTranslation } from 'react-i18next';
import './MainProductGrid.css';

const MainProductGrid = () => {
  const { t, i18n } = useTranslation();
  const [showModal, setShowModal] = useState(false);
  const [currentProduct, setCurrentProduct] = useState(null);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { token } = useSelector(state => state.auth);

  const { data: products = [], isLoading, error } = useGetAllProductsQuery(i18n.language);
  const { data: favorites = [], refetch } = useGetUserFavoritesQuery();
  const [addFavorite] = useAddFavoriteMutation();
  const [removeFavorite] = useRemoveFavoriteMutation();

  // Debug
  console.log('Все продукты:', products);

  // Категории по ID
  const categories = [
    { name: 'Figurines', items: products.filter(p => +p.id >= 1 && +p.id <= 8) },
    { name: 'EasyLife', items: products.filter(p => +p.id >= 9 && +p.id <= 12) },
    { name: 'Gifts', items: products.filter(p => +p.id >= 13 && +p.id <= 16) },
  ];

  const toggleFavorite = async (productId) => {
    if (!token) {
      navigate('/login');
      return;
    }

    try {
      if (favorites.find(p => p.id === productId)) {
        await removeFavorite(productId).unwrap();
      } else {
        await addFavorite(productId).unwrap();
      }
      refetch();
    } catch (err) {
      console.error("Ошибка избранного:", err);
      if (err?.originalStatus === 401 || err?.originalStatus === 400) {
        dispatch(logoutUser());
        navigate('/login');
      }
    }
  };

  const handleBuyNow = (product) => {
    // Персонализация для 1–8
    if (+product.id <= 8) {
      setCurrentProduct(product);
      setShowModal(true);
      return;
    }

    // Остальные — сразу в корзину
    dispatch(addToCart(product));
  };

  const handleViewProduct = (product) => {
    if (!product.link) return;
    navigate(product.link);
  };

  const handleConfirmPersonalization = (personalizedData) => {
    const productWithPersonalization = { ...currentProduct, ...personalizedData };
    dispatch(addToCart(productWithPersonalization));
    setShowModal(false);
    navigate('/cart');
  };

  if (isLoading) return <p>{t("productGrid.loading")}</p>;
  if (error) return <p>{t("productGrid.error", { message: error.message })}</p>;

  return (
    <div className="product-grid-container">
      {categories.map(category => (
        <section key={category.name} className="category-section">
          <div className="category-header">
            <h2 className="category-title">{category.name}</h2>
            <div className="category-divider" />
          </div>

          <div className="products-wrapper">
            {/* MOBILE SCROLL */}
            <div className="products-scroll-mobile">
              {category.items.map(product => (
                <div key={product.id} className="product-scroll-item">
                  <ProductCard
                    product={product}
                    favorites={favorites}
                    toggleFavorite={toggleFavorite}
                    handleBuyNow={handleBuyNow}
                    handleViewProduct={handleViewProduct}
                  />
                </div>
              ))}
            </div>

            {/* DESKTOP GRID */}
            <div className="products-grid-desktop">
              {category.items.map(product => (
                <ProductCard
                  key={product.id}
                  product={product}
                  favorites={favorites}
                  toggleFavorite={toggleFavorite}
                  handleBuyNow={handleBuyNow}
                  handleViewProduct={handleViewProduct}
                />
              ))}
            </div>
          </div>
        </section>
      ))}

      {showModal && currentProduct && (
        <PersonalizationModal
          product={currentProduct}
          onClose={() => setShowModal(false)}
          onConfirm={handleConfirmPersonalization}
        />
      )}
    </div>
  );
};

export default MainProductGrid;
