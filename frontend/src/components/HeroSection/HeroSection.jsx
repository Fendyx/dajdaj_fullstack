import React from "react";
import { useTranslation } from "react-i18next";
import "./HeroSection.css";

export function HeroSection() {
  const { t } = useTranslation();

  return (
    <section className="hero">
      <div className="hero__inner">
        <span className="hero__badge">
          <span className="hero__icon">❤️</span>
          {t("hero.badge")}
        </span>
        <h1 className="hero__title">{t("hero.title")}</h1>
        <p className="hero__subtitle">{t("hero.subtitle")}</p>
        <a href="#collection" className="hero__button">
          {t("hero.button")}
        </a>
      </div>
    </section>
  );
}

export default HeroSection;
