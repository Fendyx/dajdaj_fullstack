import { PaymentRequestButtonElement } from "@stripe/react-stripe-js";
import { useEffect, useState } from "react";
import "./PaymentMethods.css"; // Подключаем новый файл стилей

const GoogleApplePayButton = ({ paymentRequest }) => {
  const [canPay, setCanPay] = useState(null);
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    if (!paymentRequest) return;

    paymentRequest.canMakePayment().then((result) => {
      setCanPay(result);
      setShouldRender(!!result);
    });
  }, [paymentRequest]);

  if (!shouldRender || !canPay) return null;

  return (
    <div style={{ width: "100%", marginTop: "10px" }}>
      <PaymentRequestButtonElement
        options={{ paymentRequest }}
        style={{
          paymentRequestButton: {
            type: "default",
            theme: "light",
            height: "48px", // Чуть выше для удобства нажатия
          },
        }}
      />
    </div>
  );
};

export default GoogleApplePayButton;