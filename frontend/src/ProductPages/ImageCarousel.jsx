import React, { useState } from "react";
import { motion } from "framer-motion";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { Img } from "react-image";
import "./ImageCarousel.css";

export function ImageCarousel({ images = [], mainImage, onImageChange }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const swipeConfidenceThreshold = 10000;
  const swipePower = (offset, velocity) => Math.abs(offset) * velocity;

  const handleDragEnd = (e, { offset, velocity }) => {
    const swipe = swipePower(offset.x, velocity.x);

    if (swipe < -swipeConfidenceThreshold && currentIndex < images.length - 1) {
      goToNext();
    } else if (swipe > swipeConfidenceThreshold && currentIndex > 0) {
      goToPrevious();
    }

    setDragOffset(0);
    setIsDragging(false);
  };

  const handleDrag = (e, { offset }) => {
    setDragOffset(offset.x);
    setIsDragging(true);
  };

  const goToNext = () => {
    const newIndex = currentIndex + 1;
    setCurrentIndex(newIndex);
    if (onImageChange) onImageChange(images[newIndex]);
  };

  const goToPrevious = () => {
    const newIndex = currentIndex - 1;
    setCurrentIndex(newIndex);
    if (onImageChange) onImageChange(images[newIndex]);
  };

  const goToImage = (index) => {
    setCurrentIndex(index);
    if (onImageChange) onImageChange(images[index]);
  };

  return (
    <div className="carousel-container">
      <div className="carousel-main">
        <motion.div
          className="carousel-slider"
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.2}
          onDrag={handleDrag}
          onDragEnd={handleDragEnd}
          animate={{
            x: `${-currentIndex * 100}%`,
          }}
          transition={{
            type: "spring",
            stiffness: 300,
            damping: 30,
          }}
          style={{
            x: isDragging ? dragOffset : 0,
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
        </motion.div>

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
