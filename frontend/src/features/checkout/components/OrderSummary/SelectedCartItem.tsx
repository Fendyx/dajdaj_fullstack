import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { ChevronDown, ChevronUp, ShoppingCart } from "lucide-react";
import "./SelectedCartItem.css";

interface CartItemPersonalization {
  phrase?: string;
  customName?: string;
}

interface CartItem {
  id: string | number;
  name: string | Record<string, string>;
  price: number | string;
  cartQuantity?: number | string;
  qty?: number | string;
  image?: string;
  personalization?: CartItemPersonalization;
}

interface SelectedCartItemProps {
  items: CartItem[];
  isBuyNow?: boolean;
}

export const SelectedCartItem = ({ items, isBuyNow = false }: SelectedCartItemProps) => {
  const { i18n } = useTranslation();
  const [openItems, setOpenItems] = useState<Record<string | number, boolean>>({});

  if (!items || items.length === 0) return null;

  const toggleItem = (id: string | number) => {
    setOpenItems((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const totalAmount = useMemo(() => {
    return items.reduce((acc, item) => {
      const price = Number(item.price) || 0;
      const qty = Number(item.cartQuantity || item.qty) || 1;
      return acc + price * qty;
    }, 0);
  }, [items]);

  return (
    <div className="summary-container">

      {/* Header */}
      <div className="summary-header">
        <div className="header-title-row">
          <ShoppingCart size={18} className="cart-icon" />
          <h2 className="cart-title">
            {isBuyNow ? "Buy Now Item" : "Order Summary"}
          </h2>
        </div>
        <span className="header-total-amount">{totalAmount.toFixed(2)} PLN</span>
      </div>

      {/* Items */}
      <div className="summary-list">
        {items.map((item) => {
          const hasPersonalization = !!item.personalization;
          const isOpen = openItems[item.id];

          const safePrice = Number(item.price) || 0;
          const safeQty = Number(item.cartQuantity || item.qty) || 1;
          const itemTotal = (safePrice * safeQty).toFixed(2);

          const itemName =
            typeof item.name === "object" && item.name !== null
              ? item.name[i18n.language] || item.name["en"]
              : item.name;

          return (
            <div className="summary-item" key={item.id}>

              <div className="summary-item-main">
                <div className="item-image-wrapper">
                  <img
                    src={item.image || "https://placehold.co/150x150?text=No+Image"}
                    alt={itemName as string}
                    className="item-image"
                  />
                  <span className="item-qty-badge">{safeQty}</span>
                </div>

                <div className="item-info">
                  <h3 className="item-name">{itemName}</h3>
                  {hasPersonalization && (
                    <button
                      className="details-toggle-btn"
                      onClick={() => toggleItem(item.id)}
                      type="button"
                    >
                      {isOpen ? "Hide details" : "Show details"}
                      {isOpen ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                    </button>
                  )}
                </div>

                <div className="item-price">{itemTotal} PLN</div>
              </div>

              {/* Personalization drawer */}
              {hasPersonalization && isOpen && (
                <div className="item-personalization-drawer">
                  <div className="pers-row">
                    <span className="pers-label">Phrase</span>
                    <span className="pers-value">{item.personalization?.phrase}</span>
                  </div>
                  <div className="pers-row">
                    <span className="pers-label">Name</span>
                    <span className="pers-value">{item.personalization?.customName}</span>
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