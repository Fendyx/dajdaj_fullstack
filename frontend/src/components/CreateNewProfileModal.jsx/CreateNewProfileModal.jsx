import { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import { useSelector } from "react-redux";
import { useAddDeliveryDataMutation } from "../../slices/userApi";
import { useTranslation } from "react-i18next";
import "./CreateNewProfileModal.css";

export default function CreateNewProfileModal({ isOpen, onClose }) {
  const { t } = useTranslation();
  const [addDeliveryData] = useAddDeliveryDataMutation();
  const userEmail = useSelector((state) => state.auth.email);

  const [formData, setFormData] = useState({
    name: "",
    surname: "",
    address: "",
    method: "",
    phone: "",
    email: "",
  });

  // вписываем email при открытии
  useEffect(() => {
    if (isOpen) {
      setFormData((prev) => ({
        ...prev,
        email: userEmail || "",
      }));
    }
  }, [isOpen, userEmail]);

  // закрытие по ESC и Back button
  useEffect(() => {
    if (!isOpen) return;

    // помещаем новое состояние для модалки
    if (!window.history.state?.modal) {
      window.history.pushState({ modal: true }, "");
    }

    const handleKeyDown = (e) => {
      if (e.key === "Escape") closeModal();
    };

    const handlePopState = () => closeModal();

    const closeModal = () => {
      onClose();
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("popstate", handlePopState);
    };
  }, [isOpen]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleMethodSelect = (method) => {
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

      onClose();
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
          <button
            className="cnp-close-btn"
            onClick={() => window.history.back()}
            aria-label="Close"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
          <h1 className="cnp-title">{t("create-new-profile-modal.title")}</h1>
          <div className="cnp-header-spacer"></div>
        </div>

        {/* Content */}
        <div className="cnp-content">
          <div className="cnp-form">
            {/* Personal Info Section */}
            <div className="cnp-section">
              <h2 className="cnp-section-title">Личная информация</h2>
              
              <div className="cnp-row">
                <div className="cnp-input-group">
                  <label className="cnp-label">
                    {t("create-new-profile-modal.name")}
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="cnp-input"
                    placeholder="Введите имя"
                  />
                </div>

                <div className="cnp-input-group">
                  <label className="cnp-label">
                    {t("create-new-profile-modal.surname")}
                  </label>
                  <input
                    type="text"
                    name="surname"
                    value={formData.surname}
                    onChange={handleChange}
                    className="cnp-input"
                    placeholder="Введите фамилию"
                  />
                </div>
              </div>

              <div className="cnp-row">
                <div className="cnp-input-group">
                  <label className="cnp-label">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    readOnly
                    className="cnp-input cnp-input-readonly"
                  />
                </div>

                <div className="cnp-input-group">
                  <label className="cnp-label">
                    {t("create-new-profile-modal.phone")}
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="cnp-input"
                    placeholder="+48 000 000 000"
                  />
                </div>
              </div>
            </div>

            {/* Delivery Section */}
            <div className="cnp-section">
              <h2 className="cnp-section-title">Доставка</h2>
              
              <div className="cnp-input-group cnp-input-group-full">
                <label className="cnp-label">
                  {t("create-new-profile-modal.address")}
                </label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  className="cnp-input"
                  placeholder="Введите адрес доставки"
                />
              </div>

              <div className="cnp-input-group cnp-input-group-full">
                <label className="cnp-label">
                  {t("create-new-profile-modal.method")}
                </label>
                <div className="cnp-method-grid">
                  {["InPost", "ORLEN Paczka", "Poczta Polska"].map((option) => (
                    <button
                      key={option}
                      type="button"
                      className={`cnp-method-card ${
                        formData.method === option ? "cnp-method-card-selected" : ""
                      }`}
                      onClick={() => handleMethodSelect(option)}
                    >
                      <div className="cnp-method-radio">
                        <div className="cnp-method-radio-inner"></div>
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
          <button
            type="button"
            onClick={() => window.history.back()}
            className="cnp-btn cnp-btn-secondary"
          >
            {t("create-new-profile-modal.cancel")}
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="cnp-btn cnp-btn-primary"
          >
            {t("create-new-profile-modal.save")}
          </button>
        </div>
      </div>
    </div>
  );

  return ReactDOM.createPortal(modalContent, document.body);
}
