import { useTranslation } from "react-i18next";
import type { Specification } from "@/services/productsApi";
import "./ProductSpecifications.css";

interface ProductSpecificationsProps {
  specifications: Specification[];
}

export function ProductSpecifications({ specifications }: ProductSpecificationsProps) {
  const { t } = useTranslation();

  if (!specifications?.length) return null;

  return (
    <section className="prod-specs">
      <h2 className="prod-specs__title">
        {t("product.specifications", "Charakterystyka produktu")}
      </h2>
      <table className="prod-specs__table">
        <tbody>
          {specifications.map((spec, i) => (
            <tr key={i} className="prod-specs__row">
              <td className="prod-specs__label">{spec.label}</td>
              <td className="prod-specs__value">{spec.value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}