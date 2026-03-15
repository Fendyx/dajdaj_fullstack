import { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import { useTranslation } from "react-i18next";
import { X, User, Mail, Phone, MapPin, PackageOpen } from "lucide-react";

import { useAppSelector } from "@/store/hooks";
import { useAddDeliveryDataMutation } from "@/services/userApi";
import "./CreateNewProfileModal.css";

interface CreateNewProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateNewProfileModal({ isOpen, onClose }: CreateNewProfileModalProps) {
  const { t } = useTranslation();
  const [addDeliveryData, { isLoading }] = useAddDeliveryDataMutation();
  
  const userEmail = useAppSelector((state) => state.auth.email);

  const [formData, setFormData] = useState({
    name: "",
    surname: "",
    address: "",
    method: "",
    phone: "",
    email: "",
  });

  useEffect(() => {
    if (isOpen) {
      setFormData((prev) => ({ ...prev, email: userEmail || "" }));
      document.body.style.overflow = "hidden";
    }
    return () => { document.body.style.overflow = "auto"; };
  }, [isOpen, userEmail]);

  useEffect(() => {
    if (!isOpen) return;

    // Добавляем запись в историю для мобильной кнопки "Назад"
    if (!window.history.state?.modal) {
      window.history.pushState({ modal: true }, "");
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleBackClick();
    };

    const handlePopState = () => {
      onClose(); // Если пользователь нажал системную кнопку "Назад"
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("popstate", handlePopState);
    };
  }, [isOpen, onClose]); // 🔥 Добавили onClose в зависимости

  const handleBackClick = () => {
    onClose(); // 1. Моментально закрываем модалку в UI
    
    // 2. Если мы добавляли запись в историю, убираем её, чтобы не засорять браузер
    if (window.history.state?.modal) {
      window.history.back();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleMethodSelect = (method: string) => {
    setFormData({ ...formData, method });
  };

  const handleSave = async () => {
    try {
      await addDeliveryData({
        personalData: {
          name: formData.name,
          surname: formData.surname,
          email: formData.email,
          phone: formData.phone,
        },
        delivery: {
          address: formData.address,
          method: formData.method,
        },
      }).unwrap(); 
      
      handleBackClick(); // Теперь это сработает мгновенно после сохранения
    } catch (err) {
      console.error("Ошибка при добавлении профиля:", err);
    }
  };

  if (!isOpen) return null;

  const modalContent = (
    <div className="cnp-modal-overlay">
      <div className="cnp-modal-container">
        
        {/* Header */}
        <div className="cnp-header">
          <h1 className="cnp-title">{t("create-new-profile-modal.title", "Новый профиль")}</h1>
          <button
            className="cnp-close-btn"
            onClick={handleBackClick}
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="cnp-content">
          <div className="cnp-form">
            
            {/* Personal Info Section */}
            <div className="cnp-section">
              <h2 className="cnp-section-title">{t("create-new-profile-modal.personalInfo", "Личная информация")}</h2>
              
              <div className="cnp-row">
                <div className="cnp-input-group">
                  <label className="cnp-label">{t("create-new-profile-modal.name", "Имя")}</label>
                  <div className="cnp-input-wrapper">
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="cnp-input"
                      placeholder={t("create-new-profile-modal.namePlaceholder", "Введите имя")}
                    />
                    <User className="cnp-input-icon" size={17} />
                  </div>
                </div>

                <div className="cnp-input-group">
                  <label className="cnp-label">{t("create-new-profile-modal.surname", "Фамилия")}</label>
                  <div className="cnp-input-wrapper">
                    <input
                      type="text"
                      name="surname"
                      value={formData.surname}
                      onChange={handleChange}
                      className="cnp-input cnp-input-no-icon"
                      placeholder={t("create-new-profile-modal.surnamePlaceholder", "Введите фамилию")}
                    />
                  </div>
                </div>
              </div>

              <div className="cnp-row">
                <div className="cnp-input-group">
                  <label className="cnp-label">Email</label>
                  <div className="cnp-input-wrapper">
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      readOnly
                      className="cnp-input cnp-input-readonly"
                    />
                    <Mail className="cnp-input-icon" size={17} />
                  </div>
                </div>

                <div className="cnp-input-group">
                  <label className="cnp-label">{t("create-new-profile-modal.phone", "Телефон")}</label>
                  <div className="cnp-input-wrapper">
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="cnp-input"
                      placeholder="+48 000 000 000"
                    />
                    <Phone className="cnp-input-icon" size={17} />
                  </div>
                </div>
              </div>
            </div>

            {/* Delivery Section */}
            <div className="cnp-section">
              <h2 className="cnp-section-title">{t("create-new-profile-modal.delivery", "Доставка")}</h2>
              
              <div className="cnp-input-group cnp-input-group-full">
                <label className="cnp-label">{t("create-new-profile-modal.address", "Адрес")}</label>
                <div className="cnp-input-wrapper">
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    className="cnp-input"
                    placeholder={t("create-new-profile-modal.addressPlaceholder", "Введите адрес доставки")}
                  />
                  <MapPin className="cnp-input-icon" size={17} />
                </div>
              </div>

              <div className="cnp-input-group cnp-input-group-full">
                <label className="cnp-label">{t("create-new-profile-modal.method", "Способ доставки")}</label>
                <div className="cnp-method-grid">
                  {["InPost", "ORLEN Paczka", "Poczta Polska"].map((option) => (
                    <button
                      key={option}
                      type="button"
                      className={`cnp-method-card ${formData.method === option ? "selected" : ""}`}
                      onClick={() => handleMethodSelect(option)}
                    >
                      <PackageOpen className="cnp-method-icon" size={20} />
                      <span className="cnp-method-name">{option}</span>
                      
                      <div className="cnp-radio-circle">
                        {formData.method === option && <div className="cnp-radio-dot" />}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="cnp-footer">
          <button
            type="button"
            onClick={handleBackClick}
            className="cnp-btn cnp-btn-secondary"
            disabled={isLoading}
          >
            {t("create-new-profile-modal.cancel", "Отмена")}
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="cnp-btn cnp-btn-primary"
            disabled={isLoading}
          >
            {isLoading ? t("create-new-profile-modal.saving", "Сохранение...") : t("create-new-profile-modal.save", "Сохранить")}
          </button>
        </div>
      </div>
    </div>
  );

  return ReactDOM.createPortal(modalContent, document.body);
}