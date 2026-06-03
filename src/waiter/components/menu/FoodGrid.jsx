import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import FoodCard from './FoodCard';

const FoodGrid = ({ foods = [], onEdit, onDelete, onAdd }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-5 xl:gap-6">
      <AnimatePresence>
        {foods.map((food, index) => (
          <motion.div
            key={food.id}
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -20 }}
            transition={{ duration: 0.4, type: "spring", bounce: 0.3, delay: index * 0.05 }}
          >
            <FoodCard food={food} onEdit={onEdit} onDelete={onDelete} onAdd={onAdd} />
          </motion.div>
        ))}
      </AnimatePresence>
      {foods.length === 0 && (
        <div className="col-span-full py-32 flex flex-col items-center justify-center text-center bg-slate-50/80 dark:bg-white/[0.04] rounded-[32px] border-2 border-dashed dark:border-white/[0.08] border-slate-200/80">
          <div className="w-24 h-24 bg-white dark:bg-black/20 rounded-full flex items-center justify-center mb-6 shadow-md border dark:border-white/5 border-slate-100">
            <span className="text-5xl">🍕</span>
          </div>
          <h3 className="text-3xl font-extrabold tracking-tight dark:text-white text-slate-900 mb-3 tracking-tight">Taomlar topilmadi</h3>
          <p className="font-bold text-lg dark:text-slate-400 text-slate-500 max-w-md">Filtrlarni o'zgartiring yoki menyuga yangi taom qo'shing.</p>
        </div>
      )}
    </div>
  );
};

export default FoodGrid;
