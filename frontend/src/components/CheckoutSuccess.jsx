import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { clearCart } from "../slices/cartSlice";
import "./CheckoutSuccess.css"

const CheckoutSuccess = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(clearCart());
  }, [dispatch]);

  return (
    <div className="checkout-success">
      <div className="checkout-success__icon">✅</div>
      <h2 className="checkout-success__title">Dziękujemy za zakupy!</h2>
      <p className="checkout-success__text">Twoje zamówienie zostało pomyślnie złożone.</p>
      <p className="checkout-success__text">Wkrótce skontaktujemy się z Tobą w celu potwierdzenia szczegółów.</p>
      <button
        className="checkout-success__btn-home"
        onClick={() => window.location.href = "/"}
      >
        Powrót do strony głównej
      </button>
    </div>
  );
};

export default CheckoutSuccess;

