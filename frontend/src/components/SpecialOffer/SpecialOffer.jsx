import "./SpecialOffer.css";
import { useContext } from "react";
import { ScrollContext } from "../ScrollContext"; // ✅ путь правильный

const SpecialOffer = () => {
  const { specialOfferRef } = useContext(ScrollContext);

  const handleClick = () => {
    if (specialOfferRef.current) {
      specialOfferRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

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


