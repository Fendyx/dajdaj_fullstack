import { useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  addToCart,
  clearCart,
  decreaseCart,
  getTotals,
  removeFromCart,
} from "../../slices/cartSlice";
import PayButton from "../PayButton";
import { useTranslation } from "react-i18next";
import i18n from "../../i18n";
import "./Cart.css";

const Cart = () => {
  const { t } = useTranslation();

  const cart = useSelector((state) => state.cart);
  const auth = useSelector((state) => state.auth);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    dispatch(getTotals());
  }, [cart, dispatch]);

  const handleAddToCart = (product) => {
    dispatch(addToCart(product));
  };
  const handleDecreaseCart = (product) => {
    dispatch(decreaseCart(product));
  };
  const handleRemoveFromCart = (product) => {
    dispatch(removeFromCart(product));
  };
  const handleClearCart = () => {
    dispatch(clearCart());
  };

  return (
    <div className="cart-container">
      <h2>{t("cart.title")}</h2>

      {cart.cartItems.length === 0 ? (
        <div className="cart-empty">
          <p>{t("cart.emptyMessage")}</p>
          <div className="start-shopping">
            <Link to="/">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                fill="currentColor"
                className="bi bi-arrow-left"
                viewBox="0 0 16 16"
              >
                <path
                  fillRule="evenodd"
                  d="M15 8a.5.5 0 0 0-.5-.5H2.707l3.147-3.146a.5.5 0 1 0-.708-.708l-4 4a.5.5 0 0 0 0 .708l4 4a.5.5 0 0 0 .708-.708L2.707 8.5H14.5A.5.5 0 0 0 15 8z"
                />
              </svg>
              <span>{t("cart.startShopping")}</span>
            </Link>
          </div>
        </div>
      ) : (
        <div>
          <div className="titles">
            <h3 className="product-title">{t("cart.columns.product")}</h3>
            <h3 className="price">{t("cart.columns.price")}</h3>
            <h3 className="quantity">{t("cart.columns.quantity")}</h3>
            <h3 className="total">{t("cart.columns.total")}</h3>
          </div>

          <div className="cart-items">
            {cart.cartItems.map((cartItem) => (
              <div className="cart-item" key={cartItem.id}>
                <div className="cart-product">
                  <div className="img-with-name-of-product">
                    <img src={cartItem.image} alt={cartItem.name[i18n.language]} />
                    <h3>
                      {typeof cartItem.name === "object"
                        ? cartItem.name[i18n.language]
                        : cartItem.name}
                    </h3>
                  </div>
                
                  <div>
                    {cartItem.personalization && (
                      <div className="personalization-info">
                        <h4>{t("cart.personalization.title")}</h4>
                        <p><strong>{t("cart.personalization.phrase")}:</strong> {cartItem.personalization.phrase}</p>
                        <p><strong>{t("cart.personalization.customName")}:</strong> {cartItem.personalization.customName}</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="cart-product-price">
                  PLN{cartItem.price}
                </div>

                <div className="cart-product-quantity">
                  <button onClick={() => handleDecreaseCart(cartItem)}>-</button>
                  <div className="count">{cartItem.cartQuantity}</div>
                  <button onClick={() => handleAddToCart(cartItem)}>+</button>
                </div>

                <div className="cart-product-total-price">
                  PLN{cartItem.price * cartItem.cartQuantity}
                </div>
              </div>
            ))}
          </div>

          <div className="cart-summary">

            <div className="cart-checkout">
              <div className="subtotal">
                <span>{t("cart.summary.total")}</span>
                <span className="amount">PLN{cart.cartTotalAmount}</span>
              </div>

              <p>{t("cart.summary.taxesShipping")}</p>

              {auth._id ? (
                <PayButton cartItems={cart.cartItems} />
              ) : (
                <button
                  className="cart-login"
                  onClick={() => navigate("/login?redirect=/cart")}
                >
                  {t("cart.summary.loginToCheckout")}
                </button>
              )}

              {/* <div className="continue-shopping">
                <Link to="/">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    fill="currentColor"
                    className="bi bi-arrow-left"
                    viewBox="0 0 16 16"
                  >
                    <path
                      fillRule="evenodd"
                      d="M15 8a.5.5 0 0 0-.5-.5H2.707l3.147-3.146a.5.5 0 1 0-.708-.708l-4 4a.5.5 0 0 0 0 .708l4 4a.5.5 0 0 0 .708-.708L2.707 8.5H14.5A.5.5 0 0 0 15 8z"
                    />
                  </svg>
                  <span>{t("cart.buttons.continueShopping")}</span>
                </Link>
              </div> */}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;
