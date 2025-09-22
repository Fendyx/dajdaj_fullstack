import React from "react";

export function RadioGroup({ children, value, onValueChange }) {
  return (
    <div className="radio-group">
      {React.Children.map(children, (child) => {
        return React.cloneElement(child, { selectedValue: value, onChange: onValueChange });
      })}
    </div>
  );
}
