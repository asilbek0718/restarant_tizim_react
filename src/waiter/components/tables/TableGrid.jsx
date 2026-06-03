import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import TableCard from './TableCard';

const TableGrid = ({ tables = [], onTableClick, onSecondaryAction, selectedIds = [], onSplit }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
      <AnimatePresence>
        {tables.map((table, index) => (
          <motion.div
            key={table.id || table.number}
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -20 }}
            transition={{ duration: 0.3, type: "spring", bounce: 0.4, delay: index * 0.05 }}
          >
            <TableCard 
              table={table} 
              onClick={onTableClick} 
              onEdit={onSecondaryAction} 
              isSelected={selectedIds.includes(table.id)}
              onSplit={onSplit}
            />
          </motion.div>
        ))}
      </AnimatePresence>
      {tables.length === 0 && (
        <div className="col-span-full py-32 flex flex-col items-center justify-center text-center bg-slate-50/50 dark:bg-white/[0.04] rounded-[32px] border-2 border-dashed dark:border-white/[0.08] border-slate-200/80">
          <div className="w-24 h-24 bg-white dark:bg-black/20 rounded-full flex items-center justify-center mb-6 shadow-md border dark:border-white/5 border-slate-100">
            <span className="text-5xl">🪑</span>
          </div>
          <h3 className="text-3xl font-extrabold tracking-tight dark:text-white text-slate-900 mb-3 tracking-tight">Stollar topilmadi</h3>
          <p className="font-bold text-lg dark:text-slate-400 text-slate-500 max-w-md">Filtrlarni o'zgartirib ko'ring yoki restoraningizga yangi stollar qo'shing.</p>
        </div>
      )}
    </div>
  );
};

export default TableGrid;
