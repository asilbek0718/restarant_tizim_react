import React from 'react';
import { motion } from 'framer-motion';
import { Users, Clock, Edit, CheckCircle, Split } from 'lucide-react';
import TableStatusBadge from './TableStatusBadge';
import { TABLE_STATUS, ORDER_STATUS } from '@/shared/constants/statuses';
import { useTick } from '@/shared/providers/TickerProvider';

const TableCard = ({ table, onClick, onEdit, isSelected, onSplit }) => {
  const now = useTick();

  const getStatusColor = () => {
    switch(table.status?.toLowerCase()) {
      case TABLE_STATUS.EMPTY: return 'bg-green-500';
      case TABLE_STATUS.OCCUPIED: return 'bg-blue-500';
      case TABLE_STATUS.RESERVED: return 'bg-amber-500';
      case TABLE_STATUS.CLEANING: return 'bg-purple-500';
      case TABLE_STATUS.WAITING_PAYMENT: return 'bg-blue-600';
      case TABLE_STATUS.INACTIVE: return 'bg-red-500';
      default: return 'bg-slate-500';
    }
  };

  const getDuration = (startString) => {
    if (!startString) return '0:00';
    const start = new Date(startString).getTime();
    const diff = Math.max(0, Math.floor((now - start) / 1000));
    const h = Math.floor(diff / 3600);
    const m = Math.floor((diff % 3600) / 60);
    const s = diff % 60;
    if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const getCountdown = (targetTimeStr) => {
    if (!targetTimeStr) return '00:00';
    // Assume targetTimeStr is HH:mm today
    const [th, tm] = targetTimeStr.split(':');
    const targetDate = new Date();
    targetDate.setHours(parseInt(th), parseInt(tm), 0, 0);
    let diff = Math.floor((targetDate.getTime() - now) / 1000);
    
    if (diff < 0) return 'Vaqti yetdi';
    
    const h = Math.floor(diff / 3600);
    const m = Math.floor((diff % 3600) / 60);
    if (h > 0) return `${h}s ${m}d`;
    return `${m} daqiqa`;
  };

  // Cleaning countdown (e.g. 5 minutes from updatedAt)
  const getCleaningCountdown = (updatedStr) => {
    if (!updatedStr) return '0:00';
    const updated = new Date(updatedStr).getTime();
    const target = updated + 5 * 60 * 1000; // 5 min
    const diff = Math.max(0, Math.floor((target - now) / 1000));
    if (diff === 0) return 'Tayyor';
    const m = Math.floor(diff / 60);
    const s = diff % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => onClick && onClick(table)}
      className={`glass-card p-4 sm:p-5 lg:p-6 rounded-3xl border transition-all flex flex-col group relative overflow-hidden h-full ${
        isSelected 
          ? 'ring-4 ring-primary-500 border-primary-500 shadow-2xl shadow-primary-500/20 scale-[1.03]' 
          : 'dark:border-white/[0.08] border-slate-200/80 bg-white/60 dark:bg-[#111111]/80 backdrop-blur-2xl hover:shadow-2xl hover:shadow-primary-500/10'
      } ${table.mergedInto ? 'opacity-40 grayscale pointer-events-none' : ''}`}
    >
      <div className={`absolute top-0 left-0 w-full h-1.5 ${getStatusColor()} opacity-80 group-hover:opacity-100 transition-opacity`} />
      {isSelected && (
        <div className="absolute top-2 right-2 bg-primary-500 text-white p-1 rounded-full z-10">
          <CheckCircle className="w-4 h-4" />
        </div>
      )}
      
      <div className="flex justify-between items-start">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className={`w-3 h-3 rounded-full ${getStatusColor()} shadow-[0_0_10px_rgba(0,0,0,0.1)]`} />
            <h4 className="font-black text-xl sm:text-3xl lg:text-4xl dark:text-white text-slate-900 tracking-tight group-hover:text-primary-500 transition-colors">#{table.number}</h4>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{table.zone || 'Asosiy'}</span>
            <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-white/10" />
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{table.capacity} o'rin</span>
          </div>
        </div>
        <div className="flex items-center gap-1 lg:opacity-0 lg:group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0">
          {table.mergedWith?.length > 0 && (
            <button 
              onClick={(e) => { e.stopPropagation(); onSplit && onSplit(table.id); }}
              className="p-2 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all shadow-sm border border-red-500/10"
              title="Ajratish"
            >
              <Split className="w-3.5 h-3.5" />
            </button>
          )}
          <button 
            onClick={(e) => { e.stopPropagation(); onEdit && onEdit(table); }}
            className="p-2 rounded-xl bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400 hover:bg-primary-500 hover:text-white transition-all shadow-sm border dark:border-white/5"
          >
            <Edit className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="mt-8">
        {[TABLE_STATUS.OCCUPIED, TABLE_STATUS.WAITING_PAYMENT].includes(table.status?.toLowerCase()) ? (
          <div className="p-4 rounded-[24px] bg-primary-500/5 border border-primary-500/10 relative overflow-hidden">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-primary-500/10 flex items-center justify-center">
                  <Users className="w-4 h-4 text-primary-500" />
                </div>
                <span className="text-sm font-bold dark:text-white text-slate-900 truncate max-w-[100px]">
                  {table.order?.customerName || 'Mehmon'}
                </span>
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white dark:bg-white/5 border dark:border-white/5 shadow-sm">
                <Clock className="w-3 h-3 text-primary-500" />
                <span className="text-[10px] font-black dark:text-slate-400 text-slate-500">
                  {getDuration(table.order?.createdAt || table.updatedAt)}
                </span>
              </div>
            </div>
            
            {table.order?.total > 0 && (
              <div className="flex items-center justify-between pt-3 border-t dark:border-white/5 border-slate-200/60">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Hisob</span>
                <span className="text-lg font-black text-primary-500">
                  {table.order.total.toLocaleString()} <span className="text-xs">so'm</span>
                </span>
              </div>
            )}
          </div>
        ) : table.status?.toLowerCase() === TABLE_STATUS.RESERVED ? (
          <div className="p-4 rounded-[24px] bg-amber-500/5 border border-amber-500/10">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest">Bron qilingan</span>
              <div className="flex items-center gap-1 text-amber-500">
                <Clock className="w-3 h-3" />
                <span className="text-[10px] font-black">{table.reservation?.time || '--:--'}</span>
              </div>
            </div>
            <div className="space-y-1 mb-3">
              <p className="text-sm font-bold dark:text-white text-slate-900 truncate">
                {table.reservation?.customerName || 'Mijoz kutilmoqda'}
              </p>
              <p className="text-[10px] font-bold text-slate-500 tracking-tight">
                {table.reservation?.phone || 'Tel: ko\'rsatilmadi'}
              </p>
            </div>
            <div className="flex items-center justify-between pt-2 border-t dark:border-white/5 border-slate-200/50">
               <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Kishi: {table.reservation?.partySize || 0}</span>
               <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest">{table.reservation?.time} da</span>
            </div>
          </div>
        ) : table.status?.toLowerCase() === TABLE_STATUS.CLEANING ? (
          <div className="py-8 flex flex-col items-center justify-center bg-purple-500/5 border border-purple-500/10 rounded-[24px]">
             <div className="relative mb-3">
               <Clock className="w-8 h-8 text-purple-500 animate-spin-slow opacity-20" />
               <div className="absolute inset-0 flex items-center justify-center">
                 <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" />
               </div>
             </div>
             <span className="font-black text-2xl text-purple-500 mb-1">{getCleaningCountdown(table.updatedAt)}</span>
             <span className="text-[10px] font-bold text-purple-500/50 uppercase tracking-widest">Tozalanmoqda</span>
          </div>
        ) : (
          <div className="py-8 flex flex-col items-center justify-center gap-2 border-2 border-dashed dark:border-white/[0.06] border-slate-200/60 rounded-[24px] bg-slate-50/50 dark:bg-white/[0.01] group-hover:border-primary-500/20 transition-colors">
            <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center">
              <Users className="w-5 h-5 text-slate-300" />
            </div>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[2px]">Bo'sh stol</span>
          </div>
        )}
      </div>

      <div className="mt-6 pt-5 border-t dark:border-white/[0.06] border-slate-100 flex items-center justify-between gap-2">
        <TableStatusBadge status={table.status} />
        
        <div className="flex items-center gap-1.5">
          {table.status?.toLowerCase() === TABLE_STATUS.EMPTY && (
            <div className="flex gap-2">
              <button 
                onClick={(e) => { e.stopPropagation(); onClick(table, 'occupy'); }}
                className="px-6 py-2 rounded-xl bg-primary-500 text-white text-[10px] font-black uppercase tracking-widest hover:bg-primary-600 transition-colors shadow-lg shadow-primary-500/20 w-full"
              >
                Band qilish
              </button>
            </div>
          )}

          {table.status?.toLowerCase() === TABLE_STATUS.RESERVED && (
            <button 
              onClick={(e) => { e.stopPropagation(); onClick(table, 'occupy_reserved'); }}
              className="px-4 py-2 rounded-xl bg-amber-500 text-white text-[10px] font-black uppercase tracking-widest hover:bg-amber-600 transition-colors shadow-lg shadow-amber-500/20"
            >
              Mijoz keldi
            </button>
          )}

          {table.status?.toLowerCase() === TABLE_STATUS.OCCUPIED && (
            <div className="text-[10px] font-black text-primary-500 uppercase tracking-widest px-2">
              Buyurtma faol
            </div>
          )}

          {table.status?.toLowerCase() === TABLE_STATUS.CLEANING && (
            <div className="text-[10px] font-black text-purple-500 uppercase tracking-widest px-2">
              Tozalanmoqda...
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default TableCard;
