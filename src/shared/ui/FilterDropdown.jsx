import React from 'react';
import { Filter } from 'lucide-react';

const FilterDropdown = ({ value, onChange, options = [], defaultLabel = "All Options", className = "" }) => {
  return (
    <div className={`relative w-full sm:w-auto min-w-0 sm:min-w-[180px] group ${className}`}>
      <Filter className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-primary-500 transition-colors pointer-events-none" />
      <select 
        value={value}
        onChange={(e) => onChange && onChange(e.target.value)}
        className="w-full pl-12 pr-10 py-4 bg-white/60 dark:bg-white/[0.04] border border-slate-200/80 dark:border-white/[0.08] focus:border-primary-500/50 focus:bg-white dark:focus:bg-[#1a1a1a] rounded-[24px] text-sm font-bold outline-none transition-all dark:text-white appearance-none cursor-pointer shadow-md backdrop-blur-2xl"
      >
        <option value="all">{defaultLabel}</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 font-bold text-xs">▼</div>
    </div>
  );
};

export default FilterDropdown;
