import React from "react";

export function RadioGroupItem({ value, selectedValue, onChange, id }) {
  return (
    <input
      type="radio"
      id={id}
      name="radio-group"
      value={value}
      checked={selectedValue === value}
      onChange={() => onChange(value)}
      style={{ display: "none" }}
    />
  );
}
