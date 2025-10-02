import { PaymentRequestButtonElement } from "@stripe/react-stripe-js";

const GoogleApplePayButton = ({ paymentRequest }) => {
  if (!paymentRequest) return null;

  return (
    <div className="stripe-payment-request-wrapper">
      <PaymentRequestButtonElement
        options={{ paymentRequest }}
        style={{
          paymentRequestButton: {
            type: "default",
            theme: "light",
            height: "44px",
          },
        }}
      />
    </div>
  );
};

export default GoogleApplePayButton;
