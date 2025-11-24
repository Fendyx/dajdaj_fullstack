// src/components/SelectedCartItem.js
import React, { useState } from "react";
import { useSelector } from "react-redux";
import i18n from "../../i18n";
import { FaChevronDown, FaChevronUp, FaShoppingCart } from "react-icons/fa";
import "./SelectedCartItem.css";

const SelectedCartItem = () => {
  const cartItems = useSelector((state) => state.cart.cartItems);
  const [openItems, setOpenItems] = useState({});

  if (cartItems.length === 0) {
    return (
      <div className="selected-items-container">
        <div className="cart-header">
          <FaShoppingCart className="cart-icon" />
          <h2 className="cart-title">Cart</h2>
        </div>
        <p className="empty-cart-message">В корзине пока нет товаров</p>
      </div>
    );
  }

  const toggleItem = (id) => {
    setOpenItems((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  return (
    <div className="selected-items-container">
      <div className="cart-header">
        <FaShoppingCart className="cart-icon" />
        <h2 className="cart-title">Cart</h2>
      </div>
      
      {cartItems.map((item) => (
        <div className="selected-item" key={item.id}>
          <div 
            className="selected-item-header"
            onClick={() => toggleItem(item.id)}
          >
            <div className="selected-item-price">{item.price} PLN</div>
            <img
              src={item.image}
              alt={
                typeof item.name === "object"
                  ? item.name[i18n.language]
                  : item.name
              }
              className="selected-item-image"
            />
            <button
              type="button"
              className="toggle-btn"
              onClick={(e) => {
                e.stopPropagation();
                toggleItem(item.id);
              }}
            >
              {openItems[item.id] ? <FaChevronUp /> : <FaChevronDown />}
            </button>
          </div>

          {openItems[item.id] && (
            <div className="selected-item-info">
              <h3>
                {typeof item.name === "object"
                  ? item.name[i18n.language]
                  : item.name}
              </h3>

              <p>
                <strong>Количество:</strong> {item.cartQuantity}
              </p>

              {item.personalization && (
                <div className="selected-item-personalization">
                  <h4>Персонализация:</h4>
                  <p>
                    <strong>Фраза:</strong> {item.personalization.phrase}
                  </p>
                  <p>
                    <strong>Имя:</strong> {item.personalization.customName}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default SelectedCartItem;