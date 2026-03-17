// frontend/src/features/checkout/hooks/usePaymentRequest.ts
import { useState, useEffect } from "react";
import { useStripe } from "@stripe/react-stripe-js";
import type { PaymentRequest, CanMakePaymentResult } from "@stripe/stripe-js";

export function usePaymentRequest(amountCents: number) {
  const stripe = useStripe();
  const [paymentRequest, setPaymentRequest] = useState<PaymentRequest | null>(null);
  const [canMakePaymentResult, setCanMakePaymentResult] = useState<CanMakePaymentResult | null>(null);

  useEffect(() => {
    if (!stripe || amountCents <= 0) return;

    const pr = stripe.paymentRequest({
      country: "PL",
      currency: "pln",
      total: { label: "Total", amount: amountCents },
      requestPayerName: true,
      requestPayerEmail: true,
      requestPayerPhone: true,
    });

    pr.canMakePayment().then((result) => {
      if (result) {
        setPaymentRequest(pr);
        setCanMakePaymentResult(result);
      }
    });
  }, [stripe, amountCents]);

  return { paymentRequest, canMakePaymentResult };
}