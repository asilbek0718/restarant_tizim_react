import React from 'react';
import { motion } from 'framer-motion';
import { Flame } from 'lucide-react';

const TopSellingFoods = ({ foods = [], title = "Eng ko'p sotilganlar" }) => {
  return (
    <div className="glass-card p-4 sm:p-6 rounded-2xl sm:rounded-3xl border dark:border-white/[0.08] border-slate-200/80 bg-white/60 dark:bg-[#111111]/80 backdrop-blur-2xl h-full flex flex-col">
      <div className="flex items-center gap-3 mb-4 sm:mb-6">
        <div className="p-1.5 sm:p-2 rounded-lg sm:rounded-[20px] bg-orange-500/10">
          <Flame className="w-4.5 h-4.5 sm:w-5 sm:h-5 text-orange-500" />
        </div>
        <h3 className="text-base sm:text-lg font-black dark:text-white text-slate-900">{title}</h3>
      </div>
      <div className="space-y-3 sm:space-y-4 flex-1">
        {foods.length === 0 ? (
          <div className="h-full min-h-[150px] flex items-center justify-center text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider text-xs">
            Sotuvlar yo'q
          </div>
        ) : (
          foods.map((food, index) => (
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              key={food.id || index} 
              className="flex items-center gap-3 sm:gap-4 p-2 sm:p-3 rounded-xl sm:rounded-[24px] hover:bg-slate-50 dark:hover:bg-white/5 transition-all border border-transparent hover:border-slate-100 dark:hover:border-white/10 group cursor-pointer hover:shadow-md"
            >
              <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-[20px] overflow-hidden bg-slate-100 dark:bg-white/10 shrink-0 relative">
                {food.image ? (
                  <img src={food.image} alt={food.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-xl font-bold tracking-tight dark:text-slate-500 text-slate-300">
                    {index + 1}
                  </div>
                )}
                {index < 3 && (
                  <div className="absolute top-0 right-0 bg-orange-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-bl-lg rounded-tr-lg">
                    #{index + 1}
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-xs sm:text-sm dark:text-white text-slate-900 truncate group-hover:text-primary-500 transition-colors">{food.name}</h4>
                <p className="text-[10px] sm:text-xs font-bold dark:text-slate-400 text-slate-500 mt-0.5 sm:mt-1">{food.category}</p>
              </div>
              <div className="text-right shrink-0">
                <div className="font-black text-xs sm:text-sm dark:text-white text-slate-900">{food.price} so'm</div>
                <div className="text-[9px] sm:text-[10px] font-black text-primary-500 mt-0.5 sm:mt-1 uppercase tracking-wider bg-primary-500/10 px-1.5 py-0.5 rounded-md inline-block">
                  {food.sales} ta
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};

export default TopSellingFoods;
