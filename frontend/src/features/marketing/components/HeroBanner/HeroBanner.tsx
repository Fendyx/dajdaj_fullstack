import { useTranslation } from "react-i18next";
import { 
  Gift, 
  Smartphone, 
  Gamepad2, 
  ShoppingBag, 
  Percent, 
  Sparkles 
} from "lucide-react";

import { LottiePlayer } from "./LottiePlayer";
import "./HeroBanner.css";

// Массив вынесен наружу, чтобы не пересоздаваться при каждом рендере
const floatingIcons = [
  { icon: <Gift size={32} />, className: "float-icon icon1" },
  { icon: <Smartphone size={32} />, className: "float-icon icon2" },
  { icon: <Gamepad2 size={32} />, className: "float-icon icon3" },
  { icon: <Sparkles size={32} />, className: "float-icon icon4" },
  { icon: <ShoppingBag size={32} />, className: "float-icon icon5" },
  { icon: <Percent size={32} />, className: "float-icon icon6" },
];

export const HeroBanner = () => {
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
        
        {/* Передаем класс снаружи, если нужно выровнять */}
        <LottiePlayer className="lottie-figure" /> 
      </div>
    </div>
  );
};