import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import useThemeStore from '../../store/themeStore';
import Sidebar from '../../shared/components/Sidebar';
import Navbar from '../../shared/components/Navbar';

const KitchenLayout = ({ children }) => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const { theme } = useThemeStore();
  const location = useLocation();

  useEffect(() => {
    const body = document.body;
    if (theme === 'dark') {
      body.classList.add('dark');
      body.classList.remove('light');
    } else {
      body.classList.add('light');
      body.classList.remove('dark');
    }
  }, [theme]);

  return (
    <div className={`min-h-screen transition-colors duration-300 ${theme}`}>
      <Sidebar isOpen={isSidebarOpen} toggleSidebar={() => setSidebarOpen(!isSidebarOpen)} />
      
      <div className="lg:pl-64 min-h-screen flex flex-col">
        <Navbar toggleSidebar={() => setSidebarOpen(!isSidebarOpen)} />
        
        <main className="flex-1 p-3 sm:p-6 lg:p-8 overflow-x-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};

export default KitchenLayout;
