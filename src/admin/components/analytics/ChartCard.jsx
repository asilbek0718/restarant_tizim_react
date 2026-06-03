import React from 'react';
import { motion } from 'framer-motion';

const ChartCard = ({ title, actionElement, children, className = '' }) => {
  return (
    <div className={`glass-card rounded-[24px] sm:rounded-[32px] border dark:border-white/[0.08] border-slate-200/80 bg-white/60 dark:bg-[#111111]/80 backdrop-blur-2xl shadow-md overflow-hidden ${className}`}>
      <div className="p-3 pb-2 sm:p-8 sm:pb-4 flex justify-between items-center bg-slate-50/50 dark:bg-white/[0.04] border-b dark:border-white/5 border-slate-100">
        <h3 className="text-base sm:text-2xl font-bold tracking-tight dark:text-white text-slate-900 tracking-tight">{title}</h3>
        {actionElement && (
          <div className="text-[10px] sm:text-xs shrink-0">{actionElement}</div>
        )}
      </div>
      <div className="p-3 sm:p-8">
        {children}
      </div>
    </div>
  );
};

export default ChartCard;
