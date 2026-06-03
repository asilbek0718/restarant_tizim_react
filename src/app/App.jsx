import React from 'react';
import AppRouter from '@/routes/AppRouter';
import { useSessionBootVerification } from '@/shared/hooks/useSessionBootVerification';

/**
 * Root Application Component
 * Responsible for mounting the central router.
 * Also runs the session boot verification guard (Step 3 — Task B).
 */
const App = () => {
  useSessionBootVerification();
  return <AppRouter />;
};

export default App;
