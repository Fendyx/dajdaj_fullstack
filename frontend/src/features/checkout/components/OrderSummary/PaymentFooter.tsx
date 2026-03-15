import { PaymentRequestButtonElement } from "@stripe/react-stripe-js";
import { Lock, ShieldCheck } from "lucide-react";
import { type PaymentRequest } from "@stripe/stripe-js";
import "./PaymentFooter.css";

interface PaymentFooterProps {
  selected: string;
  paymentRequest?: PaymentRequest | null;
  onSubmit: (e: any) => void;
  amount: number;
  disabled?: boolean;
}

export const PaymentFooter = ({
  selected,
  paymentRequest,
  onSubmit,
  amount,
  disabled = false,
}: PaymentFooterProps) => {
  const isWalletPayment = selected === "google_apple_pay" && paymentRequest;
  const formattedPrice = (amount / 100).toFixed(2);

  return (
    <div className="pf-container">

      <div className="pf-total">
        <span className="pf-total__label">Total</span>
        <span className="pf-total__value">{formattedPrice} PLN</span>
      </div>

      <div className="pf-action">
        {isWalletPayment ? (
          <div className="pf-wallet">
            <PaymentRequestButtonElement
              options={{
                paymentRequest,
                style: {
                  paymentRequestButton: {
                    theme: "dark",
                    height: "48px",
                  },
                },
              }}
            />
          </div>
        ) : (
          <button
            type="button"
            className={`pf-btn${disabled ? " pf-btn--disabled" : ""}`}
            onClick={onSubmit}
            disabled={disabled}
          >
            {disabled ? (
              <span className="pf-btn__spinner" />
            ) : (
              <>
                <Lock size={15} />
                <span>Pay {formattedPrice} PLN</span>
              </>
            )}
          </button>
        )}
      </div>

      <div className="pf-security">
        <ShieldCheck size={13} />
        <span>Secure SSL Encrypted Payment</span>
      </div>

    </div>
  );
};