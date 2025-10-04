import { PaymentRequestButtonElement } from "@stripe/react-stripe-js";
import { useEffect, useState } from "react";

const GoogleApplePayButton = ({ paymentRequest }) => {
  const [canPay, setCanPay] = useState(null);

  useEffect(() => {
    if (!paymentRequest) return;

    paymentRequest.canMakePayment().then((result) => {
      console.log("🔍 canMakePayment result:", result);
      setCanPay(result);
    });
  }, [paymentRequest]);

  useEffect(() => {
    console.log("🧪 Checking canMakePayment...");
  }, [paymentRequest]);
  

  if (!canPay) return null;

  return (
    <div className="stripe-payment-request-wrapper">
      <PaymentRequestButtonElement
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
