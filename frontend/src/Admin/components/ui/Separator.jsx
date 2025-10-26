import React from "react";
import "./Separator.css";

export function Separator({
  orientation = "horizontal",
  className = "",
  ...props
}) {
  return (
    <div
      className={`separator ${orientation === "vertical" ? "vertical" : "horizontal"} ${className}`}
      {...props}
    />
  );
}
