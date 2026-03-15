import { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import { useTranslation } from "react-i18next";
import { X } from "lucide-react";
import {
  useGetUserProfileQuery,
  useUpdateDeliveryDataMutation,
} from "@/services/userApi";
import "./EditProfileModal.css";

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  deliveryId: number | null; // какой профиль редактируем
}

export function EditProfileModal({ isOpen, onClose, deliveryId }: EditProfileModalProps) {
  const { t } = useTranslation();

  // Берём данные из кэша RTK Query — без лишнего запроса
  const { data: userProfile } = useGetUserProfileQuery(undefined, { skip: !isOpen });
  const [updateDelivery, { isLoading }] = useUpdateDeliveryDataMutation();

  const [formData, setFormData] = useState({
    name: "",
    surname: "",
    email: "",
    phone: "",
    address: "",
    method: "",
  });

  // Заполняем форму данными нужного профиля
  useEffect(() => {
    if (!isOpen || !userProfile) return;

    document.body.style.overflow = "hidden";

    const profile = deliveryId !== null
      ? userProfile.deliveryDatas?.find((d: any) => d.deliveryId === deliveryId)
      : null;

    if (profile) {
      setFormData({
        name:    profile.personalData?.name    || "",
        surname: profile.personalData?.surname || "",
        email:   profile.personalData?.email   || "",
        phone:   profile.personalData?.phone   || "",
        address: profile.delivery?.address     || "",
        method:  profile.delivery?.method      || "",
      });
    }

    return () => { document.body.style.overflow = "auto"; };
  }, [isOpen, userProfile, deliveryId]);

  // Keyboard + mobile back
  useEffect(() => {
    if (!isOpen) return;
    
    // Добавляем запись в историю для мобильной кнопки "Назад"
    if (!window.history.state?.modal) {
      window.history.pushState({ modal: true }, "");
    }

    const onKey = (e: KeyboardEvent) => { 
      if (e.key === "Escape") handleClose(); 
    };
    
    const onPop = () => {
      onClose(); // Если пользователь нажал системную кнопку "Назад"
    };

    window.addEventListener("keydown", onKey);
    window.addEventListener("popstate", onPop);
    
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("popstate", onPop);
    };
  }, [isOpen, onClose]); // 🔥 Обязательно добавили onClose в зависимости!

  const handleClose = () => {
    onClose(); // 1. Моментально закрываем модалку в UI
    
    // 2. Если мы добавляли запись в историю, убираем её, чтобы не засорять браузер
    if (window.history.state?.modal) {
      window.history.back(); 
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleMethodSelect = (method: string) => {
    setFormData((prev) => ({ ...prev, method }));
  };

  const handleSave = async () => {
    if (deliveryId === null) return;

    try {
      await updateDelivery({
        deliveryId,
        data: {
          personalData: {
            name:    formData.name,
            surname: formData.surname,
            email:   formData.email,
            phone:   formData.phone,
          },
          delivery: {
            address: formData.address,
            method:  formData.method,
          },
        },
      }).unwrap();
      // RTK Query сам инвалидирует ["Profile"] и обновит UI
      handleClose();
    } catch (err) {
      console.error("Failed to update delivery profile:", err);
    }
  };

  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <div className="cnp-modal-overlay">
      <div className="cnp-modal-container">

        {/* Header */}
        <div className="cnp-header">
          <button className="cnp-close-btn" onClick={onClose} aria-label="Close">
            <X size={24} />
          </button>
          <h1 className="cnp-title">
            {t("profile.edit.title", "Edit delivery profile")}
          </h1>
          <div className="cnp-header-spacer" />
        </div>

        {/* Content */}
        <div className="cnp-content">
          <div className="cnp-form">

            {/* Personal Info */}
            <div className="cnp-section">
              <h2 className="cnp-section-title">
                {t("profile.edit.personalInfo", "Personal Information")}
              </h2>

              <div className="cnp-row">
                <div className="cnp-input-group">
                  <label className="cnp-label">{t("profile.edit.name", "First Name")}</label>
                  <input className="cnp-input" type="text" name="name" value={formData.name} onChange={handleChange} placeholder="John" />
                </div>
                <div className="cnp-input-group">
                  <label className="cnp-label">{t("profile.edit.surname", "Last Name")}</label>
                  <input className="cnp-input" type="text" name="surname" value={formData.surname} onChange={handleChange} placeholder="Doe" />
                </div>
              </div>

              <div className="cnp-row">
                <div className="cnp-input-group">
                  <label className="cnp-label">Email</label>
                  <input className="cnp-input" type="email" name="email" value={formData.email} onChange={handleChange} placeholder="you@example.com" />
                </div>
                <div className="cnp-input-group">
                  <label className="cnp-label">{t("profile.edit.phone", "Phone")}</label>
                  <input className="cnp-input" type="tel" name="phone" value={formData.phone} onChange={handleChange} placeholder="+48 000 000 000" />
                </div>
              </div>
            </div>

            {/* Delivery */}
            <div className="cnp-section">
              <h2 className="cnp-section-title">
                {t("profile.edit.delivery", "Delivery")}
              </h2>

              <div className="cnp-input-group cnp-input-group-full">
                <label className="cnp-label">{t("profile.edit.address", "Address")}</label>
                <input className="cnp-input" type="text" name="address" value={formData.address} onChange={handleChange} placeholder="Ul. Złota 44/2, Warsaw" />
              </div>

              <div className="cnp-input-group cnp-input-group-full">
                <label className="cnp-label">{t("profile.edit.method", "Delivery Method")}</label>
                <div className="cnp-method-grid">
                  {["InPost", "ORLEN Paczka", "Poczta Polska"].map((option) => (
                    <button
                      key={option}
                      type="button"
                      className={`cnp-method-card ${formData.method === option ? "cnp-method-card-selected" : ""}`}
                      onClick={() => handleMethodSelect(option)}
                    >
                      <div className="cnp-method-radio">
                        <div className="cnp-method-radio-inner" />
                      </div>
                      <span className="cnp-method-name">{option}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="cnp-footer">
          <button type="button" className="cnp-btn cnp-btn-secondary" onClick={onClose} disabled={isLoading}>
            {t("profile.edit.cancel", "Cancel")}
          </button>
          <button type="button" className="cnp-btn cnp-btn-primary" onClick={handleSave} disabled={isLoading || deliveryId === null}>
            {isLoading ? t("profile.edit.saving", "Saving...") : t("profile.edit.save", "Save")}
          </button>
        </div>

      </div>
    </div>,
    document.body
  );
}