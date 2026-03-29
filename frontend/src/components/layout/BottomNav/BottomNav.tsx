import { Link, useLocation } from "react-router-dom";
import { FaHome, FaUser, FaShoppingCart } from "react-icons/fa";
import { HiOutlineSearch } from "react-icons/hi";
import { useTranslation } from "react-i18next";
import { useAppSelector } from "@/store/hooks";
import { useUI } from "@/shared/context/UIContext";
import "./BottomNav.css";

export const BottomNav = () => {
  const location = useLocation();
  const { isMenuOpen, isSearchOpen, setIsSearchOpen } = useUI();
  const { t } = useTranslation();
  const cartTotalQuantity = useAppSelector(
    (state) => state.cart.cartTotalQuantity
  );

  // Hide when burger menu is open
  if (isMenuOpen) return null;

  // Hide on checkout pages
  const hideOnPages = ["/checkout-stripe", "/checkout-success"];
  if (hideOnPages.includes(location.pathname)) return null;

  return (
    <div className="bottom-nav-container">
      <nav className="bottom-nav">
        <Link
          to="/"
          className={`nav-item ${location.pathname === "/" ? "active" : ""}`}
        >
          <FaHome className="nav-icon" />
          <span>{t("bottomNav.home", "Home")}</span>
        </Link>

        {/* ── Search button ── */}
        <button
          className={`nav-item nav-item--search ${isSearchOpen ? "active" : ""}`}
          onClick={() => setIsSearchOpen(true)}
          aria-label={t("search.ariaLabel", "Search")}
          type="button"
        >
          <HiOutlineSearch className="nav-icon" />
          <span>{t("bottomNav.search", "Search")}</span>
        </button>

        <Link
          to="/profile"
          className={`nav-item ${
            location.pathname.startsWith("/profile") ? "active" : ""
          }`}
        >
          <FaUser className="nav-icon" />
          <span>{t("bottomNav.profile", "Profile")}</span>
        </Link>

        <Link
          to="/cart"
          className={`nav-item ${location.pathname === "/cart" ? "active" : ""}`}
        >
          <div className="cart-wrapper relative">
            <FaShoppingCart className="nav-icon" />
            {cartTotalQuantity > 0 && (
              <span className="cart-badge">{cartTotalQuantity}</span>
            )}
          </div>
          <span>{t("bottomNav.cart", "Cart")}</span>
        </Link>
      </nav>
    </div>
  );
};