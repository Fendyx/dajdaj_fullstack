import React, { useState, useCallback, useEffect, useRef } from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { Img } from "react-image";
import "./ImageCarousel.css";

export function ImageCarousel({ images = [], mainImage, onImageChange }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const touchStartX = useRef(null);
  const slidesContainerRef = useRef(null);

  // Обновляем трансформацию контейнера
  useEffect(() => {
    if (slidesContainerRef.current) {
      const translateX = -currentIndex * 100;
      slidesContainerRef.current.style.transform = `translateX(${translateX}%)`;
    }
  }, [currentIndex]);

  const goToNext = useCallback(() => {
    if (currentIndex < images.length - 1 && !isTransitioning) {
      setIsTransitioning(true);
      const newIndex = currentIndex + 1;
      setCurrentIndex(newIndex);
      if (onImageChange) onImageChange(images[newIndex]);
      
      setTimeout(() => setIsTransitioning(false), 300);
    }
  }, [currentIndex, images, onImageChange, isTransitioning]);

  const goToPrevious = useCallback(() => {
    if (currentIndex > 0 && !isTransitioning) {
      setIsTransitioning(true);
      const newIndex = currentIndex - 1;
      setCurrentIndex(newIndex);
      if (onImageChange) onImageChange(images[newIndex]);
      
      setTimeout(() => setIsTransitioning(false), 300);
    }
  }, [currentIndex, images, onImageChange, isTransitioning]);

  const goToImage = useCallback((index) => {
    if (index !== currentIndex && !isTransitioning) {
      setIsTransitioning(true);
      setCurrentIndex(index);
      if (onImageChange) onImageChange(images[index]);
      
      setTimeout(() => setIsTransitioning(false), 300);
    }
  }, [currentIndex, images, onImageChange, isTransitioning]);

  // Обработка касаний для свайпа
  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e) => {
    if (!touchStartX.current) return;
    
    const currentX = e.touches[0].clientX;
    const diff = touchStartX.current - currentX;

    // Проверяем, можно ли свайпать в этом направлении
    const canSwipeLeft = currentIndex < images.length - 1;
    const canSwipeRight = currentIndex > 0;

    // Если пытаемся свайпнуть влево с последнего фото - блокируем
    if (diff > 0 && !canSwipeLeft) return;
    
    // Если пытаемся свайпнуть вправо с первого фото - блокируем
    if (diff < 0 && !canSwipeRight) return;

    // Небольшое смещение для индикации свайпа
    if (slidesContainerRef.current && Math.abs(diff) > 10) {
      const translateX = -currentIndex * 100 - (diff / window.innerWidth * 100);
      slidesContainerRef.current.style.transform = `translateX(${translateX}%)`;
      slidesContainerRef.current.style.transition = 'none';
    }
  };

  const handleTouchEnd = (e) => {
    if (!touchStartX.current) return;

    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX.current - touchEndX;
    
    // Используем процент от ширины экрана для определения порога
    const swipeThresholdPercent = 0.25; // 25% ширины экрана
    const swipeThreshold = window.innerWidth * swipeThresholdPercent;

    // Восстанавливаем плавную анимацию
    if (slidesContainerRef.current) {
      slidesContainerRef.current.style.transition = 'transform 0.3s ease';
    }

    // Проверяем, можно ли свайпать в этом направлении
    const canSwipeLeft = currentIndex < images.length - 1;
    const canSwipeRight = currentIndex > 0;

    if (diff > swipeThreshold && canSwipeLeft) {
      // Свайп влево - следующее изображение
      goToNext();
    } else if (diff < -swipeThreshold && canSwipeRight) {
      // Свайп вправо - предыдущее изображение
      goToPrevious();
    } else {
      // Свайп недостаточно длинный или заблокирован - возвращаем на место
      if (slidesContainerRef.current) {
        const translateX = -currentIndex * 100;
        slidesContainerRef.current.style.transform = `translateX(${translateX}%)`;
      }
    }

    touchStartX.current = null;
  };

  // Обработка клавиатуры
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowLeft') {
        goToPrevious();
      } else if (e.key === 'ArrowRight') {
        goToNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [goToPrevious, goToNext]);

  if (!images || images.length === 0) {
    return (
      <div className="carousel-container">
        <div className="carousel-main">
          <div className="carousel-slide-wrapper">
            <img
              src="https://placehold.co/600x400?text=No+Images"
              alt="No images available"
              className="carousel-image"
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="carousel-container">
      <div className="carousel-main">
        <div 
          className="carousel-slide-wrapper"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div 
            ref={slidesContainerRef}
            className="carousel-slides-container"
            style={{
              transform: `translateX(-${currentIndex * 100}%)`,
              transition: 'transform 0.3s ease'
            }}
          >
            {images.map((image, index) => (
              <div key={index} className="carousel-slide">
                <Img
                  src={image}
                  alt={`Slide ${index + 1}`}
                  className="carousel-image"
                  draggable={false}
                  loader={<div className="carousel-loader">Загрузка...</div>}
                  unloader={
                    <img
                      src="https://placehold.co/600x400?text=No+Image"
                      alt="fallback"
                      className="carousel-image"
                      draggable={false}
                    />
                  }
                />
              </div>
            ))}
          </div>
        </div>

        {currentIndex > 0 && (
          <button
            onClick={goToPrevious}
            className="carousel-nav-button carousel-nav-left"
            aria-label="Previous image"
          >
            <FaChevronLeft className="carousel-nav-icon" />
          </button>
        )}

        {currentIndex < images.length - 1 && (
          <button
            onClick={goToNext}
            className="carousel-nav-button carousel-nav-right"
            aria-label="Next image"
          >
            <FaChevronRight className="carousel-nav-icon" />
          </button>
        )}

        {images.length > 1 && (
          <div className="carousel-dots">
            {images.map((_, index) => (
              <button
                key={index}
                onClick={() => goToImage(index)}
                className={`carousel-dot ${
                  index === currentIndex ? "carousel-dot-active" : ""
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>

      {images.length > 1 && (
        <div className="carousel-thumbnails">
          {images.map((image, index) => (
            <button
              key={index}
              onClick={() => goToImage(index)}
              className={`carousel-thumbnail ${
                index === currentIndex ? "carousel-thumbnail-active" : ""
              }`}
            >
              <Img
                src={image}
                alt={`Thumbnail ${index + 1}`}
                className="carousel-thumbnail-image"
                loader={<div className="carousel-thumb-loader">...</div>}
                unloader={
                  <img
                    src="https://placehold.co/150x100?text=No+Image"
                    alt="fallback thumb"
                    className="carousel-thumbnail-image"
                  />
                }
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
