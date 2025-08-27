import React, { useState } from "react";
import "./PersonalizationModal.css";
import { useTranslation } from "react-i18next";

export function PersonalizationModal({ product, onClose, onConfirm }) {
  const { t } = useTranslation();
  const [selectedPhrase, setSelectedPhrase] = useState("");
  const [customName, setCustomName] = useState("");

  // ✅ Фразы приходят уже локализованные с сервера
  const PRESET_PHRASES = product?.phrases || [];

  const handleConfirm = () => {
    onConfirm({ phrase: selectedPhrase, name: customName });
    onClose();
  };

  return (
    <div className="personalization-overlay">
      <div className="personalization-modal">
        {/* Header with Back Button */}
        <div className="modal-header">
          <button className="back-btn" onClick={onClose}>
            ← {t("personalizationModal.buttons.back")}
          </button>
        </div>

        <div className="modal-body">
          {/* Left column (Product Image) */}
          <div className="image-section">
            <img
              src={product.image}
              alt={product.name}
              className="product-preview"
            />
          </div>

          {/* Right column (Personalization options) */}
          <div className="content-section">
            <h2>{t("personalizationModal.title")}</h2>

            {/* Preset phrases */}
            <div className="preset-phrases">
              {PRESET_PHRASES.map((phrase, index) => (
                <div
                  key={index}
                  className={`phrase-block ${
                    selectedPhrase === phrase ? "selected" : ""
                  }`}
                  onClick={() => setSelectedPhrase(phrase)}
                >
                  {phrase}
                </div>
              ))}
            </div>

            {/* Custom name input */}
            <div className="custom-name">
              <label>{t("personalizationModal.labels.customName")}</label>
              <input
                type="text"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                placeholder={t("personalizationModal.placeholders.customName")}
              />
            </div>

            <button
              className="confirm-btn"
              onClick={handleConfirm}
              disabled={!selectedPhrase || !customName}
            >
              {t("personalizationModal.buttons.confirm")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
