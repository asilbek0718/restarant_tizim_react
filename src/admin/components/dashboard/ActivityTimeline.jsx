import React from 'react';
import { motion } from 'framer-motion';

const ActivityTimeline = ({ activities = [], title = "So'nggi faollik" }) => {
  return (
    <div className="glass-card p-4 sm:p-6 rounded-2xl sm:rounded-3xl border dark:border-white/[0.08] border-slate-200/80 bg-white/60 dark:bg-[#111111]/80 backdrop-blur-2xl h-full">
      <h3 className="text-base sm:text-lg font-black dark:text-white text-slate-900 mb-6">{title}</h3>
      <div className="space-y-4 sm:space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-[2px] before:bg-gradient-to-b before:from-transparent before:via-slate-200 dark:before:via-white/10 before:to-transparent">
        {activities.map((activity, index) => (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            key={activity.id || index} 
            className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active"
          >
            <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full border-[3px] border-white dark:border-[#0f0f0f] bg-primary-500 text-white shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-lg z-10 group-hover:scale-110 transition-transform">
              {activity.icon || '📝'}
            </div>
            <div className="w-[calc(100%-3rem)] md:w-[calc(50%-2.5rem)] p-3 sm:p-4 rounded-2xl sm:rounded-[24px] border dark:border-white/5 border-slate-100 bg-white dark:bg-white/[0.04] shadow-md hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between space-x-2 mb-1.5 sm:mb-2">
                <div className="font-black dark:text-white text-slate-900 text-xs sm:text-sm">{activity.title}</div>
                <time className="font-bold text-[10px] sm:text-xs text-primary-500 bg-primary-500/10 px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-md">{activity.time}</time>
              </div>
              <div className="text-xs sm:text-sm font-medium dark:text-slate-400 text-slate-600 leading-relaxed">{activity.description}</div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default ActivityTimeline;
