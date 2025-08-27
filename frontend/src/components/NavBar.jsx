import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { getTotals } from "../slices/cartSlice";
import { useTranslation } from "react-i18next";
import logo from "../assets/img/dajdaj_180.png";
import { useMenu } from "../context/MenuContext";
import "./Header.css";

const NavBar = () => {
  const { isMenuOpen, setIsMenuOpen } = useMenu();
  const dispatch = useDispatch();
  const cart = useSelector((state) => state.cart);
  const auth = useSelector((state) => state.auth);
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);

  const { i18n, t } = useTranslation();

  const langMenuRef = useRef(null); // ✅ ссылка на блок выбора языка

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
    dispatch(getTotals());
  }, [cart.cartItems, dispatch]);

  // ✅ Закрытие меню при клике вне блока выбора языка
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

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const closeMenu = () => setIsMenuOpen(false);
  const toggleLangMenu = () => setIsLangMenuOpen((prev) => !prev);

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng)
      .then(() => {
        console.log("Language changed:", i18n.language);
        setIsLangMenuOpen(false); // ✅ закрываем после успешной смены
      })
      .catch((err) => {
        console.error("Error changing language:", err);
        setIsLangMenuOpen(false); // ✅ даже при ошибке закрываем
      });
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
          {/* ✅ Блок выбора языка */}
          <div className="lang-selector" ref={langMenuRef} onClick={toggleLangMenu}>
            <img
              src={`https://flagcdn.com/24x18/${i18n.language === "pl" ? "pl" : "gb"}.png`}
              alt={i18n.language}
            />
            <span>{i18n.language.toUpperCase()}</span>
            <i className={`fa-solid fa-chevron-${isLangMenuOpen ? "up" : "down"}`}></i>
            {isLangMenuOpen && (
              <ul className="lang-dropdown">
                <li onClick={() => changeLanguage("en")}>
                  <img src="https://flagcdn.com/24x18/gb.png" alt="English" /> EN
                </li>
                <li onClick={() => changeLanguage("pl")}>
                  <img src="https://flagcdn.com/24x18/pl.png" alt="Polski" /> PL
                </li>
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
              <i className="fa-solid fa-heart"></i> {t("navbar.favorites")}
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

            <div className="mobile-links">
              <Link to="/" onClick={closeMenu}>
                <i className="fa-solid fa-house"></i> Home
              </Link>
              <Link to="/about" onClick={closeMenu}>
                <i className="fa-solid fa-circle-info"></i> About
              </Link>
              <Link to="/shop" onClick={closeMenu}>
                <i className="fa-solid fa-store"></i> Shop
              </Link>
              <Link to="/contact" onClick={closeMenu}>
                <i className="fa-solid fa-envelope"></i> Contact
              </Link>

              {auth._id && (
                <>
                  <Link to="/favorites" onClick={closeMenu}>
                    <i className="fa-solid fa-heart"></i> Favorites
                  </Link>
                  <Link to="/profile" onClick={closeMenu}>
                    <i className="fa-solid fa-user-circle"></i> Profile
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* ✅ Фон для клика, если меню языков открыто */}
      {isLangMenuOpen && (
        <div
          className="overlay"
          onClick={() => setIsLangMenuOpen(false)}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0, 0, 0, 0.3)",
            zIndex: 5,
          }}
        ></div>
      )}
    </>
  );
};

export default NavBar;
