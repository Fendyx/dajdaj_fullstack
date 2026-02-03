import {
  useStripe,
  useElements,
  CardNumberElement,
} from "@stripe/react-stripe-js";
import { useState, useEffect, useRef, useMemo } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import { useLocation } from "react-router-dom";
import "./StripePaymentForm.css";

// Импорт компонентов
import SelectDeliveryMethod from "../../Pages/ShippingInfo/components/selectDeliveryMethod/SelectDeliveryMethod";
import SelectedCartItem from "../SelectedCartItem/SelectedCartItem";
import PaymentMethods from "./PaymentMethods/PaymentMethods";
import PaymentFooter from "./PaymentFooter";
import { getOrderFromDB } from "../../utils/db"; 

const StripePaymentForm = ({ cartItems: propCartItems, deliveryInfo }) => {
  const stripe = useStripe();
  const elements = useElements();
  const location = useLocation();
  const auth = useSelector((state) => state.auth);
  const token = auth.token || localStorage.getItem("token");

  // Определение товаров
  const itemsToPurchase = useMemo(() => {
    if (location.state?.buyNowItem) {
      return [location.state.buyNowItem];
    }
    return propCartItems;
  }, [location.state, propCartItems]);

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

  const [formData, setFormData] = useState({
    name: deliveryInfo?.name || "",
    surname: deliveryInfo?.surname || "",
    email: deliveryInfo?.email || "",
    phone: deliveryInfo?.phone || "",
    address: deliveryInfo?.address || "",
    method: deliveryInfo?.method || "",
  });

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

  const calculateTotalAmount = () => {
    if (!itemsToPurchase || !Array.isArray(itemsToPurchase)) return 0;
    const itemsTotal = itemsToPurchase.reduce((sum, item) => {
      const price = Number(item.price) || 0;
      const qty = Number(item.cartQuantity) || 0;
      return sum + (price * qty);
    }, 0);
    const deliveryCost = 9.99;
    const total = itemsTotal + deliveryCost;
    const totalInCents = Math.round(total * 100);
    return isNaN(totalInCents) ? 0 : totalInCents;
  };

  useEffect(() => {
    if (!stripe) return;
    const amount = calculateTotalAmount();
    if (amount <= 0) return;

    const pr = stripe.paymentRequest({
      country: "PL",
      currency: "pln",
      total: { label: "Total (incl. delivery)", amount: amount },
      requestPayerName: true,
      requestPayerEmail: true,
    });

    pr.canMakePayment().then((result) => {
      setCanMakePaymentResult(result);
      if (result) setPaymentRequest(pr);
    });

    pr.on("paymentmethod", async (ev) => {
      if (submittingRef.current) {
        ev.complete("fail");
        return;
      }
      submittingRef.current = true;
      try {
        const pi = await getOrCreatePaymentIntent();
        const { clientSecret } = pi;
        const { error } = await stripe.confirmCardPayment(clientSecret, { payment_method: ev.paymentMethod.id }, { handleActions: false });
        if (error) {
          ev.complete("fail");
        } else {
          ev.complete("success");
          if (pi.orderToken) window.location.href = `${window.location.origin}/checkout-success?orderToken=${pi.orderToken}`;
        }
      } catch (err) {
        ev.complete("fail");
      } finally {
        submittingRef.current = false;
      }
    });
  }, [stripe, itemsToPurchase]);

  useEffect(() => {
    if (paymentRequest) {
      const newAmount = calculateTotalAmount();
      if (newAmount > 0) {
        paymentRequest.update({ total: { label: "Total (incl. delivery)", amount: newAmount } });
      }
    }
  }, [itemsToPurchase, paymentRequest]);

  const getOrCreatePaymentIntent = async () => {
    if (paymentIntentRef.current) return paymentIntentRef.current;
    if (creatingPIRef.current) {
      while (creatingPIRef.current) await new Promise((r) => setTimeout(r, 50));
      return paymentIntentRef.current;
    }
    creatingPIRef.current = true;
    try {
      const processedItems = await Promise.all(
        itemsToPurchase.map(async (item) => {
          if (item.tempStorageId) {
             const heavyData = await getOrderFromDB(item.tempStorageId);
             if (!heavyData) return item;
             const uploadResponse = await axios.post(`${process.env.REACT_APP_API_URL}/api/personal-orders`, { inscription: heavyData.inscription, images: heavyData.images });
             return { ...item, personalOrderId: uploadResponse.data.orderId };
          }
          return item;
        })
      );
      const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
      const { data } = await axios.post(`${process.env.REACT_APP_API_URL}/api/stripe/create-payment-intent`, { cartItems: processedItems, deliveryInfo: formData }, config);
      paymentIntentRef.current = data;
      return data;
    } catch (err) {
      paymentIntentRef.current = null;
      throw err;
    } finally {
      creatingPIRef.current = false;
    }
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setPaymentError("");
    if (submittingRef.current) return;
    submittingRef.current = true;

    try {
      const pi = await getOrCreatePaymentIntent();
      const { clientSecret, orderToken } = pi;
      const returnUrl = `${window.location.origin}/checkout-success?orderToken=${orderToken}`;

      if (selected === "blik") {
         const { error } = await stripe.confirmPayment({
          clientSecret,
          confirmParams: {
            payment_method_data: { type: "blik", billing_details: { name: `${formData.name} ${formData.surname}`, email: formData.email, phone: formData.phone } },
            payment_method_options: { blik: { code: blikCode } },
            return_url: returnUrl,
          },
        });
        if (error) throw error;
      } else if (selected === "card") {
        const cardElement = elements.getElement(CardNumberElement);
        if (!cardElement) throw new Error("Card element not found");
        const { error } = await stripe.confirmCardPayment(clientSecret, {
            payment_method: { card: cardElement, billing_details: { name: `${formData.name} ${formData.surname}`, email: formData.email, phone: formData.phone } },
            return_url: returnUrl,
          }
        );
        if (error) throw error;
        else window.location.href = returnUrl;
      } else if (selected === "p24" || selected === "klarna") {
        const { error } = await stripe.confirmPayment({
          clientSecret,
          confirmParams: {
            payment_method_data: { type: selected, billing_details: { name: `${formData.name} ${formData.surname}`, email: formData.email, address: { country: 'PL' } } },
            return_url: returnUrl,
          },
        });
        if (error) throw error;
      }
    } catch (err) {
      if (!err.message?.includes("abort")) setPaymentError(err.message || "Payment failed");
    } finally {
      submittingRef.current = false;
    }
  };

  const isProcessing = creatingPIRef.current || submittingRef.current;
  const totalAmount = calculateTotalAmount();

  // Выносим пропсы для PaymentMethods, чтобы не дублировать код
  const paymentMethodsProps = {
    selected,
    setSelected,
    paymentRequest,
    blikCode,
    setBlikCode,
    cardFields,
    handleCardFieldChange,
    handleCardFieldFocus,
    handleCardFieldBlur,
    canMakePaymentResult
  };

  return (
    <form id="payment-form" onSubmit={handleSubmit} className="stripe-form">
      {paymentError && (
        <div className="payment-error-message">❌ {paymentError}</div>
      )}

      <div className="stripe-layout">
        {/* ЛЕВАЯ КОЛОНКА: Товары + Доставка */}
        <div className="stripe-left">
          <SelectedCartItem />
          
          <SelectDeliveryMethod
            onSelectDelivery={setSelectedDelivery}
            formData={formData}
            handleChange={(e) =>
              setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }))
            }
          />

          {/* ВАЖНОЕ ИЗМЕНЕНИЕ: 
             Если это МОБИЛКА (!isDesktop), методы оплаты показываем здесь (слева/снизу)
          */}
          {!isDesktop && (
             <div className="inline-payment-methods mobile-methods">
                <h3>Payment Method</h3>
                <PaymentMethods {...paymentMethodsProps} />
             </div>
          )}
        </div>

        {/* ПРАВАЯ КОЛОНКА (Десктоп): Методы оплаты + Кнопка */}
        {isDesktop && (
          <div className="stripe-right">
             <div className="desktop-sticky-summary">
                {/* ВАЖНОЕ ИЗМЕНЕНИЕ: 
                   Если это ДЕСКТОП, методы оплаты показываем здесь (справа)
                */}
                <div className="inline-payment-methods desktop-methods">
                  <h3>Payment Method</h3>
                  <PaymentMethods {...paymentMethodsProps} />
                </div>

                <PaymentFooter
                  isDesktop={true}
                  selected={selected}
                  paymentRequest={paymentRequest}
                  onSubmit={handleSubmit}
                  amount={totalAmount}
                  disabled={isProcessing}
                />
             </div>
          </div>
        )}
      </div>

      {/* МОБИЛЬНЫЙ ФУТЕР (Только кнопка) */}
      {!isDesktop && (
        <PaymentFooter
          isDesktop={false}
          selected={selected}
          paymentRequest={paymentRequest}
          onSubmit={handleSubmit}
          amount={totalAmount}
          disabled={isProcessing}
        />
      )}
    </form>
  );
};

export default StripePaymentForm;