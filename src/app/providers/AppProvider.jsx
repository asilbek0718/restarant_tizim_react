import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import ErrorBoundary from '@/shared/components/ErrorBoundary';
import { TickerProvider } from '@/shared/providers/TickerProvider';

/**
 * AppProvider Component
 * Wraps the application with all necessary global providers.
 * Modularizes app initialization logic.
 */
const AppProvider = ({ children }) => {
  return (
    <BrowserRouter>
      <ErrorBoundary>
        <TickerProvider>
          {children}
        </TickerProvider>
      </ErrorBoundary>
    </BrowserRouter>
  );
};

export default AppProvider;
