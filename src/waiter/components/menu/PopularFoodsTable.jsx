import React from 'react';
import { motion } from 'framer-motion';

const PopularFoodsTable = ({ foods = [] }) => {
  return (
    <div className="glass-card rounded-[24px] sm:rounded-[32px] border dark:border-white/[0.08] border-slate-200/80 bg-white/60 dark:bg-[#111111]/80 backdrop-blur-2xl overflow-hidden shadow-md flex flex-col h-full">
      <div className="p-4 sm:p-6 border-b dark:border-white/5 border-slate-100 flex justify-between items-center bg-slate-50/50 dark:bg-white/[0.04]">
        <h3 className="text-lg sm:text-xl font-bold tracking-tight dark:text-white text-slate-900 tracking-tight">Eng mashhur taomlar</h3>
      </div>
      <div className="overflow-x-auto flex-1">
        <table className="w-full text-left border-collapse min-w-[400px] sm:min-w-[600px]">
          <thead>
            <tr className="bg-slate-50/30 dark:bg-white/[0.02]">
              <th className="p-3 sm:p-5 pl-4 sm:pl-8 text-[10px] sm:text-xs font-black dark:text-slate-400 text-slate-500 uppercase tracking-widest w-16 sm:w-24">O'rin</th>
              <th className="p-3 sm:p-5 text-[10px] sm:text-xs font-black dark:text-slate-400 text-slate-500 uppercase tracking-widest">Taom</th>
              <th className="p-3 sm:p-5 text-[10px] sm:text-xs font-black dark:text-slate-400 text-slate-500 uppercase tracking-widest hidden sm:table-cell">Kategoriya</th>
              <th className="p-3 sm:p-5 text-[10px] sm:text-xs font-black dark:text-slate-400 text-slate-500 uppercase tracking-widest">Narxi</th>
              <th className="p-3 sm:p-5 pr-4 sm:pr-8 text-[10px] sm:text-xs font-black dark:text-slate-400 text-slate-500 uppercase tracking-widest text-right">Sotuv</th>
            </tr>
          </thead>
          <tbody className="divide-y dark:divide-white/5 divide-slate-100/80">
            {foods.map((food, idx) => (
              <motion.tr 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                key={food.id || idx} 
                className="hover:bg-white dark:hover:bg-white/5 transition-colors group cursor-default"
              >
                <td className="p-3 sm:p-5 pl-4 sm:pl-8">
                  <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-black text-sm sm:text-lg border-2
                    ${idx === 0 ? 'bg-amber-400/20 text-amber-500 border-amber-400/30 shadow-lg shadow-amber-500/20' : 
                      idx === 1 ? 'bg-slate-300/20 text-slate-500 border-slate-300/30 shadow-lg shadow-slate-500/20 dark:text-slate-300' : 
                      idx === 2 ? 'bg-orange-600/20 text-orange-500 border-orange-600/30 shadow-lg shadow-orange-500/20' : 
                      'bg-slate-100 dark:bg-white/[0.04] dark:text-slate-400 text-slate-500 border-transparent'}`}
                  >
                    #{idx + 1}
                  </div>
                </td>
                <td className="p-3 sm:p-5">
                  <div className="flex items-center gap-2 sm:gap-4">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl overflow-hidden bg-slate-100 dark:bg-white/10 shrink-0 border border-slate-200/80 dark:border-white/[0.08] shadow-md">
                      {food.image && <img src={food.image} alt={food.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />}
                    </div>
                    <span className="text-xs sm:text-sm font-black dark:text-white text-slate-900 group-hover:text-primary-500 transition-colors truncate max-w-[100px] sm:max-w-none">{food.name}</span>
                  </div>
                </td>
                <td className="p-3 sm:p-5 text-[11px] sm:text-sm font-bold dark:text-slate-400 text-slate-600 hidden sm:table-cell">
                  <span className="bg-slate-100 dark:bg-white/10 px-3 py-1.5 rounded-full uppercase text-[9px] tracking-widest">{food.category}</span>
                </td>
                <td className="p-3 sm:p-5 text-xs sm:text-sm font-black dark:text-white text-slate-900">{food.price} so'm</td>
                <td className="p-3 sm:p-5 pr-4 sm:pr-8 text-right">
                  <span className="text-xs sm:text-sm font-black text-primary-500 bg-primary-500/10 px-3 py-1.5 rounded-full inline-block">{food.sales}</span>
                </td>
              </motion.tr>
            ))}
            {foods.length === 0 && (
              <tr>
                <td colSpan="5" className="p-20 text-center text-sm font-bold dark:text-slate-500 text-slate-400">
                  <div className="text-5xl mb-4 opacity-20">📊</div>
                  Mashhur taomlar ma'lumotlari mavjud emas.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PopularFoodsTable;
