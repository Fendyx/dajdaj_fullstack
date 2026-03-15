import { useEffect, useState } from "react";
import Lottie from "lottie-react";
import "./LottiePlayer.css";

interface LottiePlayerProps {
  className?: string;
}

export const LottiePlayer = ({ className }: LottiePlayerProps) => {
  const [animationData, setAnimationData] = useState<any>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch("https://cdn.lottielab.com/l/9fPBBsc8cpWzkm.json")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load animation");
        return res.json();
      })
      .then((data) => setAnimationData(data))
      .catch((err) => {
        console.error("Lottie error:", err);
        setError(true);
      });
  }, []);

  if (error) return <div className="lottie-error">Oops, animation failed to load</div>;
  if (!animationData) return <div className="lottie-loading">Loading...</div>;

  return (
    // Убрал inline-стили, теперь всё управляется через классы
    <div className={`lottie-container ${className || ""}`}>
      <Lottie 
        animationData={animationData} 
        loop={true} 
        className="lottie-player" 
      />
    </div>
  );
};