// components/ui/Avatar.jsx
import "./Avatar.css";

export default function Avatar({ children, className = "" }) {
  return <div className={`avatar ${className}`}>{children}</div>;
}

export function AvatarImage({ src, alt }) {
  return <img src={src} alt={alt} className="avatar-img" />;
}

export function AvatarFallback({ children }) {
  return <div className="avatar-fallback">{children}</div>;
}
