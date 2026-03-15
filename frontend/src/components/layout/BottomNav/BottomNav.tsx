import { Link, useLocation } from "react-router-dom";
import { FaHome, FaUser, FaShoppingCart } from "react-icons/fa";
import { useTranslation } from "react-i18next";

// Используем наши новые кастомные хуки
import { useAppSelector } from "@/store/hooks"; 
import { useUI } from "@/shared/context/UIContext";
import "./BottomNav.css";

export const BottomNav = () => {
  const location = useLocation();
  const { isMenuOpen } = useUI();
  const { t } = useTranslation();
  
  // Достаем только количество товаров (не нужно делать dispatch(getTotals) здесь, 
  // так как корзина уже пересчитывается в редюсере при добавлении/удалении)
  const cartTotalQuantity = useAppSelector((state) => state.cart.cartTotalQuantity);

  // Если открыто бургер-меню (из NavBar), прячем нижнюю панель, чтобы не перегружать экран
  if (isMenuOpen) return null;

  // Опционально: скрываем BottomNav на страницах чекаута, чтобы юзер не сбежал с оплаты
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

        <Link
          to="/profile"
          className={`nav-item ${location.pathname.startsWith("/profile") ? "active" : ""}`}
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