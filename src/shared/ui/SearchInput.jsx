import React from 'react';
import { Search } from 'lucide-react';

const SearchInput = ({ value, onChange, placeholder = "Search...", className = "" }) => {
  return (
    <div className={`relative group ${className}`}>
      <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-primary-500 transition-colors" />
      <input 
        type="text" 
        value={value}
        onChange={(e) => onChange && onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-14 pr-6 py-4 bg-white/60 dark:bg-white/[0.04] border border-slate-200/80 dark:border-white/[0.08] focus:border-primary-500/50 focus:bg-white dark:focus:bg-[#1a1a1a] rounded-[24px] text-sm font-bold outline-none transition-all dark:text-white placeholder:font-medium placeholder:text-slate-400 shadow-md backdrop-blur-2xl"
      />
    </div>
  );
};

export default SearchInput;
