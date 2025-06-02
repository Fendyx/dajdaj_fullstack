import React, { useEffect, useRef, useState } from "react";
import WomenBanner_mp4 from "../../assets/img/women_banner.mp4";
import "./WomenBanner.css";

export default function WomenBanner({ onScrollToCollection }) {
  const [visible, setVisible] = useState(false);
  const bannerRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.unobserve(entry.target); // чтобы не срабатывало повторно
        }
      },
      {
        threshold: 0.3, // сработает, когда 30% баннера окажется в зоне видимости
      }
    );

    if (bannerRef.current) {
      observer.observe(bannerRef.current);
    }

    return () => {
      if (bannerRef.current) {
        observer.unobserve(bannerRef.current);
      }
    };
  }, []);

  return (
    <div
    ref={bannerRef}
    className={`women-banner ${visible ? "visible" : ""}`}
  >
    <video className="women-banner-video" autoPlay loop muted playsInline>
      <source src={WomenBanner_mp4} type="video/mp4" />
      Your browser does not support the video tag.
    </video>

    <div className="women-banner-overlay" />

    <div className="women-banner-content">
      <h1>Twój napis, Twoje imię</h1>
      <p>Spersonalizowane figurki kulturystek</p>
      <button onClick={onScrollToCollection}>Zobacz kolekcję</button>
    </div>
  </div>
  );
}



  