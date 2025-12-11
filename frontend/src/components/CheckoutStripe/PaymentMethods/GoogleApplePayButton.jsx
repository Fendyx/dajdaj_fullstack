import { PaymentRequestButtonElement } from "@stripe/react-stripe-js";
import { useEffect, useState, useMemo } from "react"; // 1. Добавили useMemo
import "./PaymentMethods.css";

const GoogleApplePayButton = ({ paymentRequest }) => {
  const [canPay, setCanPay] = useState(null);

  useEffect(() => {
    if (!paymentRequest) return;

    paymentRequest.canMakePayment().then((result) => {
      setCanPay(!!result);
    });
  }, [paymentRequest]);

  // 2. ВАЖНО: Мемоизируем настройки (options). 
  // Это предотвращает бесконечную перерисовку кнопки, из-за которой она схлопывается.
  const options = useMemo(() => ({
    paymentRequest,
    style: {
      paymentRequestButton: {
        type: "default",
        theme: "light",
        height: "48px", // Высота задается здесь
      },
    },
  }), [paymentRequest]);

  // Если paymentRequest нет или платить нельзя — не рендерим ничего
  if (!paymentRequest || !canPay) return null;

  return (
    <div style={{ width: "100%", marginTop: "10px" }}>
      {/* 3. Передаем стабильный объект options */}
      <PaymentRequestButtonElement options={options} />
    </div>
  );
};

export default GoogleApplePayButton;