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
  const location = useLocation(); // 1. Хук для получения данных из "Buy Now"
  const { token } = useSelector((state) => state.auth);

  // --- ЛОГИКА ОПРЕДЕЛЕНИЯ ТОВАРОВ ДЛЯ ПОКУПКИ ---
  // Если пришли через "Купить сейчас" (есть buyNowItem в state) — используем только его.
  // Иначе — используем корзину, переданную через пропсы (Redux).
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

  // Данные доставки
  const [selectedDelivery, setSelectedDelivery] = useState(deliveryInfo || null);

  // Данные для оплаты
  const [paymentRequest, setPaymentRequest] = useState(null);
  const [canMakePaymentResult, setCanMakePaymentResult] = useState(null);
  const [blikCode, setBlikCode] = useState("");
  const [selected, setSelected] = useState("card");
  const [paymentError, setPaymentError] = useState("");

  // Поля карты
  const [cardFields, setCardFields] = useState({
    number: { complete: false, focused: false },
    expiry: { complete: false, focused: false },
    cvc: { complete: false, focused: false },
  });

  const cardCvcRef = useRef(null);
  const paymentIntentRef = useRef(null);
  const creatingPIRef = useRef(false);
  const submittingRef = useRef(false);

  // Форма данных пользователя (заполняется из deliveryInfo)
  const [formData, setFormData] = useState({
    name: deliveryInfo?.name || "",
    surname: deliveryInfo?.surname || "",
    email: deliveryInfo?.email || "",
    phone: deliveryInfo?.phone || "",
    address: deliveryInfo?.address || "",
    method: deliveryInfo?.method || "",
  });

  // Хендлеры фокуса полей карты
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

  // Ресайз (Desktop/Mobile)
  useEffect(() => {
    const mediaQuery = window.matchMedia("(min-width: 1052px)");
    const handleResize = (e) => setIsDesktop(e.matches);
    handleResize(mediaQuery);
    mediaQuery.addEventListener("change", handleResize);
    return () => mediaQuery.removeEventListener("change", handleResize);
  }, []);

  // Синхронизация formData при выборе метода доставки
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

  // --- 2. РАСЧЕТ ИТОГОВОЙ СУММЫ (использует itemsToPurchase) ---
  const calculateTotalAmount = () => {
    if (!itemsToPurchase || !Array.isArray(itemsToPurchase)) return 0;

    const itemsTotal = itemsToPurchase.reduce((sum, item) => {
      const price = Number(item.price) || 0;
      // В PostersProductDetails мы задали cartQuantity: 1, здесь его читаем
      const qty = Number(item.cartQuantity) || 0;
      return sum + (price * qty);
    }, 0);

    const deliveryCost = 9.99;
    const total = itemsTotal + deliveryCost;

    // Stripe требует сумму в минимальных единицах валюты (гроши/центы)
    const totalInCents = Math.round(total * 100);

    return isNaN(totalInCents) ? 0 : totalInCents;
  };

  // --- 3. GOOGLE PAY / APPLE PAY (Payment Request) ---
  useEffect(() => {
    if (!stripe) return;

    const amount = calculateTotalAmount();
    // Если сумма 0, кнопку не создаем
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

    // Проверяем возможность оплаты (есть ли карта в браузере)
    pr.canMakePayment().then((result) => {
      setCanMakePaymentResult(result);
      if (result) {
        setPaymentRequest(pr);
      }
    });

    // Обработка оплаты через Google/Apple Pay
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
  }, [stripe, itemsToPurchase]); // Пересоздаем, если изменился список товаров

  // --- 4. ОБНОВЛЕНИЕ СУММЫ В GOOGLE PAY ---
  // Если товары изменились, обновляем ценник в уже открытом виджете (если поддерживается)
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

  // --- 5. СОЗДАНИЕ PAYMENT INTENT НА БЭКЕНДЕ ---
  const getOrCreatePaymentIntent = async () => {
    // Если уже есть intent, возвращаем его (чтобы не дублировать)
    if (paymentIntentRef.current) return paymentIntentRef.current;

    // Блокировка повторных вызовов
    if (creatingPIRef.current) {
      while (creatingPIRef.current) await new Promise((r) => setTimeout(r, 50));
      return paymentIntentRef.current;
    }

    creatingPIRef.current = true;
    try {
      const { data } = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/stripe/create-payment-intent`,
        {
          cartItems: itemsToPurchase, // <--- ВАЖНО: Отправляем правильный список (BuyNow или Корзина)
          deliveryInfo: formData,
        },
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
    // Автофокус на CVC после даты
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

  // --- SUBMIT ФОРМЫ (ОПЛАТА КАРТОЙ ИЛИ BLIK) ---
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
          // Успех -> Редирект
          window.location.href = `${window.location.origin}/checkout-success?orderToken=${orderToken}`;
        }
      }
    } catch (err) {
      console.error("Payment submission error:", err);
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
      {paymentError && (
        <div className="payment-error-message">❌ {paymentError}</div>
      )}

      <div className="stripe-layout">
        <div className="stripe-left">
          {/* SelectedCartItem теперь самодостаточен.
              Мы не передаем ему items={...}, он сам берет их из useLocation или Redux.
          */}
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