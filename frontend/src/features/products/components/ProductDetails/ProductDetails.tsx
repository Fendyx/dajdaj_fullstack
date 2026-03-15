import { useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import {
  Cuboid as Cube,
  Image as ImageIcon,
  Check,
  Truck,
  ShieldCheck,
  Lock,
} from "lucide-react";

import { ProductActions } from "../ProductActions";
import { PersonalizationForm } from "../PersonalizationForm/PersonalizationForm";
import type { PersonalizationData } from "../PersonalizationForm/PersonalizationForm";

import "./ProductDetails.css";

export interface Product {
  slug: string;
  name: string;
  price: number;
  descriptionProductPage?: string;
  isPersonalized?: boolean;
  phrases?: string[];
  isNew?: boolean;
  isPopular?: boolean;
  [key: string]: any;
}

interface ProductDetailsProps {
  product: Product;
  show3D: boolean;
  has3DModel: boolean;
  on3DToggle: () => void;
  onPayNow: (data?: PersonalizationData | null) => void;
}

export function ProductDetails({
  product,
  show3D,
  has3DModel,
  on3DToggle,
  onPayNow,
}: ProductDetailsProps) {
  const { t } = useTranslation();

  const [personalizationData, setPersonalizationData] = useState<PersonalizationData | null>(null);
  const [shakingForm, setShakingForm] = useState(false);

  const handlePersonalizationChange = useCallback(
    (data: PersonalizationData | null) => {
      setPersonalizationData(data);
    },
    []
  );

  return (
    <div className="prod-page w-full">
      <div className="prod-container">
        <div className="prod-info-column space-y-6">

          {/* ── 1. НАЗВАНИЕ ── */}
          <div className="prod-header-minimal">
            {product.isNew && (
              <span className="prod-badge-new text-xs font-bold px-2 py-1 bg-black text-white rounded">
                New Arrival
              </span>
            )}
            <h1 className="prod-title-main text-3xl font-bold leading-tight mt-2">
              {product.name}
            </h1>
          </div>

          {/* ── 2. ЦЕНА ── */}
          <div className="prod-price-row flex items-end gap-4">
            <span className="prod-current-price text-2xl font-bold">
              {product.price} PLN
            </span>
            <div className="prod-availability flex items-center gap-2 text-sm text-green-600 font-medium">
              <div className="pulsing-dot w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              {t("product.inStock", "In Stock")}
            </div>
          </div>

          {/* ── 3. ОПИСАНИЕ ── */}
          <p className="prod-desc-text text-gray-700 leading-relaxed">
            {product.descriptionProductPage ||
              t("product.defaultDescription", "Experience premium quality tailored for your needs.")}
          </p>

          {/* ── 4. 3D TOGGLE ── */}
          {has3DModel && (
            <button
              className="btn-3d-toggle w-full flex items-center justify-center gap-2 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              onClick={on3DToggle}
            >
              {show3D ? <ImageIcon size={20} /> : <Cube size={20} />}
              <span>
                {show3D
                  ? t("product.showPhotos", "Show Standard Photos")
                  : t("product.view3d", "View in 3D Space")}
              </span>
            </button>
          )}

          {/* ── 5. ПЕРСОНАЛИЗАЦИЯ ── */}
          {product.isPersonalized && (
            <PersonalizationForm
              product={product}
              onChange={handlePersonalizationChange}
              shake={shakingForm}
              onShakeEnd={() => setShakingForm(false)}
            />
          )}

          {/* ── 6. КНОПКИ ── */}
          <ProductActions
            product={product}
            onPayNow={onPayNow}
            layout="row"
            personalizationData={
              product.isPersonalized ? personalizationData : undefined
            }
            onValidationFail={() => setShakingForm(true)}
          />

          {/* ── 7. MICRO TRUST ── */}
          <div className="prod-micro-benefits flex flex-wrap gap-3 text-sm text-gray-600">
            <div className="benefit-pill flex items-center gap-1">
              <Truck size={16} />
              {t("product.delivery", "2-3 Days Delivery")}
            </div>
            <div className="benefit-pill flex items-center gap-1">
              <Check size={16} />
              {t("product.returns", "Free Returns")}
            </div>
            <div className="benefit-pill flex items-center gap-1">
              <ShieldCheck size={16} />
              {t("product.warranty", "2 Year Warranty")}
            </div>
          </div>

          {/* ── 8. SECURE FOOTER ── */}
          <div className="prod-footer-secure flex items-center justify-center gap-2 mt-4 text-xs text-gray-500 font-medium">
            <Lock size={14} />
            {t("product.secureCheckout", "Secure checkout powered by Stripe")}
          </div>

        </div>
      </div>
    </div>
  );
}