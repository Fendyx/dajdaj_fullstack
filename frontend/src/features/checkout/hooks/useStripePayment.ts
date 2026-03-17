// frontend/src/features/checkout/hooks/useStripePayment.ts
import { useState, useRef } from "react";
import { useStripe, useElements, CardNumberElement } from "@stripe/react-stripe-js";
import axios from "axios";
import { getOrderFromDB } from "@/utils/db";

export function useStripePayment(
  itemsToPurchase: any[],
  formData: any,
  token: string | null,
  hasNoDeliveryProfile?: boolean
) {
  const stripe = useStripe();
  const elements = useElements();
  const [paymentError, setPaymentError] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const paymentIntentRef = useRef<any>(null);

  const getOrCreatePaymentIntent = async () => {
    if (paymentIntentRef.current) return paymentIntentRef.current;

    const processedItems = await Promise.all(
      itemsToPurchase.map(async (item) => {
        if (item.personalization?.tempStorageId) {
          const heavyData = await getOrderFromDB(item.personalization.tempStorageId);
          if (!heavyData) return item;
          const uploadRes = await axios.post(
            `${import.meta.env.VITE_API_URL}/api/personal-orders`,
            { inscription: heavyData.inscription, images: heavyData.images }
          );
          return { ...item, personalOrderId: uploadRes.data.orderId };
        }
        return item;
      })
    );

    const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
    const { data } = await axios.post(
      `${import.meta.env.VITE_API_URL}/api/stripe/create-payment-intent`,
      { cartItems: processedItems, deliveryInfo: formData },
      config
    );

    paymentIntentRef.current = data;
    return data;
  };

  const saveDeliveryProfileIfNeeded = async () => {
    if (!token || !hasNoDeliveryProfile) return;
    try {
      const payload = {
        personalData: {
          name: formData.name || "",
          surname: formData.surname || "",
          email: formData.email || "",
          phone: formData.phone || "",
        },
        delivery: {
          address: [formData.address, formData.city, formData.postal_code]
            .filter(Boolean)
            .join(", "),
          method: formData.method || "inpost",
        },
      };
      await axios.post(
        `${import.meta.env.VITE_API_URL}/api/user/delivery`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (err: any) {
      console.error("[saveDelivery] FAILED:", err.response?.data || err.message);
    }
  };

  // ── Wallet (Apple Pay / Google Pay) ──────────────────
  const setupWalletPayment = (paymentRequest: any) => {
    paymentRequest.on("paymentmethod", async (ev: any) => {
      try {
        const pi = await getOrCreatePaymentIntent();
        const { clientSecret, orderToken } = pi;

        const { error, paymentIntent } = await stripe!.confirmCardPayment(
          clientSecret,
          { payment_method: ev.paymentMethod.id },
          { handleActions: false }
        );

        if (error) {
          ev.complete("fail");
          setPaymentError(error.message || "Payment failed");
          return;
        }

        ev.complete("success");

        if (paymentIntent.status === "requires_action") {
          await stripe!.confirmCardPayment(clientSecret);
        }

        await saveDeliveryProfileIfNeeded();
        const returnUrl = `${window.location.origin}/checkout-success?orderToken=${orderToken}`;
        window.location.href = returnUrl;
      } catch (err: any) {
        ev.complete("fail");
        setPaymentError(err.message || "Payment failed");
      }
    });
  };

  // ── Card / BLIK / P24 / Klarna ────────────────────────
  const handlePaymentSubmit = async (selectedMethod: string, blikCode?: string) => {
    if (!stripe || !elements || isProcessing) return;
    setIsProcessing(true);
    setPaymentError("");

    try {
      const pi = await getOrCreatePaymentIntent();
      const { clientSecret, orderToken } = pi;
      const returnUrl = `${window.location.origin}/checkout-success?orderToken=${orderToken}`;

      if (selectedMethod === "card") {
        const cardElement = elements.getElement(CardNumberElement);
        if (!cardElement) throw new Error("Card not found");

        const { error } = await stripe.confirmCardPayment(clientSecret, {
          payment_method: {
            card: cardElement,
            billing_details: {
              name: formData.name,
              email: formData.email,
              phone: formData.phone,
            },
          },
        });

        if (error) throw error;
        await saveDeliveryProfileIfNeeded();
        window.location.href = returnUrl;

      } else if (selectedMethod === "blik") {
        if (!blikCode || blikCode.length !== 6)
          throw new Error("Please enter a valid 6-digit BLIK code.");

        const { error } = await stripe.confirmBlikPayment(clientSecret, {
          payment_method: {
            blik: {},
            billing_details: { name: formData.name || "Guest", email: formData.email },
          },
          payment_method_options: { blik: { code: blikCode } },
          return_url: returnUrl,
        });

        if (error) throw error;
        await saveDeliveryProfileIfNeeded();
        window.location.href = returnUrl;
      }

    } catch (err: any) {
      setPaymentError(err.message || "Payment failed. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  return { handlePaymentSubmit, setupWalletPayment, paymentError, isProcessing };
}