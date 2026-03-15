import { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Globe, ChevronDown } from "lucide-react";
import "./LanguageSelector.css";

const LANGUAGES = [
  { code: "en", label: "EN", full: "English" },
  { code: "pl", label: "PL", full: "Polski" },
  { code: "uk", label: "UA", full: "Українська" },
  { code: "ru", label: "RU", full: "Русский" },
];

export const LanguageSelector = () => {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const currentLabel =
    LANGUAGES.find((l) => l.code === i18n.language)?.label ?? "EN";

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const changeLanguage = (code: string) => {
    i18n.changeLanguage(code).then(() => setIsOpen(false));
  };

  return (
    <div
      className={`lang-selector${isOpen ? " lang-selector--open" : ""}`}
      ref={menuRef}
      onClick={() => setIsOpen(!isOpen)}
      role="button"
      aria-haspopup="listbox"
      aria-expanded={isOpen}
    >
      <Globe size={15} strokeWidth={2} className="lang-selector__globe" />
      <span className="lang-selector__label">{currentLabel}</span>
      <ChevronDown
        size={13}
        strokeWidth={2.5}
        className={`lang-selector__chevron${isOpen ? " lang-selector__chevron--up" : ""}`}
      />

      {isOpen && (
        <ul className="lang-dropdown" role="listbox">
          {LANGUAGES.map((lang) => (
            <li
              key={lang.code}
              className={`lang-dropdown__item${i18n.language === lang.code ? " lang-dropdown__item--active" : ""}`}
              onClick={(e) => { e.stopPropagation(); changeLanguage(lang.code); }}
              role="option"
              aria-selected={i18n.language === lang.code}
            >
              <span className="lang-dropdown__code">{lang.label}</span>
              <span className="lang-dropdown__full">{lang.full}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};