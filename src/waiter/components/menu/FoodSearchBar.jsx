import React from 'react';
import { Search, Plus, SlidersHorizontal } from 'lucide-react';

const FoodSearchBar = ({ 
  searchQuery, 
  onSearchChange, 
  onAddFood, 
  onToggleFilters,
  sortOrder,
  onSortChange,
  statusFilter,
  onStatusFilterChange
}) => {
  return (
    <div className="flex flex-col xl:flex-row gap-6">
      <div className="relative flex-1 group">
        <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-primary-500 transition-colors" />
        <input 
          type="text" 
          value={searchQuery}
          onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
          placeholder="Taom nomi yoki tavsifi bo'yicha qidirish..." 
          className="w-full pl-14 pr-6 py-5 bg-white/60 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.08] focus:border-primary-500/50 focus:bg-white dark:focus:bg-[#1a1a1a] rounded-[24px] text-sm font-bold outline-none transition-all dark:text-white placeholder:font-medium placeholder:text-slate-400 shadow-sm"
        />
      </div>
      
      <div className="flex flex-wrap gap-2 sm:gap-4 items-center">
        {/* Status Filter */}
        <select 
          value={statusFilter}
          onChange={(e) => onStatusFilterChange(e.target.value)}
          className="px-4 py-3 sm:px-6 sm:py-5 rounded-[24px] border dark:border-white/[0.08] border-slate-200 bg-white/60 dark:bg-white/[0.04] text-xs font-black uppercase tracking-widest outline-none cursor-pointer dark:text-white"
        >
          <option value="all">Barcha holatlar</option>
          <option value="available">Sotuvda bor</option>
          <option value="out_of_stock">Tugagan</option>
          <option value="hidden">Yashirilgan</option>
        </select>
 
        {/* Sort Order */}
        <select 
          value={sortOrder}
          onChange={(e) => onSortChange(e.target.value)}
          className="px-4 py-3 sm:px-6 sm:py-5 rounded-[24px] border dark:border-white/[0.08] border-slate-200 bg-white/60 dark:bg-white/[0.04] text-xs font-black uppercase tracking-widest outline-none cursor-pointer dark:text-white"
        >
          <option value="newest">Yangi qo'shilganlar</option>
          <option value="price_asc">Arzonroq</option>
          <option value="price_desc">Qimmatroq</option>
          <option value="name">Alifbo bo'yicha</option>
        </select>
 
        <div className="flex gap-2 sm:gap-4 flex-1 sm:flex-none">
          <button 
            onClick={onToggleFilters}
            className="px-4 py-3 sm:px-6 sm:py-5 rounded-[24px] border dark:border-white/[0.08] border-slate-200 bg-white/60 dark:bg-white/[0.04] hover:bg-slate-100 dark:hover:bg-white/10 transition-colors flex items-center justify-center text-slate-700 dark:text-white group flex-1 sm:flex-none"
          >
            <SlidersHorizontal className="w-5 h-5 group-hover:text-primary-500 transition-colors" />
          </button>
          
          {onAddFood && (
            <button 
              onClick={onAddFood}
              className="px-6 py-3 sm:px-8 sm:py-5 rounded-[24px] bg-primary-500 hover:bg-primary-600 text-white font-black text-[10px] transition-all shadow-[0_8px_30px_rgb(14,165,233,0.3)] hover:-translate-y-1 flex items-center justify-center gap-2 sm:gap-3 uppercase tracking-widest whitespace-nowrap flex-[2] sm:flex-none"
            >
              <Plus className="w-4 h-4 sm:w-5 sm:h-5" /> Yangi qo'shish
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default FoodSearchBar;
