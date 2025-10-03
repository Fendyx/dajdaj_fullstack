// components/ui/Button.jsx
import "./Button.css";

export default function Button({ children, onClick, variant = "default", size = "medium", className = "" }) {
  return (
    <button
      className={`btn btn-${variant} btn-${size} ${className}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
