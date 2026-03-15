import { useTranslation } from "react-i18next";
import type { OrderExample } from "@/services/productsApi";
import "./OrderExamples.css";

interface OrderExamplesProps {
  examples: OrderExample[];
}

export function OrderExamples({ examples }: OrderExamplesProps) {
  const { t } = useTranslation();

  if (!examples?.length) return null;

  return (
    <section className="order-examples">
      <h2 className="order-examples__title">
        {t("product.orderExamples", "Przykłady realizacji")}
      </h2>
      <p className="order-examples__subtitle">
        {t("product.orderExamplesSubtitle", "Zobacz jak wyglądają gotowe zamówienia naszych klientów")}
      </p>
      <div className="order-examples__grid">
        {examples.map((example, i) => (
          <div key={i} className="order-examples__card">
            <div className="order-examples__img-wrapper">
              <img
                src={example.image}
                alt={example.caption || `Order example ${i + 1}`}
                className="order-examples__img"
                loading="lazy"
              />
            </div>
            {example.caption && (
              <p className="order-examples__caption">{example.caption}</p>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}