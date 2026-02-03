import React, { useState } from "react";
import "./ProductDetails.css";
import { useDispatch, useSelector } from "react-redux";
import { addToCart } from "../slices/cartSlice";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate } from "react-router-dom";
import { useGetAllProductsQuery } from "../slices/productsApi";
import { PersonalizationModal } from "../components/PersonalizationModal/PersonalizationModal";

import { 
  FaShoppingCart, FaStar, FaCube, FaChevronDown, FaImage, FaBolt,
  FaCheck, FaShippingFast, FaShieldAlt, FaLock 
} from "react-icons/fa";

export function ProductDetails({ show3D, on3DToggle }) {
  const { t, i18n } = useTranslation();
  const dispatch = useDispatch();
  const location = useLocation();
  const navigate = useNavigate();
  const auth = useSelector((state) => state.auth);

  const { data: products = [], isLoading } = useGetAllProductsQuery(i18n.language);
  const slug = location.pathname.split("/products/")[1];
  const product = !isLoading ? products.find((p) => p.link?.endsWith(slug)) : null;

  const [showModal, setShowModal] = useState(false);
  const [openAccordion, setOpenAccordion] = useState("about");

  const calculateRating = () => {
    if (!product?.reviews || product.reviews.length === 0) return 5;
    const total = product.reviews.reduce((acc, review) => acc + review.rating, 0);
    return (total / product.reviews.length).toFixed(1);
  };
  const rating = calculateRating();
  const reviewCount = product?.reviews?.length || 0;

  if (isLoading) return <div className="prod-loading"><FaCube className="animate-spin"/></div>;
  if (!product) return <div className="prod-not-found">Product not found</div>;

  const handleAddToCartClick = () => setShowModal(true);
  
  const handleConfirmPersonalization = (personalizedData) => {
    dispatch(addToCart({ ...product, ...personalizedData }));
    setShowModal(false);
  };

  const handlePayNow = () => {
    const buyNowItem = { ...product, id: product._id || product.id, qty: 1 };
    if (!auth._id) { navigate(`/login?redirect=${location.pathname}`); return; }
    if ((auth.deliveryDatas || []).length === 0) {
      navigate("/shipping-info", { state: { fromPayNow: true, productToBuy: buyNowItem } });
      return;
    }
    navigate("/checkout-stripe", { state: { buyNowItem: buyNowItem } });
  };

  const toggleAccordion = (value) => setOpenAccordion(openAccordion === value ? null : value);

  return (
    <div className="prod-page">
      <div className="prod-container">
        
        <div className="prod-info-column">
          
          {/* 1. HEADER & RATING */}
          <div className="prod-header-minimal">
            <div className="prod-meta-row">
               <span className="prod-badge-new">New Arrival</span>
               <div className="prod-rating-mini">
                 <FaStar className="star-icon" /> 
                 <span>{rating}</span> 
                 <span className="review-count">({reviewCount} reviews)</span>
               </div>
            </div>
            <h1 className="prod-title-main">{product.name || "Unnamed Product"}</h1>
          </div>

          {/* 2. PRICE (Сразу под заголовком) */}
          <div className="prod-price-row">
             <span className="prod-current-price">{product.price} PLN</span>
             <div className="prod-availability">
                <div className="pulsing-dot"></div>
                In Stock
             </div>
          </div>

          {/* 3. КНОПКИ (STICKY - КАК В СТАРОМ КОДЕ) */}
          {/* Мы применяем тут класс prod-cta-group, который в CSS будет sticky */}
          <div className="prod-cta-group">
            <button className="btn-primary-buy" onClick={handlePayNow}>
              <span>Buy Now</span>
              <FaBolt className="btn-icon-right" />
            </button>
            <button className="btn-secondary-cart" onClick={handleAddToCartClick}>
              <FaShoppingCart />
              <span>Add to Cart</span>
            </button>
          </div>

          {/* 4. MICRO TRUST TEXT */}
          <div className="prod-micro-benefits">
             <div className="benefit-pill"><FaShippingFast /> 2-3 Days Delivery</div>
             <div className="benefit-pill"><FaCheck /> Free Returns</div>
             <div className="benefit-pill"><FaShieldAlt /> 2 Year Warranty</div>
          </div>

          <hr className="prod-divider" />

          {/* 5. DESCRIPTION & 3D */}
          <div className="prod-description-block">
             <p className="prod-desc-text">
               {product.descriptionProductPage || "Experience premium quality tailored for your needs."}
             </p>
             
             <button className="btn-3d-toggle" onClick={on3DToggle}>
                {show3D ? <FaImage /> : <FaCube />}
                <span>{show3D ? "Show Standard Photos" : "View in 3D Space"}</span>
             </button>
          </div>

          {/* 6. ACCORDIONS */}
          <div className="prod-specs-accordion">
            <div className={`accordion-item ${openAccordion === "about" ? "active" : ""}`}>
              <button className="accordion-head" onClick={() => toggleAccordion("about")}>
                <span>Product Specifications</span>
                <FaChevronDown className="accordion-arrow" />
              </button>
              <div className="accordion-body">
                 <div className="spec-row">
                    <span className="spec-label">Material</span>
                    <span className="spec-val">{product.material || "Eco-friendly Composite"}</span>
                 </div>
                 <div className="spec-row">
                    <span className="spec-label">Warranty</span>
                    <span className="spec-val">Premium 12 Months</span>
                 </div>
              </div>
            </div>

            <div className={`accordion-item ${openAccordion === "reviews" ? "active" : ""}`} id="reviews-section">
              <button className="accordion-head" onClick={() => toggleAccordion("reviews")}>
                <span>Reviews ({reviewCount})</span>
                <FaChevronDown className="accordion-arrow" />
              </button>
              <div className="accordion-body">
                {product.reviews?.length ? (
                  product.reviews.map((r, i) => (
                    <div key={i} className="review-card">
                      <div className="review-top">
                        <span className="review-user">{r.username || "Guest"}</span>
                        <div className="review-stars">
                          {[...Array(5)].map((_, idx) => (
                             <FaStar key={idx} className={idx < r.rating ? "star-fill" : "star-empty"} />
                          ))}
                        </div>
                      </div>
                      <p className="review-text">{r.comment}</p>
                    </div>
                  ))
                ) : (
                  <p className="no-reviews">No reviews yet.</p>
                )}
              </div>
            </div>
          </div>

          <div className="prod-footer-secure">
             <FaLock /> Secure checkout powered by Stripe & PayPal
          </div>

        </div>
      </div>

      {showModal && (
        <PersonalizationModal
          product={product}
          onClose={() => setShowModal(false)}
          onConfirm={handleConfirmPersonalization}
        />
      )}
    </div>
  );
}