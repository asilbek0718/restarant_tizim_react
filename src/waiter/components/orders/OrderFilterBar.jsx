import React from 'react';
import { Search, Filter, Calendar, MapPin, User } from 'lucide-react';
import { ORDER_STATUS } from '@/shared/constants/statuses';

const OrderFilterBar = ({ searchQuery, onSearchChange, statusFilter, onStatusChange, dateFilter, onDateChange }) => {
  return (
    <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-4 p-3 sm:p-4 rounded-2xl sm:rounded-[28px] border dark:border-white/[0.08] border-slate-200/80 bg-white/60 dark:bg-[#111111]/80 backdrop-blur-2xl mb-8 shadow-xl">
      {/* Search Input */}
      <div className="relative flex-1 group min-w-0 sm:min-w-[280px]">
        <Search className="absolute left-4 sm:left-5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 sm:w-5 sm:h-5 text-slate-400 group-focus-within:text-primary-500 transition-all duration-300" />
        <input 
          type="text" 
          value={searchQuery}
          onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
          placeholder="Buyurtma ID, Mijoz, Stol..." 
          className="w-full h-11 sm:h-14 pl-11 sm:pl-14 pr-4 sm:pr-6 bg-slate-100/80 dark:bg-white/[0.03] border-2 border-transparent focus:border-primary-500/30 focus:bg-white dark:focus:bg-[#161616] rounded-xl sm:rounded-[20px] text-xs sm:text-sm font-bold outline-none transition-all duration-300 dark:text-white placeholder:text-slate-400 shadow-inner"
        />
      </div>
      
      <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center">
        {/* Status Filter */}
        <div className="relative flex-1 min-w-0 sm:min-w-[150px] group">
          <Filter className="absolute left-4 sm:left-5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-400 group-focus-within:text-primary-500 transition-colors pointer-events-none" />
          <select 
            value={statusFilter}
            onChange={(e) => onStatusChange && onStatusChange(e.target.value)}
            className="w-full h-11 sm:h-14 pl-10 sm:pl-12 pr-10 sm:pr-12 bg-slate-100/80 dark:bg-white/[0.03] border-2 border-transparent focus:border-primary-500/30 focus:bg-white dark:focus:bg-[#161616] rounded-xl sm:rounded-[20px] text-[11px] sm:text-sm font-black outline-none transition-all duration-300 dark:text-white appearance-none cursor-pointer shadow-inner uppercase tracking-wider"
          >
            <option value="all">Barcha holatlar</option>
            <option value={ORDER_STATUS.PENDING}>Yangi</option>
            <option value={ORDER_STATUS.PREPARING}>Tayyorlanmoqda</option>
            <option value={ORDER_STATUS.READY}>Tayyor</option>
            <option value={ORDER_STATUS.DELIVERED}>Yetkazilgan</option>
            <option value={ORDER_STATUS.PAID}>To'langan</option>
            <option value={ORDER_STATUS.COMPLETED}>Yakunlangan</option>
            <option value={ORDER_STATUS.CANCELLED}>Bekor qilingan</option>
          </select>
          <div className="absolute right-4 sm:right-5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 group-hover:text-primary-500 transition-colors">
            <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </div>

        {/* Date Filter Shortcut */}
        <div className="flex overflow-x-auto bg-slate-100/80 dark:bg-white/[0.03] p-1 sm:p-1.5 rounded-xl sm:rounded-[20px] shadow-inner h-11 sm:h-14 items-center max-w-full scrollbar-none flex-1">
           {['today', 'week', 'month', 'all'].map((period) => (
             <button
               key={period}
               onClick={() => onDateChange(period)}
               className={`h-full px-3 sm:px-5 rounded-lg sm:rounded-[16px] text-[9px] sm:text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                 dateFilter === period 
                  ? 'bg-white dark:bg-white/10 text-primary-500 shadow-md' 
                  : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
               }`}
             >
               {period === 'today' ? 'Bugun' : period === 'week' ? 'Hafta' : period === 'month' ? 'Oy' : 'Hammasi'}
             </button>
           ))}
        </div>
      </div>
    </div>
  );
};
export default OrderFilterBar;
