// src/context/UIContext.jsx
import { createContext, useContext, useState } from "react";

const UIContext = createContext();

export const UIProvider = ({ children }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <UIContext.Provider
      value={{
        isMenuOpen,
        setIsMenuOpen,
        isModalOpen,
        setIsModalOpen,
      }}
    >
      {children}
    </UIContext.Provider>
  );
};

export const useUI = () => useContext(UIContext);
