import React, { useState, useEffect, useCallback } from "react";
import { UserCard } from "../UserCard/UserCard";
import { FlippableDeliveryCard } from "../FlippableDeliveryCard/FlippableDeliveryCard";
import { NewRecipientCard } from "../NewRecipientCard/NewRecipientCard";
import "./CardGallery.css";

export function CardGallery({ profiles, onEditProfile, onLogOut, onAddNewProfile }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const minSwipeDistance = 50;

  const cards = [];

  profiles.forEach((profile) => {
    const deliveryDatas = profile?.deliveryDatas || [];
    const [mainDelivery, ...extraDeliveries] = deliveryDatas;

    if (mainDelivery) {
      const mainCardData = {
        ...profile,
        delivery: mainDelivery.delivery,
        personalData: mainDelivery.personalData
      };

      console.log(mainCardData);


      cards.push(
        <UserCard
          key={`main-${profile.id}`}
          profile={mainCardData}
          onEdit={() => onEditProfile?.(profile.id)}
          onLogOut={() => onLogOut?.()}
        />
      );
    }

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
          isActive={false}
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
              {React.cloneElement(card, { isActive })}
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
