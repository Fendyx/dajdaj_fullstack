import "./SpecialOffer.css";
import { useContext } from "react";
import { ScrollContext } from "../ScrollContext";
import { useUI } from "../../context/UIContext"; // ✅ правильный импорт

const SpecialOffer = () => {
  const { specialOfferRef } = useContext(ScrollContext);
  const { isMenuOpen } = useUI(); // ✅ используем useUI

  const handleClick = () => {
    if (specialOfferRef.current) {
      specialOfferRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  if (isMenuOpen) return null;

  return (
    <div
      className="special_offer"
      onClick={handleClick}
      title="Special offer"
    >
      Oferta<br />specjalna
    </div>
  );
};

export default SpecialOffer;
