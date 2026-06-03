import React from 'react';
import { Search, Filter, MapPin } from 'lucide-react';

/**
 * Redesigned Enterprise Table Filter Bar
 * Improved spacing, consistency, and visual hierarchy.
 */
const TableFilterBar = ({ onSearch, statusFilter, onStatusChange, zoneFilter, onZoneChange }) => {
  return (
    <div className="flex flex-col xl:flex-row gap-6">
      {/* Search Input */}
      <div className="relative flex-1 group">
        <Search className="absolute left-4 sm:left-6 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-slate-400 group-focus-within:text-primary-500 transition-colors pointer-events-none" />
        <input 
          type="text" 
          onChange={(e) => onSearch && onSearch(e.target.value)}
          placeholder="Stol raqami bo'yicha qidirish..." 
          className="w-full pl-11 sm:pl-14 pr-4 sm:pr-6 py-2.5 sm:py-4 bg-white/40 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.05] focus:border-primary-500/50 focus:bg-white dark:focus:bg-[#1a1a1a] rounded-xl sm:rounded-[24px] text-sm sm:text-base font-bold outline-none transition-all dark:text-white placeholder:font-medium placeholder:text-slate-400 shadow-sm backdrop-blur-2xl"
        />
      </div>
      
      {/* Filters Container */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Status Filter */}
        <div className="relative flex-1 sm:flex-none sm:min-w-[200px] group">
          <Filter className="absolute left-4 sm:left-5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-400 group-focus-within:text-primary-500 transition-colors pointer-events-none" />
          <select 
            value={statusFilter}
            onChange={(e) => onStatusChange && onStatusChange(e.target.value)}
            className="w-full pl-10 sm:pl-12 pr-8 sm:pr-10 py-2.5 sm:py-4 bg-white/40 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.05] focus:border-primary-500/50 focus:bg-white dark:focus:bg-[#1a1a1a] rounded-xl sm:rounded-[24px] text-xs sm:text-sm font-bold outline-none transition-all dark:text-white appearance-none cursor-pointer shadow-sm backdrop-blur-2xl"
          >
            <option value="all">Barcha holatlar</option>
            <option value="empty">Bo'sh</option>
            <option value="occupied">Band</option>
            <option value="reserved">Bron qilingan</option>
            <option value="cleaning">Tozalanmoqda</option>
            <option value="waiting_payment">To'lov kutilmoqda</option>
          </select>
          <div className="absolute right-4 sm:right-5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
            <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" /></svg>
          </div>
        </div>

        {/* Zone Filter */}
        <div className="relative flex-1 sm:flex-none sm:min-w-[200px] group">
          <MapPin className="absolute left-4 sm:left-5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-400 group-focus-within:text-primary-500 transition-colors pointer-events-none" />
          <select 
            value={zoneFilter}
            onChange={(e) => onZoneChange && onZoneChange(e.target.value)}
            className="w-full pl-10 sm:pl-12 pr-8 sm:pr-10 py-2.5 sm:py-4 bg-white/40 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.05] focus:border-primary-500/50 focus:bg-white dark:focus:bg-[#1a1a1a] rounded-xl sm:rounded-[24px] text-xs sm:text-sm font-bold outline-none transition-all dark:text-white appearance-none cursor-pointer shadow-sm backdrop-blur-2xl"
          >
            <option value="all">Barcha zonalar</option>
            <option value="Asosiy zal">Asosiy zal</option>
            <option value="Terrasa">Terrasa</option>
            <option value="Bar">Bar</option>
            <option value="VIP xona">VIP xona</option>
          </select>
          <div className="absolute right-4 sm:right-5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
            <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" /></svg>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TableFilterBar;
