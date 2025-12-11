import React, { useState } from "react";
import { useSelector } from "react-redux";
import i18n from "../../i18n";
import { FaChevronDown, FaChevronUp, FaShoppingCart } from "react-icons/fa";
import "./SelectedCartItem.css";

const SelectedCartItem = () => {
  const cartItems = useSelector((state) => state.cart.cartItems);
  // Мы используем локальный стейт только для персонализации, если она длинная
  const [openItems, setOpenItems] = useState({});

  if (cartItems.length === 0) return null; // Или пустой блок, как у тебя было

  const toggleItem = (id) => {
    setOpenItems((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // Подсчет итоговой суммы для визуального подтверждения (опционально, но полезно)
  const totalAmount = cartItems.reduce((acc, item) => acc + (item.price * item.cartQuantity), 0);

  return (
    <div className="summary-container">
      <div className="summary-header">
        <div className="header-title-row">
          <FaShoppingCart className="cart-icon" />
          <h2 className="cart-title">Order Summary</h2>
        </div>
        <span className="header-total-amount">{totalAmount.toFixed(2)} PLN</span>
      </div>
      
      <div className="summary-list">
        {cartItems.map((item) => {
          const hasPersonalization = !!item.personalization;
          const isOpen = openItems[item.id];

          return (
            <div className="summary-item" key={item.id}>
              {/* Верхняя часть: Всегда видна */}
              <div className="summary-item-main">
                
                {/* 1. Картинка (Визуальный якорь) */}
                <div className="item-image-wrapper">
                  <img
                    src={item.image}
                    alt={typeof item.name === "object" ? item.name[i18n.language] : item.name}
                    className="item-image"
                  />
                  <span className="item-qty-badge">{item.cartQuantity}</span>
                </div>

                {/* 2. Информация (Название) */}
                <div className="item-info">
                  <h3 className="item-name">
                    {typeof item.name === "object" ? item.name[i18n.language] : item.name}
                  </h3>
                  
                  {/* Если есть персонализация, показываем кнопку "Детали" */}
                  {hasPersonalization && (
                    <button 
                      className="details-toggle-btn" 
                      onClick={() => toggleItem(item.id)}
                    >
                      {isOpen ? "Hide details" : "Show details"} 
                      {isOpen ? <FaChevronUp size={10}/> : <FaChevronDown size={10}/>}
                    </button>
                  )}
                </div>

                {/* 3. Цена (Справа) */}
                <div className="item-price">
                  {(item.price * item.cartQuantity).toFixed(2)} PLN
                </div>
              </div>

              {/* Выпадающая часть: Только для персонализации */}
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