import "./App.css";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchUserProfile, setToken } from "./slices/authSlice";

import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";

import NavBar from "./components/NavBar";
import ScrollToTop from "./components/ScrollToTop";
import { ScrollProvider } from "./components/ScrollContext";
import { UIProvider } from "./context/UIContext";

import { UserCard } from "./components/UserProfile/components/UserCard/UserCard";
import { UserProfileCard } from "./components/UserProfile/components/UserProfileCard/UserProfileCard";
import LottiePlayer from "./components/LottieTestHero/LottiePlayer";
import LottieTestHero from "./components/LottieTestHero/LottieTestHero";
import CheckoutStripe from "./components/CheckoutStripe/CheckoutStripe";
import SelectedCartItem from "./components/SelectedCartItem/SelectedCartItem";
import AdminLayout from "./layouts/AdminLayout";

import Home from "./components/Home";
import Cart from "./components/Cart/Cart";
import ShippingInfo from "./Pages/ShippingInfo/ShippingInfo";
import SelectDeliveryMethod from "./Pages/ShippingInfo/components/selectDeliveryMethod/SelectDeliveryMethod";
import CheckoutSuccess from "./components/CheckoutSuccess/CheckoutSuccess";
import Register from "./components/auth/Register";
import Login from "./components/auth/Login";
import { UserProfile } from "./components/UserProfile/UserProfile";
import NotFound from "./components/NotFound";
import BottomNav from "./components/BottomNav/BottomNav";
import Footer from "./components/Footer/Footer";
import PrivateRoute from "./components/PrivateRoute";

import MaleBodybuilder from "./ProductPages/MaleBodybuilder/MaleBodybuilder";
import BeerEdition from "./ProductPages/BeerEdition/BeerEdition";
import TrustBulk from "./ProductPages/TrustBulk/TrustBulk";
import NeverSkipLegs from "./ProductPages/NeverSkipLegs/NeverSkipLegs";
import FemaleBlond from "./ProductPages/FemaleBlond/FemaleBlond";
import FemaleBrunette from "./ProductPages/FemaleBrunette/FemaleBrunette";
import FemalePink from "./ProductPages/FemalePink/FemalePink";
import SpecialGirl from "./ProductPages/SpecialGirl/SpecialGirl";
import PersonalFigurine from "./ProductPages/PersonalFigurine/PersonalFigurine";
import Posters from "./ProductPages/Posters/Posters";

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLIC_KEY);

function AppContent() {
  const location = useLocation();
  const auth = useSelector((state) => state.auth);

  const footerPages = ["/", "/about", "/contacts"];
  const showFooter = footerPages.includes(location.pathname);

  const noLayoutPages = [
    "/cart",
    "/checkout",
    "/login",
    "/register",
    "/select-delivery-method",
    "/checkout-stripe",
  ];
  const hideLayout = noLayoutPages.includes(location.pathname);

  const adminPages = ["/admin"];
  const isAdminPage = adminPages.includes(location.pathname);

  return (
    <>
      {isAdminPage ? (
        <Routes>
          <Route path="/admin" element={<AdminLayout />} />
        </Routes>
      ) : (
        <>
          <NavBar />
          <ScrollToTop />
          <div className="content-container">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/checkout-success" element={<CheckoutSuccess />} />
              <Route path="/register" element={<Register />} />
              <Route path="/login" element={<Login />} />
              
              {/* Профиль остается защищенным */}
              <Route
                path="/profile"
                element={
                  <PrivateRoute>
                    <UserProfile />
                  </PrivateRoute>
                }
              />

              {/* --- ИЗМЕНЕНИЯ: Эти маршруты теперь публичные для гостей --- */}
              <Route path="/shipping-info" element={<ShippingInfo />} />
              <Route path="/checkout-stripe" element={<CheckoutStripe />} />
              {/* ----------------------------------------------------------- */}

              <Route
                path="/products/male-bodybuilder"
                element={<MaleBodybuilder />}
              />
              <Route
                path="/products/beer-edition"
                element={<BeerEdition />}
              />
              <Route
                path="/products/trust-bulk"
                element={<TrustBulk />}
              />
              <Route
                path="/products/never-skip-legs"
                element={<NeverSkipLegs />}
              />
              <Route
                path="/products/female-brunette"
                element={<FemaleBrunette />}
              />
              <Route
                path="/products/female-blond"
                element={<FemaleBlond />}
              />
              <Route
                path="/products/female-pink"
                element={<FemalePink />}
              />
              <Route
                path="/products/special-girl"
                element={<SpecialGirl />}
              />
              <Route
                path="/products/personal-figurine"
                element={<PersonalFigurine />}
              />
              <Route path="/posters/:slug" element={<Posters />} />
              <Route
                path="/select-delivery-method"
                element={<SelectDeliveryMethod />}
              />
              <Route path="/usercard" element={<UserCard profile={auth} />} />
              <Route
                path="/user-profile-card"
                element={<UserProfileCard profile={auth} />}
              />
              <Route path="/lottie" element={<LottiePlayer />} />
              <Route path="/lottie-hero" element={<LottieTestHero />} />
              <Route path="/selected-item" element={<SelectedCartItem />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
          {!hideLayout && <BottomNav />}
          {showFooter && <Footer />}
        </>
      )}
    </>
  );
}

function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    console.log("🧩 [App] useEffect triggered");
  
    const params = new URLSearchParams(window.location.search);
    const oauthToken = params.get("token");
    const storedToken = oauthToken || localStorage.getItem("token");
  
    console.log("🔑 [App] oauthToken:", oauthToken);
    console.log("🔑 [App] localStorage token:", localStorage.getItem("token"));
    console.log("🔑 [App] storedToken:", storedToken);
  
    if (storedToken) {
      console.log("🚀 [App] Dispatching setToken and fetchUserProfile");
      dispatch(setToken(storedToken));
      dispatch(fetchUserProfile());
  
      if (oauthToken) {
        console.log("🧼 [App] Cleaning up URL");
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    } else {
      console.warn("🚫 [App] No token found — skipping fetchUserProfile");
    }
  }, [dispatch]);
  

  return (
    <div className="App">
      <BrowserRouter>
        <ScrollProvider>
          <UIProvider>
            <ToastContainer />
            <Elements stripe={stripePromise}>
              <AppContent />
            </Elements>
          </UIProvider>
        </ScrollProvider>
      </BrowserRouter>
    </div>
  );
}

export default App;