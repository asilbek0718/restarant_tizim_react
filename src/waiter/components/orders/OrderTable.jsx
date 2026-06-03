import React from 'react';
import { motion } from 'framer-motion';
import { Eye, Trash2, ArrowRight, ClipboardList } from 'lucide-react';
import OrderStatusBadge from './OrderStatusBadge';
import { financeUtils } from '@/shared/utils/finances';
import EmptyState from '@/shared/ui/EmptyState';
import { ORDER_STATUS } from '@/shared/constants/statuses';

const OrderTable = ({ orders = [], onView, onEdit, onDelete }) => {
  return (
    <div className="w-full overflow-x-auto rounded-2xl sm:rounded-3xl border dark:border-white/[0.08] border-slate-200/80 bg-white/60 dark:bg-[#111111]/80 backdrop-blur-2xl shadow-md">
      <table className="w-full text-left border-collapse min-w-[500px] sm:min-w-[800px] lg:min-w-[1000px]">
        <thead>
          <tr className="bg-slate-50/80 dark:bg-white/[0.04] border-b dark:border-white/[0.08] border-slate-200/80">
            <th className="w-[120px] sm:w-[180px] p-3 sm:p-5 pl-4 sm:pl-8 text-[9px] sm:text-[11px] font-black dark:text-slate-400 text-slate-500 uppercase tracking-widest">Stol Sessiyasi</th>
            <th className="p-3 sm:p-5 text-[9px] sm:text-[11px] font-black dark:text-slate-400 text-slate-500 uppercase tracking-widest hidden sm:table-cell">Mijoz / Ofitsiant</th>
            <th className="w-[120px] sm:w-[180px] p-3 sm:p-5 text-[9px] sm:text-[11px] font-black dark:text-slate-400 text-slate-500 uppercase tracking-widest hidden md:table-cell">Faollik</th>
            <th className="w-[100px] sm:w-[160px] p-3 sm:p-5 text-[9px] sm:text-[11px] font-black dark:text-slate-400 text-slate-500 uppercase tracking-widest">Jami summa</th>
            <th className="w-[120px] sm:w-[180px] p-3 sm:p-5 text-[9px] sm:text-[11px] font-black dark:text-slate-400 text-slate-500 uppercase tracking-widest">Holat</th>
            <th className="w-[90px] sm:w-[120px] p-3 sm:p-5 pr-4 sm:pr-8 text-[9px] sm:text-[11px] font-black dark:text-slate-400 text-slate-500 uppercase tracking-widest text-right">Amallar</th>
          </tr>
        </thead>
        <tbody className="divide-y dark:divide-white/5 divide-slate-100">
          {orders.map((order, idx) => (
            <motion.tr 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(idx * 0.05, 0.4) }}
              key={order.id} 
              className="hover:bg-slate-50/50 dark:hover:bg-white/[0.02] transition-all duration-300 group cursor-default"
            >
              <td className="p-3 sm:p-5 pl-4 sm:pl-8">
                <div className="flex items-center gap-2 sm:gap-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-[18px] bg-primary-500 text-white font-black text-sm sm:text-xl flex items-center justify-center shrink-0 shadow-lg shadow-primary-500/20">
                    #{order.tableNumber || '?'}
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <p className="text-[9px] sm:text-[10px] font-black dark:text-slate-400 text-slate-500 uppercase tracking-widest">Ochiq stol</p>
                    <p className="text-xs sm:text-sm font-black dark:text-white text-slate-900">{order.orders?.length || 1} ta buyurtma</p>
                  </div>
                </div>
              </td>
              <td className="p-3 sm:p-5 hidden sm:table-cell">
                <div className="flex flex-col gap-0.5">
                  <p className="text-xs sm:text-sm font-bold dark:text-slate-200 text-slate-700 truncate max-w-[150px] sm:max-w-[200px]">{order.customerName || 'Mehmon'}</p>
                  <p className="text-[9px] sm:text-[10px] font-bold text-slate-400 italic">Mas'ul: {order.waiterName || order.serverName || 'Staff'}</p>
                </div>
              </td>
              <td className="p-3 sm:p-5 hidden md:table-cell">
                <div className="flex flex-col gap-0.5">
                  <p className="text-[10px] sm:text-xs font-bold dark:text-slate-300 text-slate-700 truncate">{order.hallName || order.zone || 'Asosiy zal'}</p>
                  <p className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-wider">{new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} boshlandi</p>
                </div>
              </td>
              <td className="p-3 sm:p-5">
                <div className="flex flex-col">
                  <p className="text-xs sm:text-sm font-black dark:text-white text-slate-900">{financeUtils.formatCurrency(order.total)}</p>
                  <p className="text-[9px] sm:text-[10px] font-bold text-slate-400 mt-0.5">
                    {order.itemsCount || (order.items?.length || 0)} ta mahsulot
                  </p>
                </div>
              </td>
              <td className="p-3 sm:p-5">
                <div className="flex items-center">
                  <OrderStatusBadge status={order.status} />
                </div>
              </td>
              <td className="p-3 sm:p-5 pr-4 sm:pr-8 text-right">
                <div className="flex justify-end gap-1.5 sm:gap-2 lg:opacity-0 lg:group-hover:opacity-100 transition-all duration-300 lg:translate-x-2 lg:group-hover:translate-x-0">
                  <button onClick={() => onView && onView(order)} className="p-2 sm:p-2.5 rounded-lg sm:rounded-xl text-slate-400 hover:text-primary-500 hover:bg-primary-500/10 transition-all border dark:border-white/5 border-slate-100 shadow-sm bg-white dark:bg-[#161616]">
                    <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </button>
                  <button onClick={() => onDelete && onDelete(order)} className="p-2 sm:p-2.5 rounded-lg sm:rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-500/10 transition-all border dark:border-white/5 border-slate-100 shadow-sm bg-white dark:bg-[#161616]">
                    <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </button>
                </div>
              </td>
            </motion.tr>
          ))}
          {orders.length === 0 && (
            <tr>
              <td colSpan="6" className="p-10">
                <EmptyState 
                  icon={ClipboardList}
                  title="Buyurtmalar topilmadi"
                  description="Siz qidirgan mezonlar bo'yicha hech qanday buyurtma mavjud emas."
                />
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default OrderTable;
