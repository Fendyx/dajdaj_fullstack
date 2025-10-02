import axios from "axios";
import { useSelector } from "react-redux";
import { url } from "../slices/api";
import { useTranslation } from "react-i18next";
import {FaCreditCard} from "react-icons/fa";

const PayButton = ({ cartItems, deliveryInfo, children }) => {
  const user = useSelector((state) => state.auth);

  const compactCart = cartItems.map(item => ({
    id: item.id,
    qty: item.cartQuantity,
  }));

  const handleCheckout = () => {
    axios
      .post(`${url}/stripe/create-checkout-session`, {
        cartItems: compactCart,
        userId: user._id,
        deliveryInfo, // 👈 передаём данные доставки
      })
      .then(res => {
        if (res.data.url) {
          window.location.href = res.data.url;
        }
      })
      .catch(err => console.log(err.message));
  };

  return (
    <div className="proceed-wrapper" onClick={handleCheckout}>
      <FaCreditCard className="credit-icon" />
      {children}
    </div>
  );
};



export default PayButton;
