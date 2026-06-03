import React from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

const StatCard = ({ icon: Icon, label, value, trend, trendValue, colorClass = "text-primary-500 bg-primary-500" }) => (
  <motion.div
    whileHover={{ y: -4 }}
    className="glass-card p-5 rounded-2xl border dark:border-white/[0.08] border-slate-200/80 bg-white/60 dark:bg-[#111111]/80 backdrop-blur-2xl flex flex-col justify-between h-full"
  >
    <div>
      <div className="flex justify-between items-center mb-4">
        <div className={`p-2.5 rounded-xl ${colorClass.split(' ')[1]} bg-opacity-10 dark:bg-opacity-20`}>
          <Icon className={`w-5 h-5 ${colorClass.split(' ')[0]}`} />
        </div>
        {trend && (
          <span className={`flex items-center justify-center p-1.5 rounded-lg ${trend === 'up' ? 'text-green-500 bg-green-500/10' : 'text-red-500 bg-red-500/10'}`}>
            {trend === 'up' ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
          </span>
        )}
      </div>
      <p className="text-[10px] font-black uppercase tracking-[2px] dark:text-slate-400 text-slate-500 mb-1">{label}</p>
      <h3 className="text-2xl font-black tracking-tight dark:text-white text-slate-900 leading-none mb-3">{value}</h3>
    </div>
    {trendValue && (
      <div className="text-[11px] font-bold text-slate-400 dark:text-slate-500 mt-1 border-t border-slate-100 dark:border-white/5 pt-2">
        {trendValue}
      </div>
    )}
  </motion.div>
);

export default StatCard;
