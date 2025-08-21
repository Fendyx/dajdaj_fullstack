import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logoutUser } from "../slices/authSlice";
import { toast } from "react-toastify";
import { getTotals } from "../slices/cartSlice";
import logo from "../assets/img/dajdaj_logo.png";
import "./Header.css";
import { useMenu } from "../context/MenuContext";

const NavBar = () => {
  const { isMenuOpen, setIsMenuOpen } = useMenu();
  const dispatch = useDispatch();
  const cart = useSelector((state) => state.cart);
  const auth = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(getTotals());
  }, [cart.cartItems, dispatch]);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
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

        <div className="burger" onClick={toggleMenu}>
          <i className="fa-solid fa-bars"></i>
        </div>

        <div className="nav-right">
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
            <div
              className="logout-link"
              onClick={() => {
                dispatch(logoutUser(null));
                toast.warning("Logged out!", { position: "bottom-left" });
              }}
            >
              <i className="fa-solid fa-arrow-right-from-bracket"></i> Logout
            </div>
          )}

          <Link to="/cart" className="nav-icon cart-link">
            <i className="fa-solid fa-shopping-cart"></i> Cart
            {cart.cartTotalQuantity > 0 && (
              <span className="bag-quantity">{cart.cartTotalQuantity}</span>
            )}
          </Link>
        </div>
      </nav>

      <div className={`mobile-menu ${isMenuOpen ? "open" : ""}`}>
        <div className="close-btn" onClick={closeMenu}>
          <i className="fa-solid fa-xmark"></i>
        </div>
        <div className="mobile-links">
          <Link to="/" onClick={closeMenu}>Home</Link>
          <Link to="/about" onClick={closeMenu}>About</Link>
          <Link to="/shop" onClick={closeMenu}>Shop</Link>
          <Link to="/contact" onClick={closeMenu}>Contact</Link>

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
            <div
              className="logout-link"
              onClick={() => {
                dispatch(logoutUser(null));
                toast.warning("Logged out!", { position: "bottom-left" });
                closeMenu();
              }}
            >
              <i className="fa-solid fa-arrow-right-from-bracket"></i> Logout
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default NavBar;