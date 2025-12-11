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

  // --- 1. ПРАВИЛЬНЫЙ ПОДСЧЕТ ЦЕНЫ ---
  const calculateTotalAmount = () => {
    // Защита: если корзины нет
    if (!cartItems || !Array.isArray(cartItems)) return 0;

    const itemsTotal = cartItems.reduce((sum, item) => {
      // Защита: превращаем строки в числа и берем 0 если что-то не так
      const price = Number(item.price) || 0;
      // Внимание: используем cartQuantity (как в вашем Redux), а не qty
      const qty = Number(item.cartQuantity) || 0;
      return sum + (price * qty);
    }, 0);

    // Доставка
    const deliveryCost = 9.99;
    const total = itemsTotal + deliveryCost;

    // Stripe принимает сумму в грошах (целое число), поэтому * 100
    const totalInCents = Math.round(total * 100);

    // Лог для проверки в консоли
    // console.log("💰 Calculated Total for Stripe:", totalInCents, "cents");
    
    return isNaN(totalInCents) ? 0 : totalInCents;
  };

  // --- 2. ИНИЦИАЛИЗАЦИЯ ЗАПРОСА ---
  useEffect(() => {
    if (!stripe) return;

    const amount = calculateTotalAmount();
    // Не создаем кнопку, если сумма 0 (это вызывает ошибку NaN)
    if (amount <= 0) return;

    const pr = stripe.paymentRequest({
      country: "PL",
      currency: "pln",
      total: { 
        label: "Total (incl. delivery)", // Красивая надпись в Google Pay
        amount: amount 
      },
      requestPayerName: true,
      requestPayerEmail: true,
    });

    pr.canMakePayment().then((result) => {
      setCanMakePaymentResult(result);
      if (result) {
        setPaymentRequest(pr);
      }
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

        const { error } = await stripe.confirmCardPayment(clientSecret, {
          payment_method: ev.paymentMethod.id,
        }, { handleActions: false }); 

        if (error) {
          ev.complete("fail");
          console.error("❌ Google Pay confirm error:", error);
        } else {
          ev.complete("success");
          if (pi.orderToken) {
             window.location.href = `${window.location.origin}/checkout-success?orderToken=${pi.orderToken}`;
          }
        }
      } catch (err) {
        console.error("❌ Google Pay processing failed:", err);
        ev.complete("fail");
      } finally {
        submittingRef.current = false;
      }
    });

  }, [stripe]); // Запускается 1 раз при старте

  // --- 3. ОБНОВЛЕНИЕ ЦЕНЫ В GOOGLE PAY ПРИ ИЗМЕНЕНИИ КОРЗИНЫ ---
  // Вот этого, скорее всего, не хватало или оно не срабатывало
  useEffect(() => {
    if (paymentRequest) {
      const newAmount = calculateTotalAmount();
      
      if (newAmount > 0) {
        console.log("🔄 Updating Google Pay price to:", newAmount);
        paymentRequest.update({
          total: {
            label: "Total (incl. delivery)",
            amount: newAmount,
          },
        });
      }
    }
  }, [cartItems, paymentRequest]); // Срабатывает каждый раз, когда меняется корзина


  const getOrCreatePaymentIntent = async () => {
    if (paymentIntentRef.current) return paymentIntentRef.current;
    
    if (creatingPIRef.current) {
      while (creatingPIRef.current) await new Promise((r) => setTimeout(r, 50));
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
      return data;
    } catch (err) {
      paymentIntentRef.current = null;
      throw err;
    } finally {
      creatingPIRef.current = false;
    }
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

  const handleDrawerOpen = () => {
    setUserInitiated(true);
    setDrawerOpen(true);
  };
  
  const handleDrawerClose = () => {
    setUserInitiated(false);
    setDrawerOpen(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setPaymentError("");

    if (submittingRef.current) return;
    submittingRef.current = true;

    try {
      const pi = await getOrCreatePaymentIntent();
      const { clientSecret, orderToken } = pi;

      if (selected === "blik") {
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
        if (!cardElement) throw new Error("Card element not found");

        const { error } = await stripe.confirmCardPayment(clientSecret, {
          payment_method: {
            card: cardElement,
            billing_details: {
              name: `${formData.name} ${formData.surname}`,
              email: formData.email,
              phone: formData.phone,
            },
          },
          return_url: `${window.location.origin}/checkout-success?orderToken=${orderToken}`,
        });

        if (error) {
          setPaymentError(`Payment failed: ${error.message}`);
          throw error;
        }
      }
    } catch (err) {
      console.error("❌ Payment submission error:", err);
      if (!err.message?.includes("abort")) {
        setPaymentError(err.message || "Payment failed. Please try again.");
      }
    } finally {
      submittingRef.current = false;
    }
  };

  const isCreating = creatingPIRef.current;
  const isSubmitting = submittingRef.current;

  return (
    <form id="payment-form" onSubmit={handleSubmit} className="stripe-form">
      {paymentError && <div className="payment-error-message">❌ {paymentError}</div>}
      
      <div className="stripe-layout">
        
        <div className="stripe-left">
          <SelectedCartItem />
          
          <SelectDeliveryMethod
            onSelectDelivery={setSelectedDelivery}
            formData={formData}
            handleChange={(e) => setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }))}
          />
          
          {!isDesktop && (
             <div className="mobile-sticky-footer">
               <button type="button" className="mobile-pay-trigger" onClick={handleDrawerOpen}>
                  Proceed to Payment
               </button>
             </div>
          )}

          {!isDesktop && (
            <Drawer open={drawerOpen && userInitiated} onOpenChange={handleDrawerClose} dragState={dragState}>
              <DrawerContent className="stripe-drawer-content">
                <PaymentMethods
                  selected={selected} setSelected={setSelected}
                  paymentRequest={paymentRequest}
                  blikCode={blikCode} setBlikCode={setBlikCode}
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
          )}
        </div>

        {isDesktop && (
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
            
            <PaymentFooter
              selected={selected}
              paymentRequest={paymentRequest}
              blikCode={blikCode}
              canMakePaymentResult={canMakePaymentResult}
              disabled={isCreating || isSubmitting}
            />
          </div>
        )}
      </div>
    </form>
  );
};

export default StripePaymentForm;