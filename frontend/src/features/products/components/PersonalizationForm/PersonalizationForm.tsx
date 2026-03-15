// src/features/products/components/PersonalizationForm/PersonalizationForm.tsx
import { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Check, Pen, List, CloudUpload, ImageIcon, CheckCircle } from "lucide-react";
import { saveOrderToDB } from "@/utils/db";
import "./PersonalizationForm.css";

export type PersonalizationData =
  | { type: "figurine"; phrase: string; customName: string }
  | { type: "custom"; inscription: string; tempStorageId: string; thumbnailImage: string };

interface PersonalizationFormProps {
  product: any;
  onChange: (data: PersonalizationData | null) => void;
  shake?: boolean; // триггер подсветки — родитель ставит true, форма сама сбрасывает
  onShakeEnd?: () => void; // колбэк после окончания анимации
}

const CART_PLACEHOLDER = "/dajdaj_logo1.png";

const convertToBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
  });

const createThumbnail = (file: File): Promise<string> =>
  new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const maxSize = 150;
        let w = img.width, h = img.height;
        if (w > h) { if (w > maxSize) { h *= maxSize / w; w = maxSize; } }
        else { if (h > maxSize) { w *= maxSize / h; h = maxSize; } }
        canvas.width = w; canvas.height = h;
        canvas.getContext("2d")!.drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL("image/jpeg", 0.7));
      };
      img.src = e.target!.result as string;
    };
    reader.readAsDataURL(file);
  });

