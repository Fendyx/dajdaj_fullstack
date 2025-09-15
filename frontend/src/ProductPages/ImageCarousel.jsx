import React, { useState } from 'react';
import './ImageCarousel.css';

export function ImageCarousel({ images, mainImage, onImageChange }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const handlePrevious = () => {
    if (isTransitioning) return;
    const newIndex = activeIndex === 0 ? images.length - 1 : activeIndex - 1;
    triggerCardTransition(newIndex);
  };

  const handleNext = () => {
    if (isTransitioning) return;
    const newIndex = activeIndex === images.length - 1 ? 0 : activeIndex + 1;
    triggerCardTransition(newIndex);
  };

  const handleCardClick = (index) => {
    if (index === activeIndex || isTransitioning) return;
    triggerCardTransition(index);
  };

  const triggerCardTransition = (newIndex) => {
    setIsTransitioning(true);
    setActiveIndex(newIndex);
    if (onImageChange) {
      onImageChange(images[newIndex]);
    }

    setTimeout(() => {
      setIsTransitioning(false);
    }, 400);
  };

  const getCardStyle = (index) => {
    const position = index - activeIndex;
    const totalImages = images.length;

    const normalizedPosition =
      position > totalImages / 2
        ? position - totalImages
        : position < -totalImages / 2
        ? position + totalImages
        : position;

    if (normalizedPosition === 0) {
      return {
        transform: 'translateX(0px) translateY(0px) scale(1)',
        zIndex: totalImages,
        opacity: 1,
      };
    } else if (normalizedPosition > 0) {
      const offset = Math.min(normalizedPosition, 3);
      return {
        transform: `translateX(${offset * 8}px) translateY(${offset * 6}px) scale(${1 - offset * 0.05})`,
        zIndex: totalImages - normalizedPosition,
        opacity: Math.max(0.4, 1 - offset * 0.2),
      };
    } else {
      const offset = Math.min(Math.abs(normalizedPosition), 3);
      return {
        transform: `translateX(${-offset * 8}px) translateY(${offset * 6}px) scale(${1 - offset * 0.05})`,
        zIndex: totalImages - Math.abs(normalizedPosition),
        opacity: Math.max(0.4, 1 - offset * 0.2),
      };
    }
  };

  return (
    <div className="carousel-container">
      {/* Кнопки переключения */}
      <button
        onClick={handlePrevious}
        disabled={isTransitioning}
        className="carousel-arrow left"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor">
          <path d="M15.5 19.5L8.5 12l7-7.5" stroke="currentColor" strokeWidth="2" fill="none" />
        </svg>
      </button>

      <button
        onClick={handleNext}
        disabled={isTransitioning}
        className="carousel-arrow right"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor">
          <path d="M8.5 19.5l7-7.5-7-7.5" stroke="currentColor" strokeWidth="2" fill="none" />
        </svg>
      </button>

      {/* Картинки */}
      <div className="carousel-images">
        {images.map((image, index) => {
          const style = getCardStyle(index);
          const isActive = index === activeIndex;

          return (
            <div
              key={index}
              className={`carousel-card ${!isActive ? 'inactive' : 'active'}`}
              style={{
                transform: style.transform,
                zIndex: style.zIndex,
                opacity: style.opacity,
              }}
              onClick={() => handleCardClick(index)}
            >
              <div className={`carousel-card-inner ${isActive ? 'active-ring' : ''}`}>
                <img src={image} alt={`Product view ${index + 1}`} className="carousel-image" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Индикаторы */}
      <div className="carousel-indicators">
        {images.map((_, index) => (
          <button
            key={index}
            onClick={() => handleCardClick(index)}
            disabled={isTransitioning}
            className={`indicator ${index === activeIndex ? 'active' : ''}`}
          />
        ))}
      </div>
    </div>
  );
}
