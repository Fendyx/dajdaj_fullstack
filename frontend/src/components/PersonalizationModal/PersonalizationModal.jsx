import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import "./PersonalizationModal.css";
import { useTranslation } from "react-i18next";
import { useDispatch } from "react-redux";
import { addToCart } from "../../slices/cartSlice";
import { useUI } from "../../context/UIContext";

export function PersonalizationModal({ product, onClose, onConfirm }) {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { setIsModalOpen } = useUI();

  const [selectedPhrase, setSelectedPhrase] = useState("");
  const [customName, setCustomName] = useState("");
  const PRESET_PHRASES = product?.phrases || [];

  useEffect(() => {
    setIsModalOpen(true);
  
    // Проверяем, если текущий state не modal и не был уже установлен
    if (!window.history.state?.modal) {
      window.history.pushState({ modal: true }, "");
    }
  
    const handlePopState = () => {
      onClose();
      setIsModalOpen(false);
    };
  
    window.addEventListener("popstate", handlePopState);
  
    return () => {
      window.removeEventListener("popstate", handlePopState);
      setIsModalOpen(false);
    };
  }, []);
  
  

  const handleConfirm = () => {
    const personalizedData = {
      personalization: { phrase: selectedPhrase, customName },
    };
    if (onConfirm) {
      onConfirm(personalizedData); // делаем, как в ProductGrid
    } else {
      dispatch(addToCart({ ...product, ...personalizedData }));
    }
    onClose();
  };

  const modalContent = (
    <div className="personalization-overlay">
      <div className="personalization-modal">
        <div className="modal-header">
          <button
            className="back-btn"
            onClick={() => {
              window.history.back(); // ← вместо прямого onClose
              setIsModalOpen(false);
            }}
          >
            ← {t("personalizationModal.buttons.back")}
          </button>
        </div>

        <div className="modal-body">
          <div className="image-section">
            <img
              src={product.image}
              alt={product.name}
              className="product-preview"
            />
          </div>

          <div className="content-section">
            <h2>{t("personalizationModal.title")}</h2>

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

  return ReactDOM.createPortal(modalContent, document.body);
}
