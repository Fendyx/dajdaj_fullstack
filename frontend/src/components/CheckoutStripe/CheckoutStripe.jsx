import { useSelector } from "react-redux";
import StripePaymentForm from "./StripePaymentForm";
import "./CheckoutStripe.css"

export default function CheckoutStripe() {
  const cart = useSelector((state) => state.cart);
  const auth = useSelector((state) => state.auth);

  const profile = auth?.deliveryDatas?.[0];

  const deliveryInfo = {
    userId: auth?._id || "",
    name: profile?.personalData?.name || "",
    surname: profile?.personalData?.surname || "",
    email: profile?.personalData?.email || "",
    phone: profile?.personalData?.phone || "",
    address: profile?.delivery?.address || "",
    method: profile?.delivery?.method || "",
  };

  const cartItems =
    cart?.cartItems?.map((item) => ({
      id: item.id,
      qty: item.cartQuantity || item.qty || 1,
    })) || [];

  return (
    <div className="checkout-container">
      <StripePaymentForm cartItems={cartItems} deliveryInfo={deliveryInfo} />
    </div>
  );
}
