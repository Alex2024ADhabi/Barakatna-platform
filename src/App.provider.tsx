import React, { createContext, useContext, useState, ReactNode } from "react";

interface AppContextType {
  theme: string;
  setTheme: (theme: string) => void;
  language: string;
  setLanguage: (language: string) => void;
  isAuthenticated: boolean;
  setIsAuthenticated: (isAuthenticated: boolean) => void;
  clientType: string;
  setClientType: (clientType: string) => void;
}

const defaultContext: AppContextType = {
  theme: "light",
  setTheme: () => {},
  language: "er",
  setLanguage: () => {},
  isAuthenticated: false,
  setIsAuthenticated: () => {},
  clientType: "FDF",
  setClientType: () => {},
};

const AppContext = createContext<AppContextType>(defaultContext);

export const useAppContext = () => useContext(AppContext);

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [theme, setTheme] = useState("light");
  const [language, setLanguage] = useState("en");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [clientType, setClientType] = useState("FDF");

  const value = {
    theme,
    setTheme,
    language,
    setLanguage,
    isAuthenticated,
    setIsAuthenticated,
    clientType,
    setClientType,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
