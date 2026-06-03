import React from 'react';

const StatusBadge = ({ status, type = 'default' }) => {
  const getBadgeConfig = () => {
    switch (type) {
      case 'success':
        return 'bg-green-500/10 text-green-600 border-green-500/20 dark:text-green-400';
      case 'danger':
        return 'bg-red-500/10 text-red-600 border-red-500/20 dark:text-red-400';
      case 'warning':
        return 'bg-amber-500/10 text-amber-600 border-amber-500/20 dark:text-amber-400';
      case 'info':
        return 'bg-blue-500/10 text-blue-600 border-blue-500/20 dark:text-blue-400';
      case 'primary':
        return 'bg-primary-500/10 text-primary-600 border-primary-500/20 dark:text-primary-400';
      default:
        return 'bg-slate-500/10 text-slate-600 border-slate-500/20 dark:text-gray-300';
    }
  };

  return (
    <span className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest border whitespace-nowrap inline-flex items-center justify-center ${getBadgeConfig()}`}>
      {status}
    </span>
  );
};

export default StatusBadge;
