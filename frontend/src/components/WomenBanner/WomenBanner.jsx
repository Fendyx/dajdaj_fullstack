import React, { useEffect, useRef, useState } from "react";
import WomenBanner_mp4 from "../../assets/img/women_banner.mp4";
import WomenBanner_mp4_Phone from "../../assets/img/women_banner_phone.mp4";
import "./WomenBanner.css";

export default function WomenBanner({ onScrollToCollection }) {
  const [visible, setVisible] = useState(false);
  const [isMobileVideo, setIsMobileVideo] = useState(window.innerWidth <= 1200);
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
        threshold: 0.3,
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

  // Обработка изменения ширины окна
  useEffect(() => {
    function handleResize() {
      setIsMobileVideo(window.innerWidth <= 1200);
    }

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div ref={bannerRef} className={`women-banner ${visible ? "visible" : ""}`}>
      <video className="women-banner-video" autoPlay loop muted playsInline>
        <source src={isMobileVideo ? WomenBanner_mp4_Phone : WomenBanner_mp4} type="video/mp4" />
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



  