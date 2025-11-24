import React from "react";
import { UserCard } from "../../../../components/UserProfile/components/UserCard/UserCard";
import { FlippableDeliveryCard } from "../../../../components/UserProfile/components/FlippableDeliveryCard/FlippableDeliveryCard";
import { NewRecipientCard } from "../../../../components/UserProfile/components/NewRecipientCard/NewRecipientCard";
import "./AnotherShippingInfoModal.css";

export default function AnotherShippingInfoModal({
  profile,
  flipStates,
  toggleFlip,
  selectedKey,
  setSelectedKey,
  onClose,
  onEditProfile,
  onLogOut,
  onAddNewProfile,
}) {
  if (!profile) return null;

  const deliveryDatas = profile?.deliveryDatas || [];
  const [mainDelivery, ...extraDeliveries] = deliveryDatas;
  const mainKey = `main-${profile.id}`;

  return (
    <div className="another-modal-overlay">
      <div className="another-modal-content">
        <div className="another-modal-header">
          <h2 className="another-modal-title">Shipping Information</h2>
          <button onClick={onClose} className="another-modal-close">
            ×
          </button>
        </div>

        <div className="another-modal-list">
          {/* Main UserCard */}
          <div
            key={mainKey}
            className={`another-delivery-card ${
              selectedKey === mainKey ? "another-selected" : ""
            }`}
            onClick={() => {
              setSelectedKey(mainKey);
              onClose();
            }}
          >
            <input
              type="radio"
              name="selectedDelivery"
              checked={selectedKey === mainKey}
              onChange={() => {
                setSelectedKey(mainKey);
                onClose();
              }}
              className="another-delivery-radio"
            />
            <UserCard
              profile={{
                ...profile,
                delivery: mainDelivery?.delivery,
                personalData: mainDelivery?.personalData,
              }}
              onEdit={(e) => {
                e.stopPropagation();
                onEditProfile(profile.id);
              }}
              onClick={(e) => {
                e.stopPropagation();
                toggleFlip(mainKey);
              }}
              onLogOut={(e) => {
                e.stopPropagation();
                onLogOut();
              }}
              isFlipped={flipStates[mainKey] || false}
            />
          </div>

          {/* Extra FlippableDeliveryCards */}
          {extraDeliveries.map((delivery, idx) => {
            const key = `extra-${profile.id}-${idx}`;
            const extraCardData = {
              ...profile,
              ...delivery.personalData,
              delivery: delivery.delivery,
              personalData: delivery.personalData,
            };

            return (
              <div
                key={key}
                className={`another-delivery-card ${
                  selectedKey === key ? "another-selected" : ""
                }`}
                onClick={() => {
                  setSelectedKey(key);
                  onClose();
                }}
              >
                <input
                  type="radio"
                  name="selectedDelivery"
                  checked={selectedKey === key}
                  onChange={() => {
                    setSelectedKey(key);
                    onClose();
                  }}
                  className="another-delivery-radio"
                />
                <FlippableDeliveryCard
                  profile={extraCardData}
                  onEdit={(e) => {
                    e.stopPropagation();
                    onEditProfile(profile.id);
                  }}
                  onLogOut={(e) => {
                    e.stopPropagation();
                    onLogOut();
                  }}
                  isFlipped={flipStates[key] || false}
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFlip(key);
                  }}
                />
              </div>
            );
          })}

          <div className="another-delivery-card-row" key="new">
            <NewRecipientCard onAdd={onAddNewProfile} />
          </div>
        </div>
      </div>
    </div>
  );
}