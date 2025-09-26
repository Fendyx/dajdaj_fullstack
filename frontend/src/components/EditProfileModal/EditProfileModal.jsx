import { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import { useDispatch, useSelector } from "react-redux";
import { updateUserProfile } from "../../slices/authSlice";
import "./EditProfileModal.css";

export default function EditProfileModal({ isOpen, onClose }) {
  const dispatch = useDispatch();
  const { name, deliveryDatas } = useSelector((state) => state.auth);

  const mainDelivery =
    deliveryDatas?.find((d) => d.deliveryId === 1) || {
      delivery: {},
      personalData: {},
    };

  const [formData, setFormData] = useState({
    name: "",
    address: "",
    method: "",
    phone: "",
  });

  useEffect(() => {
    if (isOpen) {
      setFormData({
        name: name || "",
        address: mainDelivery.delivery?.address || "",
        method: mainDelivery.delivery?.method || "",
        phone: mainDelivery.personalData?.phone || "",
      });
    }
  }, [isOpen, name, mainDelivery]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleMethodSelect = (method) => {
    setFormData({ ...formData, method });
  };

  const handleSave = async () => {
    await dispatch(updateUserProfile(formData));
    onClose();
  };

  if (!isOpen) return null;

  const modalContent = (
    <div className="uc-modal-overlay">
      <div className="uc-modal-fullscreen">
        <h2>Редактировать профиль</h2>

        <label>
          Имя:
          <input name="name" value={formData.name} onChange={handleChange} />
        </label>

        <label>
          Адрес:
          <input name="address" value={formData.address} onChange={handleChange} />
        </label>

        <div className="uc-method-selector">
          <p>Способ доставки:</p>
          {["InPost", "ORLEN Paczka", "Poczta Polska"].map((option) => (
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
