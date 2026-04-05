// frontend/src/pages/Checkout/CheckoutPage.tsx
import { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { useAppSelector } from "@/store/hooks";
import { useTrack } from '@/hooks/useTrack';
import { useDeliveryForm } from "@/features/checkout/hooks/useDeliveryForm";
import { useStripePayment } from "@/features/checkout/hooks/useStripePayment";
import { usePaymentRequest } from "@/features/checkout/hooks/usePaymentRequest";
import { useCheckoutTotal } from "@/features/checkout/hooks/useCheckoutTotal";
import { DeliverySection } from "@/features/checkout/components/DeliverySection/DeliverySection";
import { PaymentMethods } from "@/features/checkout/components/PaymentSection/PaymentMethods";
import { PaymentFooter } from "@/features/checkout/components/OrderSummary/PaymentFooter";
import { SelectedCartItem } from "@/features/checkout/components/OrderSummary/SelectedCartItem";
import "./CheckoutPage.css";

export function CheckoutPage() {
  const location = useLocation();
  const auth = useAppSelector((state) => state.auth);
  const cart = useAppSelector((state) => state.cart);

  const itemsToPurchase = location.state?.buyNowItem
    ? [{ ...location.state.buyNowItem, qty: location.state.buyNowItem.cartQuantity || 1 }]
    : cart.cartItems;

  const [selectedMethod, setSelectedMethod] = useState("card");
  const [blikCode, setBlikCode] = useState("");
  const [cardData, setCardData] = useState({ number: false, expiry: false, cvc: false });

  const handleCardFieldChange =
    (field: "number" | "expiry" | "cvc") => (event: any) => {
      setCardData((prev) => ({ ...prev, [field]: event.complete }));
    };

  const { formData, handleInputChange, hasNoDeliveryProfile } = useDeliveryForm(
    auth.token,
    auth.email,
    (auth as any).name
  );

  const { totalCents, subtotalPLN, deliveryPLN, totalPLN, isFreeDelivery } =
    useCheckoutTotal(itemsToPurchase, formData.method);

  const { handlePaymentSubmit, setupWalletPayment, paymentError, isProcessing } =
    useStripePayment(itemsToPurchase, formData, auth.token, hasNoDeliveryProfile);

  // ── Apple Pay / Google Pay detection ─────────────────
  const { paymentRequest, canMakePaymentResult } = usePaymentRequest(totalCents);
  const track = useTrack();

  function useTrackOnce(event: string, meta?: Record<string, unknown>) {
    const trackedRef = useRef(false);
    const track = useTrack();
    
    useEffect(() => {
      if (trackedRef.current) return;
      trackedRef.current = true;
      track(event, meta);
    }, [event, meta, track]);
  }

  useTrackOnce('checkout_start');

  // Авто-выбор кошелька если доступен
  useEffect(() => {
    if (!canMakePaymentResult) return;
    if (canMakePaymentResult.applePay) setSelectedMethod("apple_pay");
    else if (canMakePaymentResult.googlePay) setSelectedMethod("google_pay");
  }, [canMakePaymentResult]);

  // Подключаем listener для wallet-платежей
  useEffect(() => {
    if (!paymentRequest) return;
    setupWalletPayment(paymentRequest);
  }, [paymentRequest]); // eslint-disable-line

  const onSubmit = (e: React.FormEvent | React.MouseEvent) => {
    e.preventDefault();
    handlePaymentSubmit(selectedMethod, blikCode);
  };

  return (
    <div className="checkout-page">
      <form onSubmit={onSubmit} className="checkout-form">

        {/* ── LEFT COLUMN ─────────────────────────────── */}
        <div className="checkout-col checkout-col--left">
          {paymentError && <div className="checkout-error">❌ {paymentError}</div>}
          <SelectedCartItem items={itemsToPurchase} />
          <DeliverySection
            token={auth.token}
            formData={formData as any}
            onChange={handleInputChange}
          />
        </div>

        {/* ── RIGHT COLUMN ────────────────────────────── */}
        <div className="checkout-col checkout-col--right">
          <PaymentMethods
            selected={selectedMethod}
            onSelect={setSelectedMethod}
            blikCode={blikCode}
            setBlikCode={setBlikCode}
            handleCardFieldChange={handleCardFieldChange}
            canMakePaymentResult={canMakePaymentResult}
          />

          <div className="checkout-summary">
            <div className="checkout-summary__row">
              <span>Products</span>
              <span>{subtotalPLN.toFixed(2)} PLN</span>
            </div>
            <div className="checkout-summary__row">
              <span>Delivery</span>
              <span className={isFreeDelivery ? "checkout-summary__free" : ""}>
                {isFreeDelivery ? "Free" : `${deliveryPLN.toFixed(2)} PLN`}
              </span>
            </div>
            <div className="checkout-summary__row checkout-summary__row--total">
              <span>Total</span>
              <span>{totalPLN.toFixed(2)} PLN</span>
            </div>
          </div>

          <PaymentFooter
            selected={selectedMethod}
            paymentRequest={paymentRequest}
            amount={totalCents}
            disabled={isProcessing}
            onSubmit={onSubmit}
          />
        </div>

      </form>
    </div>
  );
}