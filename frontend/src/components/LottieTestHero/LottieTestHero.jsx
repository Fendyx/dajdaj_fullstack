// LottieTestHero.jsx
import React from "react";
import { useTranslation } from "react-i18next";
import LottiePlayer from "./LottiePlayer";
import "./LottieTestHero.css";

const LottieTestHero = () => {
  const { t } = useTranslation();

  return (
    <div className="appp-container">
      <div className="center-content">
        <h1>{t("hero.title")}</h1>
        <p>{t("hero.description")}</p>
        <button className="glass-button">{t("hero.button")}</button>
      </div>

      <div className="right-lottie">
        <div className="glass-block">{t("hero.slogan")}</div>
        <LottiePlayer className="lottie-figure" />
      </div>
    </div>
  );
};

export default LottieTestHero;
