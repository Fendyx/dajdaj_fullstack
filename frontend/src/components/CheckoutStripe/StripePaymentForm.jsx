import {
  useStripe,
  useElements,
  CardNumberElement,
} from "@stripe/react-stripe-js";
import { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import "./StripePaymentForm.css";
import SelectDeliveryMethod from "../../Pages/ShippingInfo/components/selectDeliveryMethod/SelectDeliveryMethod";
import SelectedCartItem from "../SelectedCartItem/SelectedCartItem";
import PaymentMethods from "./PaymentMethods/PaymentMethods";
import PaymentFooter from "./PaymentFooter";
import Drawer, { DrawerTrigger, DrawerContent } from "../Drawer/Drawer";

const StripePaymentForm = ({ cartItems, deliveryInfo }) => {
  const stripe = useStripe();
  const elements = useElements();
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

  const [cardFields, setCardFields] = useState({
    number: { complete: false, focused: false },
    expiry: { complete: false, focused: false },
    cvc: { complete: false, focused: false },
  });

  const cardCvcRef = useRef(null);
  const paymentIntentRef = useRef(null); // 👈 сюда кэшируем PaymentIntent

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

  // ✅ Универсальная функция: создаёт PaymentIntent только один раз
  const getOrCreatePaymentIntent = async () => {
    if (paymentIntentRef.current) {
      console.log("💾 Reusing existing clientSecret");
      return paymentIntentRef.current;
    }

    try {
      console.log("🧾 Creating new payment intent...");
      const { data } = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/stripe/create-payment-intent`,
        { cartItems, deliveryInfo: formData },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      paymentIntentRef.current = data;
      return data;
    } catch (err) {
      console.error("❌ Failed to create PaymentIntent:", err.response?.data || err.message);
      throw err;
    }
  };

  // Google/Apple Pay
  useEffect(() => {
    if (!stripe) return;

    const totalAmount = cartItems.reduce(
      (sum, item) => sum + item.qty * 1000,
      0
    );

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
        try {
          const { clientSecret } = await getOrCreatePaymentIntent();

          const { error } = await stripe.confirmCardPayment(clientSecret, {
            payment_method: ev.paymentMethod.id,
            return_url: `${window.location.origin}/checkout-success`,
          });

          if (error) ev.complete("fail");
          else ev.complete("success");
        } catch (err) {
          console.error("❌ PaymentRequest failed:", err);
          ev.complete("fail");
        }
      });
    });
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

  // ✅ Отправка платежа
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const { clientSecret } = await getOrCreatePaymentIntent();

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
            return_url: `${window.location.origin}/checkout-success`,
          },
        });
      }

      if (selected === "card") {
        const cardElement = elements.getElement(CardNumberElement);
        if (!cardElement) return;

        await stripe.confirmCardPayment(clientSecret, {
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
      }
    } catch (err) {
      console.error("❌ handleSubmit error:", err);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="stripe-form">
      <div className="stripe-layout">
        {isDesktop ? (
          <>
            {/* Левая часть */}
            <div className="stripe-left">
              <SelectedCartItem />
              <SelectDeliveryMethod
                onSelectDelivery={setSelectedDelivery}
                formData={formData}
                handleChange={(e) =>
                  setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }))
                }
              />
            </div>

            {/* Правая часть */}
            <div className="stripe-right">
            <PaymentMethods
              selected={selected}
              setSelected={setSelected}
              paymentRequest={paymentRequest}
              blikCode={blikCode}
              setBlikCode={setBlikCode}
              cardFields={cardFields}
              handleCardFieldChange={handleCardFieldChange}
              handleCardFieldFocus={handleCardFieldFocus}   // ✅ обязательно
              handleCardFieldBlur={handleCardFieldBlur}     // ✅ обязательно
              formData={formData}
              cartItems={cartItems}
              stripe={stripe}
              elements={elements}
              canMakePaymentResult={canMakePaymentResult}
            />
            </div>
          </>
        ) : (
          <>
            {/* Мобильная версия */}
            <div className="stripe-left">
              <SelectedCartItem />
              <SelectDeliveryMethod
                onSelectDelivery={setSelectedDelivery}
                formData={formData}
                handleChange={(e) =>
                  setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }))
                }
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
                  handleCardFieldFocus={handleCardFieldFocus}   // ✅ обязательно
                  handleCardFieldBlur={handleCardFieldBlur}     // ✅ обязательно
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
                    canMakePaymentResult={canMakePaymentResult}
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
        />
      )}
    </form>
  );
};

export default StripePaymentForm;
