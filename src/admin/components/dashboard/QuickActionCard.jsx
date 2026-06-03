import React from 'react';
import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';

const QuickActionCard = ({ icon: Icon, title, description, onClick, colorClass = "text-primary-500 bg-primary-500" }) => {
  return (
    <motion.button
      whileHover={{ y: -4, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="w-full text-left glass-card p-3.5 sm:p-5 rounded-2xl sm:rounded-3xl border dark:border-white/[0.08] border-slate-200/80 bg-white/60 dark:bg-[#111111]/80 backdrop-blur-2xl group hover:shadow-2xl hover:shadow-primary-500/10 transition-all"
    >
      <div className="flex items-center gap-3 sm:gap-5">
        <div className={`p-2.5 sm:p-4 rounded-xl sm:rounded-[24px] ${colorClass.split(' ')[1]} bg-opacity-10 dark:bg-opacity-20 ${colorClass.split(' ')[0]} group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300`}>
          <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-black text-sm sm:text-lg dark:text-white text-slate-900 mb-0.5 sm:mb-1 truncate">{title}</h4>
          <p className="text-xs sm:text-sm font-medium dark:text-slate-400 text-slate-500 line-clamp-1">{description}</p>
        </div>
        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border dark:border-white/[0.08] border-slate-200/80 flex items-center justify-center group-hover:bg-primary-500 group-hover:border-primary-500 group-hover:text-white transition-colors shrink-0">
          <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
        </div>
      </div>
    </motion.button>
  );
};

export default QuickActionCard;
