// src/features/products/components/ProductActions.tsx
import { ShoppingCart, Zap } from "lucide-react";
import { useAppDispatch } from "@/store/hooks";
import { addToCart, getTotals } from "@/features/cart/cartSlice";
import type { Product } from "./ProductDetails/ProductDetails";
import type { PersonalizationData } from "./PersonalizationForm/PersonalizationForm";
import "./ProductActions.css";

interface ProductActionsProps {
  product: Product;
  onPayNow?: (data?: PersonalizationData | null) => void;
  layout?: "row" | "col";
  personalizationData?: PersonalizationData | null;
  onValidationFail?: () => void; // вызывается когда форма не заполнена
}

export function ProductActions({
  product,
  onPayNow,
  layout = "row",
  personalizationData,
  onValidationFail,
}: ProductActionsProps) {
  const dispatch = useAppDispatch();

  const needsPersonalization = product.isPersonalized === true;
  const isLocked = needsPersonalization && !personalizationData;

  const handleAddToCartClick = () => {
    if (isLocked) {
      onValidationFail?.();
      return;
    }

    if (personalizationData?.type === "custom") {
      dispatch(
        addToCart({
          ...product,
          image: personalizationData.thumbnailImage,
          personalization: {
            inscription: personalizationData.inscription,
            tempStorageId: personalizationData.tempStorageId,
          },
        })
      );
    } else if (personalizationData?.type === "figurine") {
      dispatch(
        addToCart({
          ...product,
          personalization: {
            phrase: personalizationData.phrase,
            customName: personalizationData.customName,
          },
        })
      );
    } else {
      dispatch(addToCart(product));
    }

    dispatch(getTotals());
  };

  const handleBuyNowClick = () => {
    if (isLocked) {
      onValidationFail?.();
      return;
    }
    onPayNow?.(personalizationData);
  };

  return (
    <div
      className={`prod-cta-group ${
        layout === "row" ? "prod-cta-row" : "prod-cta-col"
      }`}
    >
      <button className="btn-secondary-cart" onClick={handleAddToCartClick}>
        <ShoppingCart size={18} />
        <span>Add to Cart</span>
      </button>

      {onPayNow && (
        <button className="btn-primary-buy" onClick={handleBuyNowClick}>
          <Zap size={18} />
          <span>Buy Now</span>
        </button>
      )}
    </div>
  );
}