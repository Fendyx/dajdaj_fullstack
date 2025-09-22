import React from "react";
import "../styles/ui.css";

export function Badge({ children, variant = "primary", className = "" }) {
  return <span className={`badge badge-${variant} ${className}`}>{children}</span>;
}
