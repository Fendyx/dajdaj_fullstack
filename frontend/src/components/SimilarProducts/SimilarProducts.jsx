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

import { ProductCard } from "../ProductCard/ProductCard"; 

const SimilarProducts = ({ ids = [], range = [], title }) => {
  const { i18n } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { token } = useSelector(state => state.auth);

  const { data: products = [], isLoading } = useGetAllProductsQuery(i18n.language);
  const { data: favorites = [], refetch } = useGetUserFavoritesQuery();
  const [addFavorite] = useAddFavoriteMutation();
  const [removeFavorite] = useRemoveFavoriteMutation();

  const [showModal, setShowModal] = useState(false);
  const [currentProduct, setCurrentProduct] = useState(null);

  if (isLoading) return <div className="loading-state">Loading...</div>;

  // Логика фильтрации
  let filtered = [];
  if (ids.length > 0) filtered = products.filter(p => ids.includes(+p.id));
  if (range.length === 2) {
    const [min, max] = range;
    filtered = products.filter(p => +p.id >= min && +p.id <= max);
  }

  // Логика лайка (такая же, передадим её пропсом)
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
    // Скролл наверх при переходе, хорошая практика для SPA
    window.scrollTo(0, 0); 
    if (product.link) {
      navigate(product.link);
    } else {
       // fallback если ссылки нет
       navigate(`/product/${product.id}`);
    }
  };

  // Адаптер: ProductCard вызывает handleAddToCart, 
  // а мы внутри решаем - нужна модалка или сразу в корзину
  const handleAddToCartAdapter = (product) => {
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
    // Опционально: можно не редиректить в корзину сразу, чтобы клиент продолжил покупки
    // navigate('/cart'); 
  };

  // Если товаров нет, ничего не рендерим
  if (filtered.length === 0) return null;

  return (
    <section className="similar-products-section">
      {title && <h2 className="similar-title">{title}</h2>}

      <div className="similar-products-grid">
        {filtered.map(product => (
          <div key={product.id} className="similar-card-wrapper">
             {/* Рендерим тот же компонент, что и в основном каталоге */}
             <ProductCard
                product={product}
                favorites={favorites}
                toggleFavorite={toggleFavorite}
                handleAddToCart={handleAddToCartAdapter}
                handleViewProduct={handleViewProduct}
             />
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
};

export default SimilarProducts;