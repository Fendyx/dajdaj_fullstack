import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import enLang from "./locales/en.json";
import plLang from "./locales/pl.json";

// 🔥 ВОТ ЗДЕСЬ ИСПРАВЛЕНИЕ: Оборачиваем словари в { translation: ... }
const resources = {
  en: { translation: enLang },
  pl: { translation: plLang },
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: localStorage.getItem("appLanguage") || "en", 
    fallbackLng: "en", 
    interpolation: {
      escapeValue: false, 
    },
  });

// Сохраняем выбранный язык в localStorage, чтобы он не сбрасывался при F5
i18n.on('languageChanged', (lng) => {
  localStorage.setItem('appLanguage', lng);
});

export default i18n;