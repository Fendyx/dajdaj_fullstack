import React, { useState, useEffect, useCallback } from "react";
import { UserCard } from "../UserCard/UserCard";
import { FlippableDeliveryCard } from "../FlippableDeliveryCard/FlippableDeliveryCard";
import { NewRecipientCard } from "../NewRecipientCard/NewRecipientCard";
import "./CardGallery.css";

export function CardGallery({ profiles, onEditProfile, onLogOut, onAddNewProfile }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [flipStates, setFlipStates] = useState({});
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const minSwipeDistance = 50;

  const gradients = [
    { front: "linear-gradient(135deg, #2c3e50, #1a1a1a)", back: "linear-gradient(135deg, #34495e, #2c3e50)" }, // серый
    { front: "linear-gradient(135deg, #4caf50, #2e7d32)", back: "linear-gradient(135deg, #66bb6a, #1b5e20)" }, // зеленый
    { front: "linear-gradient(135deg, #ff7f50, #ff4500)", back: "linear-gradient(135deg, #ff6347, #ff8c00)" }, // оранжевый
    { front: "linear-gradient(135deg, #8a2be2, #9400d3)", back: "linear-gradient(135deg, #9932cc, #8b008b)" }, // фиолетовый
    { front: "linear-gradient(135deg, #00bfff, #1e90ff)", back: "linear-gradient(135deg, #87cefa, #4682b4)" }, // голубой
  ];
  

  const toggleFlip = (index) => {
    setFlipStates((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const cards = [];

  profiles.forEach((profile) => {
    const deliveryDatas = profile?.deliveryDatas || [];
    const [mainDelivery, ...extraDeliveries] = deliveryDatas;

    // Даже если нет данных доставки — показываем базовую карточку
      const mainCardData = mainDelivery
      ? {
          ...profile,
          delivery: mainDelivery.delivery,
          personalData: mainDelivery.personalData,
        }
      : {
          ...profile,
          delivery: { address: "No address added", method: "—" },
          personalData: { name: profile.name, email: profile.email },
        };

      cards.push(
      <UserCard
        key={`main-${profile._id || profile.id || profile.clientId}`}
        profile={mainCardData}
        onEdit={() => onEditProfile?.(profile._id || profile.id)}
        onLogOut={() => onLogOut?.()}
      />
      );


    extraDeliveries.forEach((delivery, idx) => {
      const extraCardData = {
        ...profile,
        ...delivery.personalData,
        delivery: delivery.delivery,
        personalData: delivery.personalData,
      };

      cards.push(
        <FlippableDeliveryCard
          key={`extra-${profile.id}-${idx}`}
          profile={extraCardData}
          onEdit={() => onEditProfile?.(profile.id)}
          onLogOut={() => onLogOut?.()}
          gradient={gradients[cards.length % gradients.length]} // здесь цикл через 5 градиентов
        />
      );      
    });
  });

  cards.push(
    <NewRecipientCard key="new" onAdd={onAddNewProfile} />
  );

  const totalCards = cards.length;

  const nextCard = useCallback(() => {
    setActiveIndex((prev) => (prev + 1) % totalCards);
  }, [totalCards]);

  const prevCard = useCallback(() => {
    setActiveIndex((prev) => (prev - 1 + totalCards) % totalCards);
  }, [totalCards]);

  const goToCard = (index) => setActiveIndex(index);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.target !== document.body) return;
      switch (event.key) {
        case 'ArrowLeft': event.preventDefault(); prevCard(); break;
        case 'ArrowRight': event.preventDefault(); nextCard(); break;
        case 'Home': event.preventDefault(); goToCard(0); break;
        case 'End': event.preventDefault(); goToCard(totalCards - 1); break;
        default: break;
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [nextCard, prevCard, totalCards]);

  const onTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e) => setTouchEnd(e.targetTouches[0].clientX);

  const onTouchEnd = () => {
    if (touchStart === null || touchEnd === null) return;
    const distance = touchStart - touchEnd;
    if (distance > minSwipeDistance) nextCard();
    else if (distance < -minSwipeDistance) prevCard();
  };

  return (
    <div className="uc-gallery-container">
      <div className="uc-card-stack"
           onTouchStart={onTouchStart}
           onTouchMove={onTouchMove}
           onTouchEnd={onTouchEnd}>
        {cards.map((card, index) => {
          const isActive = index === activeIndex;
          const isFlipped = !!flipStates[index];
          const offset = index - activeIndex;
          const xOffset = offset * 40;
          const scaleStep = 0.05;
          const scale = Math.max(0.8, 1 - Math.abs(offset) * scaleStep);
          const yOffset = Math.abs(offset) * 8;
          const zIndex = totalCards - Math.abs(offset);
          const visibility = Math.abs(offset) > 2 ? 'hidden' : 'visible';

          return (
            <div key={index}
                className="uc-profile-card-wrapper"
                style={{
                  transform: `translateX(${xOffset}px) translateY(${yOffset}px) scale(${scale})`,
                  zIndex,
                  visibility,
                  pointerEvents: isActive ? 'auto' : 'none',
                }}>
              {React.cloneElement(card, {
                isActive,
                isFlipped,
                onClick: () => toggleFlip(index),
              })}
            </div>
          );
        })}
      </div>

      <div className="uc-bottom-navigation">
        <button className="uc-nav-button uc-nav-button-prev" onClick={prevCard} disabled={totalCards <= 1}>
          <svg className="uc-nav-icon" viewBox="0 0 24 24" fill="currentColor">
            <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/>
          </svg>
        </button>

        <div className="uc-card-indicators">
          {cards.map((_, index) => (
            <button key={index} onClick={() => goToCard(index)}
                    className={`uc-indicator ${activeIndex === index ? 'uc-active' : ''}`} />
          ))}
        </div>

        <button className="uc-nav-button uc-nav-button-next" onClick={nextCard} disabled={totalCards <= 1}>
          <svg className="uc-nav-icon" viewBox="0 0 24 24" fill="currentColor">
            <path d="M8.59 16.59L10 18l6-6-6-6-1.41 1.41L13.17 12z"/>
          </svg>
        </button>
      </div>

      <div className="uc-card-counter">
        <p className="uc-counter-text">
          {activeIndex < cards.length - 1
            ? `Card ${activeIndex + 1} of ${cards.length - 1} + Add New`
            : 'Add New Profile'}
        </p>
      </div>

      <div className="uc-nav-hint">
        <p className="uc-hint-text">
          Use arrow keys, swipe, or click indicators to navigate • Tap cards to flip
        </p>
      </div>
    </div>
  );
}
