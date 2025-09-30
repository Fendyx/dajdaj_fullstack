// LottiePlayer.jsx
import React, { useEffect, useState } from "react";
import Lottie from "lottie-react";
import "./LottiePlayer.css"

const LottiePlayer = () => {
  const [animationData, setAnimationData] = useState(null);

  useEffect(() => {
    fetch("https://cdn.lottielab.com/l/9fPBBsc8cpWzkm.json")
      .then((res) => res.json())
      .then((data) => setAnimationData(data));
  }, []);

  if (!animationData) return <div>Loading...</div>;

  return (
    <div className="lottie-container" style={{paddingTop: "100px"}}>
      <Lottie animationData={animationData} loop={true} className="lottie-player"/>
    </div>
  );
};

export default LottiePlayer;
