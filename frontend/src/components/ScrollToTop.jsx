import { useLocation } from "react-router-dom";
import { useEffect } from "react";

const ScrollToTop = () => {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0); // Прокручиваем страницу в начало
  }, [location]);

  return null; // Компонент ничего не рендерит
};

export default ScrollToTop;
