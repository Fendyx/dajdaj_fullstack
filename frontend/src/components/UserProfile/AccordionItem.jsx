import React, { useState, useRef, useEffect } from "react";

export default function AccordionItem({ title, count, children, isOpen: isOpenProp }) {
  const [isOpen, setIsOpen] = useState(false);
  const [height, setHeight] = useState("0px");
  const contentRef = useRef(null);

  // Если приходит пропс isOpen — синхронизируем с состоянием
  useEffect(() => {
    if (isOpenProp) {
      setIsOpen(true);
    }
  }, [isOpenProp]);

  useEffect(() => {
    if (isOpen) {
      setHeight(`${contentRef.current.scrollHeight}px`);
    } else {
      setHeight("0px");
    }
  }, [isOpen]);

  return (
    <div className="up-accordion-item">
      <button
        className="up-accordion-header"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span>{title}</span>
        <span className="up-accordion-count">{count}</span>
        <span className="up-accordion-arrow">{isOpen ? "▲" : "▼"}</span>
      </button>
      <div
        ref={contentRef}
        className="up-accordion-content-wrapper"
        style={{
          maxHeight: height,
          overflow: "hidden",
          transition: "max-height 0.3s ease",
        }}
      >
        <div className="up-accordion-content">{children}</div>
      </div>
    </div>
  );
}
