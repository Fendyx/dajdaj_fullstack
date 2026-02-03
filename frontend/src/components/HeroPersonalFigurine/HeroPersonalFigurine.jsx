import React from 'react';
import './HeroPersonalFigurine.css';
import { FaArrowRight, FaCloudUploadAlt, FaCube, FaTruck } from 'react-icons/fa';

export const HeroPersonalFigurine = ({ heroProduct, handleHeroClick }) => {
  if (!heroProduct) return null;

  return (
    <section className="hero-product-section" onClick={handleHeroClick}>
      <div className="hero-card compact-style">
        
        {/* Левая часть: Контент */}
        <div className="hero-content">
          <div className="hero-badge-row">
            <span className="pill-badge new">🔥 HIT</span>
            <span className="pill-badge">Handmade 3D</span>
          </div>

          <h2 className="hero-title">
            Make your own figurine <br />
          </h2>

          {/* UX Visualizer (оставили, но уменьшили в CSS) */}
          <div className="steps-visualizer">
            <div className="step-item">
              <div className="step-icon"><FaCloudUploadAlt /></div>
              <span>Upload</span>
            </div>
            <div className="step-arrow">→</div>
            <div className="step-item">
              <div className="step-icon"><FaCube /></div>
              <span>3D Print</span>
            </div>
            <div className="step-arrow">→</div>
            <div className="step-item">
              <div className="step-icon"><FaTruck /></div>
              <span>Receive</span>
            </div>
          </div>

          <div className="hero-bottom-row">
            <div className="price-container">
              <span className="price-label">Price from</span>
              <span className="price-value">
                {heroProduct.price} {heroProduct.currency || 'PLN'}
              </span>
            </div>
            
            <button className="hero-cta-button">
              Create My Figurine <FaArrowRight />
            </button>
          </div>
        </div>

        {/* Правая часть: Визуал с деталями */}
        <div className="hero-visual">
          <div className="visual-circle-bg"></div>
          
          {/* Тот самый "Floating UI" с анимацией загрузки - оставлен как киллер-фича */}
          <div className="floating-ui-card upload-hint">
             <div className="skeleton-photo"></div>
             <div className="ui-text">
               <span>Your Photo</span>
               <div className="loading-bar"></div>
             </div>
          </div>

          <img
            src={heroProduct.image || heroProduct.img}
            alt={heroProduct.name}
            className="hero-main-image"
          />
        </div>

      </div>
    </section>
  );
};