import React, { useState, useEffect, useCallback, useMemo } from "react";
import { UserCard } from "../UserProfile/components/UserCard/UserCard";
import { FlippableDeliveryCard } from "../UserProfile/components/FlippableDeliveryCard/FlippableDeliveryCard";
import { NewRecipientCard } from "../UserProfile/components/NewRecipientCard/NewRecipientCard";
import "./DeliverySelectorModal.css"; 

export const DeliverySelectorModal = ({ isOpen, onClose, profiles, onSelect }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [flipStates, setFlipStates] = useState({});
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const minSwipeDistance = 50;

  // Сброс индекса при открытии
  useEffect(() => {
    if (isOpen) setActiveIndex(0);
  }, [isOpen]);

  // Подготовка данных
  const cardsData = useMemo(() => {
    const dataList = [];
    if (profiles && profiles.length > 0) {
      profiles.forEach((profile) => {
        const deliveryDatas = profile?.deliveryDatas || [];
        // Главная
        const [mainDelivery] = deliveryDatas;
        const mainCardData = mainDelivery
          ? { ...profile, delivery: mainDelivery.delivery, personalData: mainDelivery.personalData, type: 'main' }
          : { ...profile, delivery: { address: "No address", method: "—" }, personalData: { name: profile.name, email: profile.email }, type: 'main' };
        dataList.push(mainCardData);

        // Дополнительные
        deliveryDatas.slice(1).forEach((delivery) => {
          dataList.push({ ...profile, ...delivery.personalData, delivery: delivery.delivery, personalData: delivery.personalData, type: 'extra' });
        });
      });
    }
    dataList.push({ type: 'new' }); 
    return dataList;
  }, [profiles]);

  // Навигация
  const totalCards = cardsData.length;
  const nextCard = useCallback(() => setActiveIndex((p) => (p + 1) % totalCards), [totalCards]);
  const prevCard = useCallback(() => setActiveIndex((p) => (p - 1 + totalCards) % totalCards), [totalCards]);
  const goToCard = (i) => setActiveIndex(i);

  const toggleFlip = (index) => {
    setFlipStates((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  // Touch/Swipe
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

  // Клавиатура
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e) => {
      // Предотвращаем дефолтное поведение, если фокус вдруг попадет на submit
      if (['ArrowLeft', 'ArrowRight'].includes(e.key)) {
         e.preventDefault();
      }
      if (e.key === 'ArrowLeft') prevCard();
      if (e.key === 'ArrowRight') nextCard();
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, nextCard, prevCard, onClose]);

  const handleConfirm = () => {
    onSelect(cardsData[activeIndex]);
    onClose();
  };

  if (!isOpen) return null;

  const gradients = [
    { front: "linear-gradient(135deg, #2c3e50, #1a1a1a)", back: "linear-gradient(135deg, #34495e, #2c3e50)" },
    { front: "linear-gradient(135deg, #4caf50, #2e7d32)", back: "linear-gradient(135deg, #66bb6a, #1b5e20)" },
    { front: "linear-gradient(135deg, #ff7f50, #ff4500)", back: "linear-gradient(135deg, #ff6347, #ff8c00)" },
  ];

  return (
    <div className="dsm-overlay">
      <div className="dsm-content">
        {/* ВАЖНО: type="button" */}
        <button type="button" className="dsm-close-cross" onClick={onClose}>&times;</button>
        
        <h3 className="dsm-title">Select Delivery Address</h3>
        
        <div className="uc-gallery-container modal-gallery-override">
          <div className="uc-card-stack"
               onTouchStart={onTouchStart}
               onTouchMove={onTouchMove}
               onTouchEnd={onTouchEnd}>
            {cardsData.map((data, index) => {
              const isActive = index === activeIndex;
              const isFlipped = !!flipStates[index];
              const offset = index - activeIndex;
              const xOffset = offset * 40;
              const scale = Math.max(0.8, 1 - Math.abs(offset) * 0.05);
              const zIndex = totalCards - Math.abs(offset);
              const visibility = Math.abs(offset) > 2 ? 'hidden' : 'visible';

              let CardComponent;
              if (data.type === 'new') CardComponent = <NewRecipientCard onAdd={() => {}} />;
              else if (data.type === 'main') CardComponent = <UserCard profile={data} hideActions={true} />;
              else CardComponent = <FlippableDeliveryCard profile={data} gradient={gradients[index % gradients.length]} hideActions={true} />;

              return (
                <div key={index}
                     className="uc-profile-card-wrapper"
                     style={{
                       transform: `translateX(${xOffset}px) scale(${scale})`, 
                       zIndex, visibility,
                       pointerEvents: isActive ? 'auto' : 'none',
                       textAlign: 'left' 
                     }}
                >
                  <div onClick={() => { if(!isActive) goToCard(index); else toggleFlip(index); }} style={{ width: '100%', height: '100%', display: 'flex', justifyContent: 'center' }}>
                      {React.cloneElement(CardComponent, { isActive, isFlipped })}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="uc-bottom-navigation">
            {/* ВАЖНО: type="button" */}
            <button type="button" className="uc-nav-button uc-nav-button-prev" onClick={prevCard} disabled={totalCards <= 1}>
              <svg className="uc-nav-icon" viewBox="0 0 24 24" fill="currentColor">
                <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/>
              </svg>
            </button>

            <div className="uc-card-indicators">
              {cardsData.map((_, index) => (
                /* ВАЖНО: type="button" */
                <button type="button" key={index} onClick={() => goToCard(index)}
                        className={`uc-indicator ${activeIndex === index ? 'uc-active' : ''}`} />
              ))}
            </div>

            {/* ВАЖНО: type="button" */}
            <button type="button" className="uc-nav-button uc-nav-button-next" onClick={nextCard} disabled={totalCards <= 1}>
              <svg className="uc-nav-icon" viewBox="0 0 24 24" fill="currentColor">
                <path d="M8.59 16.59L10 18l6-6-6-6-1.41 1.41L13.17 12z"/>
              </svg>
            </button>
          </div>
        </div>

        <div className="dsm-actions">
           {/* ВАЖНО: type="button" */}
           <button type="button" className="dsm-confirm-btn" onClick={handleConfirm}>
             {cardsData[activeIndex].type === 'new' ? 'Enter New Address' : 'Use This Address'}
           </button>
        </div>

      </div>
    </div>
  );
};