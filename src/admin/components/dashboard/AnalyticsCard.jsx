import React from 'react';
import { motion } from 'framer-motion';

const AnalyticsCard = ({ title, value, subtitle, chartData = [], color = "primary" }) => {
  const getGradient = () => {
    switch(color) {
      case 'primary': return 'from-primary-500/30 to-primary-500/0';
      case 'green': return 'from-green-500/30 to-green-500/0';
      case 'purple': return 'from-purple-500/30 to-purple-500/0';
      case 'orange': return 'from-orange-500/30 to-orange-500/0';
      default: return 'from-primary-500/30 to-primary-500/0';
    }
  };

  const getLineColor = () => {
    switch(color) {
      case 'primary': return 'stroke-primary-500';
      case 'green': return 'stroke-green-500';
      case 'purple': return 'stroke-purple-500';
      case 'orange': return 'stroke-orange-500';
      default: return 'stroke-primary-500';
    }
  };

  const min = Math.min(...chartData, 0) || 0;
  const max = Math.max(...chartData, 100) || 100;
  const range = max - min || 1;
  const points = chartData.map((val, i) => {
    const x = (i / (chartData.length - 1 || 1)) * 100;
    const y = 100 - ((val - min) / range) * 100;
    return `${x},${y}`;
  }).join(' ');

  return (
    <motion.div 
      whileHover={{ y: -4 }}
      className="glass-card p-6 rounded-3xl border dark:border-white/[0.08] border-slate-200/80 bg-white/60 dark:bg-[#111111]/80 backdrop-blur-2xl flex flex-col justify-between overflow-hidden relative group"
    >
      <div className="relative z-10 mb-8">
        <h4 className="text-xs font-black uppercase tracking-widest dark:text-slate-400 text-slate-500 mb-2">{title}</h4>
        <h2 className="text-4xl font-black dark:text-white text-slate-900 tracking-tight">{value}</h2>
        {subtitle && <p className="text-xs font-bold mt-2 text-slate-500 dark:text-slate-400">{subtitle}</p>}
      </div>
      
      <div className="h-24 w-full -mx-6 -mb-6 relative z-0 opacity-80 group-hover:opacity-100 transition-opacity">
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full absolute inset-0 drop-shadow-xl">
          <defs>
            <linearGradient id={`gradient-${color}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" className={getGradient().split(' ')[0].replace('from-', 'text-')} stopOpacity="0.4" stopColor="currentColor" />
              <stop offset="100%" className={getGradient().split(' ')[1].replace('to-', 'text-')} stopOpacity="0" stopColor="currentColor" />
            </linearGradient>
          </defs>
          <polyline
            points={`0,100 ${points} 100,100`}
            fill={`url(#gradient-${color})`}
            className="transition-all duration-1000 ease-out"
          />
          <polyline
            points={points}
            fill="none"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={`${getLineColor()} transition-all duration-1000 ease-out drop-shadow-md`}
          />
        </svg>
      </div>
    </motion.div>
  );
};

export default AnalyticsCard;
