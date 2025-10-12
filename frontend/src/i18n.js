import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

import en from "./locales/en.json";
import pl from "./locales/pl.json";
import ru from "./locales/ru.json";
import uk from "./locales/uk.json";

i18n
  .use(LanguageDetector) // определяет язык автоматически
  .use(initReactI18next) // подключаем React
  .init({
    resources: {
      en: { translation: en },
      pl: { translation: pl },
      uk: { translation: uk },
      ru: { translation: ru }
    },
    fallbackLng: "pl", // язык по умолчанию
    interpolation: {
      escapeValue: false, // React сам экранирует
    },
  });

export default i18n;
