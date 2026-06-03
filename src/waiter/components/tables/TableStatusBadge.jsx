import React from 'react';

const TableStatusBadge = ({ status }) => {
  const getStatusConfig = () => {
    switch(status?.toLowerCase()) {
      case 'empty': 
        return { label: "Bo'sh", classes: 'bg-green-500/10 text-green-600 border-green-500/20 dark:text-green-400' };
      case 'occupied': 
        return { label: 'Band', classes: 'bg-blue-500/10 text-blue-600 border-blue-500/20 dark:text-blue-400' };
      case 'reserved': 
        return { label: 'Band qilingan', classes: 'bg-amber-500/10 text-amber-600 border-amber-500/20 dark:text-amber-400' };
      case 'cleaning':
        return { label: 'Tozalanmoqda', classes: 'bg-purple-500/10 text-purple-600 border-purple-500/20 dark:text-purple-400' };
      case 'maintenance': 
        return { label: "Ta'mirlanmoqda", classes: 'bg-red-500/10 text-red-600 border-red-500/20 dark:text-red-400' };
      default: 
        return { label: status || "Noma'lum", classes: 'bg-slate-500/10 text-slate-600 border-slate-500/20 dark:text-gray-300' };
    }
  };

  const config = getStatusConfig();

  return (
    <span className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest border whitespace-nowrap ${config.classes}`}>
      {config.label}
    </span>
  );
};

export default TableStatusBadge;
