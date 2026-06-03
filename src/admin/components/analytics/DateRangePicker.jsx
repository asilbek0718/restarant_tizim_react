import React from 'react';
import { Calendar } from 'lucide-react';

const DateRangePicker = ({ startDate, endDate, onChange }) => {
  return (
    <div className="flex items-center gap-3 bg-white/80 dark:bg-white/[0.04] border border-slate-200/80 dark:border-white/[0.08] rounded-[24px] p-2 shadow-md backdrop-blur-2xl">
      <div className="px-4 py-2 flex items-center gap-3">
        <Calendar className="w-5 h-5 text-primary-500" />
        <span className="text-sm font-black dark:text-white text-slate-700 uppercase tracking-widest">
          {startDate || 'Start Date'} - {endDate || 'End Date'}
        </span>
      </div>
      <button onClick={onChange} className="px-5 py-3 bg-slate-100 dark:bg-white/10 hover:bg-primary-500 hover:text-white rounded-[20px] text-xs font-black uppercase tracking-widest transition-all dark:text-white shadow-md border border-transparent hover:border-primary-500/50">
        O'zgartirish
      </button>
    </div>
  );
};

export default DateRangePicker;
