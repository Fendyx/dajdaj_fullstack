import "../UserCard.css";

export function Button({ variant = "default", size = "default", className = "", children, ...props }) {
  const baseClass = "card-button";
  const variantClass = variant === "secondary" ? "card-button" : "card-button";
  const sizeClass = size === "sm" ? "" : "";
  
  return (
    <button 
      className={`${baseClass} ${variantClass} ${sizeClass} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}