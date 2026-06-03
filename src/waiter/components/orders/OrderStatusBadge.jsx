import React from 'react';

const OrderStatusBadge = ({ status }) => {
  const getStatusConfig = () => {
    switch(status?.toLowerCase()) {
      case 'completed': 
      case 'delivered':
        return { label: 'Bajarildi', classes: 'bg-green-500/10 text-green-600 border-green-500/20 dark:text-green-400' };
      case 'pending': 
      case 'new':
        return { label: 'Kutilmoqda', classes: 'bg-amber-500/10 text-amber-600 border-amber-500/20 dark:text-amber-400' };
      case 'preparing': 
      case 'cooking':
        return { label: 'Tayyorlanmoqda', classes: 'bg-blue-500/10 text-blue-600 border-blue-500/20 dark:text-blue-400' };
      case 'ready':
        return { label: 'Tayyor', classes: 'bg-purple-500/10 text-purple-600 border-purple-500/20 dark:text-purple-400' };
      case 'cancelled': 
        return { label: 'Bekor qilindi', classes: 'bg-red-500/10 text-red-600 border-red-500/20 dark:text-red-400' };
      default: 
        return { label: status || "Noma'lum", classes: 'bg-slate-500/10 text-slate-600 border-slate-500/20 dark:text-gray-300' };
    }
  };

  const config = getStatusConfig();

  return (
    <span className={`inline-flex items-center justify-center h-7 px-3 rounded-full text-[10px] font-black uppercase tracking-widest border whitespace-nowrap transition-colors ${config.classes}`}>
      {config.label}
    </span>
  );
};

export default OrderStatusBadge;
