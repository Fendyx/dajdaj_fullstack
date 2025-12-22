import React from "react";
import "./PaymentMethods.css"; 

const BlikPayment = ({ blikCode, setBlikCode }) => {
  return (
    <div className="pm-blik-wrapper">
      <label htmlFor="blikCode" className="pm-input-label">
        BLIK Code (6 digits)
      </label>
      <input
        id="blikCode"
        type="text"
        inputMode="numeric"
        placeholder="000 000"
        value={blikCode}
        onChange={(e) => {
          const val = e.target.value.replace(/\D/g, "");
          setBlikCode(val);
        }}
        maxLength={6}
        autoComplete="one-time-code"
        required
      />
      <p className="pm-input-hint">
        Open your banking app to generate the code.
      </p>
    </div>
  );
};

export default BlikPayment;