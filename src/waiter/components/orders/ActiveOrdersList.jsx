import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import OrderCard from './OrderCard';

const ActiveOrdersList = ({ orders = [], onOrderClick }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6">
      <AnimatePresence>
        {orders.map((order, index) => (
          <motion.div
            key={order.id}
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -20 }}
            transition={{ duration: 0.3, type: "spring", bounce: 0.4, delay: index * 0.05 }}
          >
            <OrderCard order={order} onClick={onOrderClick} />
          </motion.div>
        ))}
      </AnimatePresence>
      {orders.length === 0 && (
        <div className="col-span-full py-24 flex flex-col items-center justify-center text-center bg-slate-50/50 dark:bg-white/[0.04] rounded-3xl border border-dashed dark:border-white/[0.08] border-slate-200/80">
          <div className="w-24 h-24 bg-white dark:bg-black/20 rounded-full flex items-center justify-center mb-6 shadow-md border dark:border-white/5 border-slate-100">
            <span className="text-4xl">📭</span>
          </div>
          <h3 className="text-3xl font-extrabold tracking-tight dark:text-white text-slate-900 mb-3 tracking-tight">Faol buyurtmalar yo'q</h3>
          <p className="font-bold dark:text-slate-400 text-slate-500 max-w-md">Barcha buyurtmalar tugatilgan yoki hozircha yangi buyurtmalar yo'q. Biroz dam olish vaqti!</p>
        </div>
      )}
    </div>
  );
};

export default ActiveOrdersList;
