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

return ( <div className="modal-overlay"> <div className="modal-content"> <button onClick={onClose} className="modal-close">×</button> <h2 className="modal-title">Select Shipping Info</h2>

    <div className="modal-list">
      {/* Main UserCard */}
      <div
        key={mainKey}
        className={`delivery-card ${selectedKey === mainKey ? "selected" : ""}`}
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
          className="delivery-radio"
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
            className={`delivery-card ${selectedKey === key ? "selected" : ""}`}
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
              className="delivery-radio"
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

      <div className="delivery-card-row" key="new">
        <NewRecipientCard onAdd={onAddNewProfile} />
      </div>
    </div>
  </div>
</div>

);
}
