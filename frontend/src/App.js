import "./App.css";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchUserProfile, setToken } from "./slices/authSlice";
import { UserProfile } from "./components/UserProfile/UserProfile";

// import Checkout from "./Pages/Checkout/Checkout";
import Home from "./components/Home";
import NavBar from "./components/NavBar";
import BottomNav from "./components/BottomNav/BottomNav";
import Footer from "./components/Footer/Footer";
import NotFound from "./components/NotFound";
import Cart from "./components/Cart/Cart";
import MaleBodybuilder from "./ProductPages/MaleBodybuilder/MaleBodybuilder";
import BeerEdition from "./ProductPages/BeerEdition/BeerEdition";
import TrustBulk from "./ProductPages/TrustBulk/TrustBulk";
import NeverSkipLegs from "./ProductPages/NeverSkipLegs/NeverSkipLegs";
import FemaleBlond from "./ProductPages/FemaleBlond/FemaleBlond";
import FemaleBrunette from "./ProductPages/FemaleBrunette/FemaleBrunette";
import FemalePink from "./ProductPages/FemalePink/FemalePink";
import SpecialGirl from "./ProductPages/SpecialGirl/SpecialGirl";
import Register from "./components/auth/Register";
import Login from "./components/auth/Login";
import CheckoutSuccess from "./components/CheckoutSuccess/CheckoutSuccess";
import ReturnPolicy from "./Pages/ReturnPolicy/ReturnPolicy";
import PaymentMethods from "./Pages/PaymentsMethods/PaymentMethods";
import Shipping from "./Pages/Shipping/Shipping";
import Contact from "./Pages/Contact/Contact";
import ScrollToTop from "./components/ScrollToTop";
import { ScrollProvider } from "./components/ScrollContext";
import { UIProvider } from "./context/UIContext";

function AppContent() {
  const location = useLocation();

  const footerPages = ["/", "/about", "/contacts"];
  const showFooter = footerPages.includes(location.pathname);

  const noLayoutPages = ["/cart", "/checkout", "/login", "/register"];
  const hideLayout = noLayoutPages.includes(location.pathname);

  return (
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
          <Route path="/profile" element={<UserProfile />} />
          <Route path="/products/male-bodybuilder" element={<MaleBodybuilder />} />
          <Route path="/products/beer-edition" element={<BeerEdition />} />
          <Route path="/products/trust-bulk" element={<TrustBulk />} />
          <Route path="/products/never-skip-legs" element={<NeverSkipLegs />} />
          <Route path="/products/female-blond" element={<FemaleBlond />} />
          <Route path="/products/female-brunette" element={<FemaleBrunette />} />
          <Route path="/products/female-pink" element={<FemalePink />} />
          <Route path="/products/special-girl" element={<SpecialGirl />} />
          <Route path="/return-policy" element={<ReturnPolicy />} />
          <Route path="/payment-methodes" element={<PaymentMethods />} />
          <Route path="/shipping" element={<Shipping />} />
          <Route path="/contact" element={<Contact />} />
          {/* <Route path="/checkout" element={<Checkout />} /> */}
          <Route path="/about" element={<div>About Page</div>} />
          <Route path="/contacts" element={<div>Contacts Page</div>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
      {!hideLayout && <BottomNav />}
      {showFooter && <Footer />}
    </>
  );
}

function App() {
  const dispatch = useDispatch();
  const token = useSelector((state) => state.auth.token);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const oauthToken = params.get("token");

    if (oauthToken) {
      localStorage.setItem("token", oauthToken);
      dispatch(setToken(oauthToken)); // ⚠️ добавь setToken в authSlice
      dispatch(fetchUserProfile());
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (localStorage.getItem("token") && !token) {
      dispatch(setToken(localStorage.getItem("token")));
      dispatch(fetchUserProfile());
    }
  }, [dispatch, token]);

  return (
    <div className="App">
      <BrowserRouter>
        <ScrollProvider>
          <UIProvider>
            <ToastContainer />
            <AppContent />
          </UIProvider>
        </ScrollProvider>
      </BrowserRouter>
    </div>
  );
}

export default App;
