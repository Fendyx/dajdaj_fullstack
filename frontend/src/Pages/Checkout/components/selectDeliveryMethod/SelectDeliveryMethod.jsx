import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { FaPlus, FaArrowRight, FaShippingFast } from "react-icons/fa";

import { UserCard } from "../../../../components/UserProfile/components/UserCard/UserCard";
import { FlippableDeliveryCard } from "../../../../components/UserProfile/components/FlippableDeliveryCard/FlippableDeliveryCard";
import AnotherShippingInfoModal from "./AnotherShippingInfoModal";
import PersonalInformationForm from "../../../../components/CheckoutStripe/PersonalInformationForm";
import "./SelectDeliveryMethod.css";

export default function SelectDeliveryMethod({ onSelectDelivery, formData, handleChange }) {
  const auth = useSelector((state) => state.auth);
  const [profiles, setProfiles] = useState([]);
  const [flipStates, setFlipStates] = useState({});
  const [selectedKey, setSelectedKey] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [isAddingNew, setIsAddingNew] = useState(false); // 👈 режим добавления нового
  const navigate = useNavigate();

  useEffect(() => {
    if (!auth.token) {
      navigate("/login");
      return;
    }

    if (auth.deliveryDatas) {
      setProfiles([auth]);
    } else {
      setProfiles([]);
    }
  }, [auth, navigate]);

  const handleEditProfile = (profileId) => console.log("Edit profile", profileId);
  const handleLogOut = () => console.log("Logging out");

  const handleAddNewProfile = () => {
    setIsAddingNew(true); // 👈 переключаемся в форму
  };

  const handleBack = () => {
    setIsAddingNew(false); // 👈 возвращаем обратно
  };

  const toggleFlip = (cardKey) => {
    setFlipStates((prev) => ({
      ...prev,
      [cardKey]: !prev[cardKey],
    }));
  };

  const profile = profiles[0];
  const deliveryDatas = profile?.deliveryDatas || [];
  const [mainDelivery, ...extraDeliveries] = deliveryDatas;
  const mainKey = `main-${profile?.id}`;

  // 👉 сразу выбрать дефолтную доставку
  useEffect(() => {
    if (mainDelivery && profile && onSelectDelivery) {
      setSelectedKey(mainKey);
      onSelectDelivery({
        userId: profile?.id,
        personalData: mainDelivery?.personalData,
        delivery: mainDelivery?.delivery,
      });
    }
  }, [mainDelivery, profile, mainKey, onSelectDelivery]);

  const handleSelect = (delivery, key) => {
    setSelectedKey(key);
    if (onSelectDelivery) {
      onSelectDelivery({
        userId: profile?.id,
        personalData: delivery?.personalData,
        delivery: delivery?.delivery,
      });
    }
  };

  const selectedDelivery = (() => {
    if (selectedKey === null || selectedKey === mainKey) {
      return {
        key: mainKey,
        card: (
          <UserCard
            profile={{
              ...profile,
              delivery: mainDelivery?.delivery,
              personalData: mainDelivery?.personalData,
            }}
            onEdit={() => handleEditProfile(profile.id)}
            onClick={() => toggleFlip(mainKey)}
            onLogOut={handleLogOut}
            isFlipped={flipStates[mainKey] || false}
          />
        ),
      };
    }

    const match = extraDeliveries.find(
      (_, idx) => `extra-${profile.id}-${idx}` === selectedKey
    );
    if (!match) return null;

    return {
      key: selectedKey,
      card: (
        <FlippableDeliveryCard
          profile={{
            ...profile,
            ...match.personalData,
            delivery: match.delivery,
            personalData: match.personalData,
          }}
          onEdit={() => handleEditProfile(profile.id)}
          onClick={() => {
            toggleFlip(selectedKey);
            handleSelect(match, selectedKey);
          }}
          onLogOut={handleLogOut}
          isFlipped={flipStates[selectedKey] || false}
        />
      ),
    };
  })();

  return (
    <div className="shipping-card-wrapper">
      <h1 className="shipping-title">Shipping info</h1>

      {/* Если в режиме добавления нового → показываем форму */}
      {isAddingNew ? (
        <div className="personal-info-form-section">
          <PersonalInformationForm
            formData={formData}
            handleChange={handleChange}
            isExpanded={true}
            setIsExpanded={() => {}}
          />

          <button
            className="back-btn"
            type="button"
            onClick={handleBack}
          >
            ← Вернуться обратно
          </button>
        </div>
      ) : (
        <>
          {selectedDelivery?.card}

          <div className="shipping-options">
            {/* Select another shipping info */}
            <div
              onClick={() => setShowModal(true)}
              className="shipping-option select-another"
            >
              <div className="shipping-option-left">
                <div className="icon-circle blue">
                  <FaShippingFast className="icon blue" />
                </div>
                <div>
                  <p className="option-title">Select another shipping info</p>
                  <p className="option-subtitle">Choose different shipping details</p>
                </div>
              </div>
              <FaArrowRight className="arrow-icon" />
            </div>

            {/* Add another shipping method & pay */}
            <div
              onClick={handleAddNewProfile}
              className="shipping-option add-new"
            >
              <div className="shipping-option-left">
                <div className="icon-circle green">
                  <FaPlus className="icon green" />
                </div>
                <div>
                  <p className="option-title">Add another shipping method & pay</p>
                  <p className="option-subtitle">Add new shipping option</p>
                </div>
              </div>
              <FaArrowRight className="arrow-icon" />
            </div>
          </div>
        </>
      )}

      {showModal && (
        <AnotherShippingInfoModal
          profile={profile}
          flipStates={flipStates}
          toggleFlip={toggleFlip}
          selectedKey={selectedKey || mainKey}
          setSelectedKey={(key) => {
            setSelectedKey(key);

            let newDelivery;
            if (key === mainKey) {
              newDelivery = mainDelivery;
            } else {
              newDelivery = extraDeliveries.find(
                (_, idx) => `extra-${profile.id}-${idx}` === key
              );
            }

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
