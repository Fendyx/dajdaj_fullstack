import { useState, useRef } from 'react';
import { ArrowRight, Volume2, VolumeX, Pause, Play } from 'lucide-react';
import './HeroPersonalFigurine.css';

const VIDEO_URL =
  'https://cdn.pixabay.com/video/2022/01/27/105760-672185993_large.mp4';

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
              aria-label={paused ? 'Play' : 'Pause'}
            >
              {paused ? <Play size={15} /> : <Pause size={15} />}
            </button>
            <button
              className="hpf-ctrl-btn"
              onClick={toggleMute}
              aria-label={muted ? 'Unmute' : 'Mute'}
            >
              {muted ? <VolumeX size={15} /> : <Volume2 size={15} />}
            </button>
          </div>
        </div>

        {/* ═══ 2. PRODUCT BLOCK ═══ */}
        <div className="hpf-product-block">
          <span className="hpf-hit-badge">✦ Hit</span>

          {productImageUrl && (
            <div className="hpf-img-wrap">
              <img
                src={productImageUrl}
                alt={heroProduct.name || 'Personal Figurine'}
                className="hpf-product-img"
              />
            </div>
          )}

          <div className="hpf-content">
            <h2 className="hpf-title">
              Make your own <span className="hpf-highlight">figurine</span>
            </h2>
            <div className="hpf-price">
              <span className="hpf-price-label">from</span>
              <span className="hpf-price-value">
                {heroProduct.price} {heroProduct.currency || 'PLN'}
              </span>
            </div>
          </div>
        </div>

        {/* ═══ 3. CTA BUTTON — прямой потомок hpf-card ═══ */}
        <button
          className="hpf-cta"
          onClick={(e) => {
            e.stopPropagation();
            handleHeroClick();
          }}
        >
          Сделать мою фигурку <ArrowRight size={14} />
        </button>

      </div>
    </section>
  );
};