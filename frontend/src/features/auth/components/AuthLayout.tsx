import { motion, AnimatePresence } from "framer-motion";
import React from "react";
import "./Auth.css"; // Импортируем наш единый файл стилей

interface AuthLayoutProps {
  children: React.ReactNode;
}

export const AuthLayout = ({ children }: AuthLayoutProps) => {
  return (
    <AnimatePresence mode="wait">
      <div className="auth-container">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
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