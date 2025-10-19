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
import PaymentFooter from "./PaymentFooter"
import { FaCreditCard } from "react-icons/fa";

import Drawer, { DrawerTrigger, DrawerContent } from "../Drawer/Drawer";

const StripePaymentForm = ({ cartItems, deliveryInfo }) => {
  const stripe = useStripe();
  const elements = useElements();
  const { token } = useSelector((state) => state.auth);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [dragState, setDragState] = useState({ dragging: false, translateY: 0 });
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

  const cardExpiryRef = useRef(null);
  const cardCvcRef = useRef(null);

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

  // PaymentRequest для Google/Apple Pay
  useEffect(() => {
    if (stripe) {
      const totalAmount = cartItems.reduce(
        (sum, item) => sum + item.qty * 1000,
        0
      );

      const pr = stripe.paymentRequest({
        country: "PL",
        currency: "pln",
        total: {
          label: "Total",
          amount: totalAmount,
        },
        requestPayerName: true,
        requestPayerEmail: true,
      });

      pr.canMakePayment().then((result) => {
        setCanMakePaymentResult(result);
        if (result) {
          setPaymentRequest(pr);

          pr.on("paymentmethod", async (ev) => {
            try {
              const { data } = await axios.post(
                `${process.env.REACT_APP_API_URL}/api/stripe/create-payment-intent`,
                { cartItems, deliveryInfo: formData },
                { headers: { Authorization: `Bearer ${token}` } }
              );

              const clientSecret = data?.clientSecret;
              if (!clientSecret) return ev.complete("fail");

              const { error } = await stripe.confirmCardPayment(clientSecret, {
                payment_method: ev.paymentMethod.id,
                return_url: `${window.location.origin}/checkout-success`,
              });

              if (error) ev.complete("fail");
              else ev.complete("success");
            } catch (err) {
              ev.complete("fail");
            }
          });
        }
      });
    }
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

    if (event.complete) {
      if (fieldName === "expiry") cardCvcRef.current?.focus();
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

    let clientSecret;
    try {
      const { data } = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/stripe/create-payment-intent`,
        { cartItems, deliveryInfo: formData },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      clientSecret = data?.clientSecret;
      if (!clientSecret) return;
    } catch (err) {
      return;
    }

    if (selected === "blik") {
      try {
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
      } catch (err) {}
    }

    if (selected === "card") {
      const cardElement = elements.getElement(CardNumberElement);
      if (!cardElement) return;

      try {
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
      } catch (err) {}
    }
  };

  return (
    <form onSubmit={handleSubmit} className="stripe-form">
      <div className="stripe-layout">
        <div className="stripe-left">
          <SelectedCartItem />
          <SelectDeliveryMethod
            onSelectDelivery={setSelectedDelivery}
            formData={formData}
            handleChange={(e) =>
              setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }))
            }
          />

        {/* DrawerTrigger с обработчиком dragState */}
        <DrawerTrigger
            open={drawerOpen}
            onClick={() => setDrawerOpen(true)}
            onDragState={setDragState}
          >
            {/* <div className="drawer-trigger-summary">
              <span>Change delivery information</span>
            </div> */}
          </DrawerTrigger>


          {/* Сам Drawer */}
          <Drawer open={drawerOpen} 
            onOpenChange={setDrawerOpen}
            dragState={dragState}>
            <DrawerContent className="stripe-drawer-content">
              <h2 className="text-lg font-semibold mb-4">Choose Payment Method</h2>
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
            canMakePaymentResult={canMakePaymentResult}
          />
            </DrawerContent>
          </Drawer>
        </div>
      </div>
    </form>
  );
};

export default StripePaymentForm;
