import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  addToCart,
  clearCart,
  decreaseCart,
  getTotals,
  removeFromCart,
} from "../../slices/cartSlice";
import { useTranslation } from "react-i18next";
import i18n from "../../i18n";
import { 
  FiPlus, FiMinus, FiChevronDown, FiChevronUp, FiTrash2, 
  FiShield, FiLock, FiTruck 
} from "react-icons/fi";
import { FaCcVisa, FaCcMastercard, FaApple, FaGoogle } from "react-icons/fa";
import "./Cart.css";

const Cart = () => {
  const { t } = useTranslation();
  const cart = useSelector((state) => state.cart);
  const auth = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [expandedPersonalization, setExpandedPersonalization] = useState({});

  useEffect(() => {
    dispatch(getTotals());
  }, [cart, dispatch]);

  const handleAddToCart = (product) => dispatch(addToCart(product));
  const handleDecreaseCart = (product) => dispatch(decreaseCart(product));
  const handleRemoveFromCart = (product) => dispatch(removeFromCart(product));

  const handleProceedToCheckout = () => {
    if (!auth._id) {
      navigate("/login?redirect=/cart");
      return;
    }
    const deliveryList = auth.deliveryDatas || [];
    if (deliveryList.length === 0) {
      navigate("/shipping-info", { state: { fromCart: true } });
      return;
    }
    navigate("/checkout-stripe");
  };

  const togglePersonalization = (itemId) => {
    setExpandedPersonalization(prev => ({ ...prev, [itemId]: !prev[itemId] }));
  };

  // --- ЛОГИКА FREE SHIPPING BAR ---
  const FREE_SHIPPING_THRESHOLD = 100; // Например, 100 PLN
  const currentTotal = cart.cartTotalAmount;
  const isFreeShipping = currentTotal >= FREE_SHIPPING_THRESHOLD;
  const amountToFreeShipping = FREE_SHIPPING_THRESHOLD - currentTotal;
  const progressPercent = Math.min((currentTotal / FREE_SHIPPING_THRESHOLD) * 100, 100);

  return (
    <div className="cart-container">
      <h2>{t("cart.title")}</h2>

      {cart.cartItems.length === 0 ? (
        <div className="cart-empty">
          <div className="empty-icon-bg">
            <FiTruck size={40} />
          </div>
          <p>{t("cart.emptyMessage")}</p>
          <div className="start-shopping">
            <Link to="/" className="btn-primary">
              <span>{t("cart.startShopping")}</span>
            </Link>
          </div>
        </div>
      ) : (
        <div className="cart-content-wrapper">
          
          {/* Секция товаров */}
          <div className="cart-items-section">
            
            {/* --- FREE SHIPPING BAR (GAMIFICATION) --- */}
            <div className="free-shipping-bar-container">
              <div className="fs-text">
                {isFreeShipping ? (
                  <span className="fs-success">
                    <FiShield style={{ marginRight: 6, verticalAlign: 'middle' }}/> 
                    Congrats! You've got <strong>Free Shipping</strong>
                  </span>
                ) : (
                  <span>
                    Add <strong>PLN{amountToFreeShipping.toFixed(2)}</strong> for free shipping
                  </span>
                )}
              </div>
              <div className="fs-progress-bg">
                <div 
                  className="fs-progress-fill" 
                  style={{ width: `${progressPercent}%`, backgroundColor: isFreeShipping ? '#10b981' : '#2563eb' }}
                ></div>
              </div>
            </div>

            <div className="titles desktop-only">
              <h3 className="product-title">{t("cart.columns.product")}</h3>
              <h3 className="price">{t("cart.columns.price")}</h3>
              <h3 className="quantity">{t("cart.columns.quantity")}</h3>
              <h3 className="total">{t("cart.columns.total")}</h3>
            </div>

            <div className="cart-items">
              {cart.cartItems.map((cartItem) => (
                <div className="cart-item" key={cartItem.id}>
                  {/* ... (Ваш код товара остался почти таким же, структура хорошая) ... */}
                  <div className="cart-product">
                    <div className="img-with-name-of-product">
                      <img src={cartItem.image} alt={cartItem.name[i18n.language]} />
                      <div className="product-info">
                        <h3>
                          {typeof cartItem.name === "object"
                            ? cartItem.name[i18n.language]
                            : cartItem.name}
                        </h3>
                        {/* Mobile controls */}
                        <div className="quantity-and-delete mobile-only">
                           {/* ... (ваш код) ... */}
                           <div className="cart-product-quantity">
                            <button onClick={() => handleDecreaseCart(cartItem)}><FiMinus /></button>
                            <div className="count">{cartItem.cartQuantity}</div>
                            <button onClick={() => handleAddToCart(cartItem)}><FiPlus /></button>
                          </div>
                          <button className="delete-btn" onClick={() => handleRemoveFromCart(cartItem)}>
                            <FiTrash2 />
                          </button>
                        </div>
                      </div>
                    </div>
                    {/* Personalization (ваш код) */}
                    {cartItem.personalization && (
                      <div className="personalization-info">
                        <div className="personalization-header" onClick={() => togglePersonalization(cartItem.id)}>
                          <h4>{t("cart.personalization.title")}</h4>
                          {expandedPersonalization[cartItem.id] ? <FiChevronUp /> : <FiChevronDown />}
                        </div>
                        {expandedPersonalization[cartItem.id] && (
                           <div className="personalization-details expanded">
                              <p><strong>{t("cart.personalization.phrase")}:</strong> {cartItem.personalization.phrase}</p>
                              <p><strong>{t("cart.personalization.customName")}:</strong> {cartItem.personalization.customName}</p>
                           </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Desktop Columns */}
                  <div className="cart-product-price desktop-only">PLN{cartItem.price}</div>
                  <div className="cart-product-quantity desktop-only">
                    <button onClick={() => handleDecreaseCart(cartItem)}><FiMinus /></button>
                    <div className="count">{cartItem.cartQuantity}</div>
                    <button onClick={() => handleAddToCart(cartItem)}><FiPlus /></button>
                  </div>
                  <div className="cart-product-total-price desktop-only"> {/* Исправил класс для Desktop */}
                    PLN{(cartItem.price * cartItem.cartQuantity).toFixed(2)}
                  </div>
                   {/* Desktop Delete Btn - можно добавить отдельно справа */}
                   <div className="desktop-only remove-col">
                      <button className="delete-btn" onClick={() => handleRemoveFromCart(cartItem)}>
                        <FiTrash2 />
                      </button>
                   </div>
                </div>
              ))}
            </div>
          </div>

          {/* SIDEBAR SUMMARY */}
          <div className="cart-summary">
            <div className="cart-checkout">
              <div className="subtotal">
                <span>{t("cart.summary.total")}</span>
                <span className="amount">PLN{cart.cartTotalAmount}</span>
              </div>
              
              <div className="shipping-note">
                <p>{t("cart.summary.taxesShipping")}</p>
              </div>

              {auth._id ? (
                <button className="cart-proceed" onClick={handleProceedToCheckout}>
                  {t("cart.summary.proceedToDelivery")}
                </button>
              ) : (
                <button className="cart-login" onClick={() => navigate("/login?redirect=/cart")}>
                  {t("cart.summary.loginToCheckout")}
                </button>
              )}

              {/* --- TRUST SIGNALS (PSYCHOLOGY) --- */}
              <div className="trust-badges">
                <div className="secure-checkout">
                  <FiLock size={14} /> 
                  <span>Secure Checkout</span>
                </div>
                <div className="payment-icons">
                  <FaCcVisa />
                  <FaCcMastercard />
                  <FaApple />
                  <FaGoogle />
                </div>
              </div>

            </div>
          </div>

        </div>
      )}
    </div>
  );
};

export default Cart;