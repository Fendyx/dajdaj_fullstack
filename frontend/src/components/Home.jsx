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
          <div className="background-quote">
            <p className="hero-text">
              Niepowtarzalny prezent dla ukochanej osoby i nie tylko! Bądź
              niezapomniany — podaruj kawałek swojego serca
            </p>
          </div>

          {/* ПЕРВЫЕ 4 ТОВАРА */}
          <div className="products">
            {data &&
              data.slice(0, 4).map((product) => (
                <div
                  key={product.id}
                  className="product"
                  onClick={(e) => handleCardClick(product.link, e)}
                >
                  <h3>{product.name}</h3>
                  <img src={product.image} alt={product.name} />
                  <div className="details">
                    <span>{product.desc}</span>
                    <span className="price">PLN{product.price}</span>
                  </div>
                  <div>
                    <Link
                      to={product.link}
                      className="learn-more"
                      onClick={(e) => e.stopPropagation()}
                    >
                      Pokaż 3D model
                    </Link>
                    <button onClick={(e) => openModal(product, e)}>
                      Dodaj do koszyka
                    </button>
                  </div>
                </div>
              ))}
            {selectedProduct && (
              <AddCustomName
                product={selectedProduct}
                onClose={closeModal}
                onConfirm={handleConfirm}
              />
            )}
          </div>

          {/* БАННЕР */}
          <WomenBanner onScrollToCollection={scrollToCollection} />

          {/* ОСТАЛЬНЫЕ ТОВАРЫ */}
          <div ref={middleProductsRef} className="products">
            {data &&
              data.slice(4, 7).map((product) => (
                <div
                  key={product.id}
                  className="product"
                  onClick={(e) => handleCardClick(product.link, e)}
                >
                  <h3>{product.name}</h3>
                  <img src={product.image} alt={product.name} />
                  <div className="details">
                    <span>{product.desc}</span>
                    <span className="price">PLN{product.price}</span>
                  </div>
                  <div>
                    <Link
                      to={product.link}
                      className="learn-more"
                      onClick={(e) => e.stopPropagation()}
                    >
                      Pokaż 3D model
                    </Link>
                    <button onClick={(e) => openModal(product, e)}>
                      Dodaj do koszyka
                    </button>
                  </div>
                </div>
              ))}
          </div>
          <div ref={specialOfferRef}>
            <SpecialOfferBanner onScrollToCollection={scrollToFinalCollection}/>
          </div>

          <div ref={finalProductsRef} className="products">
            {data &&
              data.slice(7).map((product) => (
                <div
                  key={product.id}
                  className="product"
                  onClick={(e) => handleCardClick(product.link, e)}
                >
                  <h3>{product.name}</h3>
                  <img src={product.image} alt={product.name} />
                  <div className="details">
                    <span>{product.desc}</span>
                    <span className="price">PLN{product.price}</span>
                  </div>
                  <div>
                    <Link
                      to={product.link}
                      className="learn-more"
                      onClick={(e) => e.stopPropagation()}
                    >
                      Pokaż 3D model
                    </Link>
                    <button onClick={(e) => openModal(product, e)}>
                      Dodaj do koszyka
                    </button>
                  </div>
                </div>
              ))}
          </div>

          {/* Модалка на случай если осталась открытой */}
          {selectedProduct && (
            <AddCustomName
              product={selectedProduct}
              onClose={closeModal}
              onConfirm={handleConfirm}
            />
          )}
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



