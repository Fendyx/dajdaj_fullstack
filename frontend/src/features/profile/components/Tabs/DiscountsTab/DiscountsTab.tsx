import { useTranslation } from "react-i18next";
import { Ticket, Copy, Check } from "lucide-react";
import { useState } from "react";
import { useGetUserDiscountsQuery } from "@/services/userApi";
import { EmptyState } from "@/components/ui/EmptyState";
import { Spinner } from "@/components/ui/Spinner/Spinner";
import "./DiscountsTab.css";

function CouponCard({ discount }: { discount: any }) {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);

  const isExpiringSoon =
    discount.expiresAt &&
    new Date(discount.expiresAt).getTime() - Date.now() < 1000 * 60 * 60 * 24 * 7; // 7 days

  const handleCopy = () => {
    navigator.clipboard.writeText(discount.code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const formattedExpiry = discount.expiresAt
    ? new Date(discount.expiresAt).toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : null;

  return (
    <div className={`dt-ticket ${isExpiringSoon ? "expiring" : ""}`}>
      {/* Left tear edge */}
      <div className="dt-tear-left" />

      {/* Discount Value */}
      <div className="dt-value-section">
        <span className="dt-percent">{discount.value}</span>
        <span className="dt-percent-symbol">%</span>
        <span className="dt-off-label">OFF</span>
      </div>

      {/* Divider (perforated) */}
      <div className="dt-perforation" />

      {/* Code Section */}
      <div className="dt-code-section">
        <div className="dt-code-label">
          {t("discounts.yourCode", "Your promo code")}
        </div>
        <div className="dt-code-row">
          <span className="dt-code">{discount.code}</span>
          <button
            className={`dt-copy-btn ${copied ? "copied" : ""}`}
            onClick={handleCopy}
            aria-label={t("discounts.copy", "Copy code")}
            title={t("discounts.copy", "Copy code")}
          >
            {copied ? <Check size={14} /> : <Copy size={14} />}
          </button>
        </div>
        {formattedExpiry && (
          <div className={`dt-expiry ${isExpiringSoon ? "soon" : ""}`}>
            {isExpiringSoon
              ? t("discounts.expiresSoon", "Expires soon") + " — "
              : t("discounts.validUntil", "Valid until") + " "}
            {formattedExpiry}
          </div>
        )}
      </div>

      {/* Right tear edge */}
      <div className="dt-tear-right" />
    </div>
  );
}

export function DiscountsTab() {
  const { t } = useTranslation();
  const { data: discounts, isLoading } = useGetUserDiscountsQuery();

  if (isLoading) return <Spinner />;

  if (!discounts || discounts.length === 0) {
    return (
      <EmptyState
        icon={<Ticket size={48} strokeWidth={1.5} />}
        title={t("discounts.empty.title", "No coupons yet")}
        description={t(
          "discounts.empty.description",
          "Complete orders and participate in promotions to earn discount coupons."
        )}
      />
    );
  }

  return (
    <div className="dt-grid">
      <p className="dt-hint">
        {t("discounts.hint", "Click the copy icon to copy a code, then use it at checkout.")}
      </p>
      {discounts.map((discount: any, idx: number) => (
        <CouponCard key={idx} discount={discount} />
      ))}
    </div>
  );
}