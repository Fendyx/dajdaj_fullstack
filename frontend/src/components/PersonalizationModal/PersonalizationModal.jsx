import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import "./PersonalizationModal.css";
import { useTranslation } from "react-i18next";
import { useDispatch } from "react-redux";
import { addToCart } from "../../slices/cartSlice";
import { useUI } from "../../context/UIContext";
import { FaCheck, FaArrowLeft, FaTimes, FaPen, FaListUl } from "react-icons/fa";

export function PersonalizationModal({ product, onClose, onConfirm }) {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { setIsModalOpen } = useUI();

  // Состояние: 'preset' (готовые) или 'custom' (свой текст)
  const [phraseMode, setPhraseMode] = useState("preset"); 
  const [selectedPhrase, setSelectedPhrase] = useState("");
  const [customPhraseInput, setCustomPhraseInput] = useState("");
  const [customName, setCustomName] = useState("");

  const PRESET_PHRASES = product?.phrases || [];

  useEffect(() => {
    setIsModalOpen(true);
    document.body.style.overflow = "hidden";

    if (!window.history.state?.modal) {
      window.history.pushState({ modal: true }, "");
    }

    const handlePopState = () => closeModal();
    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
      document.body.style.overflow = "auto";
      setIsModalOpen(false);
    };
  }, []);

  const closeModal = () => {
    if (window.history.state?.modal) {
      window.history.back();
    } else {
      onClose();
    }
  };

  const handleConfirm = () => {
    // Определяем, какую фразу брать
    const finalPhrase = phraseMode === "preset" ? selectedPhrase : customPhraseInput;

    const personalizedData = {
      personalization: { 
        phrase: finalPhrase, 
        customName: customName 
      },
    };

    if (onConfirm) {
      onConfirm(personalizedData);
    } else {
      dispatch(addToCart({ ...product, ...personalizedData }));
    }
    onClose();
  };

  // Валидация:
  // 1. Если режим "preset" — должна быть выбрана фраза.
  // 2. Если режим "custom" — поле ввода не должно быть пустым.
  // 3. Имя всегда должно быть заполнено.
  const isPhraseValid = phraseMode === "preset" 
    ? selectedPhrase.length > 0 
    : customPhraseInput.trim().length > 0;
    
  const isFormValid = isPhraseValid && customName.trim().length > 0;

  const modalContent = (
    <div className="personalization-overlay">
      <div className="personalization-modal">
        
        {/* Header */}
        <div className="modal-header">
          <button className="header-btn back" onClick={closeModal}>
            <FaArrowLeft />
            <span className="desktop-only">{t("personalizationModal.buttons.back", "Back")}</span>
          </button>
          <h3 className="modal-title">{t("personalizationModal.title", "Customize Your Beer")}</h3>
          <button className="header-btn close" onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        <div className="modal-body">
          {/* LEFT SIDE: Static Image */}
          <div className="preview-section">
            <div className="preview-container">
              <img
                src={product.image}
                alt={product.name}
                className="product-image"
              />
            </div>
          </div>

          {/* RIGHT SIDE: Controls */}
          <div className="controls-section">
            <div className="scrollable-content">
              
              {/* Step 1: Phrase Selection Mode */}
              <div className="control-group">
                <div className="group-header">
                  <span className="step-badge">1</span>
                  <h4>{t("personalizationModal.step1", "Inscription on the box")}</h4>
                </div>

                {/* TABS SWITCHER */}
                <div className="mode-switcher">
                  <button 
                    className={`mode-btn ${phraseMode === "preset" ? "active" : ""}`}
                    onClick={() => setPhraseMode("preset")}
                  >
                    <FaListUl />
                    {t("personalizationModal.chooseFromList", "Choose from list")}
                  </button>
                  <button 
                    className={`mode-btn ${phraseMode === "custom" ? "active" : ""}`}
                    onClick={() => setPhraseMode("custom")}
                  >
                    <FaPen />
                    {t("personalizationModal.writeOwn", "Write my own")}
                  </button>
                </div>

                {/* CONTENT BASED ON TAB */}
                <div className="mode-content">
                  {phraseMode === "preset" ? (
                    <div className="options-grid">
                      {PRESET_PHRASES.map((phrase, index) => (
                        <div
                          key={index}
                          className={`option-card ${selectedPhrase === phrase ? "active" : ""}`}
                          onClick={() => setSelectedPhrase(phrase)}
                        >
                          <span className="option-text">{phrase}</span>
                          {selectedPhrase === phrase && <div className="check-circle"><FaCheck /></div>}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="custom-phrase-input-wrapper">
                      <label className="input-label">
                        {t("personalizationModal.yourTextLabel", "Your unique text")}
                      </label>
                      <textarea
                        className="custom-textarea"
                        value={customPhraseInput}
                        onChange={(e) => setCustomPhraseInput(e.target.value)}
                        placeholder={t("personalizationModal.placeholderPhrase", "Best Dad in the World...")}
                        maxLength={50} // Ограничение, чтобы не вылезло за пределы коробки
                      />
                      <span className="char-count">{customPhraseInput.length}/50</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Step 2: Name */}
              <div className="control-group">
                <div className="group-header">
                  <span className="step-badge">2</span>
                  <h4>{t("personalizationModal.enterName", "Enter name")}</h4>
                </div>
                <div className="input-wrapper">
                  <input
                    type="text"
                    className="custom-input"
                    value={customName}
                    maxLength={15}
                    onChange={(e) => setCustomName(e.target.value)}
                    placeholder={t("personalizationModal.placeholders.customName", "E.g. John Doe")}
                  />
                  <span className="char-count">{customName.length}/15</span>
                </div>
              </div>

            </div>

            {/* Footer */}
            <div className="modal-footer">
              <div className="price-summary">
                <span>Total:</span>
                <span className="price-value">{product.price} PLN</span>
              </div>
              <button
                className="cta-button"
                onClick={handleConfirm}
                disabled={!isFormValid}
              >
                {t("personalizationModal.buttons.addToCart", "Add to Cart")}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return ReactDOM.createPortal(modalContent, document.body);
}