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

  // ✅ Stripe элемент создаётся один раз, не пересоздаётся
  return shouldRender && canPay ? (
    <div className="stripe-payment-request-wrapper">
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
  ) : null;
};

export default GoogleApplePayButton;
