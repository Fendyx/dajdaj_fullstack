import React, { useState } from "react";
import "./ImageCarousel.css";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

export function ImageCarousel({ images = [], mainImage, onImageChange }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const handlePrevious = () => {
    if (isTransitioning) return;
    const newIndex = activeIndex === 0 ? images.length - 1 : activeIndex - 1;
    triggerTransition(newIndex);
  };

  const handleNext = () => {
    if (isTransitioning) return;
    const newIndex = activeIndex === images.length - 1 ? 0 : activeIndex + 1;
    triggerTransition(newIndex);
  };

  const handleCardClick = (index) => {
    if (isTransitioning || index === activeIndex) return;
    triggerTransition(index);
  };

  const triggerTransition = (newIndex) => {
    setIsTransitioning(true);
    setActiveIndex(newIndex);
    if (onImageChange) onImageChange(images[newIndex]);
    setTimeout(() => setIsTransitioning(false), 400);
  };

  const getCardStyle = (index) => {
    const position = index - activeIndex;
    const total = images.length;

    const normalized =
      position > total / 2
        ? position - total
        : position < -total / 2
        ? position + total
        : position;

    if (normalized === 0) {
      return {
        transform: "translateX(0px) translateY(0px) scale(1)",
        zIndex: total,
        opacity: 1,
      };
    } else if (normalized > 0) {
      const offset = Math.min(normalized, 3);
      return {
        transform: `translateX(${offset * 8}px) translateY(${offset * 6}px) scale(${1 - offset * 0.05})`,
        zIndex: total - normalized,
        opacity: Math.max(0.4, 1 - offset * 0.2),
      };
    } else {
      const offset = Math.min(Math.abs(normalized), 3);
      return {
        transform: `translateX(${-offset * 8}px) translateY(${offset * 6}px) scale(${1 - offset * 0.05})`,
        zIndex: total - Math.abs(normalized),
        opacity: Math.max(0.4, 1 - offset * 0.2),
      };
    }
  };

  return (
    <div className="carousel">
      {/* Кнопки навигации */}
      <button
        onClick={handlePrevious}
        disabled={isTransitioning}
        className="carousel-arrow carousel-left"
      >
        <FaChevronLeft />
      </button>

      <button
        onClick={handleNext}
        disabled={isTransitioning}
        className="carousel-arrow carousel-right"
      >
        <FaChevronRight />
      </button>

      {/* Основные изображения */}
      <div className="carousel-track">
        {images.map((image, index) => {
          const style = getCardStyle(index);
          const active = index === activeIndex;

          return (
            <div
              key={index}
              className={`carousel-card ${active ? "carousel-active" : ""}`}
              style={style}
              onClick={() => handleCardClick(index)}
            >
              <div className={`carousel-inner ${active ? "carousel-active-ring" : ""}`}>
                <img
                  src={image}
                  alt={`Product ${index}`}
                  className="carousel-image"
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Индикаторы */}
      <div className="carousel-indicators">
        {images.map((image, index) => (
          <button
            key={index}
            onClick={() => handleCardClick(index)}
            disabled={isTransitioning}
            className={`carousel-indicator ${index === activeIndex ? "carousel-indicator-active" : ""}`}
          >
            <img
              src={image}
              alt={`Thumb ${index}`}
              className="carousel-indicator-image"
            />
          </button>
        ))}
      </div>
    </div>
  );
}
