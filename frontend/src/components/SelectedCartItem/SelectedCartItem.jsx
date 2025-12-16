import React, { useState, useMemo } from "react";
import { useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import i18n from "../../i18n";
import { FaChevronDown, FaChevronUp, FaShoppingCart } from "react-icons/fa";
import "./SelectedCartItem.css";

const SelectedCartItem = () => {
  const location = useLocation();
  const reduxCartItems = useSelector((state) => state.cart.cartItems);
  
  // Логика выбора источника данных
  const currentItems = useMemo(() => {
    if (location.state?.buyNowItem) {
      return [location.state.buyNowItem];
    }
    return reduxCartItems;
  }, [location.state, reduxCartItems]);

  const [openItems, setOpenItems] = useState({});

  if (!currentItems || currentItems.length === 0) return null;

  const toggleItem = (id) => {
    setOpenItems((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // --- ИСПРАВЛЕНИЕ 1: Безопасный подсчет суммы ---
  const totalAmount = currentItems.reduce((acc, item) => {
    // Принудительно превращаем в числа, чтобы избежать ошибок со строками
    const price = Number(item.price) || 0;
    const qty = Number(item.cartQuantity) || 0;
    return acc + (price * qty);
  }, 0);

  return (
    <div className="summary-container">
      <div className="summary-header">
        <div className="header-title-row">
          <FaShoppingCart className="cart-icon" />
          <h2 className="cart-title">
            {location.state?.buyNowItem ? "Buy Now Item" : "Order Summary"}
          </h2>
        </div>
        {/* Отображаем подсчитанную сумму */}
        <span className="header-total-amount">{totalAmount.toFixed(2)} PLN</span>
      </div>
      
      <div className="summary-list">
        {currentItems.map((item) => {
          const hasPersonalization = !!item.personalization;
          const isOpen = openItems[item.id];

          // --- ИСПРАВЛЕНИЕ 2: Безопасные переменные для рендера ---
          const safePrice = Number(item.price) || 0;
          const safeQty = Number(item.cartQuantity) || 0;
          const itemTotal = (safePrice * safeQty).toFixed(2);

          return (
            <div className="summary-item" key={item.id}>
              {/* Верхняя часть */}
              <div className="summary-item-main">
                
                <div className="item-image-wrapper">
                  <img
                    src={item.image}
                    alt={typeof item.name === "object" ? item.name[i18n.language] : item.name}
                    className="item-image"
                  />
                  <span className="item-qty-badge">{safeQty}</span>
                </div>

                <div className="item-info">
                  <h3 className="item-name">
                    {typeof item.name === "object" ? item.name[i18n.language] : item.name}
                  </h3>
                  
                  {hasPersonalization && (
                    <button 
                      className="details-toggle-btn" 
                      onClick={() => toggleItem(item.id)}
                      type="button"
                    >
                      {isOpen ? "Hide details" : "Show details"} 
                      {isOpen ? <FaChevronUp size={10}/> : <FaChevronDown size={10}/>}
                    </button>
                  )}
                </div>

                {/* Цена */}
                <div className="item-price">
                  {itemTotal} PLN
                </div>
              </div>

              {hasPersonalization && isOpen && (
                <div className="item-personalization-drawer">
                  <div className="pers-row">
                    <span className="pers-label">Phrase:</span>
                    <span className="pers-value">{item.personalization.phrase}</span>
                  </div>
                  <div className="pers-row">
                    <span className="pers-label">Name:</span>
                    <span className="pers-value">{item.personalization.customName}</span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SelectedCartItem;