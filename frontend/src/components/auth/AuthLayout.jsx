import { motion, AnimatePresence } from "framer-motion";
import "./AuthLayout.css";

const AuthLayout = ({ children }) => {
  return (
    <AnimatePresence mode="wait">
      <div className="auth-container">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }} // Легкое увеличение при появлении
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          style={{ width: "100%", display: "flex", justifyContent: "center" }}
        >
          {children}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default AuthLayout;