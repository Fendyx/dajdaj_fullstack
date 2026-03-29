import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Heart,
  ShoppingBag,
  CircleUserRound,
  Search,
  LogIn,
  UserPlus,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { getTotals } from "@/features/cart/cartSlice";
import { useUI } from "@/shared/context/UIContext";
import { useNavScroll } from "./hooks/useNavScroll";
import { LanguageSelector } from "./LanguageSelector";
import { MobileMenu } from "./MobileMenu";
import logo from "@/assets/img/dajdaj_180.png";
import "./NavBar.css";

export const NavBar = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { isMenuOpen, setIsMenuOpen, setIsSearchOpen } = useUI();
  const cart = useAppSelector((state) => state.cart);
  const auth = useAppSelector((state) => state.auth);
  const navVisible = useNavScroll();

  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? "hidden" : "auto";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isMenuOpen]);

  useEffect(() => {
    dispatch(getTotals());
  }, [cart.cartItems, dispatch]);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  return (
    <nav className={`nav-bar${navVisible ? "" : " nav-bar--hidden"}`}>
      {/* ── Logo ── */}
      <div className="nav-left">
        <Link to="/" className="logo-link">
          <img src={logo} alt="DajDaj Logo" />
          <span className="logo-text">DajDaj</span>
        </Link>
      </div>

      {/* ── Desktop Search — click to open modal ── */}
      <div className="nav-center">
        <button
          className="nav-search"
          onClick={() => setIsSearchOpen(true)}
          aria-label={t("search.ariaLabel", "Search")}
          type="button"
        >
          <Search className="nav-search__icon" size={15} strokeWidth={2.2} />
          <span className="nav-search__placeholder">
            {t("navbar.searchPlaceholder", "Search products…")}
          </span>
          <kbd className="nav-search__kbd">⌘K</kbd>
        </button>
      </div>

      {/* ── Right actions ── */}
      <div className="nav-right">
        <LanguageSelector />

        {!auth._id ? (
          <div className="auth-actions">
            <Link to="/login" className="auth-btn sign-in">
              <LogIn size={15} strokeWidth={2} />
              {t("navbar.signIn")}
            </Link>
            <Link to="/register" className="auth-btn join-us">
              <UserPlus size={15} strokeWidth={2} />
              {t("navbar.joinUs")}
            </Link>
          </div>
        ) : (
          <>
            <Link to="/favorites" className="nav-icon-btn">
              <Heart size={20} strokeWidth={1.8} />
              <span className="nav-icon-btn__label">{t("navbar.favorites")}</span>
            </Link>
            <Link to="/profile" className="nav-icon-btn">
              <CircleUserRound size={20} strokeWidth={1.8} />
              <span className="nav-icon-btn__label">{t("navbar.profile")}</span>
            </Link>
          </>
        )}

        <Link to="/cart" className="cart-btn">
          <span className="cart-btn__icon-wrap">
            <ShoppingBag size={20} strokeWidth={1.8} />
            {cart.cartTotalQuantity > 0 && (
              <span className="cart-btn__badge">{cart.cartTotalQuantity}</span>
            )}
          </span>
          <span className="cart-btn__label">{t("navbar.cart")}</span>
        </Link>

        {/* Burger — mobile only */}
        <button
          className={`burger${isMenuOpen ? " burger--open" : ""}`}
          onClick={toggleMenu}
          aria-label="Toggle menu"
          aria-expanded={isMenuOpen}
        >
          <span className="burger__line" />
          <span className="burger__line" />
          <span className="burger__line" />
        </button>
      </div>

      <MobileMenu
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        auth={auth}
        cartQuantity={cart.cartTotalQuantity}
      />
    </nav>
  );
};