import { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import "./Drawer.css";

const Drawer = ({ open, onOpenChange, children, dragState, onDragStateChange }) => {
  const drawerRef = useRef(null);
  const startYRef = useRef(0);
  const lastYRef = useRef(0);
  const [translateY, setTranslateY] = useState(0);
  const [dragging, setDragging] = useState(false);

  // Закрытие по ESC
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") onOpenChange(false);
    };
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [onOpenChange]);

  const handleTouchStart = (e) => {
    startYRef.current = e.touches[0].clientY;
    lastYRef.current = startYRef.current;
    setDragging(true);
  };

  const handleTouchMove = (e) => {
    if (!dragging) return;
    const currentY = e.touches[0].clientY;
    const deltaY = currentY - startYRef.current;
    lastYRef.current = currentY;

    if (open && deltaY > 0) {
      setTranslateY(deltaY);
    }
  };

  const handleTouchEnd = () => {
    const delta = lastYRef.current - startYRef.current;
    if (open && delta > 100) {
      onOpenChange(false);
    }
    setDragging(false);
    setTranslateY(0);
  };

  // Вычисляем transform с учетом dragState от триггера
  let transform;
  const isDraggingFromTrigger = dragState?.dragging && !open;
  
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

  return (
    <>
      {(open || isDraggingFromTrigger) && (
        <div
          className={`drawer-backdrop ${isDraggingFromTrigger ? "drawer-backdrop-partial" : ""}`}
          style={{
            opacity: isDraggingFromTrigger
              ? Math.min(Math.abs(dragState.translateY) / 200, 0.5)
              : undefined,
          }}
          onClick={() => onOpenChange(false)}
        />
      )}

      <div
        ref={drawerRef}
        className={`drawer-container ${open ? "drawer-open" : ""} ${
          isDraggingFromTrigger ? "drawer-dragging" : ""
        }`}
        style={{
          transform,
          transition:
            dragging || isDraggingFromTrigger
              ? "none"
              : "transform 0.3s ease",
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
  const [translateY, setTranslateY] = useState(0);
  const [dragging, setDragging] = useState(false);

  // ✅ Получаем данные корзины из Redux
  const cartItems = useSelector((state) => state.cart.cartItems);

  // ✅ Считаем суммы
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

  if (open) return null;

  const handleTouchStart = (e) => {
    startYRef.current = e.touches[0].clientY;
    setDragging(true);
  };

  const handleTouchMove = (e) => {
    if (!dragging) return;
    const currentY = e.touches[0].clientY;
    const deltaY = currentY - startYRef.current;
    if (deltaY < 0) {
      setTranslateY(deltaY);
    }
  };

  const handleTouchEnd = () => {
    const wasDragging = dragging;
    const dragDistance = Math.abs(translateY);

    setTranslateY(0);
    setDragging(false);

    if (wasDragging && dragDistance > 80) {
      onClick?.();
    }
  };

  return (
    <button
      ref={triggerRef}
      className={`drawer-trigger ${className}`}
      style={{
        transform: `translateY(0)`,
        transition: dragging ? "none" : "transform 0.2s ease",
      }}
      onClick={(e) => {
        if (!dragging) {
          onClick?.(e);
        }
      }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      {...props}
    >
      <div className="drawer-trigger-handle" />

      {/* 💰 Информация о сумме */}
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

      {/* 🔵 Кнопка выбора оплаты */}
      <button
        type="button"
        className="drawer-payment-method-trigger"
        onClick={onClick}
      >
        Select Payment Method
      </button>
      {children}
    </button>
  );
};

/* --- DrawerContent --- */
export const DrawerContent = ({ children, className = "" }) => {
  return <div className={`drawer-content ${className}`}>{children}</div>;
};

export default Drawer;
