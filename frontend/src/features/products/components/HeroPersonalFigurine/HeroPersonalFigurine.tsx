import { ArrowRight, CloudUpload, Box, Truck } from 'lucide-react';
import './HeroPersonalFigurine.css';

// 1️⃣ Типизируем пропсы. Если у тебя есть общий тип Product, можно импортировать его.
// Пока опишем то, что реально используется в этом компоненте.
interface HeroProduct {
  price: number | string;
  currency?: string;
  image?: string;
  img?: string;
  name?: string;
}

interface HeroPersonalFigurineProps {
  heroProduct: HeroProduct | null | undefined;
  handleHeroClick: () => void;
}

export const HeroPersonalFigurine = ({ heroProduct, handleHeroClick }: HeroPersonalFigurineProps) => {
  if (!heroProduct) return null;

  // Безопасно достаем картинку (в старом коде было image || img)
  const productImageUrl = heroProduct.image || heroProduct.img;

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

          {/* UX Visualizer (Заменили иконки на Lucide) */}
          <div className="steps-visualizer">
            <div className="step-item">
              <div className="step-icon"><CloudUpload size={24} /></div>
              <span>Upload</span>
            </div>
            <div className="step-arrow">→</div>
            <div className="step-item">
              <div className="step-icon"><Box size={24} /></div>
              <span>3D Print</span>
            </div>
            <div className="step-arrow">→</div>
            <div className="step-item">
              <div className="step-icon"><Truck size={24} /></div>
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
              Create My Figurine <ArrowRight size={18} className="ml-2" />
            </button>
          </div>
        </div>

        {/* Правая часть: Визуал с деталями */}
        <div className="hero-visual">
          <div className="visual-circle-bg"></div>
          
          {/* Тот самый "Floating UI" с анимацией загрузки */}
          <div className="floating-ui-card upload-hint">
             <div className="skeleton-photo"></div>
             <div className="ui-text">
               <span>Your Photo</span>
               <div className="loading-bar"></div>
             </div>
          </div>

          {productImageUrl && (
            <img
              src={productImageUrl}
              alt={heroProduct.name || "Personal Figurine"}
              className="hero-main-image"
            />
          )}
        </div>

      </div>
    </section>
  );
};