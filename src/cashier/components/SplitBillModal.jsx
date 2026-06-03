import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, Split, ChevronRight, ChevronLeft } from 'lucide-react';
import { financeUtils } from '@/shared/utils/finances';
import { TRANSLATIONS } from '@/shared/constants/translations';

const SplitBillModal = ({ isOpen, onClose, order, onSplitComplete }) => {
  const [splitItems, setSplitItems] = useState([]);
  const [remainingItems, setRemainingItems] = useState([]);
  const t = TRANSLATIONS.cashier;
  const common = TRANSLATIONS.common;

  useEffect(() => {
    if (order?.items) {
      setRemainingItems([...order.items]);
      setSplitItems([]);
    }
  }, [order, isOpen]);

  if (!order || !isOpen) return null;

  const handleMoveToSplit = (itemIndex) => {
    const item = remainingItems[itemIndex];
    if (item.quantity > 1) {
       const newRemaining = [...remainingItems];
       newRemaining[itemIndex] = { ...item, quantity: item.quantity - 1 };
       setRemainingItems(newRemaining);
       
       const existingInSplit = splitItems.findIndex(si => si.id === item.id);
       if (existingInSplit > -1) {
         const newSplit = [...splitItems];
         newSplit[existingInSplit].quantity += 1;
         setSplitItems(newSplit);
       } else {
         setSplitItems([...splitItems, { ...item, quantity: 1 }]);
       }
    } else {
       setSplitItems([...splitItems, item]);
       setRemainingItems(remainingItems.filter((_, i) => i !== itemIndex));
    }
  };

  const handleMoveBack = (itemIndex) => {
    const item = splitItems[itemIndex];
    if (item.quantity > 1) {
       const newSplit = [...splitItems];
       newSplit[itemIndex] = { ...item, quantity: item.quantity - 1 };
       setSplitItems(newSplit);

       const existingInRemaining = remainingItems.findIndex(ri => ri.id === item.id);
       if (existingInRemaining > -1) {
         const newRemaining = [...remainingItems];
         newRemaining[existingInRemaining].quantity += 1;
         setRemainingItems(newRemaining);
       } else {
         setRemainingItems([...remainingItems, { ...item, quantity: 1 }]);
       }
    } else {
       setRemainingItems([...remainingItems, item]);
       setSplitItems(splitItems.filter((_, i) => i !== itemIndex));
    }
  };

  const calculateTotal = (items) => {
    return items.reduce((sum, i) => sum + (i.price * i.quantity), 0);
  };

  const handleConfirmSplit = () => {
    const splitTotal = calculateTotal(splitItems);
    if (splitTotal === 0) return;
    onSplitComplete(splitItems, splitTotal);
  };

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[120] bg-black/90 backdrop-blur-xl flex items-center justify-center p-4 sm:p-6"
      >
        <motion.div 
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          className="bg-white dark:bg-[#0a0a0a] w-full max-w-5xl rounded-[40px] overflow-hidden flex flex-col max-h-[90vh] border dark:border-white/10 shadow-2xl"
        >
          <div className="p-4 sm:p-8 border-b dark:border-white/5 flex justify-between items-center bg-slate-50/50 dark:bg-white/[0.02]">
            <div>
              <h3 className="text-lg sm:text-2xl font-black dark:text-white tracking-tight">{t.split}</h3>
              <p className="text-[9px] sm:text-[10px] font-black text-slate-500 uppercase tracking-[2px] mt-1 sm:mt-1.5">{common.table} #{order.tableNumber} • {t.receipt.order} #{order.id}</p>
            </div>
            <button onClick={onClose} className="p-2 sm:p-3 rounded-xl sm:rounded-2xl hover:bg-slate-100 dark:hover:bg-white/5 transition-all">
              <X className="w-5 h-5 sm:w-6 sm:h-6 dark:text-slate-400" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto lg:overflow-hidden grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x dark:divide-white/5">
            {/* Left: Original Bill */}
            <div className="p-4 sm:p-8 flex flex-col h-auto lg:h-full bg-white dark:bg-transparent">
              <div className="flex items-center justify-between mb-4 sm:mb-8">
                <h4 className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-[3px]">Asosiy hisob</h4>
                <span className="px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full bg-slate-100 dark:bg-white/5 text-[9px] sm:text-[10px] font-black text-slate-500">{remainingItems.length} {common.items}</span>
              </div>
              <div className="flex-1 overflow-y-auto space-y-2.5 sm:space-y-3 pr-1 sm:pr-2 no-scrollbar max-h-[30vh] lg:max-h-none">
                {remainingItems.map((item, idx) => (
                  <button 
                    key={item.id || `remaining-${idx}-${item.name}`}
                    onClick={() => handleMoveToSplit(idx)}
                    className="w-full p-3 sm:p-4 rounded-2xl sm:rounded-3xl bg-slate-50 dark:bg-white/[0.03] border-2 border-transparent hover:border-primary-500/30 flex justify-between items-center transition-all group relative overflow-hidden"
                  >
                    <div className="flex items-center gap-3 sm:gap-4">
                       <span className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-white dark:bg-white/5 flex items-center justify-center font-black text-[10px] sm:text-xs shadow-sm text-primary-500">x{item.quantity}</span>
                       <span className="font-bold dark:text-white text-xs sm:text-sm text-left">{item.name}</span>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-3">
                      <span className="font-black text-slate-900 dark:text-white text-xs sm:text-sm">{financeUtils.formatCurrency(item.price * item.quantity)}</span>
                      <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-300 group-hover:translate-x-1 transition-all" />
                    </div>
                  </button>
                ))}
              </div>
              <div className="pt-4 sm:pt-8 border-t dark:border-white/5 mt-4 sm:mt-8">
                 <div className="flex justify-between items-center">
                    <span className="text-[10px] sm:text-xs font-black text-slate-400 uppercase tracking-widest">{common.total}</span>
                    <span className="text-xl sm:text-2xl font-black dark:text-white tabular-nums">{financeUtils.formatCurrency(calculateTotal(remainingItems))}</span>
                 </div>
              </div>
            </div>

            {/* Right: New Split Bill */}
            <div className="p-4 sm:p-8 bg-primary-500/[0.02] flex flex-col h-auto lg:h-full">
              <div className="flex items-center justify-between mb-4 sm:mb-8">
                <h4 className="text-[9px] sm:text-[10px] font-black text-primary-500 uppercase tracking-[3px]">Yangi hisob</h4>
                <span className="px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full bg-primary-500 text-white text-[9px] sm:text-[10px] font-black">{splitItems.length} {common.items}</span>
              </div>
              <div className="flex-1 overflow-y-auto space-y-2.5 sm:space-y-3 pr-1 sm:pr-2 no-scrollbar max-h-[30vh] lg:max-h-none">
                {splitItems.map((item, idx) => (
                  <button 
                    key={item.id || `split-${idx}-${item.name}`}
                    onClick={() => handleMoveBack(idx)}
                    className="w-full p-3 sm:p-4 rounded-2xl sm:rounded-3xl bg-white dark:bg-white/5 border-2 border-primary-500/20 flex justify-between items-center hover:border-red-500/30 transition-all group"
                  >
                    <div className="flex items-center gap-3 sm:gap-4">
                       <span className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-primary-500 text-white flex items-center justify-center font-black text-[10px] sm:text-xs shadow-lg shadow-primary-500/20">x{item.quantity}</span>
                       <span className="font-bold dark:text-white text-xs sm:text-sm text-left">{item.name}</span>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-3">
                      <ChevronLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary-300 group-hover:-translate-x-1 transition-all" />
                      <span className="font-black text-primary-500 text-xs sm:text-sm">{financeUtils.formatCurrency(item.price * item.quantity)}</span>
                    </div>
                  </button>
                ))}
                {splitItems.length === 0 && (
                   <div className="h-full flex flex-col items-center justify-center opacity-20 py-10 sm:py-20 text-center">
                      <div className="w-14 h-14 sm:w-20 sm:h-20 rounded-[24px] sm:rounded-[40px] bg-slate-200 dark:bg-white/5 flex items-center justify-center mb-4 sm:mb-6">
                        <Split className="w-7 h-7 sm:w-10 sm:h-10 text-slate-500" />
                      </div>
                      <p className="text-[10px] sm:text-xs font-black uppercase tracking-[2px]">Bu yerga ko'chiring</p>
                   </div>
                )}
              </div>
              <div className="pt-4 sm:pt-8 border-t border-primary-500/20 mt-4 sm:mt-8">
                 <div className="flex justify-between items-center mb-4 sm:mb-8">
                    <span className="text-[10px] sm:text-xs font-black text-primary-500 uppercase tracking-widest">Summa</span>
                    <span className="text-2xl sm:text-4xl font-black text-primary-500 tabular-nums">{financeUtils.formatCurrency(calculateTotal(splitItems))}</span>
                 </div>
                 <button 
                  disabled={splitItems.length === 0}
                  onClick={handleConfirmSplit}
                  className="w-full py-3.5 sm:py-5 rounded-2xl sm:rounded-[28px] bg-primary-500 text-white font-black uppercase tracking-[2px] text-[10px] sm:text-xs shadow-2xl shadow-primary-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-3"
                 >
                   <CheckCircle className="w-5 h-5" /> {t.processPayment}
                 </button>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default SplitBillModal;
