import { Link } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import styled from "styled-components";
import { logoutUser } from "../slices/authSlice";
import { toast } from "react-toastify";
import { useEffect } from "react";
import { getTotals } from "../slices/cartSlice";
import logo from "../assets/img/dajdaj_logo.png";
import "./Header.css";

const NavBar = () => {
  const dispatch = useDispatch();
  const cart = useSelector((state) => state.cart);
  const auth = useSelector((state) => state.auth);

  // Добавляем эффект для обновления totals при изменении корзины
  useEffect(() => {
    dispatch(getTotals());
  }, [cart.cartItems, dispatch]);

  return (
    <nav className="nav-bar">
      <Link to="/">
        <div className="company_name_logo">
          <img src={logo} alt="DajDaj Logo" />
          <span>DajDaj</span>
        </div>
      </Link>
      <Link to="/cart" className="cart-link">
        <div className="nav-bag">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="35"
            height="35"
            fill="black"
            className="bi bi-handbag-fill"
            viewBox="0 0 16 16"
          >
            <path d="M8 1a2 2 0 0 0-2 2v2H5V3a3 3 0 1 1 6 0v2h-1V3a2 2 0 0 0-2-2zM5 5H3.36a1.5 1.5 0 0 0-1.483 1.277L.85 13.13A2.5 2.5 0 0 0 3.322 16h9.355a2.5 2.5 0 0 0 2.473-2.87l-1.028-6.853A1.5 1.5 0 0 0 12.64 5H11v1.5a.5.5 0 0 1-1 0V5H6v1.5a.5.5 0 0 1-1 0V5z" />
          </svg>
          {cart.cartTotalQuantity > 0 && (
            <span className="bag-quantity">
              <span>{cart.cartTotalQuantity}</span>
            </span>
          )}
        </div>
      </Link>
      {auth._id ? (
        <Logout
          onClick={() => {
            dispatch(logoutUser(null));
            toast.warning("Logged out!", { position: "bottom-left" });
          }}
          style={{ color: "black" }}
        >
          Wyloguj się
        </Logout>
      ) : (
        <AuthLinks>
          <Link to="/login">Logowanie</Link>
          <Link to="/register">Rejestracja</Link>
        </AuthLinks>
      )}
    </nav>
  );
};

export default NavBar;

const AuthLinks = styled.div`
  a {
    &:last-child {
      margin-left: 2rem;
    }
  }
`;

const Logout = styled.div`
  color: white;
  cursor: pointer;
`;
