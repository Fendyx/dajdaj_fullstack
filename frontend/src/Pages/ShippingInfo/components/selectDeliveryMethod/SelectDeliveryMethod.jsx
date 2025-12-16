import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import { UserCard } from "../../../../components/UserProfile/components/UserCard/UserCard";
import { FlippableDeliveryCard } from "../../../../components/UserProfile/components/FlippableDeliveryCard/FlippableDeliveryCard";
import AnotherShippingInfoModal from "./AnotherShippingInfoModal";
// Импортируем твой НОВЫЙ компонент формы
import PersonalInformationForm from "../../../../components/CheckoutStripe/PersonalInformationForm"; 
import "./SelectDeliveryMethod.css";

export default function SelectDeliveryMethod({ onSelectDelivery, formData, handleChange }) {
  const auth = useSelector((state) => state.auth);
  const navigate = useNavigate();

  const [flipStates, setFlipStates] = useState({});
  const [selectedKey, setSelectedKey] = useState(null);
  const [showModal, setShowModal] = useState(false);
  
  // Состояние: показываем форму добавления или нет
  const [isAddingNew, setIsAddingNew] = useState(false);

  // Проверяем, есть ли сохраненные данные доставки
  const deliveryDatas = auth?.deliveryDatas || [];
  const hasSavedAddresses = deliveryDatas.length > 0;

  // --- ГЛАВНАЯ ЛОГИКА ---
  // Если у пользователя НЕТ адресов, мы принудительно включаем режим "isAddingNew"
  useEffect(() => {
    if (!auth.token) {
      navigate("/login");
      return;
    }

    if (!hasSavedAddresses) {
      setIsAddingNew(true);
    } else {
      // Если адреса есть, по дефолту показываем карточку
      setIsAddingNew(false);
    }
  }, [auth, hasSavedAddresses, navigate]);

  // --- ЛОГИКА КАРТОЧЕК ---
  const [mainDelivery, ...extraDeliveries] = deliveryDatas;
  const mainKey = `main-${auth?.id}`;

  const handleEditProfile = (profileId) => console.log("Edit profile", profileId);
  const handleLogOut = () => console.log("Logging out");

  // Кнопка "Add New" из модалки
  const handleAddNewProfile = () => {
    setShowModal(false);
    setIsAddingNew(true);
  };

  // Логика "Назад" (работает только если есть куда возвращаться)
  const handleBack = () => {
    if (hasSavedAddresses) {
      setIsAddingNew(false);
    }
  };

  const toggleFlip = (cardKey) => {
    setFlipStates((prev) => ({
      ...prev,
      [cardKey]: !prev[cardKey],
    }));
  };

  // Авто-выбор основного адреса при загрузке (если он есть)
  useEffect(() => {
    if (mainDelivery && onSelectDelivery && !isAddingNew) {
      setSelectedKey(mainKey);
      onSelectDelivery({
        userId: auth?.id,
        personalData: mainDelivery?.personalData,
        delivery: mainDelivery?.delivery,
      });
    }
  }, [mainDelivery, auth, mainKey, onSelectDelivery, isAddingNew]);

  const handleSelect = (delivery, key) => {
    setSelectedKey(key);
    if (onSelectDelivery) {
      onSelectDelivery({
        userId: auth?.id,
        personalData: delivery?.personalData,
        delivery: delivery?.delivery,
      });
    }
  };

  // Рендер выбранной карточки
  const selectedDeliveryCard = (() => {
    if (!hasSavedAddresses) return null;

    if (selectedKey === null || selectedKey === mainKey) {
      return (
        <UserCard
          profile={{
            ...auth,
            delivery: mainDelivery?.delivery,
            personalData: mainDelivery?.personalData,
          }}
          onEdit={() => handleEditProfile(auth.id)}
          onClick={() => toggleFlip(mainKey)}
          onLogOut={handleLogOut}
          isFlipped={flipStates[mainKey] || false}
        />
      );
    }

    const match = extraDeliveries.find(
      (_, idx) => `extra-${auth.id}-${idx}` === selectedKey
    );
    if (!match) return null;

    return (
      <FlippableDeliveryCard
        profile={{
          ...auth,
          ...match.personalData,
          delivery: match.delivery,
          personalData: match.personalData,
        }}
        onEdit={() => handleEditProfile(auth.id)}
        onClick={() => {
          toggleFlip(selectedKey);
          handleSelect(match, selectedKey);
        }}
        onLogOut={handleLogOut}
        isFlipped={flipStates[selectedKey] || false}
      />
    );
  })();

  return (
    <div className="shipping-card-wrapper">
      <div className="shipping-header">
        <h2 className="shipping-title">
          {/* Меняем заголовок в зависимости от контекста */}
          {isAddingNew && !hasSavedAddresses 
            ? "Enter Shipping Details" 
            : "Shipping info"}
        </h2>
        
        {/* Показываем кнопку Change ТОЛЬКО если мы в режиме просмотра карточки */}
        {!isAddingNew && hasSavedAddresses && (
          <button 
            className="change-btn" 
            onClick={() => setShowModal(true)}
            type="button"
          >
            Change
          </button>
        )}
        
        {/* Показываем кнопку Cancel/Back ТОЛЬКО если мы добавляем новый, но старые ЕСТЬ */}
        {isAddingNew && hasSavedAddresses && (
           <button 
           className="change-btn" 
           onClick={handleBack}
           type="button"
         >
           Cancel
         </button>
        )}
      </div>

      {isAddingNew ? (
        <div className="personal-info-form-section">
          {/* Вставляем твой новый красивый компонент формы */}
          <PersonalInformationForm
            formData={formData}
            handleChange={handleChange}
          />
        </div>
      ) : (
        <div className="selected-card-container">
          {selectedDeliveryCard}
        </div>
      )}

      {showModal && (
        <AnotherShippingInfoModal
          profile={auth}
          flipStates={flipStates}
          toggleFlip={toggleFlip}
          selectedKey={selectedKey || mainKey}
          setSelectedKey={(key) => {
            setSelectedKey(key);
            let newDelivery;
            if (key === mainKey) newDelivery = mainDelivery;
            else
              newDelivery = extraDeliveries.find(
                (_, idx) => `extra-${auth.id}-${idx}` === key
              );

            if (newDelivery) {
              handleSelect(newDelivery, key);
            }
            setShowModal(false);
          }}
          onClose={() => setShowModal(false)}
          onEditProfile={handleEditProfile}
          onLogOut={handleLogOut}
          onAddNewProfile={handleAddNewProfile}
        />
      )}
    </div>
  );
}