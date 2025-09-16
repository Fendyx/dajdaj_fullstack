import { motion, AnimatePresence } from "framer-motion";
import "./AuthLayout.css";

const AuthLayout = ({ children, imagePosition = "left", imageSrc, layoutKey }) => {
  return (
    <AnimatePresence mode="wait">
      <div className="auth-container" key={layoutKey}>
        {/* Десктопная версия */}
        {imageSrc && (
          <motion.div
            className={`auth-image desktop-image ${imagePosition}`}
            initial={{ x: imagePosition === "left" ? -100 : 100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: imagePosition === "left" ? -100 : 100, opacity: 0 }}
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

        {/* Форма */}
        <motion.div
          className="auth-form"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          transition={{ duration: 0.5 }}
        >
          {children}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default AuthLayout;
