import { FaBolt } from "react-icons/fa";

const BlikPayment = ({ blikCode, setBlikCode }) => {
  return (
    <div className="stripe-card-form">
      <div className="stripe-form-group">
        <label htmlFor="blikCode" className="stripe-label-with-icon">
          <FaBolt className="stripe-icon" />
          Enter BLIK code
        </label>
        <input
          id="blikCode"
          placeholder="123456"
          value={blikCode}
          onChange={(e) => setBlikCode(e.target.value)}
          maxLength={6}
          pattern="\d{6}"
          required
        />
      </div>
    </div>
  );
};

export default BlikPayment;
