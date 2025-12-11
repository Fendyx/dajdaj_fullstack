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

  const heroProduct = products.find(p => +p.id === 17);

  const categories = [
    { name: 'Figurines', items: products.filter(p => +p.id >= 1 && +p.id <= 8) },
    { name: 'Interior maps', items: products.filter(p => +p.id >= 18 && +p.id <= 21) },
    { name: 'EasyLife', items: products.filter(p => +p.id >= 9 && +p.id <= 12) },
    { name: 'Gifts', items: products.filter(p => +p.id >= 13 && +p.id <= 16) },
  ];

  const toggleFavorite = async (productId) => {
    if (!token) { navigate('/login'); return; }
    try {
      if (favorites.find(p => p.id === productId)) { await removeFavorite(productId).unwrap(); } 
      else { await addFavorite(productId).unwrap(); }
      refetch();
    } catch (err) {
      if (err?.originalStatus === 401 || err?.originalStatus === 400) {
        dispatch(logoutUser());
        navigate('/login');
      }
    }
  };

  // Renamed function to match logic, though internal name doesn't matter as much as the prop
  const handleAddToCart = (product) => {
    // If products 1-8 — open modal
    if (+product.id <= 8) {
      setCurrentProduct(product);
      setShowModal(true);
      return;
    }
    // For others — add to cart immediately (Child component handles visual feedback)
    dispatch(addToCart(product));
  };

  const handleHeroClick = () => {
    navigate('/products/personal-figurine');
  };

  const handleViewProduct = (product) => {
    const productId = +product.id;
  
    // Если продукт — постер (18–21), открываем Posters.js
    if (productId >= 18 && productId <= 21) {
      navigate(`/posters/${product.slug}`);
      return;
    }
  
    // Все остальные — обычная страница продукта
    navigate(`${product.link}`);
  };
  

  const handleConfirmPersonalization = (personalizedData) => {
    const productWithPersonalization = { ...currentProduct, ...personalizedData };
    dispatch(addToCart(productWithPersonalization));
    setShowModal(false);
    
    // ❌ DELETED: navigate('/cart');
    // The user now stays on the page. 
    // Optional: Add a global toast notification here if you want feedback for modal items.
  };

  if (isLoading) return <p>{t("productGrid.loading")}</p>;
  if (error) return <p>{t("productGrid.error", { message: error.message })}</p>;

  return (
    <div className="product-grid-container">
      
      {/* === HERO BLOCK (ID 17) === */}
      {heroProduct && (
        <section className="hero-product-section" onClick={handleHeroClick}>
          <div className="hero-card">
            <div className="hero-content">
              <div className="hero-tags">
                <span className="hero-badge highlight">HIT</span>
                <span className="hero-badge">Custom 3D</span>
              </div>
              <h2 className="hero-title">
                Your exact copy <br/>
                <span>from a photo</span>
              </h2>
              <p className="hero-description">
                A unique handmade figurine. Upload your photo and we will create a personalized 3D model just for you.
              </p>
              <div className="hero-action-row">
                <div className="hero-price-container">
                  <span className="hero-label">Price</span>
                  <span className="hero-price">
                    {heroProduct.price} {heroProduct.currency || 'pln'}
                  </span>
                </div>
                <div className="hero-cta">
                  Create a figurine
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </div>
            </div>
            <div className="hero-image-wrapper">
              <div className="hero-circle"></div>
              <img 
                src={heroProduct.image || heroProduct.img} 
                alt={heroProduct.name} 
                className="hero-image" 
              />
            </div>
          </div>
        </section>
      )}

      {/* === CATEGORIES === */}
      {categories.map(category => (
        category.items.length > 0 && (
          <section key={category.name} className="category-section">
            <div className="category-header">
              <h2 className="category-title">{category.name}</h2>
              <div className="category-divider" />
            </div>

            <div className="products-wrapper">
              <div className="products-grid">
                {category.items.map(product => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    favorites={favorites}
                    toggleFavorite={toggleFavorite}
                    
                    // ✅ FIXED: Passed the correct prop name
                    handleAddToCart={handleAddToCart}
                    
                    handleViewProduct={handleViewProduct}
                  />
                ))}
              </div>
            </div>
          </section>
        )
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