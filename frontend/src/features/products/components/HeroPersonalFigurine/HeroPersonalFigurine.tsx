import { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next'; // Добавили импорт
import { ArrowRight, Volume2, VolumeX, Pause, Play } from 'lucide-react';
import './HeroPersonalFigurine.css';
import video from "@/assets/Product_Animation_Couple_Figurine_Revealed.mp4"

const VIDEO_URL = video;

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

export const HeroPersonalFigurine = ({
  heroProduct,
  handleHeroClick,
}: HeroPersonalFigurineProps) => {
  const { t } = useTranslation(); // Инициализация i18n
  const videoRef = useRef<HTMLVideoElement>(null);
  const [muted, setMuted] = useState(true);
  const [paused, setPaused] = useState(false);

  if (!heroProduct) return null;

  const productImageUrl = heroProduct.image || heroProduct.img;

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!videoRef.current) return;
    videoRef.current.muted = !muted;
    setMuted((m) => !m);
  };

  const togglePause = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!videoRef.current) return;
    if (paused) {
      videoRef.current.play();
    } else {
      videoRef.current.pause();
    }
    setPaused((p) => !p);
  };

  return (
    <section className="hpf-section" onClick={handleHeroClick}>
      <div className="hpf-card">

        {/* ═══ 1. VIDEO BLOCK ═══ */}
        <div className="hpf-video-block">
          <video
            ref={videoRef}
            src={VIDEO_URL}
            autoPlay
            loop
            muted
            playsInline
            className="hpf-video"
          />
          <div className="hpf-video-overlay" />
          <div className="hpf-video-controls">
            <button
              className="hpf-ctrl-btn"
              onClick={togglePause}
              aria-label={paused ? t('hero_figurine.play') : t('hero_figurine.pause')}
            >
              {paused ? <Play size={15} /> : <Pause size={15} />}
            </button>
            <button
              className="hpf-ctrl-btn"
              onClick={toggleMute}
              aria-label={muted ? t('hero_figurine.unmute') : t('hero_figurine.mute')}
            >
              {muted ? <VolumeX size={15} /> : <Volume2 size={15} />}
            </button>
          </div>
        </div>

        {/* ═══ 2. PRODUCT BLOCK ═══ */}
        <div className="hpf-product-block">
          <span className="hpf-hit-badge">✦ {t('hero_figurine.hit_badge')}</span>

          {productImageUrl && (
            <div className="hpf-img-wrap">
              <img
                src={productImageUrl}
                alt={heroProduct.name || t('hero_figurine.default_alt')}
                className="hpf-product-img"
              />
            </div>
          )}

          <div className="hpf-content">
            <h2 className="hpf-title">
              {t('hero_figurine.title_start')} <span className="hpf-highlight">{t('hero_figurine.title_highlight')}</span>
            </h2>
            <div className="hpf-price">
              <span className="hpf-price-label">{t('hero_figurine.price_from')}</span>
              <span className="hpf-price-value">
                {heroProduct.price} {heroProduct.currency || 'PLN'}
              </span>
            </div>
          </div>
        </div>

        {/* ═══ 3. CTA BUTTON ═══ */}
        <button
          className="hpf-cta"
          onClick={(e) => {
            e.stopPropagation();
            handleHeroClick();
          }}
        >
          {t('hero_figurine.cta_button')} <ArrowRight size={14} />
        </button>

      </div>
    </section>
  );
};