import {
  useStripe,
  useElements,
  CardNumberElement,
} from "@stripe/react-stripe-js";
import { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import "./StripePaymentForm.css";
import SelectDeliveryMethod from "../../Pages/Checkout/components/selectDeliveryMethod/SelectDeliveryMethod";
import SelectedCartItem from "../SelectedCartItem/SelectedCartItem";
import CardPayment from "./PaymentMethods/CardPayment";
import BlikPayment from "./PaymentMethods/BlikPayment";
import GoogleApplePayButton from "./PaymentMethods/GoogleApplePayButton";
import PersonalInformationForm from "./PersonalInformationForm";
import PaymentMethods from "./PaymentMethods/PaymentMethods";
import PaymentFooter from "./PaymentFooter";

const StripePaymentForm = ({ cartItems, deliveryInfo }) => {
  const stripe = useStripe();
  const elements = useElements();
  const { token } = useSelector((state) => state.auth);

  const cardNumberRef = useRef(null);
  const cardExpiryRef = useRef(null);
  const cardCvcRef = useRef(null);

  const [formData, setFormData] = useState({
    name: deliveryInfo?.name || "",
    surname: deliveryInfo?.surname || "",
    email: deliveryInfo?.email || "",
    phone: deliveryInfo?.phone || "",
    address: deliveryInfo?.address || "",
    method: deliveryInfo?.method || "",
  });

  const [selectedDelivery, setSelectedDelivery] = useState(deliveryInfo || null);
  const [paymentRequest, setPaymentRequest] = useState(null);
  const [canMakePaymentResult, setCanMakePaymentResult] = useState(null);
  const [blikCode, setBlikCode] = useState("");
  const [selected, setSelected] = useState("card");

  const [cardFields, setCardFields] = useState({
    number: { complete: false, focused: false },
    expiry: { complete: false, focused: false },
    cvc: { complete: false, focused: false },
  });

  useEffect(() => {
    console.log("🌍 Current URL:", window.location.href);
    console.log("📦 Stripe loaded:", !!stripe);
    console.log("🧮 Cart total:", cartItems.reduce((sum, item) => sum + item.qty * 1000, 0));
  }, [stripe, cartItems]);

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

  useEffect(() => {
    if (stripe) {
      const pr = stripe.paymentRequest({
        country: "PL",
        currency: "pln",
        total: {
          label: "Total",
          amount: Math.round(
            cartItems.reduce((sum, item) => sum + item.qty * 1000, 0)
          ),
        },
        requestPayerName: true,
        requestPayerEmail: true,
      });

      pr.canMakePayment().then((result) => {
        console.log("🔍 canMakePayment result:", result);
        setCanMakePaymentResult(result);

        if (result) {
          setPaymentRequest(pr);

          pr.on("paymentmethod", async (ev) => {
            console.log("🧾 Received paymentmethod event:", ev.paymentMethod);
            console.log("📤 Billing details:", ev.paymentMethod.billing_details);

            try {
              const { data } = await axios.post(
                `${process.env.REACT_APP_API_URL}/api/stripe/create-payment-intent`,
                {
                  cartItems,
                  deliveryInfo: formData,
                },
                {
                  headers: {
                    Authorization: `Bearer ${token}`,
                  },
                }
              );

              const clientSecret = data?.clientSecret;
              console.log("🔑 Received clientSecret:", clientSecret);

              if (!clientSecret) {
                console.error("❌ No clientSecret received");
                ev.complete("fail");
                return;
              }

              const { error, paymentIntent } = await stripe.confirmPayment({
                clientSecret,
                confirmParams: {
                  payment_method_data: {
                    type: "card",
                    card: ev.paymentMethod.card,
                    billing_details: ev.paymentMethod.billing_details,
                  },
                  return_url: `${window.location.origin}/checkout-success`,
                },
              });

              console.log("📦 confirmPayment result:", { error, paymentIntent });

              if (error) {
                console.error("❌ Google/Apple Pay failed:", error.message);
                ev.complete("fail");
              } else {
                console.log("✅ Google/Apple Pay succeeded:", paymentIntent?.id);
                ev.complete("success");
              }
            } catch (err) {
              console.error("❌ Google/Apple Pay error:", err.message);
              ev.complete("fail");
            }
          });
        } else {
          console.warn("⚠️ PaymentRequest not available on this device/browser");
        }
      });
    }
  }, [stripe, cartItems]);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleCardFieldChange = (fieldName) => (event) => {
    setCardFields((prev) => ({
      ...prev,
      [fieldName]: {
        ...prev[fieldName],
        complete: event.complete,
        error: event.error,
      },
    }));

    if (event.complete) {
      switch (fieldName) {
        case "number":
          cardExpiryRef.current?.focus();
          break;
        case "expiry":
          cardCvcRef.current?.focus();
          break;
        default:
          break;
      }
    }
  };

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

  const handleSubmit = async (e) => {
    e.preventDefault();

    console.log("🧾 Starting payment submission...");
    console.log("🛒 Cart items:", cartItems);
    console.log("📦 Delivery info:", formData);
    console.log("💳 Selected method:", selected);

    let clientSecret;

    try {
      const { data } = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/stripe/create-payment-intent`,
        {
          cartItems,
          deliveryInfo: formData,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      clientSecret = data?.clientSecret;
      console.log("🎯 Received clientSecret:", clientSecret);

      if (!clientSecret) {
        console.error("❌ No clientSecret received from backend");
        return;
      }
    } catch (err) {
      console.error("❌ Error creating payment intent:", err.response?.data || err.message);
      return;
    }

    if (selected === "blik") {
      console.log("⚡ Attempting BLIK payment with code:", blikCode);

      try {
        const { error } = await stripe.confirmPayment({
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
            return_url: `${window.location.origin}/checkout-success`,
          },
        });

        if (error) {
          console.error("❌ BLIK payment failed:", error.message);
        } else {
          console.log("✅ BLIK payment confirmed");
        }
      } catch (err) {
        console.error("❌ BLIK payment error:", err.message);
      }
    }

    if (selected === "card") {
      console.log("💳 Attempting card payment...");

      const cardElement = elements.getElement(CardNumberElement);
      if (!cardElement) {
        console.error("❌ CardNumberElement not found");
        return;
      }

      try {
        const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
          payment_method: {
            card: cardElement,
            billing_details: {
              name: `${formData.name} ${formData.surname}`,
              email: formData.email,
              phone: formData.phone,
            },
          },
          return_url: `${window.location.origin}/checkout-success`,
        });

        if (error) {
          console.error("❌ Card payment failed:", error.message);
        } else if (paymentIntent?.status === "succeeded") {
          console.log("✅ Card payment succeeded:", paymentIntent.id);
        } else {
          console.warn("⚠️ Card payment status:", paymentIntent?.status);
        }
      } catch (err) {
        console.error("❌ Card payment error:", err.message);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="stripe-form">
      <SelectedCartItem />

      <SelectDeliveryMethod
        onSelectDelivery={setSelectedDelivery}
        formData={formData}
        handleChange={handleChange}
      />

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
        formData={formData}
        cartItems={cartItems}
        stripe={stripe}
        elements={elements}
        canMakePaymentResult={canMakePaymentResult}
      />

      <PaymentFooter
        selected={selected}
        paymentRequest={paymentRequest}
        blikCode={blikCode}
      />
    </form>
  );
};

export default StripePaymentForm;
