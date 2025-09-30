import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { FaPlus, FaCreditCard, FaArrowRight, FaShippingFast } from "react-icons/fa";

import { UserCard } from "../../../../components/UserProfile/components/UserCard/UserCard";
import PayButton from "../../../../components/PayButton";
import { FlippableDeliveryCard } from "../../../../components/UserProfile/components/FlippableDeliveryCard/FlippableDeliveryCard";
import AnotherShippingInfoModal from "./AnotherShippingInfoModal";
import "./SelectDeliveryMethod.css";

export default function SelectDeliveryMethod() {
const auth = useSelector((state) => state.auth);
const cart = useSelector((state) => state.cart);
const [profiles, setProfiles] = useState([]);
const [flipStates, setFlipStates] = useState({});
const [selectedKey, setSelectedKey] = useState(null);
const [showModal, setShowModal] = useState(false);
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
const handleAddNewProfile = () => console.log("Add new profile");

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
)
};
}
const match = extraDeliveries.find((_, idx) => `extra-${profile.id}-${idx}` === selectedKey);
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
      onClick={() => toggleFlip(selectedKey)}
      onLogOut={handleLogOut}
      isFlipped={flipStates[selectedKey] || false}
    />
  )
};

})();

return ( <div className="shipping-card-wrapper"> <h1 className="shipping-title">Shipping info</h1>
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

    {/* Proceed to payment */}
    <div className="cart-summary">
    <div className="cart-checkout">
              <div className="subtotal">
                <span>Total</span>
                <span className="amount">PLN{cart.cartTotalAmount}</span>
              </div>

              <p>Taxes and shipping will be calculated at checkout</p>
              <PayButton cartItems={cart.cartItems}>
        Proceed to Payment
      </PayButton>

            </div>
     
    </div>


  </div>

  {showModal && (
    <AnotherShippingInfoModal
      profile={profile}
      flipStates={flipStates}
      toggleFlip={toggleFlip}
      selectedKey={selectedKey || mainKey}
      setSelectedKey={(key) => {
        setSelectedKey(key);
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
