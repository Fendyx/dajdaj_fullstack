import React, { useState } from 'react';
import { useGetAllProductsQuery } from '../../slices/productsApi';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { addToCart } from '../../slices/cartSlice';
import "./ProductGrid.css";
import { PersonalizationModal } from '../PersonalizationModal/PersonalizationModal';

export function ProductGrid() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [favorites, setFavorites] = useState(new Set());
  const [showModal, setShowModal] = useState(false);
  const [currentProduct, setCurrentProduct] = useState(null);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { data: products = [], isLoading, error } = useGetAllProductsQuery();

  const filteredProducts = selectedCategory === 'all'
    ? products
    : products.filter(p => p.category === selectedCategory);

  const toggleFavorite = (productId) => {
    const newFavorites = new Set(favorites);
    if (newFavorites.has(productId)) {
      newFavorites.delete(productId);
    } else {
      newFavorites.add(productId);
    }
    setFavorites(newFavorites);
  };

  const handleBuyNow = (product) => {
    setCurrentProduct(product);
    setShowModal(true);
  };

  const handleView3D = (productId) => {
    window.open(`/product/${productId}`, '_blank');
  };

  const handleConfirmPersonalization = (personalizedData) => {
    const productWithPersonalization = {
      ...currentProduct,
      ...personalizedData, // name, message, и т.д.
    };
    dispatch(addToCart(productWithPersonalization));
    setShowModal(false);
    navigate("/cart");
  };

  if (isLoading) return <p>Loading products...</p>;
  if (error) return <p>Error loading products: {error.message}</p>;

  return (
    <section className="product-grid">
      <div className="section-header">
        <h2>Choose Their Perfect Figurine</h2>
        <p>
          Each pre-designed figurine captures a different spirit of strength.
          Pick the one that reminds you of them, then make it personal with their name and your message.
        </p>
      </div>

      <div className="category-filter">
        <button 
          onClick={() => setSelectedCategory('all')} 
          className={`category-btn ${selectedCategory === 'all' ? 'active' : ''}`}
        >
          All Figurines
        </button>
        <button 
          onClick={() => setSelectedCategory('male')} 
          className={`category-btn ${selectedCategory === 'male' ? 'active' : ''}`}
        >
          For Him
        </button>
        <button 
          onClick={() => setSelectedCategory('female')} 
          className={`category-btn ${selectedCategory === 'female' ? 'active' : ''}`}
        >
          For Her
        </button>
      </div>

      <div className="products-grid">
        {filteredProducts.map((product) => (
          <div key={product.id} className="product-card">
            <div className="product-image">
              <img src={product.image} alt={product.name} />
              <div className="badges">
                {product.isNew && <span className="badge new">New</span>}
                {product.isPopular && <span className="badge popular">Popular</span>}
              </div>
              <button
                className={`favorite ${favorites.has(product.id) ? 'favorited' : ''}`}
                onClick={(e) => {
                  e.stopPropagation();
                  toggleFavorite(product.id);
                }}
              >
                ♥
              </button>
              <div className="actions">
                <button onClick={() => handleBuyNow(product)} className="buy-now">
                  Buy now
                </button>
                <button onClick={() => handleView3D(product.id)} className="view3d">
                  👁
                </button>
              </div>
            </div>
            <div className="product-info">
              <h3>{product.name}</h3>
              <p>{product.description}</p>
              <div className="product-footer">
                <span className="price">${product.price}</span>
                <span className={`tag ${product.category}`}>
                  {product.category === 'female' ? '💗 For Her' : '💪 For Him'}
                </span>
              </div>
              <div className="engraving">
                🎁 Pre-designed • Name & message engraving included
              </div>
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
