import React from 'react';
import { motion } from 'framer-motion';

const SettingsCard = ({ title, description, icon: Icon, children }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="glass-card rounded-2xl sm:rounded-[32px] border dark:border-white/[0.08] border-slate-200/80 bg-white/60 dark:bg-[#111111]/80 backdrop-blur-2xl overflow-hidden shadow-sm"
    >
      <div className="p-3 sm:p-8 border-b dark:border-white/5 border-slate-100 flex items-center gap-3 sm:gap-5 bg-slate-50/50 dark:bg-white/[0.02]">
        {Icon && (
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl flex items-center justify-center shrink-0 bg-primary-500/10 text-primary-500">
            <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
        )}
        <div className="min-w-0">
          <h3 className="text-base sm:text-lg font-black tracking-tight dark:text-white text-slate-900 leading-tight">{title}</h3>
          {description && <p className="text-[9px] sm:text-xs font-bold dark:text-slate-500 text-slate-400 mt-0.5 truncate">{description}</p>}
        </div>
      </div>
      <div className="p-4 sm:p-8 space-y-4 sm:space-y-6">
        {children}
      </div>
    </motion.div>
  );
};

export default SettingsCard;
