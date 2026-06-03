import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { TRANSLATIONS } from '@/shared/constants/translations';

const MetricCard = ({ title, value, trend, trendValue, icon: Icon, colorClass = "text-primary-500 bg-primary-500" }) => {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="glass-card p-4 sm:p-5 lg:p-6 rounded-3xl border dark:border-white/[0.08] border-slate-200/80 bg-white/60 dark:bg-[#111111]/80 backdrop-blur-2xl group hover:shadow-xl hover:shadow-primary-500/10 transition-all flex flex-col justify-between h-full relative overflow-hidden"
    >
      <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-white/40 to-transparent dark:from-white/5 rounded-bl-3xl -z-10 opacity-30 group-hover:opacity-60 transition-opacity"></div>
      
      <div className="flex justify-between items-start mb-4">
        <h4 className="text-[10px] font-black uppercase tracking-[2px] dark:text-slate-400 text-slate-500 pt-1 break-words line-clamp-2 pr-2">{title}</h4>
        <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-2xl ${colorClass.split(' ')[1]} bg-opacity-10 dark:bg-opacity-20 flex items-center justify-center shrink-0 group-hover:scale-105 group-hover:rotate-3 transition-transform duration-500 shadow-inner`}>
          <Icon className={`w-5 h-5 sm:w-6 sm:h-6 ${colorClass.split(' ')[0]}`} />
        </div>
      </div>
      
      <div>
        <h2 className="text-2xl sm:text-3xl font-black dark:text-white text-slate-900 tracking-tight mb-2.5 truncate">{value}</h2>
        {trend && (
          <div className={`flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider ${trend === 'up' ? 'text-green-500' : 'text-red-500'}`}>
            {trend === 'up' ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
            <span>{trendValue} {TRANSLATIONS.analytics.metrics.vsLastPeriod}</span>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default MetricCard;
