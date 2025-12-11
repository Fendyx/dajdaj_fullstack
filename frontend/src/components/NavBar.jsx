import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { getTotals } from "../slices/cartSlice";
import { useTranslation } from "react-i18next";
import logo from "../assets/img/dajdaj_180.png";
import { useUI } from "../context/UIContext";
import "./NavBar.css";

const NavBar = () => {
  const { isMenuOpen, setIsMenuOpen } = useUI();
  const dispatch = useDispatch();
  const cart = useSelector((state) => state.cart);
  const auth = useSelector((state) => state.auth);
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);

  const { i18n, t } = useTranslation();
  const langMenuRef = useRef(null);

  // ... (Ваши useEffect остались без изменений) ...
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => { document.body.style.overflow = "auto"; };
  }, [isMenuOpen]);

  useEffect(() => {
    const handlePopState = () => {
      if (isMenuOpen) setIsMenuOpen(false);
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [isMenuOpen]);

  useEffect(() => {
    dispatch(getTotals());
  }, [cart.cartItems, dispatch]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (langMenuRef.current && !langMenuRef.current.contains(e.target)) {
        setIsLangMenuOpen(false);
      }
    };
    if (isLangMenuOpen) document.addEventListener("click", handleClickOutside);
    else document.removeEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [isLangMenuOpen]);
  // ... (Конец useEffects) ...

  const toggleMenu = () => {
    if (!isMenuOpen) {
      document.body.classList.add("no-blur");
      setIsMenuOpen(true);
      window.history.pushState({ menu: true }, "");
      setTimeout(() => document.body.classList.remove("no-blur"), 350);
    } else {
      setIsMenuOpen(false);
    }
  };
  
  const closeMenu = () => setIsMenuOpen(false);
  const toggleLangMenu = () => setIsLangMenuOpen((prev) => !prev);

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng).then(() => setIsLangMenuOpen(false)).catch(() => setIsLangMenuOpen(false));
  };

  const LANG_LABELS = { en: "EN", pl: "PL", uk: "UA", ru: "RU" };

  return (
    <>
      <nav className="nav-bar">
        <div className="nav-left">
          <Link to="/" className="logo-link">
            <img src={logo} alt="DajDaj Logo" />
            <span>DajDaj</span>
          </Link>
        </div>

        <div className="nav-right">
          {/* Desktop Lang Selector */}
          <div className="lang-selector" ref={langMenuRef} onClick={toggleLangMenu}>
            <i className="fa-solid fa-globe"></i>
            <span>{LANG_LABELS[i18n.language]}</span>
            <i className={`fa-solid fa-chevron-${isLangMenuOpen ? "up" : "down"}`}></i>
            {isLangMenuOpen && (
              <ul className="lang-dropdown">
                <li onClick={() => changeLanguage("en")}>EN</li>
                <li onClick={() => changeLanguage("pl")}>PL</li>
                <li onClick={() => changeLanguage("uk")}>UA</li>
                <li onClick={() => changeLanguage("ru")}>RU</li>
              </ul>
            )}
          </div>

          {/* Desktop Icons */}
          {!auth._id && (
            <Link to="/login" className="nav-icon sign-in">
              <i className="fa-solid fa-user"></i> {t("navbar.signIn")}
            </Link>
          )}
          {!auth._id && (
            <Link to="/register" className="nav-icon join-us">
              <i className="fa-solid fa-user-plus"></i> {t("navbar.joinUs")}
            </Link>
          )}
          {auth._id && (
            <Link to="/profile" className="nav-icon favorites-link">
              <i className="fa-regular fa-heart"></i> {t("navbar.favorites")}
            </Link>
          )}
          {auth._id && (
            <Link to="/profile" className="profile-button">
              <span>{t("navbar.profile")}</span>
              <i className="fa-solid fa-user-circle"></i>
            </Link>
          )}
          <Link to="/cart" className="nav-icon cart-link">
            <i className="fa-solid fa-shopping-cart"></i> {t("navbar.cart")}
            {cart.cartTotalQuantity > 0 && (
              <span className="bag-quantity">{cart.cartTotalQuantity}</span>
            )}
          </Link>

          <div className="burger" onClick={toggleMenu}>
            <i className="fa-solid fa-bars"></i>
          </div>

          {/* ================= MOBILE MENU ================= */}
          <div className={`mobile-menu ${isMenuOpen ? "open" : ""}`}>
            <div className="mobile-menu-header">
               <span className="menu-title">Menu</span>
               <div className="close-btn" onClick={closeMenu}>
                  <i className="fa-solid fa-xmark"></i>
               </div>
            </div>

            <div className="mobile-content">
              
              {/* 1. User Auth Section */}
              <div className="mobile-section auth-section">
                {auth._id ? (
                   <Link to="/profile" onClick={closeMenu} className="user-profile-row">
                      <div className="user-avatar">
                        <i className="fa-solid fa-user"></i>
                      </div>
                      <div className="user-info">
                        <span className="user-name">My Profile</span>
                        <span className="user-action">Go to settings</span>
                      </div>
                      <i className="fa-solid fa-chevron-right arrow-icon"></i>
                   </Link>
                ) : (
                  <div className="auth-buttons-row">
                    <Link to="/login" onClick={closeMenu} className="btn-auth login">
                      {t("navbar.signIn")}
                    </Link>
                    <Link to="/register" onClick={closeMenu} className="btn-auth register">
                      {t("navbar.joinUs")}
                    </Link>
                  </div>
                )}
              </div>

              {/* 2. CATALOG Section (Новые категории здесь) */}
              <div className="mobile-section">
                <h3 className="section-label">Catalog</h3>
                <ul className="mobile-list">
                  <li>
                    <Link to="/" onClick={closeMenu} className="mobile-link">
                      <span className="link-icon"><i className="fa-solid fa-layer-group"></i></span>
                      <span className="link-text">All Products</span>
                      <i className="fa-solid fa-chevron-right arrow-icon"></i>
                    </Link>
                  </li>
                  <li>
                    <Link to="/figurines" onClick={closeMenu} className="mobile-link">
                      <span className="link-icon"><i className="fa-solid fa-dragon"></i></span>
                      <span className="link-text">Figurines</span>
                      <i className="fa-solid fa-chevron-right arrow-icon"></i>
                    </Link>
                  </li>
                  <li>
                    <Link to="/interior" onClick={closeMenu} className="mobile-link">
                      <span className="link-icon"><i className="fa-solid fa-couch"></i></span>
                      <span className="link-text">Interior</span>
                      <i className="fa-solid fa-chevron-right arrow-icon"></i>
                    </Link>
                  </li>
                </ul>
              </div>

              {/* 3. USER LINKS Section */}
              <div className="mobile-section">
                <h3 className="section-label">My Account</h3>
                <ul className="mobile-list">
                  <li>
                    <Link to="/cart" onClick={closeMenu} className="mobile-link">
                      <span className="link-icon"><i className="fa-solid fa-shopping-cart"></i></span>
                      <span className="link-text">Cart</span>
                      {cart.cartTotalQuantity > 0 && <span className="mobile-badge">{cart.cartTotalQuantity}</span>}
                    </Link>
                  </li>
                  {auth._id && (
                    <>
                      <li>
                        <Link to="/favorites" onClick={closeMenu} className="mobile-link">
                          <span className="link-icon"><i className="fa-regular fa-heart"></i></span>
                          <span className="link-text">Favorites</span>
                        </Link>
                      </li>
                      <li>
                        <Link to="/orders" onClick={closeMenu} className="mobile-link">
                          <span className="link-icon"><i className="fa-solid fa-box-open"></i></span>
                          <span className="link-text">My Orders</span>
                        </Link>
                      </li>
                    </>
                  )}
                </ul>
              </div>

              {/* 4. INFO Section */}
              <div className="mobile-section">
                <h3 className="section-label">Information</h3>
                <ul className="mobile-list">
                  <li>
                    <Link to="/about" onClick={closeMenu} className="mobile-link">
                      <span className="link-icon"><i className="fa-solid fa-circle-info"></i></span>
                      <span className="link-text">About Us</span>
                    </Link>
                  </li>
                  <li>
                    <Link to="/contact" onClick={closeMenu} className="mobile-link">
                      <span className="link-icon"><i className="fa-solid fa-envelope"></i></span>
                      <span className="link-text">Contact</span>
                    </Link>
                  </li>
                </ul>
              </div>

            </div>
          </div>
        </div>
      </nav>

      {isLangMenuOpen && (
        <div className="overlay" onClick={() => setIsLangMenuOpen(false)}></div>
      )}
    </>
  );
};

export default NavBar;