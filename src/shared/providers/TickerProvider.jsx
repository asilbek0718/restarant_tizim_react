import React, { createContext, useContext, useState, useEffect } from 'react';

const TickerContext = createContext(null);

export const TickerProvider = ({ children }) => {
  const [tick, setTick] = useState(Date.now());

  useEffect(() => {
    const interval = setInterval(() => {
      setTick(Date.now());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <TickerContext.Provider value={tick}>
      {children}
    </TickerContext.Provider>
  );
};

export const useTick = () => {
  const context = useContext(TickerContext);
  if (context === null) {
    return Date.now();
  }
  return context;
};
