import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { getTotals } from "../slices/cartSlice";
import logo from "../assets/img/dajdaj_logo.png";
import "./Header.css";
import { useMenu } from "../context/MenuContext";

const NavBar = () => {
  const { isMenuOpen, setIsMenuOpen } = useMenu();
  const dispatch = useDispatch();
  const cart = useSelector((state) => state.cart);
  const auth = useSelector((state) => state.auth);
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);

  useEffect(() => {
    dispatch(getTotals());
  }, [cart.cartItems, dispatch]);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const toggleLangMenu = () => {
    setIsLangMenuOpen((prev) => !prev);
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
          {/* Языковое меню */}
          <div className="lang-selector" onClick={toggleLangMenu}>
            <img src="https://flagcdn.com/24x18/gb.png" alt="English" />
            <span>EN</span>
            <i className={`fa-solid fa-chevron-${isLangMenuOpen ? "up" : "down"}`}></i>
            {isLangMenuOpen && (
              <ul className="lang-dropdown">
                <li>
                  <img src="https://flagcdn.com/24x18/gb.png" alt="English" /> EN
                </li>
                <li>
                  <img src="https://flagcdn.com/24x18/pl.png" alt="Polski" /> PL
                </li>
                <li>
                  <img src="https://flagcdn.com/24x18/ua.png" alt="Українська" /> UK
                </li>
                <li>
                  <img src="https://flagcdn.com/24x18/ru.png" alt="Русский" /> RU
                </li>
              </ul>
            )}
          </div>

          {!auth._id && (
            <Link to="/login" className="nav-icon sign-in">
              <i className="fa-solid fa-user"></i> Sign in
            </Link>
          )}

          {!auth._id && (
            <Link to="/register" className="nav-icon join-us">
              <i className="fa-solid fa-user-plus"></i> Join us
            </Link>
          )}

          {auth._id && (
            <Link
              to="/profile"
              className="nav-icon favorites-link"
              state={{ openSection: "favorites" }}
              title="Favorites"
            >
              <i className="fa-solid fa-heart"></i>
              <span className="favorites-text">Favorites</span>
            </Link>
          )}

          {auth._id && (
            <Link to="/profile" className="profile-button" title="Profile">
              <span className="profile-text">MyProfile</span>
              <i className="fa-solid fa-user-circle"></i>
            </Link>
          )}

          <Link to="/cart" className="nav-icon cart-link">
            <i className="fa-solid fa-shopping-cart"></i> Cart
            {cart.cartTotalQuantity > 0 && (
              <span className="bag-quantity">{cart.cartTotalQuantity}</span>
            )}
          </Link>

          <div className="burger" onClick={toggleMenu}>
            <i className="fa-solid fa-bars"></i>
          </div>
        </div>
      </nav>

      {/* Мобильное меню */}
      <div className={`mobile-menu ${isMenuOpen ? "open" : ""}`}>
        <div className="close-btn" onClick={closeMenu}>
          <i className="fa-solid fa-xmark"></i>
        </div>

        <div className="mobile-links">
          <Link to="/" onClick={closeMenu}>Home</Link>
          <Link to="/about" onClick={closeMenu}>About</Link>
          <Link to="/shop" onClick={closeMenu}>Shop</Link>
          <Link to="/contact" onClick={closeMenu}>Contact</Link>

          {auth._id && (
            <Link
              to="/profile"
              state={{ openSection: "favorites" }}
              onClick={closeMenu}
            >
              <i className="fa-solid fa-heart"></i> Favorites
            </Link>
          )}

          {!auth._id ? (
            <>
              <Link to="/login" onClick={closeMenu}>
                <i className="fa-solid fa-user"></i> Sign in
              </Link>
              <Link to="/register" onClick={closeMenu}>
                <i className="fa-solid fa-user-plus"></i> Join us
              </Link>
            </>
          ) : (
            <Link to="/profile" onClick={closeMenu}>
              <i className="fa-solid fa-user-circle"></i> Profile
            </Link>
          )}
        </div>
      </div>
    </>
  );
};

export default NavBar;
