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

// RTK Query
import { useGetUserProfileQuery } from "../../slices/userApi";

// Импорт компонентов
import SelectedCartItem from "../SelectedCartItem/SelectedCartItem";
import PaymentMethods from "./PaymentMethods/PaymentMethods";
import PaymentFooter from "./PaymentFooter";
import { getOrderFromDB } from "../../utils/db"; 

// --- НОВЫЕ КОМПОНЕНТЫ ---
import { UserCard } from "../UserProfile/components/UserCard/UserCard";
import { DeliverySelectorModal } from "./DeliverySelectorModal"; 

const StripePaymentForm = ({ cartItems: propCartItems, deliveryInfo }) => {
  const stripe = useStripe();
  const elements = useElements();
  const location = useLocation();
  const auth = useSelector((state) => state.auth);
  const token = auth.token || localStorage.getItem("token");

  // 1. Загружаем профиль пользователя (если есть токен)
  const { data: userProfile } = useGetUserProfileQuery(undefined, { skip: !token });

  // 2. Состояние для Модалки и Выбранной карты
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProfileCard, setSelectedProfileCard] = useState(null);

  // 3. Данные формы (Они отправляются в Stripe)
  const [formData, setFormData] = useState({
    name: deliveryInfo?.name || "",
    surname: deliveryInfo?.surname || "",
    email: deliveryInfo?.email || "",
    phone: deliveryInfo?.phone || "",
    address: deliveryInfo?.address || "",
    method: deliveryInfo?.method || "",
  });

  // 4. Эффект: При загрузке профиля ставим дефолтную карту
  useEffect(() => {
    if (userProfile && !selectedProfileCard) {
        const mainDelivery = userProfile.deliveryDatas?.[0];
        const initialCard = mainDelivery 
            ? { ...userProfile, ...mainDelivery.personalData, delivery: mainDelivery.delivery, type: 'main' }
            : { ...userProfile, delivery: { address: "No address", method: "—" }, personalData: { name: userProfile.name, email: userProfile.email }, type: 'main' };
        
        setSelectedProfileCard(initialCard);
    }
  }, [userProfile, selectedProfileCard]);

  // 5. ГЛАВНОЕ: Синхронизация Выбранной карты с formData
  // Как только меняется selectedProfileCard -> обновляем formData
  useEffect(() => {
    if (selectedProfileCard && selectedProfileCard.type !== 'new') {
        setFormData({
            name: selectedProfileCard.personalData?.name || selectedProfileCard.name || "",
            surname: selectedProfileCard.personalData?.surname || selectedProfileCard.surname || "",
            email: selectedProfileCard.personalData?.email || selectedProfileCard.email || "",
            phone: selectedProfileCard.personalData?.phone || selectedProfileCard.phone || "",
            address: selectedProfileCard.delivery?.address || "",
            method: selectedProfileCard.delivery?.method || "Standard", // Дефолт, если пусто
        });
    } else if (selectedProfileCard?.type === 'new') {
        // Если выбрали "New", очищаем, но оставляем email аккаунта если есть
        setFormData({ 
            name: "", 
            surname: "", 
            email: auth.email || "", 
            phone: "", 
            address: "", 
            method: "" 
        });
    }
  }, [selectedProfileCard, auth.email]);

  // Обычный обработчик ввода для ручного режима
  const handleInputChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // --- ЛОГИКА ОПЛАТЫ (Взята из твоего рабочего файла) ---
  
  const itemsToPurchase = useMemo(() => {
    if (location.state?.buyNowItem) {
      return [location.state.buyNowItem];
    }
    return propCartItems;
  }, [location.state, propCartItems]);

  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1052);
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
    setCardFields((prev) => ({ ...prev, [fieldName]: { ...prev[fieldName], focused: true } }));
  };

  const handleCardFieldBlur = (fieldName) => () => {
    setCardFields((prev) => ({ ...prev, [fieldName]: { ...prev[fieldName], focused: false } }));
  };

  const handleCardFieldChange = (fieldName) => (event) => {
    setCardFields((prev) => ({
      ...prev,
      [fieldName]: { ...prev[fieldName], complete: event.complete, error: event.error },
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
      if (submittingRef.current) { ev.complete("fail"); return; }
      submittingRef.current = true;
      try {
        const pi = await getOrCreatePaymentIntent();
        const { clientSecret } = pi;
        const { error } = await stripe.confirmCardPayment(clientSecret, { payment_method: ev.paymentMethod.id }, { handleActions: false });
        if (error) { ev.complete("fail"); } 
        else {
          ev.complete("success");
          if (pi.orderToken) window.location.href = `${window.location.origin}/checkout-success?orderToken=${pi.orderToken}`;
        }
      } catch (err) { ev.complete("fail"); } 
      finally { submittingRef.current = false; }
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
      // ВАЖНО: Здесь мы передаем formData (который обновился из Галереи или инпутов)
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

  // Обработчик выбора из модалки
  const handleSelectFromModal = (cardData) => {
    if (cardData.type === 'new') {
        setSelectedProfileCard(null); 
    } else {
        setSelectedProfileCard(cardData);
    }
  };

  return (
    <form id="payment-form" onSubmit={handleSubmit} className="stripe-form">
      {paymentError && (
        <div className="payment-error-message">❌ {paymentError}</div>
      )}

      <div className="stripe-layout">
        {/* ЛЕВАЯ КОЛОНКА */}
        <div className="stripe-left">
          <SelectedCartItem />
          
          {/* БЛОК ДОСТАВКИ (Новый дизайн) */}
          <div className="delivery-section-container" style={{ margin: '20px 0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                <h3>Delivery Details</h3>
                {token && (
                    <button 
                        type="button" 
                        onClick={() => setIsModalOpen(true)}
                        style={{ background: 'transparent', border: '1px solid #ccc', borderRadius: '15px', padding: '5px 15px', cursor: 'pointer' }}
                    >
                        Change
                    </button>
                )}
            </div>

            {/* ВАРИАНТ 1: ПОЛЬЗОВАТЕЛЬ ЗАЛОГИНЕН И ВЫБРАЛ ПРОФИЛЬ */}
            {token && selectedProfileCard ? (
                <div className="selected-card-preview fade-in">
                    <UserCard 
                        profile={selectedProfileCard} 
                        hideActions={true} 
                        style={{ margin: 0, width: '100%', maxWidth: '100%' }}
                    />
                </div>
            ) : (
            /* ВАРИАНТ 2: ГОСТЬ ИЛИ РУЧНОЙ ВВОД */
                <div className="manual-address-fields fade-in">
                     <p style={{fontSize: '0.9rem', color: '#666', marginBottom: '10px'}}>
                        {token ? "Enter details for new recipient:" : "Please fill in delivery details:"}
                     </p>
                    <div className="input-row">
                        <input name="name" placeholder="Name" value={formData.name} onChange={handleInputChange} required className="stripe-input" />
                        <input name="surname" placeholder="Surname" value={formData.surname} onChange={handleInputChange} required className="stripe-input" />
                    </div>
                    <input name="email" type="email" placeholder="Email" value={formData.email} onChange={handleInputChange} required className="stripe-input" />
                    <input name="phone" placeholder="Phone" value={formData.phone} onChange={handleInputChange} required className="stripe-input" />
                    <input name="address" placeholder="Address (Street, House, Zip)" value={formData.address} onChange={handleInputChange} required className="stripe-input" />
                    
                    <select name="method" value={formData.method} onChange={handleInputChange} className="stripe-input" required>
                        <option value="" disabled>Select Delivery Method</option>
                        <option value="Standard">Standard Delivery</option>
                        <option value="Express">Express Delivery</option>
                        <option value="InPost">InPost Locker</option>
                    </select>
                </div>
            )}
          </div>

          {!isDesktop && (
             <div className="inline-payment-methods mobile-methods">
                <h3>Payment Method</h3>
                <PaymentMethods {...paymentMethodsProps} />
             </div>
          )}
        </div>

        {/* ПРАВАЯ КОЛОНКА */}
        {isDesktop && (
          <div className="stripe-right">
             <div className="desktop-sticky-summary">
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

      {/* МОДАЛКА */}
      {token && (
          <DeliverySelectorModal 
            isOpen={isModalOpen} 
            onClose={() => setIsModalOpen(false)} 
            profiles={userProfile ? [userProfile] : []}
            onSelect={handleSelectFromModal}
          />
      )}
    </form>
  );
};

export default StripePaymentForm;