import React, { useState } from "react";
import "./PersonalizationModal.css";

export function PersonalizationModal({ product, onClose, onConfirm }) {
  const [selectedPhrase, setSelectedPhrase] = useState("");
  const [customName, setCustomName] = useState("");

  // ✅ Массив фраз берём здесь, когда есть продукт
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
            ← Return
          </button>
        </div>

        <div className="modal-body">
          {/* Left column (Product Image) */}
          <div className="image-section">
            <img src={product.image} alt={product.name} className="product-preview" />
          </div>

          {/* Right column (Personalization options) */}
          <div className="content-section">
            <h2>Personalize Your Product</h2>

            <div className="preset-phrases">
              {PRESET_PHRASES.map((phrase, index) => (
                <div
                  key={index}
                  className={`phrase-block ${selectedPhrase === phrase ? "selected" : ""}`}
                  onClick={() => setSelectedPhrase(phrase)}
                >
                  {phrase}
                </div>
              ))}
            </div>

            <div className="custom-name">
              <label>Enter a name for personalization</label>
              <input
                type="text"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                placeholder="Type name here..."
              />
            </div>

            <button
              className="confirm-btn"
              onClick={handleConfirm}
              disabled={!selectedPhrase || !customName}
            >
              Personalize & Add to Cart
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
