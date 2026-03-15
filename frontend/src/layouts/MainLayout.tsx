import { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import ReactGA from "react-ga4";

import { NavBar } from "@/components/layout/NavBar/NavBar";
import { BottomNav } from "@/components/layout/BottomNav/BottomNav";
import { Footer } from "@/components/layout/Footer/Footer";
import { ScrollToTop } from "@/components/layout/ScrollToTop";

// Инициализация GA4
ReactGA.initialize("G-B1FPX1YX71");

export function MainLayout() {
  const location = useLocation();

  // --- GA4 TRACKING ---
  useEffect(() => {
    ReactGA.send({ hitType: "pageview", page: location.pathname + location.search });
  }, [location]);

  // Логика отображения (оставляем твою, но делаем чище)
  const showFooter = ["/", "/about", "/contacts"].includes(location.pathname);
  const hideBottomNav = [
    "/cart", "/checkout", "/login", "/register", "/checkout-stripe"
  ].some(path => location.pathname.startsWith(path));

  return (
    <>
      <NavBar />
      <ScrollToTop />
      
      {/* Здесь будут рендериться все страницы (Home, Profile, Product) */}
      <main>
        <Outlet /> 
      </main>

      {!hideBottomNav && <BottomNav />}
      {showFooter && <Footer />}
    </>
  );
}