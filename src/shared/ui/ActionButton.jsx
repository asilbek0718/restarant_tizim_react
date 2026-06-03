import React from 'react';
import { motion } from 'framer-motion';

const ActionButton = ({ onClick, icon: Icon, label, variant = 'primary', className = '', ...props }) => {
  const getVariantClasses = () => {
    switch (variant) {
      case 'primary':
        return 'bg-primary-500 hover:bg-primary-600 text-white shadow-[0_8px_30px_rgb(14,165,233,0.3)] hover:shadow-primary-500/50 hover:-translate-y-1 border border-transparent';
      case 'secondary':
        return 'bg-white/60 dark:bg-white/[0.04] hover:bg-slate-100 dark:hover:bg-white/10 text-slate-700 dark:text-white border dark:border-white/[0.08] border-slate-200/80 shadow-md hover:-translate-y-1';
      case 'danger':
        return 'bg-red-500 hover:bg-red-600 text-white shadow-xl shadow-red-500/30 hover:shadow-red-500/50 hover:-translate-y-1 border border-transparent';
      case 'ghost':
        return 'bg-transparent hover:bg-slate-100 dark:hover:bg-white/10 text-slate-600 dark:text-gray-300 border border-transparent';
      default:
        return 'bg-primary-500 hover:bg-primary-600 text-white';
    }
  };

  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={`px-6 py-4 rounded-[24px] font-black text-sm transition-all flex items-center justify-center gap-3 uppercase tracking-widest backdrop-blur-2xl ${getVariantClasses()} ${className}`}
      {...props}
    >
      {Icon && <Icon className="w-5 h-5" />}
      {label && <span>{label}</span>}
    </motion.button>
  );
};

export default ActionButton;
