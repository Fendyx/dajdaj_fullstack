// App.jsx
import React from "react";
import LottiePlayer from "./LottiePlayer";
import "./LottieTestHero.css";

const LottieTestHero = () => {
  return (
    <div className="appp-container">

      <div className="center-content">
        <h1>WEŹŻE DAJ COŚ WYJĄTKOWEGO</h1>
        <p>
          Te kulturowe i kulturowe elementy sprawiają, że obraz staje się bardziej
          osobisty i atrakcyjny.
        </p>
        <button className="glass-button">Buy</button>
      </div>

      <div className="right-lottie">
        <div className="glass-block">
            Bóbr nie ku**a bo kupuje na DajDaj
        </div>
        <LottiePlayer className="lottie-figure"/>
      </div>
    </div>
  );
};

export default LottieTestHero;



