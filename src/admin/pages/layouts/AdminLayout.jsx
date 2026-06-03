import React, { useEffect, useState } from 'react';
import { useLocation, Outlet } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import useUIStore from '@/store/ui/uiStore';
import Sidebar from '@/shared/components/Sidebar';
import Navbar from '@/shared/components/Navbar';

const AdminLayout = ({ children }) => {
  const { theme, isSidebarOpen, toggleSidebar } = useUIStore();
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
    <div className={`h-screen transition-colors duration-300 ${theme} relative overflow-hidden bg-slate-50 dark:bg-[#050505]`}>
      {/* Premium Ambient Background */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-primary-500/20 dark:bg-primary-500/10 blur-[120px] mix-blend-screen dark:mix-blend-lighten animate-float opacity-50" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-blue-500/20 dark:bg-blue-500/10 blur-[120px] mix-blend-screen dark:mix-blend-lighten animate-float opacity-50" style={{ animationDelay: '2s' }} />
        <div className="absolute top-[40%] right-[20%] w-[30%] h-[30%] rounded-full bg-accent-500/10 dark:bg-accent-500/5 blur-[100px] mix-blend-screen dark:mix-blend-lighten animate-float opacity-30" style={{ animationDelay: '4s' }} />
        {/* Subtle Noise Overlay */}
        <div className="absolute inset-0 opacity-[0.015] dark:opacity-[0.03] mix-blend-overlay" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.85%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")' }}></div>
      </div>

      <div className="relative z-10 flex h-full">
        <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
      
        <div className="lg:pl-60 h-full flex flex-col w-full min-w-0">
          <Navbar toggleSidebar={toggleSidebar} />
          
          <main className="flex-1 p-3 sm:p-6 lg:p-8 overflow-y-auto overflow-x-hidden min-h-0 relative">
            <AnimatePresence mode="wait">
              <motion.div
                key={location.pathname}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="h-full flex flex-col"
              >
                {children || <Outlet />}
              </motion.div>
            </AnimatePresence>
          </main>
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
