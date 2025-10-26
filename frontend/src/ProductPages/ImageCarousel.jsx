import React, { useState } from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { Img } from "react-image";
import "./ImageCarousel.css";

export function ImageCarousel({ images = [], mainImage, onImageChange }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const goToNext = () => {
    if (currentIndex < images.length - 1) {
      const newIndex = currentIndex + 1;
      setCurrentIndex(newIndex);
      if (onImageChange) onImageChange(images[newIndex]);
    }
  };

  const goToPrevious = () => {
    if (currentIndex > 0) {
      const newIndex = currentIndex - 1;
      setCurrentIndex(newIndex);
      if (onImageChange) onImageChange(images[newIndex]);
    }
  };

  const goToImage = (index) => {
    setCurrentIndex(index);
    if (onImageChange) onImageChange(images[index]);
  };

  return (
    <div className="carousel-container">
      <div className="carousel-main">
        <div className="carousel-slide-wrapper">
          <Img
            src={images[currentIndex]}
            alt={`Slide ${currentIndex + 1}`}
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

        <div className="carousel-dots">
          {images.map((_, index) => (
            <div
              key={index}
              className={`carousel-dot ${
                index === currentIndex ? "carousel-dot-active" : ""
              }`}
            />
          ))}
        </div>
      </div>

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
    </div>
  );
}
