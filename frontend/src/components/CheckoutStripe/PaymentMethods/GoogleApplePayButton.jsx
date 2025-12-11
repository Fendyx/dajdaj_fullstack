import { PaymentRequestButtonElement } from "@stripe/react-stripe-js";
import { useEffect, useState, useMemo } from "react";

const GoogleApplePayButton = ({ paymentRequest }) => {
  const [canPay, setCanPay] = useState(null);

  useEffect(() => {
    if (!paymentRequest) return;

    paymentRequest.canMakePayment().then((result) => {
      setCanPay(!!result);
    });
  }, [paymentRequest]);

  // Мемоизация options критична для предотвращения схлопывания в 1px
  const options = useMemo(() => ({
    paymentRequest,
    style: {
      paymentRequestButton: {
        type: "default",
        theme: "light",
        height: "48px",
      },
    },
  }), [paymentRequest]);

  if (!paymentRequest || !canPay) return null;

  return (
    <div style={{ width: "100%", height: "48px", marginTop: "10px" }}>
      <PaymentRequestButtonElement options={options} />
    </div>
  );
};

export default GoogleApplePayButton;