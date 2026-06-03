import React from 'react';
import { motion } from 'framer-motion';

const DashboardHeader = ({ title, subtitle, rightElement }) => {
  return (
    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 mt-2">
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
      >
        <h1 className="text-xl sm:text-2xl md:text-4xl font-black dark:text-white text-slate-900 tracking-tight leading-tight">
          {title}
        </h1>
        {subtitle && (
          <p className="text-xs sm:text-sm md:text-base font-bold dark:text-slate-400 text-slate-500 mt-1 sm:mt-2">
            {subtitle}
          </p>
        )}
      </motion.div>
      {rightElement && (
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex-shrink-0"
        >
          {rightElement}
        </motion.div>
      )}
    </div>
  );
};

export default DashboardHeader;
