import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { loadUser } from "./slices/authSlice";
import { UserProfile } from "./components/UserProfile/UserProfile";


import Home from "./components/Home";
import NavBar from "./components/NavBar";
import Footer from "./components/Footer/Footer";
import NotFound from "./components/NotFound";
import Cart from "./components/Cart";
import MaleBodybuilder from "./components/MaleBodybuilder/MaleBodybuilder";
import BeerEdition from "./components/BeerEdition/BeerEdition";
import TrustBulk from "./components/TrustBulk/TrustBulk";
import NeverSkipLegs from "./components/NeverSkipLegs/NeverSkipLegs";
import FemaleBlond from "./components/FemaleBlond/FemaleBlond";
import FemaleBrunette from "./components/FemaleBrunette/FemaleBrunette";
import FemalePink from "./components/FemalePink/FemalePink";
import SpecialGirl from "./components/SpecialGirl/SpecialGirl";
import Register from "./components/auth/Register";
import Login from "./components/auth/Login";
import CheckoutSuccess from "./components/CheckoutSuccess";
import ReturnPolicy from "./Pages/ReturnPolicy/ReturnPolicy";
import PaymentMethods from "./Pages/PaymentsMethods/PaymentMethods";
import Shipping from "./Pages/Shipping/Shipping";
import Contact from "./Pages/Contact/Contact";
import ScrollToTop from "./components/ScrollToTop";
import { ScrollProvider } from "./components/ScrollContext";
import { MenuProvider } from "./context/MenuContext"; // Добавлен импорт MenuProvider

function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(loadUser(null));
  }, [dispatch]);

  return (
    <div className="App">
      <BrowserRouter>
        <ScrollProvider>
          <MenuProvider> {/* Добавлен MenuProvider */}
            <ToastContainer />
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
                <Route path="/male-bodybuilder" element={<MaleBodybuilder />} />
                <Route path="/beer-edition" element={<BeerEdition />} />
                <Route path="/trust-bulk" element={<TrustBulk />} />
                <Route path="/never-skip-legs" element={<NeverSkipLegs />} />
                <Route path="/female-blond" element={<FemaleBlond />} />
                <Route path="/female-brunette" element={<FemaleBrunette />} />
                <Route path="/female-pink" element={<FemalePink />} />
                <Route path="/special-girl" element={<SpecialGirl />} />
                <Route path="/return-policy" element={<ReturnPolicy />} />
                <Route path="/payment-methodes" element={<PaymentMethods />} />
                <Route path="/shipping" element={<Shipping />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </div>
            <Footer />
          </MenuProvider>
        </ScrollProvider>
      </BrowserRouter>
    </div>
  );
}

export default App;