import { useState } from "react";
import { useTranslation } from "react-i18next";
import { ChevronDown } from "lucide-react";
import type { FaqItem } from "@/services/productsApi";
import "./ProductFaq.css";

interface ProductFaqProps {
  faq: FaqItem[];
}

export function ProductFaq({ faq }: ProductFaqProps) {
  const { t } = useTranslation();
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  if (!faq?.length) return null;

  const toggle = (i: number) => setOpenIndex(openIndex === i ? null : i);

  return (
    <section className="prod-faq">
      <h2 className="prod-faq__title">
        {t("product.faq", "Często zadawane pytania")}
      </h2>
      <div className="prod-faq__list">
        {faq.map((item, i) => (
          <div
            key={i}
            className={`prod-faq__item ${openIndex === i ? "prod-faq__item--open" : ""}`}
          >
            <button
              className="prod-faq__question"
              onClick={() => toggle(i)}
              aria-expanded={openIndex === i}
            >
              <span>{item.question}</span>
              <ChevronDown
                size={20}
                className={`prod-faq__icon ${openIndex === i ? "prod-faq__icon--rotated" : ""}`}
              />
            </button>
            <div className="prod-faq__answer-wrapper">
              <p className="prod-faq__answer">{item.answer}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}