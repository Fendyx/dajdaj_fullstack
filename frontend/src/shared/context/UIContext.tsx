import { createContext, useContext, useState, type ReactNode } from "react";

// 1. Описываем, какие данные лежат в контексте
interface UIContextType {
  isMenuOpen: boolean;
  setIsMenuOpen: (isOpen: boolean) => void;
  isModalOpen: boolean;
  setIsModalOpen: (isOpen: boolean) => void;
}

// 2. Создаем сам контекст (с пустым дефолтным значением)
const UIContext = createContext<UIContextType | undefined>(undefined);

// 3. Создаем Провайдер (Радиовышку)
export const UIProvider = ({ children }: { children: ReactNode }) => {
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

// 4. Создаем безопасный Хук (Приемник)
export const useUI = () => {
  const context = useContext(UIContext);
  if (!context) {
    throw new Error("useUI must be used within a UIProvider");
  }
  return context;
};