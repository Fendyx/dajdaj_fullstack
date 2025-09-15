import { useSelector } from "react-redux";
import "./UserCard.css";

export function UserCard() {
  const { name, email } = useSelector((state) => state.auth);
  
  const formattedName = name || "User Name";
  const formattedEmail = email || "user@example.com";
  
  const generateCardNumber = (email) => {
    if (!email) return "4532 1234 5678 0001";
    const hash = email.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    return `4532 ${Math.abs(hash % 9000) + 1000} ${Math.abs((hash * 7) % 9000) + 1000} ${Math.abs((hash * 13) % 9000) + 1000}`;
  };

  const cardNumber = generateCardNumber(email);
  const registrationDate = new Date().toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  const handleLogout = () => {
    // Здесь будет логика выхода
    console.log("Logout clicked");
  };

  return (
    <div className="uc-user-card">
      <div className="uc-card-pattern">
        <div className="uc-pattern-element-1"></div>
        <div className="uc-pattern-element-2"></div>
        <div className="uc-pattern-element-3"></div>
        <div className="uc-pattern-element-4"></div>
      </div>

      <div className="uc-card-logo">
        <div className="uc-logo-icon">
          <svg className="uc-button-icon" viewBox="0 0 24 24" fill="currentColor">
            <path d="M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z"/>
          </svg>
        </div>
        <span className="uc-logo-text">DajDaj</span>
      </div>

      <div className="uc-card-content">
        <div className="uc-card-top">
          <button className="uc-card-button" onClick={handleLogout}>
            <svg className="uc-button-icon" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.59L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"/>
            </svg>
            Log Out
          </button>
        </div>

        <div className="uc-card-bottom">
          <div className="uc-card-section">
            <p className="uc-section-label">Card Number</p>
            <p className="uc-section-value">{cardNumber}</p>
          </div>

          <div className="uc-card-section">
            <p className="uc-section-label">Member since</p>
            <p className="uc-section-value">{registrationDate}</p>
          </div>

          <div className="uc-card-section">
            <h2 className="uc-user-name">{formattedName}</h2>
            <p className="uc-user-email">{formattedEmail}</p>
          </div>
        </div>
      </div>

      <div className="uc-card-styling">
        <div className="uc-styling-dots">
          <div className="uc-styling-dot"></div>
          <div className="uc-styling-dot"></div>
          <div className="uc-styling-dot"></div>
        </div>
      </div>
    </div>
  );
}