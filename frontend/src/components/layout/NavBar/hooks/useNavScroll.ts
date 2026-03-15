import { useEffect, useRef, useState } from "react";

/**
 * Returns true when the navbar should be visible.
 * – Hides on scroll DOWN past a threshold (mobile only, < 1024 px)
 * – Shows immediately on any scroll UP
 */
export const useNavScroll = (threshold = 6) => {
  const [visible, setVisible] = useState(true);
  const lastY = useRef(0);
  const ticking = useRef(false);

  useEffect(() => {
    const onScroll = () => {
      if (ticking.current) return;
      ticking.current = true;

      requestAnimationFrame(() => {
        const currentY = window.scrollY;
        const delta = currentY - lastY.current;

        if (window.innerWidth >= 1024) {
          setVisible(true);
        } else if (delta > threshold && currentY > 56) {
          setVisible(false);
        } else if (delta < -threshold) {
          setVisible(true);
        }

        lastY.current = currentY;
        ticking.current = false;
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [threshold]);

  return visible;
};