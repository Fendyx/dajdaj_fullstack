import { useState, useEffect, useCallback } from "react";
import { FlippableDeliveryCard } from "./FlippableDeliveryCard";
import { NewRecipientCard } from "./NewRecipientCard";
import "./CardGallery.css";

export function CardGallery({ profiles, onEditProfile, onLogOut, onAddNewProfile }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);

  const totalCards = profiles.length + 1;
  const minSwipeDistance = 50;

  const nextCard = useCallback(() => {
    setActiveIndex((prev) => (prev + 1) % totalCards);
  }, [totalCards]);

  const prevCard = useCallback(() => {
    setActiveIndex((prev) => (prev - 1 + totalCards) % totalCards);
  }, [totalCards]);

  const goToCard = (index) => {
    setActiveIndex(index);
  };

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.target !== document.body) return;

      switch (event.key) {
        case 'ArrowLeft':
          event.preventDefault(); prevCard(); break;
        case 'ArrowRight':
          event.preventDefault(); nextCard(); break;
        case 'Home':
          event.preventDefault(); goToCard(0); break;
        case 'End':
          event.preventDefault(); goToCard(totalCards - 1); break;
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

        {profiles.map((profile, index) => {
          const isActive = activeIndex === index;
          const offset = index - activeIndex;
          return (
            <div key={profile.id} className="uc-profile-card-wrapper"
                 style={{
                   transform: `translateX(${offset * 20}px) translateY(${Math.abs(offset) * 8}px) scale(${isActive ? 1 : 0.95 - Math.abs(offset) * 0.05}) translateX(-50%)`,
                   zIndex: totalCards - Math.abs(offset),
                   opacity: Math.abs(offset) > 2 ? 0 : 1 - Math.abs(offset) * 0.2,
                   pointerEvents: isActive ? 'auto' : 'none'
                 }}>
              <FlippableDeliveryCard 
                profile={profile} 
                onEdit={() => onEditProfile?.(profile.id)}
                onLogOut={() => onLogOut?.()}
                isActive={isActive} />
            </div>
          );
        })}

        {/* Новая карточка */}
        <div className="uc-new-card-wrapper"
             style={{
               transform: `translateX(${(profiles.length - activeIndex) * 20}px) translateY(${Math.abs(profiles.length - activeIndex) * 8}px) scale(${activeIndex === profiles.length ? 1 : 0.95 - Math.abs(profiles.length - activeIndex) * 0.05}) translateX(-50%)`,
               zIndex: totalCards - Math.abs(profiles.length - activeIndex),
               opacity: Math.abs(profiles.length - activeIndex) > 2 ? 0 : 1 - Math.abs(profiles.length - activeIndex) * 0.2,
               pointerEvents: activeIndex === profiles.length ? 'auto' : 'none'
             }}>
          <NewRecipientCard onAdd={onAddNewProfile} />
        </div>
      </div>

      {/* Новая навигация снизу */}
      <div className="uc-bottom-navigation">
        <button className="uc-nav-button uc-nav-button-prev" onClick={prevCard} disabled={totalCards <= 1}>
          <svg className="uc-nav-icon" viewBox="0 0 24 24" fill="currentColor">
            <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/>
          </svg>
        </button>

        {/* Индикаторы */}
        <div className="uc-card-indicators">
          {Array.from({ length: totalCards }).map((_, index) => (
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

      {/* Счётчик */}
      <div className="uc-card-counter">
        <p className="uc-counter-text">
          {activeIndex < profiles.length
            ? `Profile ${activeIndex + 1} of ${profiles.length}${profiles.length > 0 ? ' + Add New' : ''}`
            : 'Add New Profile'}
        </p>
      </div>

      {/* Подсказка */}
      <div className="uc-nav-hint">
        <p className="uc-hint-text">
          Use arrow keys, swipe, or click indicators to navigate • Tap cards to flip
        </p>
      </div>
    </div>
  );
}