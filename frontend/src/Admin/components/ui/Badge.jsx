// components/ui/Badge.jsx
import "./Badge.css";

export default function Badge({ children, className = "" }) {
  return <span className={`badge ${className}`}>{children}</span>;
}
