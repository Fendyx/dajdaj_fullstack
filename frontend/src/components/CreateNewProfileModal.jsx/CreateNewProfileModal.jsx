import { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import { useSelector } from "react-redux";
import { useAddDeliveryDataMutation } from "../../slices/userApi";
import "./CreateNewProfileModal.css";

export default function CreateNewProfileModal({ isOpen, onClose }) {
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

  useEffect(() => {
    if (isOpen) {
      setFormData((prev) => ({
        ...prev,
        email: userEmail || "",
      }));
    }
  }, [isOpen, userEmail]);

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
    <div className="uc-modal-overlay">
      <div className="uc-modal-fullscreen">
        <h2>Создать новый профиль</h2>

        <label>
          Имя:
          <input name="name" value={formData.name} onChange={handleChange} />
        </label>

        <label>
          Фамилия:
          <input name="surname" value={formData.surname} onChange={handleChange} />
        </label>

        <label>
          Email:
          <input name="email" value={formData.email} readOnly />
        </label>

        <label>
          Адрес:
          <input name="address" value={formData.address} onChange={handleChange} />
        </label>

        <div className="uc-method-selector">
          <p>Способ доставки:</p>
          {["InPost", "ORLEN Paczka", "Poczta Polska", "flash"].map((option) => (
            <div
              key={option}
              className={`uc-method-option ${
                formData.method === option ? "selected" : ""
              }`}
              onClick={() => handleMethodSelect(option)}
            >
              {option}
            </div>
          ))}
        </div>

        <label>
          Телефон:
          <input name="phone" value={formData.phone} onChange={handleChange} />
        </label>

        <div className="uc-modal-actions">
          <button onClick={handleSave}>Сохранить</button>
          <button onClick={onClose}>Отмена</button>
        </div>
      </div>
    </div>
  );

  return ReactDOM.createPortal(modalContent, document.body);
}
