import "../UserCard.css";

export function Card({ className = "", children, ...props }) {
  return (
    <div className={`user-card ${className}`} {...props}>
      {children}
    </div>
  );
}