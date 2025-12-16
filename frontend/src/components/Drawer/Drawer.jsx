import { useEffect, useRef, useState, useCallback } from "react";
import { useSelector } from "react-redux";
import "./Drawer.css";

const Drawer = ({ open, onOpenChange, children, dragState, onDragStateChange }) => {
  const drawerRef = useRef(null);
  const startYRef = useRef(0);
  const [translateY, setTranslateY] = useState(0);
  const [dragging, setDragging] = useState(false);

  // Управление body overflow
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  // Закрытие по ESC
  useEffect(() => {
    if (!open) return;
    
    const handleEsc = (e) => {
      if (e.key === "Escape") onOpenChange(false);
    };
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [open, onOpenChange]);

  const handleTouchStart = useCallback((e) => {
    if (!open) return;
    startYRef.current = e.touches[0].clientY;
    setDragging(true);
  }, [open]);

  const handleTouchMove = useCallback((e) => {
    if (!dragging || !open) return;
    const currentY = e.touches[0].clientY;
    const deltaY = currentY - startYRef.current;

    if (deltaY > 0) {
      setTranslateY(deltaY);
    }
  }, [dragging, open]);

  const handleTouchEnd = useCallback(() => {
    if (!open) return;
    
    const shouldClose = translateY > 100;
    if (shouldClose) {
      onOpenChange(false);
    }
    setDragging(false);
    setTranslateY(0);
  }, [open, translateY, onOpenChange]);

  // Вычисляем transform
  const isDraggingFromTrigger = dragState?.dragging && !open;
  
  let transform;
  if (open) {
    transform = dragging ? `translateY(${translateY}px)` : `translateY(0)`;
  } else if (isDraggingFromTrigger) {
    const dragOffset = Math.abs(dragState.translateY);
    const maxHeight = window.innerHeight * 0.9;
    const visibleAmount = Math.min(dragOffset, maxHeight);
    transform = `translateY(calc(100% - ${visibleAmount}px))`;
  } else {
    transform = `translateY(100%)`;
  }

  // Вычисляем opacity backdrop
  const backdropOpacity = isDraggingFromTrigger
    ? Math.min(Math.abs(dragState.translateY) / 200, 0.45)
    : open ? 0.45 : 0;

  const shouldShowBackdrop = open || isDraggingFromTrigger;

  return (
    <>
      {/* Backdrop */}
      <div
        className={`drawer-backdrop ${shouldShowBackdrop ? "drawer-backdrop-visible" : ""}`}
        style={{
          opacity: backdropOpacity,
          pointerEvents: open ? "auto" : "none",
        }}
        onClick={(e) => {
          e.stopPropagation();
          if (open) onOpenChange(false);
        }}
      />

      {/* Drawer Container */}
      <div
        ref={drawerRef}
        className={`drawer-container ${open ? "drawer-open" : ""} ${
          isDraggingFromTrigger ? "drawer-dragging" : ""
        }`}
        style={{
          transform,
          transition: dragging || isDraggingFromTrigger ? "none" : "transform 0.3s cubic-bezier(0.22, 1, 0.36, 1)",
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div className="drawer-handle" />
        {children}
      </div>
    </>
  );
};

/* --- DrawerTrigger --- */
export const DrawerTrigger = ({
  open,
  children,
  className = "",
  onClick,
  onDragState,
  ...props
}) => {
  const triggerRef = useRef(null);
  const startYRef = useRef(0);
  const rafRef = useRef(null);
  const [translateY, setTranslateY] = useState(0);
  const [dragging, setDragging] = useState(false);

  const cartItems = useSelector((state) => state.cart.cartItems);

  const cartTotal = cartItems.reduce(
    (total, item) => total + item.price * item.cartQuantity,
    0
  );
  const deliveryFee = 9.99;
  const totalWithDelivery = (cartTotal + deliveryFee).toFixed(2);

  useEffect(() => {
    if (onDragState) {
      onDragState({ dragging, translateY });
    }
  }, [dragging, translateY, onDragState]);

  const handleTouchStart = useCallback((e) => {
    startYRef.current = e.touches[0].clientY;
    setDragging(true);
  }, []);

  const handleTouchMove = useCallback((e) => {
    if (!dragging) return;
    
    // Отменяем предыдущий RAF если есть
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
    }
    
    // Используем RAF для плавности
    rafRef.current = requestAnimationFrame(() => {
      const currentY = e.touches[0].clientY;
      const deltaY = currentY - startYRef.current;
      if (deltaY < 0) {
        setTranslateY(deltaY);
      }
    });
  }, [dragging]);

  const handleTouchEnd = useCallback(() => {
    const dragDistance = Math.abs(translateY);
    const shouldOpen = dragDistance > 80;
    
    setTranslateY(0);
    setDragging(false);
    
    if (shouldOpen && onClick) {
      onClick();
    }
  }, [translateY, onClick]);

  const handleClick = useCallback((e) => {
    if (!dragging && onClick) {
      onClick(e);
    }
  }, [dragging, onClick]);

  // Cleanup RAF on unmount
  useEffect(() => {
    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);

  return (
    <button
      ref={triggerRef}
      className={`drawer-trigger ${className}`}
      style={{
        transform: `translateY(0)`,
      }}
      onClick={handleClick}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      {...props}
    >
      <div className="drawer-trigger-handle" />
      <div className="drawer-trigger-summary">
        <div className="drawer-summary-row">
          <span>Subtotal</span>
          <span>{cartTotal.toFixed(2)} PLN</span>
        </div>
        <div className="drawer-summary-row">
          <span>Delivery</span>
          <span>{deliveryFee.toFixed(2)} PLN</span>
        </div>
        <div className="drawer-summary-total">
          <strong>Total</strong>
          <strong>{totalWithDelivery} PLN</strong>
        </div>
      </div>
      <button
        type="button"
        className="drawer-payment-method-trigger"
        onClick={handleClick}
      >
        Select Payment Method
      </button>
      {children}
    </button>
  );
};

/* --- DrawerContent --- */
export const DrawerContent = ({ children, className = "" }) => {
  const handleTouchMove = useCallback((e) => {
    e.stopPropagation();
  }, []);

  return (
    <div
      className={`drawer-content ${className}`}
      onTouchMove={handleTouchMove}
    >
      <div className="drawer-content-inner">
        {children}
      </div>
    </div>
  );
};

export default Drawer;
