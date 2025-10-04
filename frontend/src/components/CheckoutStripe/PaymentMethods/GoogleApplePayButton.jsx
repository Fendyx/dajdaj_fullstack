import { PaymentRequestButtonElement } from "@stripe/react-stripe-js";
import { useEffect, useState } from "react";

const GoogleApplePayButton = ({ paymentRequest }) => {
  const [canPay, setCanPay] = useState(null);
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    if (!paymentRequest) return;

    console.log("🧪 Checking canMakePayment...");
    paymentRequest.canMakePayment().then((result) => {
      console.log("🔍 canMakePayment result:", result);
      setCanPay(result);
      setShouldRender(!!result);
    });
  }, [paymentRequest]);

  if (!shouldRender || !canPay) return null;

  return (
    <div className="stripe-payment-request-wrapper">
      {/* ✅ Создаётся один раз, не пересоздаётся */}
      <PaymentRequestButtonElement
        key="payment-request-button"
        options={{ paymentRequest }}
        style={{
          paymentRequestButton: {
            type: "default",
            theme: "light",
            height: "44px",
          },
        }}
      />
    </div>
  );
};

export default GoogleApplePayButton;
