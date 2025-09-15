import { useState, useRef, useContext } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";

import { addToCart } from "../slices/cartSlice";
import { useGetAllProductsQuery } from "../slices/productsApi";

import AddCustomName from "./AddCustomName/AddCustomName";
import { ScrollContext } from "./ScrollContext";

import "react-toastify/dist/ReactToastify.css";
import { HeroSection } from "./HeroSection/HeroSection";
import { ProductGrid } from "./ProductGrid/ProductGrid";

const Home = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { data: products, error, isLoading } = useGetAllProductsQuery();

  const [selectedProduct, setSelectedProduct] = useState(null);

  const openModal = (product, e) => {
    e.stopPropagation();
    setSelectedProduct(product);
  };

  const closeModal = () => {
    setSelectedProduct(null);
  };

  const handleConfirm = (productWithCustomText) => {
    dispatch(addToCart(productWithCustomText));
    closeModal();
    navigate("/cart");
  };

  const handleCardClick = (link, e) => {
    if (e.target.closest("button") || e.target.closest("a")) return;
    navigate(link);
  };

  const { specialOfferRef } = useContext(ScrollContext);

  const middleProductsRef = useRef(null);
  const scrollToCollection = () => {
    middleProductsRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const finalProductsRef = useRef(null);
  const scrollToFinalCollection = () => {
    finalProductsRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="home-container">
      {isLoading ? (
        <p>Loading...</p>
      ) : error ? (
        <p>Unexpected error occurred...</p>
      ) : (
        <>
          <HeroSection />
          <ProductGrid
            products={products}
            onCardClick={handleCardClick}
            openModal={openModal}
          />
          {/* Модальные компоненты и баннеры можно добавить здесь */}
        </>
      )}

      {/* Пример модального окна */}
      {selectedProduct && (
        <AddCustomName
          product={selectedProduct}
          onClose={closeModal}
          onConfirm={handleConfirm}
        />
      )}
    </div>
  );
};

export default Home;
