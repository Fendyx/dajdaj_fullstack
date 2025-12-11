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

  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isMenuOpen]);

  useEffect(() => {
    const handlePopState = () => {
      if (isMenuOpen) {
        setIsMenuOpen(false);
      }
    };
  
    window.addEventListener("popstate", handlePopState);
  
    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
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

    if (isLangMenuOpen) {
      document.addEventListener("click", handleClickOutside);
    } else {
      document.removeEventListener("click", handleClickOutside);
    }

    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [isLangMenuOpen]);

  const toggleMenu = () => {
    if (!isMenuOpen) {
      document.body.classList.add("no-blur");
      setIsMenuOpen(true);
      window.history.pushState({ menu: true }, ""); // ← добавляем запись
      setTimeout(() => document.body.classList.remove("no-blur"), 350);
    } else {
      setIsMenuOpen(false);
    }
  };
  
  const closeMenu = () => setIsMenuOpen(false);
  const toggleLangMenu = () => setIsLangMenuOpen((prev) => !prev);

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng)
      .then(() => {
        console.log("Language changed:", i18n.language);
        setIsLangMenuOpen(false);
      })
      .catch((err) => {
        console.error("Error changing language:", err);
        setIsLangMenuOpen(false);
      });
  };

  const LANG_LABELS = {
  en: "EN",
  pl: "PL",
  uk: "UA",
  ru: "RU",
};


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
          {/* Language selector */}
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

          {/* FULLSCREEN MOBILE MENU */}
          <div className={`mobile-menu ${isMenuOpen ? "open" : ""}`}>
            <div className="close-btn" onClick={closeMenu}>
              <i className="fa-solid fa-xmark"></i>
            </div>
            <div className="menu-header">DajDaj</div>

            <div className="mobile-links">
              {/* Home - большая карточка */}
              <Link to="/" onClick={closeMenu} className="menu-card menu-card-large">
                <div className="card-icon-wrapper">
                  <i className="fa-solid fa-house"></i>
                </div>
                <span className="card-text">Home</span>
              </Link>

              {/* About и Contact - две карточки в ряд */}
              <div className="menu-row">
                <Link to="/about" onClick={closeMenu} className="menu-card menu-card-small">
                  <div className="card-icon-wrapper">
                    <i className="fa-solid fa-circle-info"></i>
                  </div>
                  <span className="card-text">About</span>
                </Link>

                <Link to="/contact" onClick={closeMenu} className="menu-card menu-card-small">
                  <div className="card-icon-wrapper">
                    <i className="fa-solid fa-envelope"></i>
                  </div>
                  <span className="card-text">Contact</span>
                </Link>
              </div>

              {auth._id && (
                <>
                  {/* Favorites и My orders - две карточки в ряд */}
                  <div className="menu-row">
                    <Link to="/favorites" onClick={closeMenu} className="menu-card menu-card-small">
                      <div className="card-icon-wrapper">
                        <i className="fa-solid fa-heart"></i>
                      </div>
                      <span className="card-text">Favorites</span>
                    </Link>

                    <Link to="/orders" onClick={closeMenu} className="menu-card menu-card-small">
                      <div className="card-icon-wrapper">
                        <i className="fa-solid fa-shopping-bag"></i>
                      </div>
                      <span className="card-text">My orders</span>
                    </Link>
                  </div>

                  {/* Profile - большая фиолетовая кнопка */}
                  <Link to="/profile" onClick={closeMenu} className="menu-card menu-card-profile">
                    <i className="fa-solid fa-user-circle"></i>
                    <span className="card-text">Profile</span>
                  </Link>
                </>
              )}

              {/* Login/register */}
              {!auth._id && (
                <div className="menu-row">
                  <Link to="/login" onClick={closeMenu} className="menu-card menu-card-small">
                    <div className="card-icon-wrapper">
                      <i className="fa-solid fa-right-to-bracket"></i>
                    </div>
                    <span className="card-text">{t("navbar.signIn")}</span>
                  </Link>

                  <Link to="/register" onClick={closeMenu} className="menu-card menu-card-small">
                    <div className="card-icon-wrapper">
                      <i className="fa-solid fa-user-plus"></i>
                    </div>
                    <span className="card-text">{t("navbar.joinUs")}</span>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Overlay для языкового меню */}
      {isLangMenuOpen && (
        <div className="overlay" onClick={() => setIsLangMenuOpen(false)}></div>
      )}
    </>
  );
};

export default NavBar;