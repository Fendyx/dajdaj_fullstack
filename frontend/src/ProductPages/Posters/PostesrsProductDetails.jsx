import React, { useState } from "react";
import "../ProductDetails.css";
import { useDispatch, useSelector } from "react-redux";
import { addToCart } from "../../slices/cartSlice";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import { useGetAllProductsQuery } from "../../slices/productsApi";
import {
  FaShoppingCart,
  FaStar,
  FaCube,
  FaChevronDown,
  FaImage,
  FaCreditCard
} from "react-icons/fa";

export function PostersProductDetails({ product: externalProduct, show3D, on3DToggle }) {
  const { t, i18n } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const auth = useSelector((state) => state.auth);

  // Берём slug из URL
  const { slug } = useParams();

  // Загружаем продукты по языку
  const { data: products = [], isLoading } = useGetAllProductsQuery(i18n.language);

  // Если продукт передан через проп — используем его
  // Если нет — ищем по slug
  const product = externalProduct || products.find((p) => p.slug === slug);

  const [openAccordion, setOpenAccordion] = useState(null);

  if (isLoading) {
    return (
      <div className="prod-loading">
        <FaCube className="prod-loading-icon" />
        <p>{t("productDetails.loadingProduct", "Загрузка продукта...")}</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="prod-not-found">
        <p>{t("productDetails.notFound", "Продукт не найден")}</p>
      </div>
    );
  }

  const handleAddToCart = () => {
    dispatch(
      addToCart({
        ...product,
        id: product._id || product.id,
        qty: 1,
      })
    );
  };

  const handlePayNow = () => {
    // ВАЖНО: Используем cartQuantity: 1, чтобы структура совпадала с элементами в Redux корзине
    const buyNowItem = {
      ...product,
      id: product._id || product.id,
      cartQuantity: 1, // Было qty: 1, меняем на cartQuantity
    };

    if (!auth._id) {
      // Передаем state даже при редиректе на логин, чтобы не потерять товар
      navigate(`/login?redirect=/posters/${slug}`, { state: { buyNowItem } }); 
      return;
    }

    const deliveryList = auth.deliveryDatas || [];
    if (deliveryList.length === 0) {
      navigate("/shipping-info", {
        state: {
          fromPayNow: true,
          productToBuy: buyNowItem, // Передаем дальше
        },
      });
      return;
    }

    // Переход на оплату с передачей объекта в state
    navigate("/checkout-stripe", { state: { buyNowItem } });
  };

  const toggleAccordion = (value) =>
    setOpenAccordion(openAccordion === value ? null : value);

  return (
    <div className="prod-page">
      <div className="prod-container">
        <div className="prod-info">

          {/* Заголовок */}
          <div className="prod-header">
            <h1 className="prod-title">{product.name}</h1>
            <p className="prod-description">{product.descriptionProductPage}</p>
          </div>

          {/* Цена */}
          {product.price && <div className="prod-price">{product.price} PLN</div>}

          {/* Переключатель 3D */}
          <button className="three-d-button" onClick={on3DToggle}>
            {show3D ? (
              <>
                <FaImage className="three-d-icon" />
                <span>{t("productDetails.showPhotos")}</span>
              </>
            ) : (
              <>
                <FaCube className="three-d-icon" />
                <span>{t("productDetails.view3D")}</span>
              </>
            )}
          </button>

          {/* Add / Buy now */}
          <div className="prod-actions-sticky">
            <button className="prod-add-btn" onClick={handleAddToCart}>
              <FaShoppingCart className="prod-cart-icon" />
              <span>{t("productDetails.addToCart")}</span>
            </button>

            <button className="prod-buy-now-btn" onClick={handlePayNow}>
              <FaCreditCard className="prod-cart-icon" />
              <span>{t("productDetails.payNow")}</span>
            </button>
          </div>

          {/* Аккордеоны */}
          <div className="prod-accordion">

            {/* ABOUT */}
            <div className="prod-accordion-item">
              <button
                className="prod-accordion-trigger"
                onClick={() => toggleAccordion("about")}
              >
                <span>{t("productDetails.about")}</span>
                <FaChevronDown
                  className={`prod-accordion-icon ${
                    openAccordion === "about" ? "prod-accordion-icon-open" : ""
                  }`}
                />
              </button>

              <div
                className={`prod-accordion-content ${
                  openAccordion === "about" ? "prod-accordion-content-open" : ""
                }`}
              >
                <div className="prod-accordion-inner">
                  <div className="prod-row">
                    <span>{t("productDetails.material")}:</span>
                    <span className="prod-row-value">{product.material}</span>
                  </div>

                  <div className="prod-row">
                    <span>{t("productDetails.delivery")}:</span>
                    <span className="prod-row-value">2–3 дня</span>
                  </div>

                  <div className="prod-row prod-row-last">
                    <span>{t("productDetails.warranty")}:</span>
                    <span className="prod-row-value">12 месяцев</span>
                  </div>
                </div>
              </div>
            </div>

            {/* REVIEWS */}
            <div className="prod-accordion-item">
              <button
                className="prod-accordion-trigger"
                onClick={() => toggleAccordion("reviews")}
              >
                <span>
                  {t("productDetails.reviews")} ({product.reviews?.length || 0})
                </span>
                <FaChevronDown
                  className={`prod-accordion-icon ${
                    openAccordion === "reviews" ? "prod-accordion-icon-open" : ""
                  }`}
                />
              </button>

              <div
                className={`prod-accordion-content ${
                  openAccordion === "reviews" ? "prod-accordion-content-open" : ""
                }`}
              >
                <div className="prod-accordion-inner">
                  {product.reviews?.length ? (
                    product.reviews.map((review, idx) => (
                      <div
                        key={idx}
                        className={`prod-review ${
                          idx === product.reviews.length - 1
                            ? "prod-review-last"
                            : ""
                        }`}
                      >
                        <div className="prod-review-header">
                          <div>
                            <p className="prod-username">{review.username}</p>
                            <p className="prod-date">
                              Registered: {review.registeredDate}
                            </p>
                          </div>

                          <div className="prod-stars">
                            {[...Array(5)].map((_, i) => (
                              <FaStar
                                key={i}
                                className={`prod-star ${
                                  i < review.rating ? "prod-star-filled" : ""
                                }`}
                              />
                            ))}
                          </div>
                        </div>

                        <p className="prod-comment">{review.comment}</p>
                      </div>
                    ))
                  ) : (
                    <p className="prod-no-reviews">
                      {t("productDetails.noReviews")}
                    </p>
                  )}
                </div>
              </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}
