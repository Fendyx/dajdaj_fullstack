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
import "./ProductGrid.css";
import { PersonalizationModal } from '../PersonalizationModal/PersonalizationModal';
import { useTranslation } from 'react-i18next';

export function ProductGrid() {
  const { t, i18n } = useTranslation();

  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [currentProduct, setCurrentProduct] = useState(null);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { token } = useSelector((state) => state.auth);

  // ✅ Передаем язык в API-запрос
  const { data: products = [], isLoading, error } = useGetAllProductsQuery(i18n.language);
  const { data: favorites = [], refetch } = useGetUserFavoritesQuery();
  const [addFavorite] = useAddFavoriteMutation();
  const [removeFavorite] = useRemoveFavoriteMutation();

  const filteredProducts = selectedCategory === 'all'
    ? products
    : products.filter(p => p.category === selectedCategory);

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
    setCurrentProduct(product);
    setShowModal(true);
  };
  

  const handleViewProduct = (product) => {
    try {
      if (!product.link) {
        console.error("Product link is missing!", product);
        return;
      }
  
      console.log("Navigating to product link:", product.link);
  
      // Используем navigate
      navigate(product.link);
    } catch (err) {
      console.error("Error during navigation:", err);
    }
  };
  

  const handleConfirmPersonalization = (personalizedData) => {
    const productWithPersonalization = {
      ...currentProduct,
      ...personalizedData,
    };
    dispatch(addToCart(productWithPersonalization));
    setShowModal(false);
    navigate("/cart");
  };

  if (isLoading) return <p>{t("productGrid.loading")}</p>;
  if (error) return <p>{t("productGrid.error", { message: error.message })}</p>;

  return (
    <section className="product-grid">
      <div className="section-header">
        <h2>{t("productGrid.headerTitle")}</h2>
        <p>{t("productGrid.headerDescription")}</p>
      </div>

      <div className="category-filter">
        <button 
          onClick={() => setSelectedCategory('all')} 
          className={`category-btn ${selectedCategory === 'all' ? 'active' : ''}`}
        >
          {t("productGrid.categories.all")}
        </button>
        <button 
          onClick={() => setSelectedCategory('male')} 
          className={`category-btn ${selectedCategory === 'male' ? 'active' : ''}`}
        >
          {t("productGrid.categories.male")}
        </button>
        <button 
          onClick={() => setSelectedCategory('female')} 
          className={`category-btn ${selectedCategory === 'female' ? 'active' : ''}`}
        >
          {t("productGrid.categories.female")}
        </button>
      </div>

      <div className="products-grid">
        {filteredProducts.map((product) => (
          <div key={product.id} className="product-card">
            <div className="product-image">
            <img 
              src={product.image} 
              alt={product.name} 
              onClick={() => handleViewProduct(product)} 
              style={{ cursor: "pointer" }}
            />
            <div className="badges">
              {product.isNew && <span className="badge new">{t("productGrid.badges.new")}</span>}
              {product.isPopular && <span className="badge popular">{t("productGrid.badges.popular")}</span>}
            </div>
            <button
              className={`favorite ${favorites.find(p => p.id === product.id) ? 'favorited' : ''}`}
              onClick={(e) => {
                e.stopPropagation(); // чтобы "♥" не открывал карточку
                toggleFavorite(product.id);
              }}
            >
              ♥
            </button>
            <div className="actions">
              <button onClick={() => handleBuyNow(product)} className="buy-now">
                {t("productGrid.actions.buyNow")}
              </button>
              <button
                type="button"
                onClick={() => handleViewProduct(product)}
                className="view3d"
              >
                👁
              </button>
            </div>
          </div>
            <div className="product-info">
              <h3>{product.name}</h3>
              <p>{product.description}</p>
              <div className="product-footer">
                <span className="price">{product.price}pln</span>
                <span className={`tag ${product.category}`}>
                  {product.category === 'female' ? `💗 ${t("productGrid.tags.female")}` : `💪 ${t("productGrid.tags.male")}`}
                </span>
              </div>
              {/* <div className="engraving">
                {t("productGrid.engraving")}
              </div> */}
            </div>
          </div>
        ))}
      </div>

      {showModal && currentProduct && (
        <PersonalizationModal
          product={currentProduct}
          onClose={() => setShowModal(false)}
          onConfirm={handleConfirmPersonalization}
        />
      )}
    </section>
  );
}
