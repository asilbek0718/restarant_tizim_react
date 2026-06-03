import React from 'react';
import { motion } from 'framer-motion';
import { Clock, User, ChevronRight } from 'lucide-react';
import OrderStatusBadge from './OrderStatusBadge';
import { financeUtils } from '@/shared/utils/finances';

const OrderCard = ({ order, onClick }) => {
  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => onClick && onClick(order)}
      className="glass-card p-6 rounded-3xl border dark:border-white/[0.08] border-slate-200/80 bg-white/60 dark:bg-[#111111]/80 backdrop-blur-2xl shadow-md hover:shadow-xl hover:shadow-primary-500/10 cursor-pointer transition-all flex flex-col h-full group"
    >
      <div className="flex justify-between items-start mb-6">
        <div>
          <h4 className="font-black text-xl dark:text-white text-slate-900 group-hover:text-primary-500 transition-colors">#{order.id}</h4>
          <p className="text-xs font-black text-primary-500 uppercase tracking-wider mt-1 bg-primary-500/10 inline-block px-2 py-0.5 rounded-md">
            {order.type || 'Zalda'} • {order.tableNumber}-stol
          </p>
        </div>
        <OrderStatusBadge status={order.status} />
      </div>

      <div className="space-y-3 mb-6 flex-1">
        <div className="flex items-center text-sm dark:text-slate-400 text-slate-600 font-bold bg-slate-50 dark:bg-white/[0.04] p-2 rounded-[20px]">
          <User className="w-4 h-4 mr-3 text-primary-500" />
          <div className="flex flex-col">
            <span className="truncate">{order.customerName || 'Mehmon'}</span>
            <span className="text-[10px] text-slate-400 font-medium">Ofitsiant: {order.waiterName || order.serverName || 'Staff'}</span>
          </div>
        </div>
        <div className="flex items-center text-sm dark:text-slate-400 text-slate-600 font-bold bg-slate-50 dark:bg-white/[0.04] p-2 rounded-[20px]">
          <Clock className="w-4 h-4 mr-3 text-blue-500" />
          {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>

      <div className="border-t dark:border-white/[0.08] border-slate-200/80 pt-5 flex justify-between items-center mt-auto">
        <div className="flex flex-col">
          <span className="text-xs font-black dark:text-slate-400 text-slate-500 uppercase tracking-widest bg-slate-100 dark:bg-white/10 px-3 py-1.5 rounded-lg w-fit">
            {order.items?.length || 0} ta taom
          </span>
          {order.notes && <span className="text-[10px] text-amber-500 font-bold mt-2 ml-1">● Izoh bor</span>}
        </div>
        <span className="text-2xl font-extrabold tracking-tight dark:text-white text-slate-900 tracking-tight">
          {financeUtils.formatCurrency(order.total)}
        </span>
      </div>
    </motion.div>
  );
};

export default OrderCard;
