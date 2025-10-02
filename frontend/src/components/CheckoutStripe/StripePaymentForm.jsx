import {
  useStripe,
  useElements,
  PaymentRequestButtonElement,
  CardNumberElement,
} from "@stripe/react-stripe-js";
import { useState, useEffect, useRef } from "react"; // Добавлен useRef
import axios from "axios";
import { 
  FaCreditCard,
  FaGoogle,
  FaApple,
  FaBolt
} from "react-icons/fa";
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

  // Refs для автоматического перехода между полями
  const cardNumberRef = useRef(null);
  const cardExpiryRef = useRef(null);
  const cardCvcRef = useRef(null);

  const [formData, setFormData] = useState({
    userId: deliveryInfo?.userId || "",
    name: deliveryInfo?.name || "",
    surname: deliveryInfo?.surname || "",
    email: deliveryInfo?.email || "",
    phone: deliveryInfo?.phone || "",
    address: deliveryInfo?.address || "",
    method: deliveryInfo?.method || "",
  });

  // 🔥 Стейт выбранной доставки
  const [selectedDelivery, setSelectedDelivery] = useState(deliveryInfo || null);

  // Когда пользователь выбирает доставку — обновляем formData
  useEffect(() => {
    if (selectedDelivery) {
      setFormData({
        userId: selectedDelivery?.userId || "",
        name: selectedDelivery?.personalData?.name || "",
        surname: selectedDelivery?.personalData?.surname || "",
        email: selectedDelivery?.personalData?.email || "",
        phone: selectedDelivery?.personalData?.phone || "",
        address: selectedDelivery?.delivery?.address || "",
        method: selectedDelivery?.delivery?.method || "",
      });
    }
  }, [selectedDelivery]);

  const [paymentRequest, setPaymentRequest] = useState(null);
  const [blikCode, setBlikCode] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);
  const [selected, setSelected] = useState("card");

  // Состояния для отслеживания заполнения карточных полей
  const [cardFields, setCardFields] = useState({
    number: { complete: false, focused: false },
    expiry: { complete: false, focused: false },
    cvc: { complete: false, focused: false }
  });

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
        if (result) {  
          setPaymentRequest(pr);  
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

  // Обработчик изменения состояния карточных полей
  const handleCardFieldChange = (fieldName) => (event) => {
    setCardFields(prev => ({
      ...prev,
      [fieldName]: {
        ...prev[fieldName],
        complete: event.complete,
        error: event.error
      }
    }));

    // Автоматический переход на следующее поле при полном заполнении
    if (event.complete) {
      switch (fieldName) {
        case 'number':
          cardExpiryRef.current?.focus();
          break;
        case 'expiry':
          cardCvcRef.current?.focus();
          break;
        default:
          break;
      }
    }
  };

  // Обработчики фокуса
  const handleCardFieldFocus = (fieldName) => () => {
    setCardFields(prev => ({
      ...prev,
      [fieldName]: { ...prev[fieldName], focused: true }
    }));
  };

  const handleCardFieldBlur = (fieldName) => () => {
    setCardFields(prev => ({
      ...prev,
      [fieldName]: { ...prev[fieldName], focused: false }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    const { data } = await axios.post("/api/stripe/create-payment-intent", {
      cartItems,
      userId: formData.userId,
      deliveryInfo: formData,
    });
  
    if (selected === "blik") {
      const { error } = await stripe.confirmPayment({
        clientSecret: data.clientSecret,
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
      }
    }
  
    if (selected === "card") {
      const cardElement = elements.getElement(CardNumberElement);
      const { error, paymentIntent } = await stripe.confirmCardPayment(data.clientSecret, {
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
        console.log("✅ Card payment succeeded!");
      }
    }
  };
  

  return (
    <form onSubmit={handleSubmit} className="stripe-form">
       <SelectedCartItem />

      {/* Personal Information */}
      {/* <PersonalInformationForm
        formData={formData}
        handleChange={handleChange}
        isExpanded={isExpanded}
        setIsExpanded={setIsExpanded}
      /> */}

      <SelectDeliveryMethod 
        onSelectDelivery={setSelectedDelivery} 
        formData={formData} 
        handleChange={handleChange}
      />


      {/* Вынесенный блок оплаты */}
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