import React from 'react';
import { motion } from 'framer-motion';

const EmptyState = ({ icon: Icon, title, description, actionElement }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="w-full py-24 flex flex-col items-center justify-center text-center bg-slate-50/50 dark:bg-white/[0.04] rounded-[32px] border-2 border-dashed dark:border-white/[0.08] border-slate-200/80 px-6"
    >
      <div className="w-24 h-24 bg-white dark:bg-black/20 rounded-full flex items-center justify-center mb-6 shadow-md border dark:border-white/5 border-slate-100 text-primary-500">
        {Icon ? <Icon className="w-10 h-10" /> : <span className="text-5xl opacity-40">📭</span>}
      </div>
      <h3 className="text-3xl font-extrabold tracking-tight dark:text-white text-slate-900 mb-3 tracking-tight">{title || 'No data found'}</h3>
      <p className="font-bold text-lg dark:text-slate-400 text-slate-500 max-w-md mb-8">
        {description || 'There is currently no data to display here. Adjust your filters or create a new entry.'}
      </p>
      {actionElement && (
        <div className="mt-2">
          {actionElement}
        </div>
      )}
    </motion.div>
  );
};

export default EmptyState;
