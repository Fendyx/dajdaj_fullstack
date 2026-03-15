import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Plus, Minus, Trash2,
  ShieldCheck, Lock, ShoppingBag, CreditCard, Smartphone,
  ChevronDown, ChevronUp, ArrowRight,
} from "lucide-react";

import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  addToCart,
  decreaseCart,
  getTotals,
  removeFromCart,
} from "@/features/cart/cartSlice";

import "./Cart.css";

export function CartPage() {
  const { t, i18n } = useTranslation();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const cart = useAppSelector((state) => state.cart);
  const [expandedPersonalization, setExpandedPersonalization] = useState<
    Record<string | number, boolean>
  >({});

  useEffect(() => {
    dispatch(getTotals());
  }, [cart, dispatch]);

  const handleAddToCart = (product: any) => dispatch(addToCart(product));
  const handleDecreaseCart = (product: any) => dispatch(decreaseCart(product));
  const handleRemoveFromCart = (product: any) => dispatch(removeFromCart(product));
  const handleProceedToCheckout = () => navigate("/checkout-stripe");

  const togglePersonalization = (itemId: string | number) => {
    setExpandedPersonalization((prev) => ({
      ...prev,
      [itemId]: !prev[itemId],
    }));
  };

  const FREE_SHIPPING_THRESHOLD = 100;
  const currentTotal = cart.cartTotalAmount || 0;
  const isFreeShipping = currentTotal >= FREE_SHIPPING_THRESHOLD;
  const amountToFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - currentTotal);
  const progressPercent = Math.min((currentTotal / FREE_SHIPPING_THRESHOLD) * 100, 100);
  const itemCount = cart.cartItems.reduce(
    (acc: number, item: any) => acc + (item.cartQuantity || 0),
    0
  );

  /* ─── Empty state ──────────────────────────────────────────────── */
  if (cart.cartItems.length === 0) {
    return (
      <div className="cart-page">
        <div className="cart-empty">
          <div className="cart-empty__icon">
            <ShoppingBag size={48} strokeWidth={1.4} />
          </div>
          <h2 className="cart-empty__title">
            {t("cart.emptyMessage", "Your cart is empty")}
          </h2>
          <p className="cart-empty__sub">
            Looks like you haven't added anything yet.
            <br />
            Explore our products and find something you love.
          </p>
          <Link to="/" className="cart-empty__cta">
            {t("cart.startShopping", "Start Shopping")}
            <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    );
  }

  /* ─── Main cart ────────────────────────────────────────────────── */
  return (
    <div className="cart-page">
      <div className="cart-layout">

        {/* ── LEFT: Items ─────────────────────────────────── */}
        <section className="cart-items-section">

          <div className="cart-heading">
            <h2 className="cart-heading__title">
              {t("cart.title", "Shopping Cart")}
            </h2>
            <span className="cart-heading__count">
              {itemCount} {itemCount === 1 ? "item" : "items"}
            </span>
          </div>

          {/* Free shipping bar */}
          <div className="shipping-bar">
            <p className="shipping-bar__text">
              {isFreeShipping ? (
                <span className="shipping-bar__text--success">
                  <ShieldCheck size={16} />
                  Congrats! You've got <strong>Free Shipping</strong>
                </span>
              ) : (
                <>
                  Add <strong>{amountToFreeShipping.toFixed(2)} PLN</strong> more for free shipping
                </>
              )}
            </p>
            <div className="shipping-bar__track">
              <div
                className="shipping-bar__fill"
                style={{
                  width: `${progressPercent}%`,
                  backgroundColor: isFreeShipping ? "#10b981" : "#3b82f6",
                }}
              />
            </div>
          </div>

          {/* Desktop column headers */}
          <div className="cart-table-head">
            <span>{t("cart.columns.product", "Product")}</span>
            <span>{t("cart.columns.price", "Price")}</span>
            <span>{t("cart.columns.quantity", "Quantity")}</span>
            <span>{t("cart.columns.total", "Total")}</span>
            <span />
          </div>

          {/* Items list */}
          <ul className="cart-list">
            {cart.cartItems.map((cartItem: any) => {
              const itemName =
                typeof cartItem.name === "object" && cartItem.name !== null
                  ? cartItem.name[i18n.language] || cartItem.name["en"]
                  : cartItem.name || "Unknown Product";

              return (
                <li className="cart-item" key={cartItem.id}>

                  {/* Col 1: Product */}
                  <div className="cart-item__product">
                    <img
                      src={cartItem.image || "https://placehold.co/120x120"}
                      alt={itemName as string}
                      className="cart-item__img"
                    />
                    <div className="cart-item__info">
                      <h3 className="cart-item__name">{itemName}</h3>

                      {/* Mobile-only: price + qty + delete inline */}
                      <div className="cart-item__mobile-row">
                        <span className="cart-item__mobile-price">
                          {(cartItem.price || 0).toFixed(2)} PLN
                        </span>
                        <div className="qty-control">
                          <button
                            className="qty-control__btn"
                            onClick={() => handleDecreaseCart(cartItem)}
                            aria-label="Decrease quantity"
                          >
                            <Minus size={14} />
                          </button>
                          <span className="qty-control__count">{cartItem.cartQuantity}</span>
                          <button
                            className="qty-control__btn"
                            onClick={() => handleAddToCart(cartItem)}
                            aria-label="Increase quantity"
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                        <button
                          className="cart-item__delete"
                          onClick={() => handleRemoveFromCart(cartItem)}
                          aria-label="Remove item"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Col 2: Price (desktop only) */}
                  <div className="cart-item__price">
                    {(cartItem.price || 0).toFixed(2)} PLN
                  </div>

                  {/* Col 3: Qty control (desktop only) */}
                  <div className="cart-item__qty">
                    <div className="qty-control">
                      <button
                        className="qty-control__btn"
                        onClick={() => handleDecreaseCart(cartItem)}
                        aria-label="Decrease quantity"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="qty-control__count">{cartItem.cartQuantity}</span>
                      <button
                        className="qty-control__btn"
                        onClick={() => handleAddToCart(cartItem)}
                        aria-label="Increase quantity"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                  </div>

                  {/* Col 4: Total (desktop only) */}
                  <div className="cart-item__total">
                    {((cartItem.price || 0) * (cartItem.cartQuantity || 0)).toFixed(2)} PLN
                  </div>

                  {/* Col 5: Delete (desktop only) */}
                  <div className="cart-item__actions">
                    <button
                      className="cart-item__delete"
                      onClick={() => handleRemoveFromCart(cartItem)}
                      aria-label="Remove item"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>

                  {/* Personalization accordion — spans full row */}
                  {cartItem.personalization && (
                    <div className="cart-item__personalization">
                      <button
                        className="personalization__toggle"
                        onClick={() => togglePersonalization(cartItem.id)}
                      >
                        <span>{t("cart.personalization.title", "Personalization Details")}</span>
                        {expandedPersonalization[cartItem.id]
                          ? <ChevronUp size={15} />
                          : <ChevronDown size={15} />}
                      </button>
                      {expandedPersonalization[cartItem.id] && (
                        <div className="personalization__body">
                          <p>
                            <strong>{t("cart.personalization.phrase", "Phrase")}:</strong>{" "}
                            {cartItem.personalization.phrase}
                          </p>
                          <p>
                            <strong>{t("cart.personalization.customName", "Name")}:</strong>{" "}
                            {cartItem.personalization.customName}
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                </li>
              );
            })}
          </ul>

          <Link to="/" className="cart-continue">
            <ArrowRight size={16} style={{ transform: "rotate(180deg)" }} />
            {t("cart.continueShopping", "Continue Shopping")}
          </Link>

        </section>

        {/* ── RIGHT: Order Summary ────────────────────────── */}
        <aside className="cart-summary">
          <div className="cart-summary__inner">
            <h3 className="cart-summary__title">Order Summary</h3>

            <div className="cart-summary__row">
              <span>Subtotal ({itemCount} {itemCount === 1 ? "item" : "items"})</span>
              <span>{currentTotal.toFixed(2)} PLN</span>
            </div>
            <div className="cart-summary__row">
              <span>Shipping</span>
              <span className={isFreeShipping ? "cart-summary__free" : ""}>
                {isFreeShipping ? "Free" : "Calculated at checkout"}
              </span>
            </div>

            <div className="cart-summary__divider" />

            <div className="cart-summary__total">
              <span>{t("cart.summary.total", "Total")}</span>
              <span>{currentTotal.toFixed(2)} PLN</span>
            </div>

            <p className="cart-summary__note">
              {t("cart.summary.taxesShipping", "Taxes calculated at checkout")}
            </p>

            <button
              className="cart-summary__checkout"
              onClick={handleProceedToCheckout}
            >
              {t("cart.summary.proceedToDelivery", "Proceed to Checkout")}
              <ArrowRight size={18} />
            </button>

            <div className="cart-summary__trust">
              <div className="trust__secure">
                <Lock size={14} />
                <span>Secure Encrypted Checkout</span>
              </div>
              <div className="trust__icons">
                <CreditCard size={28} />
                <Smartphone size={28} />
              </div>
            </div>
          </div>
        </aside>

      </div>
    </div>
  );
}