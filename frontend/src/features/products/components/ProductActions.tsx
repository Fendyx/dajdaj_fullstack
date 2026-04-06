// src/features/products/components/ProductActions.tsx
import { ShoppingCart, Zap } from "lucide-react";
import { useAppDispatch } from "@/store/hooks";
import { addToCart, getTotals } from "@/features/cart/cartSlice";
import type { Product } from "@/types/product";
import type { PersonalizationData } from "./PersonalizationForm/PersonalizationForm";
import "./ProductActions.css";
import { useTrack } from "@/hooks/useTrack";

interface ProductActionsProps {
  product: Product;
  onPayNow?: (data?: PersonalizationData | null) => void;
  layout?: "row" | "col";
  personalizationData?: PersonalizationData | null;
  onValidationFail?: () => void;
}

export function ProductActions({
  product,
  onPayNow,
  layout = "row",
  personalizationData,
  onValidationFail,
}: ProductActionsProps) {
  const dispatch = useAppDispatch();
  const track = useTrack();

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

    track('add_to_cart', {
      productId: product._id,
      price: product.price,
      name: product.name,
      category: product.category,
      hasPersonalization: !!personalizationData,
    });
  };

  const handleBuyNowClick = () => {
    if (isLocked) {
      onValidationFail?.();
      return;
    }

    track('buy_now_click', {
      productId: product._id,
      price: product.price,
      name: product.name,
      category: product.category,
      hasPersonalization: !!personalizationData,
    });

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