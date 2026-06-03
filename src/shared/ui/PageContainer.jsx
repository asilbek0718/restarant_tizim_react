import React from 'react';
import { motion } from 'framer-motion';

const PageContainer = ({ children, className = '' }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className={`min-h-[calc(100vh-6rem)] w-full max-w-7xl mx-auto pb-8 min-w-0 ${className}`}
    >
      {children}
    </motion.div>
  );
};

export default PageContainer;
