import { useSelector } from "react-redux";
import { useLocation } from "react-router-dom"; // 1. Импортируем useLocation
import StripePaymentForm from "./StripePaymentForm";
import "./CheckoutStripe.css";

export default function CheckoutStripe() {
  const location = useLocation(); // 2. Инициализируем хук
  const cart = useSelector((state) => state.cart);
  const auth = useSelector((state) => state.auth);

  // Проверяем, передан ли товар через Pay Now
  const buyNowItem = location.state?.buyNowItem;

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

  // 3. Логика выбора товаров:
  // Если есть buyNowItem — создаем массив из него.
  // Иначе — берем из корзины Redux.
  const cartItems = buyNowItem
    ? [
        {
          id: buyNowItem.id,
          qty: buyNowItem.qty || 1, // Убедимся, что количество передается
          // Можно добавить price, если StripePaymentForm его использует для отображения,
          // но для API обычно нужны только ID и Qty
        },
      ]
    : cart?.cartItems?.map((item) => ({
        id: item.id,
        qty: item.cartQuantity || item.qty || 1,
      })) || [];

  return (
    <div className="checkout-container">
      <StripePaymentForm cartItems={cartItems} deliveryInfo={deliveryInfo} />
    </div>
  );
}