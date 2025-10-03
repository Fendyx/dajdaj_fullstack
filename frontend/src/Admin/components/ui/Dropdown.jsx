// components/ui/Dropdown.jsx
import { useState, useRef, useEffect } from "react";
import Button from "./Button";

export default function Dropdown({ triggerContent, children }) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  const handleClickOutside = (event) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      setOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="dropdown" ref={dropdownRef}>
      <Button variant="ghost" onClick={() => setOpen(!open)}>
        {triggerContent}
      </Button>

      {open && <div className="dropdown-menu">{children}</div>}
    </div>
  );
}
