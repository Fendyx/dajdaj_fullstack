import React from "react";
import { IoClose } from "react-icons/io5";
import "./Dialog.css";

export function Dialog({ open, onOpenChange, children }) {
  if (!open) return null;
  return (
    <div className="dialog-overlay" onClick={() => onOpenChange(false)}>
      <div
        className="dialog-content"
        onClick={(e) => e.stopPropagation()}
      >
        {children}
        <button
          className="dialog-close"
          onClick={() => onOpenChange(false)}
        >
          <IoClose size={20} />
        </button>
      </div>
    </div>
  );
}

export function DialogHeader({ children }) {
  return <div className="dialog-header">{children}</div>;
}

export function DialogTitle({ children }) {
  return <h2 className="dialog-title">{children}</h2>;
}

export function DialogFooter({ children }) {
  return <div className="dialog-footer">{children}</div>;
}

export function DialogContent({ children }) {
  return <div className="dialog-body">{children}</div>;
}
