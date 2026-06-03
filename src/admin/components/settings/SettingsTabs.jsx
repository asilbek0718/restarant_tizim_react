import React from 'react';
import { motion } from 'framer-motion';

const SettingsTabs = ({ tabs = [], activeTab, onTabChange }) => {
  return (
    <div className="overflow-x-auto no-scrollbar mb-10">
      <div className="flex gap-1.5 p-1.5 bg-slate-50/50 dark:bg-[#0a0a0a]/80 border dark:border-white/[0.06] border-slate-200/60 rounded-[28px] backdrop-blur-2xl shadow-sm min-w-max">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange && onTabChange(tab.id)}
              className={`relative px-5 py-3 rounded-[22px] text-[10px] font-black uppercase tracking-[0.15em] whitespace-nowrap transition-all flex items-center gap-2 ${
                isActive 
                  ? 'text-white' 
                  : 'text-slate-500 dark:text-slate-400 hover:bg-white dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="activeSettingsTab"
                  className="absolute inset-0 bg-primary-500 rounded-[22px] -z-10 shadow-[0_8px_30px_rgb(14,165,233,0.25)]"
                  initial={false}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                />
              )}
              <span className="relative z-10 flex items-center gap-2">
                {tab.icon && <tab.icon className="w-4 h-4 opacity-80" />}
                <span>{tab.label}</span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default SettingsTabs;
