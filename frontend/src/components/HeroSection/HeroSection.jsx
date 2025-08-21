import React from 'react';
import './HeroSection.css';

export function HeroSection() {
  return (
    <section className="hero">
      <div className="hero__inner">
        <span className="hero__badge">
          <span className="hero__icon">❤️</span>
          Meaningful Gifts
        </span>
        <h1 className="hero__title">
          A Gift That Looks Just Like Their Spirit
        </h1>
        <p className="hero__subtitle">
          Choose a ready-made bodybuilding figurine and add a name and personal message — 
          a unique way to honor someone's strength.
        </p>
        <a href="#collection" className="hero__button">
          ↓ Explore Our Collection
        </a>
      </div>
    </section>
  );
}

export default HeroSection;
