import React from 'react';
import { motion } from 'framer-motion';

const FoodStatsCard = ({ title, value, icon: Icon, colorClass = "text-primary-500 bg-primary-500" }) => {
  return (
    <motion.div
      whileHover={{ y: -5 }}
      className="glass-card p-4 sm:p-6 lg:p-8 rounded-2xl sm:rounded-3xl border dark:border-white/[0.08] border-slate-200/80 bg-white/60 dark:bg-[#111111]/80 backdrop-blur-2xl flex items-center gap-3 sm:gap-6 group hover:shadow-xl hover:shadow-primary-500/10 transition-all min-w-0"
    >
      <div className={`w-12 h-12 sm:w-20 sm:h-20 rounded-xl sm:rounded-[1.5rem] ${colorClass.split(' ')[1]} bg-opacity-10 dark:bg-opacity-20 flex items-center justify-center shrink-0 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300`}>
        <Icon className={`w-6 h-6 sm:w-10 sm:h-10 ${colorClass.split(' ')[0]}`} />
      </div>
      <div className="min-w-0">
        <p className="text-[10px] sm:text-xs font-black dark:text-slate-400 text-slate-500 uppercase tracking-widest mb-1 truncate">{title}</p>
        <h3 className="text-2xl sm:text-4xl font-black dark:text-white text-slate-900 tracking-tight truncate">{value}</h3>
      </div>
    </motion.div>
  );
};

export default FoodStatsCard;
