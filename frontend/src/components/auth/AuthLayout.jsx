import { motion, AnimatePresence } from "framer-motion";
import "./AuthLayout.css";

const AuthLayout = ({ children, imagePosition = "left", imageSrc, layoutKey }) => {
  return (
    <AnimatePresence mode="wait">
      <div className="auth-container" key={layoutKey}>
        {/* Мобильная версия - всегда сверху */}
        <motion.div
          className="auth-image mobile-image"
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="image-overlay">
            <div className="image-text">
              <h1>DajDaj</h1>
              <p>Więcej niż prezent</p>
            </div>
          </div>
          <img src={imageSrc} alt="Auth visual" />
        </motion.div>

        {/* Десктопная версия - меняется в зависимости от imagePosition */}
        {imagePosition === "left" && (
          <motion.div
            className="auth-image desktop-image left"
            initial={{ x: -100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -100, opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="image-overlay">
              <div className="image-text">
                <h1>DajDaj</h1>
                <p>Więcej niż prezent</p>
              </div>
            </div>
            <img src={imageSrc} alt="Auth visual" />
          </motion.div>
        )}

        <motion.div
          className="auth-form"
          initial={{ 
            x: window.innerWidth > 768 ? (imagePosition === "left" ? 100 : -100) : 0,
            y: window.innerWidth <= 768 ? 100 : 0,
            opacity: 0 
          }}
          animate={{ x: 0, y: 0, opacity: 1 }}
          exit={{ 
            x: window.innerWidth > 768 ? (imagePosition === "left" ? 100 : -100) : 0,
            y: window.innerWidth <= 768 ? 100 : 0,
            opacity: 0 
          }}
          transition={{ duration: 0.5 }}
        >
          {children}
        </motion.div>

        {imagePosition === "right" && (
          <motion.div
            className="auth-image desktop-image right"
            initial={{ x: 100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 100, opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="image-overlay">
              <div className="image-text">
                <h1>DajDaj</h1>
                <p>Więcej niż prezent</p>
              </div>
            </div>
            <img src={imageSrc} alt="Auth visual" />
          </motion.div>
        )}
      </div>
    </AnimatePresence>
  );
};

export default AuthLayout;

