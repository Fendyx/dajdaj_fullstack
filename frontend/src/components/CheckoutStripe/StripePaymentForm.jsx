import {
  useStripe,
  useElements,
  CardNumberElement,
} from "@stripe/react-stripe-js";
import { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./StripePaymentForm.css";
import SelectDeliveryMethod from "../../Pages/ShippingInfo/components/selectDeliveryMethod/SelectDeliveryMethod";
import SelectedCartItem from "../SelectedCartItem/SelectedCartItem";
import PaymentMethods from "./PaymentMethods/PaymentMethods";
import PaymentFooter from "./PaymentFooter";
import Drawer, { DrawerTrigger, DrawerContent } from "../Drawer/Drawer";

const StripePaymentForm = ({ cartItems, deliveryInfo }) => {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  const { token } = useSelector((state) => state.auth);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [userInitiated, setUserInitiated] = useState(false);
  const [dragState, setDragState] = useState({ dragging: false, translateY: 0 });
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1052);
  const [selectedDelivery, setSelectedDelivery] = useState(deliveryInfo || null);
  const [paymentRequest, setPaymentRequest] = useState(null);
  const [canMakePaymentResult, setCanMakePaymentResult] = useState(null);
  const [blikCode, setBlikCode] = useState("");
  const [selected, setSelected] = useState("card");
  const [paymentError, setPaymentError] = useState("");

  const [cardFields, setCardFields] = useState({
    number: { complete: false, focused: false },
    expiry: { complete: false, focused: false },
    cvc: { complete: false, focused: false },
  });

  const cardCvcRef = useRef(null);
  const paymentIntentRef = useRef(null);
  const creatingPIRef = useRef(false);
  const submittingRef = useRef(false);

  const handleCardFieldFocus = (fieldName) => () => {
    setCardFields((prev) => ({
      ...prev,
      [fieldName]: { ...prev[fieldName], focused: true },
    }));
  };
  
  const handleCardFieldBlur = (fieldName) => () => {
    setCardFields((prev) => ({
      ...prev,
      [fieldName]: { ...prev[fieldName], focused: false },
    }));
  };

  // данные формы
  const [formData, setFormData] = useState({
    name: deliveryInfo?.name || "",
    surname: deliveryInfo?.surname || "",
    email: deliveryInfo?.email || "",
    phone: deliveryInfo?.phone || "",
    address: deliveryInfo?.address || "",
    method: deliveryInfo?.method || "",
  });

  useEffect(() => {
    const mediaQuery = window.matchMedia("(min-width: 1052px)");
    const handleResize = (e) => setIsDesktop(e.matches);
    handleResize(mediaQuery);
    mediaQuery.addEventListener("change", handleResize);
    return () => mediaQuery.removeEventListener("change", handleResize);
  }, []);

  useEffect(() => {
    if (selectedDelivery) {
      setFormData({
        name: selectedDelivery?.personalData?.name || "",
        surname: selectedDelivery?.personalData?.surname || "",
        email: selectedDelivery?.personalData?.email || "",
        phone: selectedDelivery?.personalData?.phone || "",
        address: selectedDelivery?.delivery?.address || "",
        method: selectedDelivery?.delivery?.method || "",
      });
    }
  }, [selectedDelivery]);

  // Блокирующая, идемпотентная функция: создаёт PaymentIntent только один раз
  const getOrCreatePaymentIntent = async () => {
    if (paymentIntentRef.current) {
      return paymentIntentRef.current;
    }
    
    if (creatingPIRef.current) {
      while (creatingPIRef.current) {
        await new Promise((r) => setTimeout(r, 50));
      }
      return paymentIntentRef.current;
    }

    creatingPIRef.current = true;
    try {
      const { data } = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/stripe/create-payment-intent`,
        { cartItems, deliveryInfo: formData },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      paymentIntentRef.current = data;
      
      if (data.reused) {
        console.log("🔄 Reusing existing payment intent and order");
      } else {
        console.log("🆕 Created new payment intent and order");
      }
      
      return data;
    } catch (err) {
      paymentIntentRef.current = null;
      throw err;
    } finally {
      creatingPIRef.current = false;
    }
  };

  // Google/Apple Pay (Payment Request)
  useEffect(() => {
    if (!stripe) return;

    const totalAmount = cartItems.reduce((sum, item) => sum + item.qty * 1000, 0);

    const pr = stripe.paymentRequest({
      country: "PL",
      currency: "pln",
      total: { label: "Total", amount: totalAmount },
      requestPayerName: true,
      requestPayerEmail: true,
    });

    pr.canMakePayment().then((result) => {
      setCanMakePaymentResult(result);
      if (!result) return;

      setPaymentRequest(pr);

      pr.on("paymentmethod", async (ev) => {
        if (submittingRef.current) {
          ev.complete("fail");
          return;
        }
        submittingRef.current = true;
        try {
          const pi = await getOrCreatePaymentIntent();
          const { clientSecret } = pi;

          const { error } = await stripe.confirmCardPayment(clientSecret, {
            payment_method: ev.paymentMethod.id,
            return_url: `${window.location.origin}/checkout-success?orderToken=${paymentIntentRef.current?.orderToken}`,
          });

          if (error) {
            ev.complete("fail");
            console.error("❌ PaymentRequest confirm error:", error);
          } else {
            ev.complete("success");
          }
        } catch (err) {
          console.error("❌ PaymentRequest failed:", err);
          ev.complete("fail");
        } finally {
          submittingRef.current = false;
        }
      });
    });

    return () => {
      try {
        pr.destroy && pr.destroy();
      } catch (e) {
        // ignore
      }
    };
  }, [stripe, cartItems, formData, token]);

  const handleCardFieldChange = (fieldName) => (event) => {
    setCardFields((prev) => ({
      ...prev,
      [fieldName]: {
        ...prev[fieldName],
        complete: event.complete,
        error: event.error,
      },
    }));

    if (event.complete && fieldName === "expiry") cardCvcRef.current?.focus();
  };

  const handleDrawerOpen = () => {
    setUserInitiated(true);
    setDrawerOpen(true);
  };
  
  const handleDrawerClose = () => {
    setUserInitiated(false);
    setDrawerOpen(false);
  };

  // 🔥 ИСПРАВЛЕННАЯ ФУНКЦИЯ ОПЛАТЫ
  const handleSubmit = async (e) => {
    e.preventDefault();
    setPaymentError("");

    if (submittingRef.current) return;
    submittingRef.current = true;

    try {
      const pi = await getOrCreatePaymentIntent();
      const { clientSecret, orderToken } = pi;

      console.log("🔄 Starting payment with:", { 
        selected, 
        orderToken
      });

      if (selected === "blik") {
        // BLIK логика (работает)
        await stripe.confirmPayment({
          clientSecret,
          confirmParams: {
            payment_method_data: {
              type: "blik",
              billing_details: {
                name: `${formData.name} ${formData.surname}`,
                email: formData.email,
                phone: formData.phone,
              },
            },
            payment_method_options: {
              blik: { code: blikCode },
            },
            return_url: `${window.location.origin}/checkout-success?orderToken=${orderToken}`,
          },
        });

      } else if (selected === "card") {
        const cardElement = elements.getElement(CardNumberElement);
        if (!cardElement) {
          throw new Error("Card element not found");
        }

        console.log("💳 Confirming card payment...");

        // 🔥 ИСПРАВЛЕННЫЙ ВЫЗОВ - убраны confirmParams
        const { error } = await stripe.confirmCardPayment(clientSecret, {
          payment_method: {
            card: cardElement,
            billing_details: {
              name: `${formData.name} ${formData.surname}`,
              email: formData.email,
              phone: formData.phone,
            },
          },
          // 🔥 return_url должен быть на верхнем уровне
          return_url: `${window.location.origin}/checkout-success?orderToken=${orderToken}`,
        });

        if (error) {
          console.error("❌ Card payment failed:", error);
          setPaymentError(`Payment failed: ${error.message}`);
          throw error;
        }

        console.log("✅ Card payment processing completed");
        // Stripe автоматически перенаправит на return_url при необходимости
      }
    } catch (err) {
      console.error("❌ Payment submission error:", err);
      if (!err.message.includes("abort")) {
        setPaymentError(err.message || "Payment failed. Please try again.");
      }
    } finally {
      submittingRef.current = false;
    }
  };

  const isCreating = creatingPIRef.current;
  const isSubmitting = submittingRef.current;

  return (
    <form onSubmit={handleSubmit} className="stripe-form">
      {paymentError && (
        <div className="payment-error-message">
          ❌ {paymentError}
        </div>
      )}
      
      <div className="stripe-layout">
        {isDesktop ? (
          <>
            <div className="stripe-left">
              <SelectedCartItem />
              <SelectDeliveryMethod
                onSelectDelivery={setSelectedDelivery}
                formData={formData}
                handleChange={(e) => setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }))}
              />
            </div>
            <div className="stripe-right">
              <PaymentMethods
                selected={selected}
                setSelected={setSelected}
                paymentRequest={paymentRequest}
                blikCode={blikCode}
                setBlikCode={setBlikCode}
                cardFields={cardFields}
                handleCardFieldChange={handleCardFieldChange}
                handleCardFieldFocus={handleCardFieldFocus}
                handleCardFieldBlur={handleCardFieldBlur}
                canMakePaymentResult={canMakePaymentResult}
              />
            </div>
          </>
        ) : (
          <>
            <div className="stripe-left">
              <SelectedCartItem />
              <SelectDeliveryMethod
                onSelectDelivery={setSelectedDelivery}
                formData={formData}
                handleChange={(e) => setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }))}
              />

              <DrawerTrigger open={drawerOpen} onClick={handleDrawerOpen} onDragState={setDragState} />
              <Drawer open={drawerOpen && userInitiated} onOpenChange={handleDrawerClose} dragState={dragState}>
                <DrawerContent className="stripe-drawer-content">
                  <PaymentMethods
                    selected={selected}
                    setSelected={setSelected}
                    paymentRequest={paymentRequest}
                    blikCode={blikCode}
                    setBlikCode={setBlikCode}
                    cardFields={cardFields}
                    handleCardFieldChange={handleCardFieldChange}
                    handleCardFieldFocus={handleCardFieldFocus}
                    handleCardFieldBlur={handleCardFieldBlur}
                    canMakePaymentResult={canMakePaymentResult}
                  />
                  <PaymentFooter
                    selected={selected}
                    paymentRequest={paymentRequest}
                    blikCode={blikCode}
                    canMakePaymentResult={canMakePaymentResult}
                    disabled={isCreating || isSubmitting}
                  />
                </DrawerContent>
              </Drawer>
            </div>
          </>
        )}
      </div>

      {isDesktop && (
        <PaymentFooter
          selected={selected}
          paymentRequest={paymentRequest}
          blikCode={blikCode}
          canMakePaymentResult={canMakePaymentResult}
          disabled={isCreating || isSubmitting}
        />
      )}
    </form>
  );
};

export default StripePaymentForm;