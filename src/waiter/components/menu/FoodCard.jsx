import React from 'react';
import { motion } from 'framer-motion';
import { Edit, Trash2, Plus, Clock, Flame } from 'lucide-react';

const FoodCard = ({ food, onEdit, onDelete, onAdd }) => {
  const hasDiscount = food.discountPrice && food.discountPrice > 0;
  
  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.01 }}
      className="glass-card rounded-[32px] border dark:border-white/[0.08] border-slate-200/80 bg-white/60 dark:bg-[#111111]/80 backdrop-blur-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all flex flex-col group h-full"
    >
      <div className="relative h-52 w-full overflow-hidden bg-slate-100 dark:bg-white/[0.04]">
        {food.image ? (
          <img src={food.image} alt={food.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000 ease-out" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-6xl opacity-20 group-hover:scale-110 transition-transform duration-1000">🍽️</div>
        )}
        
        {/* Status Overlay */}
        {(food.status === 'out_of_stock' || food.status === 'unavailable') && (
          <div className="absolute inset-0 bg-slate-900/40 dark:bg-black/60 backdrop-blur-[2px] flex items-center justify-center z-20">
            <span className="bg-red-500 text-white text-[10px] font-black px-4 py-2 rounded-xl uppercase tracking-widest shadow-xl border border-white/20">
              {food.status === 'out_of_stock' ? 'Tugagan' : 'Mavjud emas'}
            </span>
          </div>
        )}

        {food.status === 'hidden' && (
          <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-md flex items-center justify-center z-20">
            <span className="text-white/40 text-[10px] font-black uppercase tracking-widest">Yashirilgan</span>
          </div>
        )}

        {/* Floating Badges */}
        <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
          {hasDiscount && (
            <span className="px-3 py-1.5 bg-green-500 text-white text-[10px] font-black rounded-lg shadow-lg uppercase tracking-widest border border-white/20">Aksiya</span>
          )}
          {food.spicyLevel > 0 && (
            <span className="px-3 py-1.5 bg-orange-500/90 text-white text-[10px] font-black rounded-lg shadow-lg uppercase tracking-widest border border-white/20 flex items-center gap-1">
              {'🌶️'.repeat(food.spicyLevel)}
            </span>
          )}
        </div>

        <div className="absolute top-4 right-4 flex gap-2 lg:opacity-0 lg:group-hover:opacity-100 transition-all duration-300 transform lg:translate-x-4 lg:group-hover:translate-x-0 z-30">
          <button onClick={(e) => { e.stopPropagation(); onEdit && onEdit(food); }} className="p-2.5 rounded-xl bg-white/90 dark:bg-black/60 backdrop-blur-md text-slate-700 dark:text-white hover:text-amber-500 transition-all shadow-xl border border-white/20 active:scale-95">
            <Edit className="w-4 h-4" />
          </button>
          <button onClick={(e) => { e.stopPropagation(); onDelete && onDelete(food); }} className="p-2.5 rounded-xl bg-white/90 dark:bg-black/60 backdrop-blur-md text-slate-700 dark:text-white hover:text-red-500 transition-all shadow-xl border border-white/20 active:scale-95">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="p-6 flex-1 flex flex-col">
        <div className="flex justify-between items-start mb-4 gap-4">
          <div className="flex-1">
            <p className="text-[10px] font-black text-primary-500 uppercase tracking-widest mb-1.5 opacity-80">{food.category}</p>
            <h4 className="font-black text-xl dark:text-white text-slate-900 line-clamp-1 group-hover:text-primary-500 transition-colors leading-tight">{food.name}</h4>
          </div>
          <div className="text-right">
            {hasDiscount ? (
              <div className="flex flex-col items-end">
                <span className="text-[10px] font-bold text-slate-400 line-through mb-1">{Number(food.price).toLocaleString()} so'm</span>
                <span className="text-2xl font-black text-green-500 tracking-tight">{Number(food.discountPrice).toLocaleString()}</span>
              </div>
            ) : (
              <span className="text-2xl font-black dark:text-white text-slate-900 tracking-tight">{Number(food.price).toLocaleString()}</span>
            )}
          </div>
        </div>
        
        <p className="text-sm font-medium dark:text-slate-400 text-slate-500 line-clamp-2 mb-6 flex-1 leading-relaxed opacity-80">
          {food.description || 'Bu taom uchun batafsil tavsif mavjud emas.'}
        </p>

        <div className="flex items-center justify-between pt-5 border-t dark:border-white/[0.08] border-slate-100">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 text-slate-400">
              <Clock className="w-3.5 h-3.5" />
              <span className="text-[10px] font-black uppercase tracking-widest">{food.cookingTime || 15} daq</span>
            </div>
            {food.calories && (
              <div className="flex items-center gap-1.5 text-slate-400 border-l dark:border-white/10 border-slate-200 pl-4">
                <Flame className="w-3.5 h-3.5" />
                <span className="text-[10px] font-black uppercase tracking-widest">{food.calories} kkal</span>
              </div>
            )}
          </div>
          
          {onAdd && (
            <button 
              onClick={(e) => { e.stopPropagation(); onAdd(food); }} 
              disabled={food.status !== 'available'} 
              className="p-3 rounded-2xl bg-primary-500 hover:bg-primary-600 text-white transition-all disabled:opacity-20 disabled:grayscale shadow-lg shadow-primary-500/20 active:scale-95"
            >
              <Plus className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default FoodCard;
