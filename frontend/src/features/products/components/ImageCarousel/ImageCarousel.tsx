import { useState, useCallback, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight, Image as ImageIcon, X } from "lucide-react";
import "./ImageCarousel.css";

interface ImageCarouselProps {
  images?: string[];
  mainImage?: string;
  onImageChange?: (image: string) => void;
}

export function ImageCarousel({ images = [], mainImage, onImageChange }: ImageCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);
  const slidesContainerRef = useRef<HTMLDivElement>(null);

  // Синхронизация с внешним mainImage
  useEffect(() => {
    if (mainImage && images.length > 0) {
      const idx = images.indexOf(mainImage);
      if (idx !== -1 && idx !== currentIndex) {
        setCurrentIndex(idx);
      }
    }
  }, [mainImage, images]);

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

  const goToImage = useCallback((index: number) => {
    if (index !== currentIndex && !isTransitioning) {
      setIsTransitioning(true);
      setCurrentIndex(index);
      if (onImageChange) onImageChange(images[index]);
      setTimeout(() => setIsTransitioning(false), 300);
    }
  }, [currentIndex, images, onImageChange, isTransitioning]);

  // --- Touch Logic (Swipe) ---
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!touchStartX.current || !touchStartY.current || !slidesContainerRef.current) return;
    
    const currentX = e.touches[0].clientX;
    const currentY = e.touches[0].clientY;
    const diffX = touchStartX.current - currentX;
    const diffY = touchStartY.current - currentY;
  
    // Блокируем вертикальный скролл только если свайп горизонтальный
    if (Math.abs(diffX) > Math.abs(diffY)) {
      e.preventDefault();
    }
  
    const canSwipeLeft = currentIndex < images.length - 1;
    const canSwipeRight = currentIndex > 0;
  
    if (diffX > 0 && !canSwipeLeft) return;
    if (diffX < 0 && !canSwipeRight) return;
  
    if (Math.abs(diffX) > 10) {
      const translateX = -currentIndex * 100 - (diffX / window.innerWidth * 100);
      slidesContainerRef.current.style.transform = `translateX(${translateX}%)`;
      slidesContainerRef.current.style.transition = 'none';
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartX.current) return;
    
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX.current - touchEndX;
    const swipeThreshold = window.innerWidth * 0.2;

    if (slidesContainerRef.current) {
      slidesContainerRef.current.style.transition = 'transform 0.3s ease';
    }

    if (diff > swipeThreshold && currentIndex < images.length - 1) {
      goToNext();
    } else if (diff < -swipeThreshold && currentIndex > 0) {
      goToPrevious();
    } else {
      if (slidesContainerRef.current) {
        slidesContainerRef.current.style.transform = `translateX(${-currentIndex * 100}%)`;
      }
    }
    touchStartX.current = null;
    touchStartY.current = null;
  };

  // --- Keyboard Logic ---
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isFullscreen) {
        if (e.key === 'Escape') setIsFullscreen(false);
        if (e.key === 'ArrowLeft') goToPrevious();
        else if (e.key === 'ArrowRight') goToNext();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreen, goToPrevious, goToNext]);

  // Fallback для пустого массива
  if (!images || images.length === 0) {
    return (
      <div className="carousel-container">
        <div className="carousel-main">
          <div className="carousel-empty">
            <ImageIcon size={48} className="carousel-empty__icon" />
            <span>Нет изображений</span>
          </div>
        </div>
      </div>
    );
  }

  const hasMultipleImages = images.length > 1;

  return (
    <>
      <div className="carousel-container">
        {/* Desktop: миниатюры слева */}
        <div className="carousel-layout">
          {/* Миниатюры (Desktop - вертикально слева) */}
          {hasMultipleImages && (
            <div className="carousel-thumbnails-desktop">
              {images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => goToImage(index)}
                  className={`carousel-thumbnail-desktop ${
                    index === currentIndex ? "carousel-thumbnail-desktop--active" : ""
                  }`}
                  aria-label={`View image ${index + 1}`}
                >
                  <img 
                    src={image} 
                    alt={`Thumbnail ${index + 1}`} 
                    className="carousel-thumbnail-desktop__image"
                    loading="lazy"
                  />
                </button>
              ))}
            </div>
          )}

          {/* Главное изображение */}
          <div className="carousel-main-wrapper">
            <div 
              className="carousel-main"
              onClick={() => hasMultipleImages && setIsFullscreen(true)}
            >
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
                    transition: isTransitioning ? 'transform 0.3s ease' : 'none'
                  }}
                >
                  {images.map((image, index) => (
                    <div key={index} className="carousel-slide">
                      <img
                        src={image}
                        alt={`Product image ${index + 1}`}
                        className="carousel-image"
                        draggable={false}
                        loading={index === 0 ? "eager" : "lazy"}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Навигация (Стрелки) - только если >1 фото */}
              {hasMultipleImages && (
                <>
                  {currentIndex > 0 && (
                    <button 
                      onClick={(e) => { e.stopPropagation(); goToPrevious(); }} 
                      className="carousel-nav-button carousel-nav-left"
                      aria-label="Previous image"
                    >
                      <ChevronLeft size={24} />
                    </button>
                  )}
                  {currentIndex < images.length - 1 && (
                    <button 
                      onClick={(e) => { e.stopPropagation(); goToNext(); }} 
                      className="carousel-nav-button carousel-nav-right"
                      aria-label="Next image"
                    >
                      <ChevronRight size={24} />
                    </button>
                  )}
                </>
              )}

              {/* Точки-индикаторы (Mobile) */}
              {hasMultipleImages && (
                <div className="carousel-dots">
                  {images.map((_, index) => (
                    <button
                      key={index}
                      onClick={(e) => { e.stopPropagation(); goToImage(index); }}
                      className={`carousel-dot ${
                        index === currentIndex ? "carousel-dot--active" : ""
                      }`}
                      aria-label={`Go to slide ${index + 1}`}
                    />
                  ))}
                </div>
              )}

              {/* Fullscreen иконка */}
              {hasMultipleImages && (
                <button className="carousel-fullscreen-btn" aria-label="Open fullscreen">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/>
                  </svg>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Миниатюры (Mobile - горизонтально снизу) */}
        {hasMultipleImages && (
          <div className="carousel-thumbnails-mobile">
            {images.map((image, index) => (
              <button
                key={index}
                onClick={() => goToImage(index)}
                className={`carousel-thumbnail-mobile ${
                  index === currentIndex ? "carousel-thumbnail-mobile--active" : ""
                }`}
              >
                <img 
                  src={image} 
                  alt={`Thumbnail ${index + 1}`} 
                  className="carousel-thumbnail-mobile__image"
                  loading="lazy"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Fullscreen Modal */}
      {isFullscreen && (
        <div className="carousel-fullscreen" onClick={() => setIsFullscreen(false)}>
          <button className="carousel-fullscreen__close" aria-label="Close fullscreen">
            <X size={28} />
          </button>
          
          <button 
            className="carousel-fullscreen__nav carousel-fullscreen__nav--prev"
            onClick={(e) => { e.stopPropagation(); goToPrevious(); }}
            disabled={currentIndex === 0}
          >
            <ChevronLeft size={32} />
          </button>
          
          <button 
            className="carousel-fullscreen__nav carousel-fullscreen__nav--next"
            onClick={(e) => { e.stopPropagation(); goToNext(); }}
            disabled={currentIndex === images.length - 1}
          >
            <ChevronRight size={32} />
          </button>

          <div className="carousel-fullscreen__content" onClick={(e) => e.stopPropagation()}>
            <img
              src={images[currentIndex]}
              alt={`Full size image ${currentIndex + 1}`}
              className="carousel-fullscreen__image"
            />
          </div>

          <div className="carousel-fullscreen__counter">
            {currentIndex + 1} / {images.length}
          </div>
        </div>
      )}
    </>
  );
}