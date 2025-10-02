import { useSelector } from "react-redux";
import StripePaymentForm from "./StripePaymentForm";

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

  const cartItems = cart?.cartItems?.map((item) => ({
    id: item.id,
    qty: item.cartQuantity || item.qty || 1,
  })) || [];

  return (
    <div style={{ padding: "2rem", paddingTop: "100px", maxWidth: "600px", margin: "0 auto" }}>
      {/* <h2 style={{ marginBottom: "2rem" }}>Stripe Elements Checkout</h2> */}
      <StripePaymentForm cartItems={cartItems} deliveryInfo={deliveryInfo} />
    </div>
  );
}
