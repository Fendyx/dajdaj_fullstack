// LottieTestHero.jsx
import React from "react";
import { useTranslation } from "react-i18next";
import LottiePlayer from "./LottiePlayer";
import {
  FaGift,
  FaMobileAlt,
  FaGamepad,
  FaShoppingBag,
  FaPercent,
} from "react-icons/fa";
import { SiAdafruit } from "react-icons/si"; // аналогичный “блочный” логотип
import "./LottieTestHero.css";

const floatingIcons = [
  { icon: <FaGift />, className: "float-icon icon1" },
  { icon: <FaMobileAlt />, className: "float-icon icon2" },
  { icon: <FaGamepad />, className: "float-icon icon3" },
  { icon: <SiAdafruit />, className: "float-icon icon4" },
  { icon: <FaShoppingBag />, className: "float-icon icon5" },
  { icon: <FaPercent />, className: "float-icon icon6" },
];

const LottieTestHero = () => {
  const { t } = useTranslation();

  return (
    <div className="appp-container">
      {/* Плавающие иконки */}
      {floatingIcons.map((item, index) => (
        <div key={index} className={item.className}>
          {item.icon}
        </div>
      ))}

      <div className="center-content">
        <h1>{t("hero.title")}</h1>
        {/* <p>{t("hero.description")}</p> */}
      </div>

      <div className="right-lottie">
        <div className="glass-block">
          {t("hero.slogan")}
        </div>
        <LottiePlayer className="lottie-figure" />
      </div>
    </div>
  );
};

export default LottieTestHero;
