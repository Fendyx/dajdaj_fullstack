import { useContext, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";

import { addToCart } from "../slices/cartSlice";
import { useGetAllProductsQuery } from "../slices/productsApi";

import AddCustomName from "./AddCustomName/AddCustomName";
import WomenBanner from "./WomenBanner/WomenBanner";
import SpecialOffer from "./SpecialOffer/SpecialOffer";
import SpecialOfferBanner from "./SpecialOffer/SpecialOfferBanner";
import { ScrollContext } from "./ScrollContext";

import "react-toastify/dist/ReactToastify.css";
import { HeroSection } from "./HeroSection/HeroSection";
import { ProductGrid } from "./ProductGrid/ProductGrid";




const Home = () => {
  const { items: products, status } = useSelector((state) => state.products);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { data, error, isLoading } = useGetAllProductsQuery();

  const [selectedProduct, setSelectedProduct] = useState(null);

  const openModal = (product, e) => {
    e.stopPropagation();
    setSelectedProduct(product);
  };

  const closeModal = () => {
    setSelectedProduct(null);
  };

  const handleConfirm = (productWithCustomText) => {
    dispatch(addToCart(productWithCustomText)); // только одно уведомление будет из Redux
    closeModal();
    navigate("/cart"); // редирект
  };
  

  const handleCardClick = (link, e) => {
    if (e.target.closest("button") || e.target.closest("a")) return;
    navigate(link);
  };

  const { specialOfferRef } = useContext(ScrollContext);

  const middleProductsRef = useRef(null);
  const scrollToCollection = () => {
    if (middleProductsRef.current) {
      middleProductsRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  const finalProductsRef = useRef(null);
  const scrollToFinalCollection = () => {
    if (finalProductsRef.current) {
      finalProductsRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };
  
  
  
  return (
    <div className="home-container">
      <SpecialOffer />
      {status === "success" ? (
        <>
          <HeroSection />
          <ProductGrid />
          
        </>
      ) : status === "pending" ? (
        <p>Loading...</p>
      ) : (
        <p>Unexpected error occurred...</p>
      )}
    </div>
  );
};

export default Home;



