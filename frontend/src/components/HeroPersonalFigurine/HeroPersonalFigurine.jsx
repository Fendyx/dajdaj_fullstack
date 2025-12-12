import React from 'react';
import './HeroPersonalFigurine.css'; // Не забудь создать/обновить этот файл
import { FaCamera, FaArrowRight, FaMagic } from 'react-icons/fa'; // Используем иконки для наглядности

export const HeroPersonalFigurine = ({ heroProduct, handleHeroClick }) => {
  if (!heroProduct) return null;

  return (
    <section className="hero-product-section" onClick={handleHeroClick}>
      <div className="hero-card">
        {/* Фоновый декоративный элемент */}
        <div className="hero-bg-glow"></div>

        <div className="hero-content">
          <div className="hero-tags">
            <span className="hero-badge highlight">
              <FaMagic className="badge-icon" /> HIT
            </span>
            <span className="hero-badge">Handmade 3D</span>
          </div>

          <h2 className="hero-title">
            Turn your photo <br />
            <span className="text-gradient">into a Mini-You</span>
          </h2>

          <p className="hero-description">
            Ever wanted a figurine of yourself? Upload a photo, and we will craft 
            a <strong>unique handmade 3D model</strong> that looks exactly like you.
          </p>

          <div className="hero-action-row">
            <div className="hero-price-block">
              <span className="hero-label">Starting at</span>
              <span className="hero-price">
                {heroProduct.price} {heroProduct.currency || 'PLN'}
              </span>
            </div>

            <button className="hero-cta-button">
              <span>Create My Figurine</span>
              <div className="icon-circle">
                <FaArrowRight />
              </div>
            </button>
          </div>
        </div>

        <div className="hero-image-wrapper">
          {/* Визуальная подсказка: Иконка фото */}
          <div className="photo-hint-badge">
            <FaCamera />
            <span>From Photo</span>
          </div>
          
          <div className="hero-circle-decoration"></div>
          <img
            src={heroProduct.image || heroProduct.img}
            alt={heroProduct.name}
            className="hero-image"
          />
        </div>
      </div>
    </section>
  );
};