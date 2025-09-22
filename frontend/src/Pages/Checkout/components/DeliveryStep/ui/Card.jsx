import React from "react";
import "../styles/ui.css";

export function Card({ children, className = "", ...props }) {
  return (
    <div className={`card ${className}`} {...props}>
      {children}
    </div>
  );
}
