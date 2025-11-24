import { motion, AnimatePresence } from "framer-motion";
import "./AuthLayout.css";

const AuthLayout = ({ children, imagePosition = "left", imageSrc, layoutKey }) => {
  return (
    <AnimatePresence mode="wait">
      <div className="auth-container" key={layoutKey}>
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
