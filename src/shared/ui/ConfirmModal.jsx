import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Info, CheckCircle2, XCircle } from 'lucide-react';

const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message, type = 'warning', confirmText = 'Confirm', cancelText = 'Cancel' }) => {
  const getIcon = () => {
    switch (type) {
      case 'warning': return <AlertTriangle className="w-6 h-6 sm:w-8 sm:h-8 text-amber-500" />;
      case 'danger': return <XCircle className="w-6 h-6 sm:w-8 sm:h-8 text-red-500" />;
      case 'success': return <CheckCircle2 className="w-6 h-6 sm:w-8 sm:h-8 text-green-500" />;
      case 'info': default: return <Info className="w-6 h-6 sm:w-8 sm:h-8 text-blue-500" />;
    }
  };

  const getButtonClass = () => {
    switch (type) {
      case 'danger': return 'bg-red-500 hover:bg-red-600 shadow-red-500/30';
      case 'success': return 'bg-green-500 hover:bg-green-600 shadow-green-500/30';
      case 'warning': return 'bg-amber-500 hover:bg-amber-600 shadow-amber-500/30';
      case 'info': default: return 'bg-blue-500 hover:bg-blue-600 shadow-blue-500/30';
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 z-[110] bg-slate-900/60 dark:bg-black/80 backdrop-blur-md" />
          <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} transition={{ type: "spring", damping: 25, stiffness: 300 }} className="fixed inset-0 z-[110] flex items-center justify-center p-4 pointer-events-none">
            <div className="bg-white dark:bg-[#121212] w-full max-w-sm sm:max-w-md rounded-2xl sm:rounded-[32px] shadow-2xl border dark:border-white/[0.08] border-slate-200/80 flex flex-col pointer-events-auto overflow-hidden p-5 sm:p-8 text-center">
              <div className="w-14 h-14 sm:w-20 sm:h-20 rounded-xl sm:rounded-[1.5rem] mx-auto flex items-center justify-center mb-4 sm:mb-6 bg-slate-50 dark:bg-white/[0.04] border dark:border-white/5 border-slate-100 shadow-md">
                {getIcon()}
              </div>
              <h2 className="text-lg sm:text-3xl font-extrabold tracking-tight dark:text-white text-slate-900 mb-1.5 sm:mb-3">{title}</h2>
              <p className="text-xs sm:text-sm font-bold dark:text-slate-400 text-slate-500 mb-5 sm:mb-8 px-2 sm:px-4 leading-relaxed">{message}</p>
              
              <div className="flex flex-col-reverse sm:flex-row gap-2.5 sm:gap-3">
                <button onClick={onClose} className="flex-1 py-2.5 sm:py-4 rounded-xl sm:rounded-[24px] border-2 dark:border-white/[0.08] border-slate-200/80 font-black text-xs sm:text-sm dark:text-white text-slate-700 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors uppercase tracking-widest">
                  {cancelText}
                </button>
                <button onClick={() => { onConfirm(); onClose(); }} className={`flex-1 py-2.5 sm:py-4 rounded-xl sm:rounded-[24px] text-white font-black text-xs sm:text-sm transition-all shadow-xl hover:-translate-y-1 hover:shadow-lg uppercase tracking-widest ${getButtonClass()}`}>
                  {confirmText}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ConfirmModal;
