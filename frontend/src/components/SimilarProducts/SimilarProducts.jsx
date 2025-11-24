import React, { useState } from "react";
import { useGetAllProductsQuery } from "../../slices/productsApi";
import { 
  useGetUserFavoritesQuery, 
  useAddFavoriteMutation, 
  useRemoveFavoriteMutation 
} from "../../slices/userApi";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { logoutUser } from "../../slices/authSlice";
import { addToCart } from "../../slices/cartSlice";
import { PersonalizationModal } from "../PersonalizationModal/PersonalizationModal";
import { useTranslation } from "react-i18next";
import "./SimilarProducts.css";

const SimilarProducts = ({ ids = [], range = [], title }) => {
  const { i18n, t } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { token } = useSelector(state => state.auth);

  const { data: products = [], isLoading } = useGetAllProductsQuery(i18n.language);
  const { data: favorites = [], refetch } = useGetUserFavoritesQuery();
  const [addFavorite] = useAddFavoriteMutation();
  const [removeFavorite] = useRemoveFavoriteMutation();

  const [showModal, setShowModal] = useState(false);
  const [currentProduct, setCurrentProduct] = useState(null);

  if (isLoading) return <p>Loading...</p>;

  let filtered = [];
  if (ids.length > 0) filtered = products.filter(p => ids.includes(+p.id));
  if (range.length === 2) {
    const [min, max] = range;
    filtered = products.filter(p => +p.id >= min && +p.id <= max);
  }

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

  const handleViewProduct = (product) => {
    if (product.link) {
      navigate(product.link);
    }
  };

  const handleBuyNow = (product) => {
    if (+product.id <= 8) {
      setCurrentProduct(product);
      setShowModal(true);
    } else {
      dispatch(addToCart(product));
    }
  };

  const handleConfirmPersonalization = (personalizedData) => {
    const productWithPersonalization = { ...currentProduct, ...personalizedData };
    dispatch(addToCart(productWithPersonalization));
    setShowModal(false);
    navigate('/cart');
  };

  return (
    <section className="similar-products-section">
      {title && <h2 className="similar-title">{title}</h2>}

      <div className="similar-products-grid">
        {filtered.map(product => (
          <SimilarCard
            key={product.id}
            product={product}
            isFavorite={favorites?.some(f => f.id === product.id)}
            toggleFavorite={toggleFavorite}
            handleViewProduct={handleViewProduct}
            handleBuyNow={handleBuyNow}
            t={t}
            i18n={i18n}
          />
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
};


/* ============================================================
   КАРТОЧКА ПО АНАЛОГИИ С твоим Product Grid
   ============================================================ */
const SimilarCard = ({ product, isFavorite, toggleFavorite, handleViewProduct, handleBuyNow, i18n, t }) => {
  console.log("Product description: ", product.description)
  return (
    <div 
      className="similar-card" 
      onClick={() => handleViewProduct(product)}
    >
      <div className="similar-img-wrapper">
        <img
          src={product.image}
          alt={product.name[i18n.language] || product.name.en}
          className="similar-img"
        />

        <button
          className={`similar-fav-btn ${isFavorite ? "active" : ""}`}
          onClick={(e) => {
            e.stopPropagation();
            toggleFavorite(product.id);
          }}
        >
          ♥
        </button>
      </div>

      <div className="similar-content">
        <h3 className="similar-name">
          {product.name}
        </h3>
        <span className="similar-price">{product.price} PLN</span>
        <button 
          className="similar-buy-btn" 
          onClick={(e) => {
            e.stopPropagation();
            handleBuyNow(product);
          }}
        >
          {t("productGrid.actions.buyNow")}
        </button>
      </div>
    </div>
  );
};

export default SimilarProducts;
