import { createContext, useRef } from "react";

export const ScrollContext = createContext();

export const ScrollProvider = ({ children }) => {
  const specialOfferRef = useRef(null);

  return (
    <ScrollContext.Provider value={{ specialOfferRef }}>
      {children}
    </ScrollContext.Provider>
  );
};

