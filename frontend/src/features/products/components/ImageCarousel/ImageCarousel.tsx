import { useState, useCallback, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight, Image as ImageIcon } from "lucide-react";
import "./ImageCarousel.css"; // Оставляем твои стили

interface ImageCarouselProps {
  images?: string[];
  mainImage?: string;
  onImageChange?: (image: string) => void;
}

export function ImageCarousel({ images = [], mainImage, onImageChange }: ImageCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  
  const touchStartX = useRef<number | null>(null);
  const slidesContainerRef = useRef<HTMLDivElement>(null);

  // Синхронизация: если родитель изменил mainImage (например, кликнули на миниатюру снаружи)
  useEffect(() => {
    if (mainImage && images.length > 0) {
      const idx = images.indexOf(mainImage);
      if (idx !== -1 && idx !== currentIndex) {
        setCurrentIndex(idx);
      }
    }
  }, [mainImage, images, currentIndex]);

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
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!touchStartX.current || !slidesContainerRef.current) return;
    const currentX = e.touches[0].clientX;
    const diff = touchStartX.current - currentX;

    const canSwipeLeft = currentIndex < images.length - 1;
    const canSwipeRight = currentIndex > 0;

    if (diff > 0 && !canSwipeLeft) return;
    if (diff < 0 && !canSwipeRight) return;

    if (Math.abs(diff) > 10) {
      const translateX = -currentIndex * 100 - (diff / window.innerWidth * 100);
      slidesContainerRef.current.style.transform = `translateX(${translateX}%)`;
      slidesContainerRef.current.style.transition = 'none';
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartX.current) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX.current - touchEndX;
    const swipeThreshold = window.innerWidth * 0.25;

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
  };

  // --- Keyboard Logic ---
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') goToPrevious();
      else if (e.key === 'ArrowRight') goToNext();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [goToPrevious, goToNext]);

  // Fallback для пустого массива
  if (!images || images.length === 0) {
    return (
      <div className="carousel-container bg-gray-100 rounded-xl flex items-center justify-center min-h-[400px]">
         <div className="text-gray-400 flex flex-col items-center">
            <ImageIcon size={48} className="mb-2 opacity-50" />
            <span>No images available</span>
         </div>
      </div>
    );
  }

  return (
    <div className="carousel-container">
      <div className="carousel-main">
        <div 
          className="carousel-slide-wrapper overflow-hidden relative rounded-xl bg-gray-50"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div 
            ref={slidesContainerRef}
            className="carousel-slides-container flex h-full"
            style={{ transform: `translateX(-${currentIndex * 100}%)`, transition: 'transform 0.3s ease' }}
          >
            {images.map((image, index) => (
              <div key={index} className="carousel-slide w-full h-full flex-shrink-0 flex items-center justify-center">
                <img
                  src={image}
                  alt={`Slide ${index + 1}`}
                  className="carousel-image max-w-full max-h-[500px] object-contain"
                  draggable={false}
                  loading="lazy"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Навигация (Стрелки) */}
        {currentIndex > 0 && (
          <button onClick={goToPrevious} className="carousel-nav-button carousel-nav-left absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 p-2 rounded-full shadow hover:bg-white">
            <ChevronLeft size={24} />
          </button>
        )}
        {currentIndex < images.length - 1 && (
          <button onClick={goToNext} className="carousel-nav-button carousel-nav-right absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 p-2 rounded-full shadow hover:bg-white">
            <ChevronRight size={24} />
          </button>
        )}

        {/* Точки */}
        {images.length > 1 && (
          <div className="carousel-dots absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
            {images.map((_, index) => (
              <button
                key={index}
                onClick={() => goToImage(index)}
                className={`w-2 h-2 rounded-full transition-all ${index === currentIndex ? "bg-black w-4" : "bg-gray-400"}`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Миниатюры внизу */}
      {images.length > 1 && (
        <div className="carousel-thumbnails flex gap-2 mt-4 overflow-x-auto pb-2 scrollbar-hide">
          {images.map((image, index) => (
            <button
              key={index}
              onClick={() => goToImage(index)}
              className={`flex-shrink-0 w-20 h-20 rounded-md overflow-hidden border-2 transition-all ${
                index === currentIndex ? "border-black opacity-100" : "border-transparent opacity-60 hover:opacity-100"
              }`}
            >
              <img src={image} alt={`Thumbnail ${index + 1}`} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}