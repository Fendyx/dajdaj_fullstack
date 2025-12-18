import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
// import { useNavigate } from "react-router-dom"; // navigate больше не нужен здесь для блокировки

import { UserCard } from "../../../../components/UserProfile/components/UserCard/UserCard";
import { FlippableDeliveryCard } from "../../../../components/UserProfile/components/FlippableDeliveryCard/FlippableDeliveryCard";
import AnotherShippingInfoModal from "./AnotherShippingInfoModal";
import PersonalInformationForm from "../../../../components/CheckoutStripe/PersonalInformationForm"; 
import "./SelectDeliveryMethod.css";

export default function SelectDeliveryMethod({ onSelectDelivery, formData, handleChange }) {
  const auth = useSelector((state) => state.auth);
  // const navigate = useNavigate(); // Можно убрать

  const [flipStates, setFlipStates] = useState({});
  const [selectedKey, setSelectedKey] = useState(null);
  const [showModal, setShowModal] = useState(false);
  
  const [isAddingNew, setIsAddingNew] = useState(false);

  const deliveryDatas = auth?.deliveryDatas || [];
  const hasSavedAddresses = deliveryDatas.length > 0;

  // --- ИСПРАВЛЕННАЯ ЛОГИКА ---
  useEffect(() => {
    // УБРАЛИ ПРОВЕРКУ (!auth.token) -> navigate("/login")

    // Логика теперь такая:
    // 1. Если это гость (нет токена) -> isAddingNew = true (показываем форму)
    // 2. Если юзер залогинен, но нет адресов -> isAddingNew = true (показываем форму)
    // 3. Если юзер залогинен и есть адреса -> isAddingNew = false (показываем карточку)
    
    if (!auth.token || !hasSavedAddresses) {
      setIsAddingNew(true);
    } else {
      setIsAddingNew(false);
    }
  }, [auth.token, hasSavedAddresses]); 

  // --- ЛОГИКА КАРТОЧЕК ---
  const [mainDelivery, ...extraDeliveries] = deliveryDatas;
  const mainKey = `main-${auth?.id}`;

  const handleEditProfile = (profileId) => console.log("Edit profile", profileId);
  const handleLogOut = () => console.log("Logging out");

  const handleAddNewProfile = () => {
    setShowModal(false);
    setIsAddingNew(true);
  };

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

  useEffect(() => {
    // Добавили проверку auth.token, чтобы не крашилось у гостей при попытке прочитать auth.id
    if (auth.token && mainDelivery && onSelectDelivery && !isAddingNew) {
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
          {isAddingNew && !hasSavedAddresses 
            ? "Enter Shipping Details" // Для гостей будет этот заголовок
            : "Shipping info"}
        </h2>
        
        {!isAddingNew && hasSavedAddresses && (
          <button 
            className="change-btn" 
            onClick={() => setShowModal(true)}
            type="button"
          >
            Change
          </button>
        )}
        
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