export function PersonalizationForm({ product, onChange, shake, onShakeEnd }: PersonalizationFormProps) {
  const { t } = useTranslation();
  const [isShaking, setIsShaking] = useState(false);
  const type = product?.personalizationType as "figurine" | "custom";

  // Запускаем анимацию когда родитель выставляет shake=true
  useEffect(() => {
    if (!shake) return;
    setIsShaking(true);

    // Скроллим форму в видимую область (актуально на мобиле)
    const el = document.querySelector(".pf-shell");
    el?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [shake]);

  const handleAnimationEnd = () => {
    setIsShaking(false);
    onShakeEnd?.(); // говорим родителю что можно сбросить shake
  };

  return (
    <div
      className={`pf-shell${isShaking ? " pf-shell--shake" : ""}`}
      onAnimationEnd={handleAnimationEnd}
    >
      <div className="pf-shell-label">
        {t("personalization.title", "Personalization")}
      </div>

      {type === "figurine" && <FigurineForm product={product} onChange={onChange} />}
      {type === "custom"   && <CustomForm onChange={onChange} />}
    </div>
  );
}

// ── Режим 1: Фигурки ──────────────────────────────────────────────────────────

function FigurineForm({ product, onChange }: {
  product: any;
  onChange: (data: PersonalizationData | null) => void;
}) {
  const { t } = useTranslation();
  const PRESET_PHRASES: string[] = product?.phrases || [];

  const [phraseMode, setPhraseMode] = useState<"preset" | "custom">("preset");
  const [selectedPhrase, setSelectedPhrase] = useState("");
  const [customPhraseInput, setCustomPhraseInput] = useState("");
  const [customName, setCustomName] = useState("");

  useEffect(() => {
    const phrase = phraseMode === "preset" ? selectedPhrase : customPhraseInput.trim();
    const valid = phrase.length > 0 && customName.trim().length > 0;
    onChange(valid ? { type: "figurine", phrase, customName: customName.trim() } : null);
  }, [phraseMode, selectedPhrase, customPhraseInput, customName, onChange]);

  return (
    <>
      <div className="pf-group">
        <p className="pf-step-label">
          <span className="pf-step-badge">1</span>
          {t("personalization.step1", "Inscription on the box")}
        </p>

        <div className="pf-mode-switcher">
          <button className={`pf-mode-btn ${phraseMode === "preset" ? "active" : ""}`} onClick={() => setPhraseMode("preset")} type="button">
            <List size={15} />{t("personalization.chooseFromList", "Choose from list")}
          </button>
          <button className={`pf-mode-btn ${phraseMode === "custom" ? "active" : ""}`} onClick={() => setPhraseMode("custom")} type="button">
            <Pen size={15} />{t("personalization.writeOwn", "Write my own")}
          </button>
        </div>

        {phraseMode === "preset" ? (
          <div className="pf-options-grid">
            {PRESET_PHRASES.map((phrase, i) => (
              <div key={i} className={`pf-option-card ${selectedPhrase === phrase ? "active" : ""}`} onClick={() => setSelectedPhrase(phrase)}>
                <span>{phrase}</span>
                {selectedPhrase === phrase && <div className="pf-check"><Check size={13} /></div>}
              </div>
            ))}
          </div>
        ) : (
          <div className="pf-field-wrapper">
            <textarea className="pf-textarea" value={customPhraseInput} onChange={(e) => setCustomPhraseInput(e.target.value)}
              placeholder={t("personalization.placeholderPhrase", "Best Dad in the World...")} maxLength={50} rows={3} />
            <span className="pf-char-count">{customPhraseInput.length}/50</span>
          </div>
        )}
      </div>

      <div className="pf-group">
        <p className="pf-step-label">
          <span className="pf-step-badge">2</span>
          {t("personalization.step2", "Enter name")}
        </p>
        <div className="pf-field-wrapper">
          <input type="text" className="pf-input" value={customName} onChange={(e) => setCustomName(e.target.value)}
            placeholder={t("personalization.placeholderName", "E.g. John Doe")} maxLength={15} />
          <span className="pf-char-count pf-char-count--inline">{customName.length}/15</span>
        </div>
      </div>
    </>
  );
}

// ── Режим 2: Кастомная фигурка ────────────────────────────────────────────────

function CustomForm({ onChange }: { onChange: (data: PersonalizationData | null) => void }) {
  const { t } = useTranslation();
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [inscription, setInscription] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [savedId, setSavedId] = useState<string | null>(null);
  const [thumbnail, setThumbnail] = useState<string>(CART_PLACEHOLDER);

  const handleFiles = useCallback(async (files: File[]) => {
    setSelectedFiles(files);
    setSavedId(null);
    onChange(null);
    if (files.length === 0) return;
  
    setIsProcessing(true);
    try {
      // Загружаем на Cloudinary через наш бек
      const formData = new FormData();
      files.forEach((file) => formData.append("images", file));
  
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/upload`, {
        method: "POST",
        body: formData,
        // НЕ ставь Content-Type — браузер сам выставит multipart/form-data
      });
  
      if (!response.ok) throw new Error("Upload failed");
  
      const { urls } = await response.json();
  
      // Thumbnail только для превью в корзине — делаем локально
      const thumb = await createThumbnail(files[0]).catch(() => CART_PLACEHOLDER);
      const tempId = `custom_${Date.now()}`;
  
      // В IndexedDB теперь храним только URLs и thumbnail, не base64
      await saveOrderToDB({ 
        id: tempId, 
        inscription, 
        images: urls,  // URLs вместо base64
        timestamp: Date.now() 
      });
  
      setSavedId(tempId);
      setThumbnail(thumb);
      onChange({ type: "custom", inscription, tempStorageId: tempId, thumbnailImage: thumb });
    } catch (err) {
      console.error("Photo processing error:", err);
      onChange(null);
    } finally {
      setIsProcessing(false);
    }
  }, [inscription, onChange]);

  useEffect(() => {
    if (savedId && selectedFiles.length > 0) {
      onChange({ type: "custom", inscription, tempStorageId: savedId, thumbnailImage: thumbnail });
    }
  }, [inscription]);

  const hasFiles = selectedFiles.length > 0;

  return (
    <>
      <div className="pf-group">
        <p className="pf-step-label">
          <span className="pf-step-badge">1</span>
          {t("personalization.uploadPhoto", "Upload your photo")}
        </p>

        <div className="pf-upload-wrapper">
          <input id="pf-photo-upload" type="file" multiple accept="image/*"
            onChange={(e) => e.target.files && handleFiles(Array.from(e.target.files))}
            className="pf-file-input" />
          <label htmlFor="pf-photo-upload"
            className={`pf-upload-area ${hasFiles ? "pf-upload-area--success" : ""} ${isProcessing ? "pf-upload-area--processing" : ""}`}>
            {isProcessing ? <div className="pf-upload-spinner" /> :
              hasFiles ? <CheckCircle size={28} className="pf-upload-icon pf-upload-icon--success" /> :
              <CloudUpload size={28} className="pf-upload-icon" />}
            <p className="pf-upload-text">
              {isProcessing ? t("personalization.processing", "Processing...") :
               hasFiles ? t("personalization.photosLoaded", "Photos loaded!") :
               t("personalization.tapToUpload", "Tap to upload photos")}
            </p>
            <p className="pf-upload-hint">{t("personalization.uploadHint", "Selfies, full body, any clear image")}</p>
          </label>

          {hasFiles && !isProcessing && (
            <div className="pf-file-list">
              {selectedFiles.map((f, i) => (
                <div key={i} className="pf-file-item">
                  <ImageIcon size={14} />
                  <span className="pf-file-name">{f.name}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="pf-group">
        <p className="pf-step-label">
          <span className="pf-step-badge">2</span>
          {t("personalization.inscription", "Inscription")}
          <span className="pf-optional-badge">{t("personalization.optional", "Optional")}</span>
        </p>
        <div className="pf-field-wrapper">
          <input type="text" className="pf-input" value={inscription} onChange={(e) => setInscription(e.target.value)}
            placeholder={t("personalization.inscriptionPlaceholder", "E.g. Super Dad, Happy Birthday...")} maxLength={50} />
          <span className="pf-char-count pf-char-count--inline">{inscription.length}/50</span>
        </div>
      </div>
    </>
  );
}