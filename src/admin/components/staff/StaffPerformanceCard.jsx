import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Target } from 'lucide-react';

const StaffPerformanceCard = ({ title, value, percentage, isPositive }) => {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="glass-card p-4 sm:p-8 rounded-2xl sm:rounded-[32px] border dark:border-white/[0.08] border-slate-200/80 bg-white/60 dark:bg-[#111111]/80 backdrop-blur-2xl flex flex-col h-full group hover:shadow-2xl hover:shadow-primary-500/5 transition-all relative overflow-hidden"
    >
      <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:scale-110 transition-transform duration-500 text-primary-500">
        <Target className="w-24 h-24 sm:w-32 sm:h-32" />
      </div>
      
      <div className="flex items-center justify-between mb-6 sm:mb-8">
        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] dark:text-slate-500 text-slate-400">{title}</h4>
        <div className="p-2 rounded-xl bg-slate-100 dark:bg-white/5">
          <Target className="w-4 h-4 text-primary-500" />
        </div>
      </div>

      <div className="flex items-end justify-between relative z-10">
        <h2 className="text-3xl sm:text-5xl font-black dark:text-white text-slate-900 tracking-tight leading-none">{value}</h2>
        {percentage !== undefined && (
          <div className={`flex items-center gap-1.5 px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest border shadow-sm ${isPositive ? 'bg-green-500/10 text-green-600 border-green-500/20 dark:text-green-400' : 'bg-red-500/10 text-red-600 border-red-500/20 dark:text-red-400'}`}>
            {isPositive ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
            {isPositive ? '+' : ''}{percentage}%
          </div>
        )}
      </div>
      
      <div className="mt-6 w-full h-1.5 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: value }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="h-full bg-primary-500 rounded-full"
        />
      </div>
    </motion.div>
  );
};

export default StaffPerformanceCard;
