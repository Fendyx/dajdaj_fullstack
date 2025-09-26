import axios from "axios";
import { useSelector } from "react-redux";
import { url } from "../slices/api";
import { useTranslation } from "react-i18next";

const PayButton = ({ cartItems }) => {
  const { t } = useTranslation();
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
    })
      .then((res) => {
        if (res.data.url) {
          window.location.href = res.data.url;
        }
      })
      .catch((err) => console.log(err.message));
  };

  return (
    <button onClick={handleCheckout}>
      {t("payButton.checkout")}
    </button>
  );
};

export default PayButton;
