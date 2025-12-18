import {
  useStripe,
  useElements,
  CardNumberElement,
} from "@stripe/react-stripe-js";
import { useState, useEffect, useRef, useMemo } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import "./StripePaymentForm.css";

// Импорт компонентов
import SelectDeliveryMethod from "../../Pages/ShippingInfo/components/selectDeliveryMethod/SelectDeliveryMethod";
import SelectedCartItem from "../SelectedCartItem/SelectedCartItem";
import PaymentMethods from "./PaymentMethods/PaymentMethods";
import PaymentFooter from "./PaymentFooter";
import Drawer, { DrawerTrigger, DrawerContent } from "../Drawer/Drawer";

const StripePaymentForm = ({ cartItems: propCartItems, deliveryInfo }) => {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  const location = useLocation();
  const { token } = useSelector((state) => state.auth);

  // --- ЛОГИКА ОПРЕДЕЛЕНИЯ ТОВАРОВ ДЛЯ ПОКУПКИ ---
  const itemsToPurchase = useMemo(() => {
    if (location.state?.buyNowItem) {
      return [location.state.buyNowItem];
    }
    return propCartItems;
  }, [location.state, propCartItems]);
  // ----------------------------------------------

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
      total: {
        label: "Total (incl. delivery)",
        amount: amount,
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

        const { error } = await stripe.confirmCardPayment(
          clientSecret,
          {
            payment_method: ev.paymentMethod.id,
          },
          { handleActions: false }
        );

        if (error) {
          ev.complete("fail");
          console.error("Google Pay confirm error:", error);
        } else {
          ev.complete("success");
          if (pi.orderToken) {
            window.location.href = `${window.location.origin}/checkout-success?orderToken=${pi.orderToken}`;
          }
        }
      } catch (err) {
        console.error("Google Pay processing failed:", err);
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
        paymentRequest.update({
          total: {
            label: "Total (incl. delivery)",
            amount: newAmount,
          },
        });
      }
    }
  }, [itemsToPurchase, paymentRequest]);

  // --- ИСПРАВЛЕННАЯ ФУНКЦИЯ ---
  const getOrCreatePaymentIntent = async () => {
    if (paymentIntentRef.current) return paymentIntentRef.current;

    if (creatingPIRef.current) {
      while (creatingPIRef.current) await new Promise((r) => setTimeout(r, 50));
      return paymentIntentRef.current;
    }

    creatingPIRef.current = true;
    try {
      // 1. Создаем конфигурацию заголовков
      const config = {};
      
      // 2. Добавляем Authorization ТОЛЬКО если токен существует
      if (token) {
        config.headers = { Authorization: `Bearer ${token}` };
      }

      const { data } = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/stripe/create-payment-intent`,
        {
          cartItems: itemsToPurchase,
          deliveryInfo: formData,
        },
        config // 3. Передаем конфиг (с заголовком или без)
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
  // -----------------------------

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
            return_url: `${window.location.origin}/checkout-success?orderToken=${orderToken}`,
          },
        });
        if (error) throw error;
      } else if (selected === "card") {
        const cardElement = elements.getElement(CardNumberElement);
        if (!cardElement) throw new Error("Card element not found");

        const { error } = await stripe.confirmCardPayment(
          clientSecret,
          {
            payment_method: {
              card: cardElement,
              billing_details: {
                name: `${formData.name} ${formData.surname}`,
                email: formData.email,
                phone: formData.phone,
              },
            },
            return_url: `${window.location.origin}/checkout-success?orderToken=${orderToken}`,
          }
        );

        if (error) {
          setPaymentError(`Payment failed: ${error.message}`);
          throw error;
        } else {
          window.location.href = `${window.location.origin}/checkout-success?orderToken=${orderToken}`;
        }
      }
    } catch (err) {
      console.error("Payment submission error:", err);
      // Если ошибка связана с авторизацией, можно вывести конкретное сообщение
      if (err.response && (err.response.status === 401 || err.response.status === 403)) {
         setPaymentError("Session expired or unauthorized. Please refresh or login.");
      } else if (!err.message?.includes("abort")) {
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
      {paymentError && (
        <div className="payment-error-message">❌ {paymentError}</div>
      )}

      <div className="stripe-layout">
        <div className="stripe-left">
          <SelectedCartItem />
          <SelectDeliveryMethod
            onSelectDelivery={setSelectedDelivery}
            formData={formData}
            handleChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                [e.target.name]: e.target.value,
              }))
            }
          />

          {!isDesktop && (
            <div className="mobile-sticky-footer">
              <button
                type="button"
                className="mobile-pay-trigger"
                onClick={handleDrawerOpen}
              >
                Proceed to Payment
              </button>
            </div>
          )}

          {!isDesktop && (
            <Drawer
              open={drawerOpen && userInitiated}
              onOpenChange={handleDrawerClose}
              dragState={dragState}
            >
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
               
              </DrawerContent>
              <div className="drawer-footer">
              <PaymentFooter
                  selected={selected}
                  paymentRequest={paymentRequest}
                  blikCode={blikCode}
                  canMakePaymentResult={canMakePaymentResult}
                  disabled={isCreating || isSubmitting}
                />
              </div>
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