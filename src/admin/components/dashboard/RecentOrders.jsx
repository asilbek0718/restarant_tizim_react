import React from 'react';
import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';

const RecentOrders = ({ orders = [], onViewAll }) => {
  const getStatusStyle = (status) => {
    switch(status?.toLowerCase()) {
      case 'completed': return 'text-green-600 bg-green-500/10 border-green-500/20';
      case 'pending': return 'text-amber-600 bg-amber-500/10 border-amber-500/20';
      case 'preparing': return 'text-blue-600 bg-blue-500/10 border-blue-500/20';
      case 'cancelled': return 'text-red-600 bg-red-500/10 border-red-500/20';
      default: return 'text-slate-600 bg-slate-500/10 border-slate-500/20';
    }
  };

  return (
    <div className="glass-card rounded-[24px] sm:rounded-[32px] border dark:border-white/[0.08] border-slate-200/80 bg-white/60 dark:bg-[#111111]/80 backdrop-blur-2xl overflow-hidden flex flex-col h-full">
      <div className="flex items-center justify-between p-4 sm:p-6 border-b dark:border-white/5 border-slate-100">
        <h3 className="text-base sm:text-lg font-black dark:text-white text-slate-900">So'nggi buyurtmalar</h3>
        {onViewAll && (
          <button onClick={onViewAll} className="text-xs sm:text-sm font-black text-primary-500 hover:text-primary-600 flex items-center gap-1 group uppercase tracking-wider">
            Barchasi <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        )}
      </div>
      <div className="overflow-x-auto flex-1">
        <table className="w-full text-left border-collapse min-w-[400px] sm:min-w-[600px]">
          <thead>
            <tr className="bg-slate-50/50 dark:bg-white/[0.04]">
              <th className="p-3 pl-4 sm:pl-6 text-[10px] sm:text-xs font-black dark:text-slate-400 text-slate-500 uppercase tracking-wider">Buyurtma ID</th>
              <th className="p-3 text-[10px] sm:text-xs font-black dark:text-slate-400 text-slate-500 uppercase tracking-wider">Mijoz</th>
              <th className="p-3 text-[10px] sm:text-xs font-black dark:text-slate-400 text-slate-500 uppercase tracking-wider">Summa</th>
              <th className="p-3 pr-4 sm:pr-6 text-[10px] sm:text-xs font-black dark:text-slate-400 text-slate-500 uppercase tracking-wider text-right">Holat</th>
            </tr>
          </thead>
          <tbody className="divide-y dark:divide-white/5 divide-slate-100">
            {orders.map((order, idx) => (
              <motion.tr 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                key={order.id || `order-${idx}`} 
                className="hover:bg-slate-50/50 dark:hover:bg-white/5 transition-colors group cursor-pointer"
              >
                <td className="p-3 pl-4 sm:pl-6 text-xs sm:text-sm font-black dark:text-white text-slate-900 group-hover:text-primary-500 transition-colors">#{order.id}</td>
                <td className="p-3 text-xs sm:text-sm font-bold dark:text-gray-300 text-slate-700">{order.customerName}</td>
                <td className="p-3 text-xs sm:text-sm font-black dark:text-white text-slate-900">{order.amount} so'm</td>
                <td className="p-3 pr-4 sm:pr-6 text-right">
                  <span className={`px-2 py-1 rounded-md text-[9px] sm:text-[10px] font-black uppercase tracking-wider border ${getStatusStyle(order.status)}`}>
                    {order.status}
                  </span>
                </td>
              </motion.tr>
            ))}
            {orders.length === 0 && (
              <tr>
                <td colSpan="4" className="p-12 text-center text-sm font-bold dark:text-slate-500 text-slate-400">
                  <div className="text-4xl mb-3 opacity-30">📋</div>
                  So'nggi buyurtmalar topilmadi.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RecentOrders;
