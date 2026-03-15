import { useEffect } from "react";
import { RouterProvider } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import "react-toastify/dist/ReactToastify.css";

import { router } from "./router";
// 🔥 Добавили useAppSelector
import { useAppDispatch, useAppSelector } from "@/store/hooks"; 
import { setToken, fetchUserProfile } from "@/features/auth/authSlice";
import { UIProvider } from "@/shared/context/UIContext"; 
import { GdprGate } from "./features/auth/components/GdprGate/GdprGate";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY || "");

function App() {
  const dispatch = useAppDispatch();
  // 🔥 Следим, загрузились ли данные пользователя
  const userLoaded = useAppSelector((state) => state.auth.userLoaded);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const oauthToken = params.get("token");
    const storedToken = oauthToken || localStorage.getItem("token");

    if (storedToken) {
      // Если токен только что пришел из URL (Google/Facebook)
      if (oauthToken) {
        localStorage.setItem("token", oauthToken);
        dispatch(setToken(oauthToken));
        window.history.replaceState({}, document.title, window.location.pathname);
      }
      
      // 🔥 Ждем профиль только если он еще не загружен
      if (!userLoaded) {
        dispatch(fetchUserProfile());
      }
    }
  }, [dispatch, userLoaded]);
  
  return (
    <UIProvider>
      <ToastContainer position="top-right" autoClose={3000} />
      <Elements stripe={stripePromise}>
        <RouterProvider router={router} />
        <GdprGate />
      </Elements>
    </UIProvider>
  );
}

export default App;