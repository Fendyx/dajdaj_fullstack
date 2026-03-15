import { useState, useEffect, useMemo } from "react";
import { PaymentRequestButtonElement } from "@stripe/react-stripe-js";
import { type PaymentRequest } from "@stripe/stripe-js";
import "./PaymentMethods.css";

interface GoogleApplePayButtonProps {
  paymentRequest: PaymentRequest | null;
}

export const GoogleApplePayButton = ({ paymentRequest }: GoogleApplePayButtonProps) => {
  const [canPay, setCanPay] = useState<boolean>(false);

  useEffect(() => {
    if (!paymentRequest) return;
    paymentRequest.canMakePayment().then((result) => {
      setCanPay(!!result);
    });
  }, [paymentRequest]);

  // Memoized options — prevents the element collapsing to 1px on re-render
  const options = useMemo(
    () => ({
      paymentRequest: paymentRequest as PaymentRequest,
      style: {
        paymentRequestButton: {
          type: "default" as const,
          theme: "light" as const,
          height: "48px",
        },
      },
    }),
    [paymentRequest]
  );

  if (!paymentRequest || !canPay) return null;

  return (
    <div className="pm-express-btn">
      <PaymentRequestButtonElement options={options} />
    </div>
  );
};