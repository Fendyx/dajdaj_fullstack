import { useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import StripePaymentForm from "./StripePaymentForm";
import "./CheckoutStripe.css";

export default function CheckoutStripe() {
  const location = useLocation();
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

  // ✅ ИСПРАВЛЕННАЯ ЛОГИКА
  // Мы должны передавать ВЕСЬ объект товара, чтобы не потерять tempStorageId
  const cartItems = buyNowItem
    ? [
        // Если это Buy Now, просто берем объект целиком, он уже правильный
        // (добавляем qty на всякий случай, если его там нет)
        { 
          ...buyNowItem, 
          qty: buyNowItem.cartQuantity || 1 
        }
      ]
    : cart?.cartItems?.map((item) => ({
        // Если из корзины — копируем ВСЕ поля (...item)
        // Это сохранит tempStorageId, originalId, price, name и т.д.
        ...item,
        qty: item.cartQuantity || 1,
      })) || [];

  return (
    <div className="checkout-container">
      <StripePaymentForm cartItems={cartItems} deliveryInfo={deliveryInfo} />
    </div>
  );
}