// contexts/GuestContext.tsx
import React, { createContext, useContext, useState } from 'react';

interface GuestContextType {
  isGuest: boolean;
  setGuest: (guest: boolean) => void;
}

const GuestContext = createContext<GuestContextType | undefined>(undefined);

export const GuestProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isGuest, setIsGuest] = useState(false);

  const setGuest = (guest: boolean) => {
    setIsGuest(guest);
  };

  return (
    <GuestContext.Provider value={{ isGuest, setGuest }}>
      {children}
    </GuestContext.Provider>
  );
};

export const useGuestContext = () => {
  const context = useContext(GuestContext);
  if (context === undefined) {
    throw new Error('useGuestContext must be used within a GuestProvider');
  }
  return context;
};