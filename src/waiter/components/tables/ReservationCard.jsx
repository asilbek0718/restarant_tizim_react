import React from 'react';
import { motion } from 'framer-motion';
import { Users, Clock, Calendar, Check, X } from 'lucide-react';

const ReservationCard = ({ reservation, onConfirm, onCancel, onEdit }) => {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="glass-card p-4 sm:p-6 rounded-2xl sm:rounded-3xl border dark:border-white/[0.08] border-slate-200/80 bg-white/60 dark:bg-[#111111]/80 backdrop-blur-2xl flex flex-col gap-5 h-full group hover:shadow-2xl hover:shadow-primary-500/10 transition-all"
    >
      <div className="flex justify-between items-start">
        <div>
          <h4 className="font-black text-lg sm:text-xl dark:text-white text-slate-900 group-hover:text-primary-500 transition-colors">{reservation.customerName}</h4>
          <p className="text-[10px] sm:text-xs font-bold text-slate-500 dark:text-slate-400 mt-1 uppercase tracking-wider">{reservation.phone}</p>
        </div>
        <span className={`px-2 py-1 sm:px-3 sm:py-1.5 rounded-lg text-[9px] sm:text-[10px] font-black uppercase tracking-widest border shadow-md ${
          reservation.status === 'confirmed' ? 'bg-green-500/10 text-green-600 border-green-500/20' :
          reservation.status === 'pending' ? 'bg-amber-500/10 text-amber-600 border-amber-500/20' :
          'bg-slate-500/10 text-slate-600 border-slate-500/20'
        }`}>
          {reservation.status === 'confirmed' ? 'Tasdiqlangan' : 
           reservation.status === 'pending' ? 'Kutilmoqda' : 
           reservation.status === 'cancelled' ? 'Bekor qilingan' : reservation.status}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:gap-4 mt-2 mb-2 bg-slate-50/80 dark:bg-white/[0.04] p-3 sm:p-5 rounded-2xl sm:rounded-[24px] border dark:border-white/5 border-slate-100">
        <div className="flex flex-col gap-2 sm:gap-3 text-xs sm:text-sm font-bold dark:text-gray-300 text-slate-700">
          <span className="flex items-center gap-2 sm:gap-3"><Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary-500" /> {reservation.date}</span>
          <span className="flex items-center gap-2 sm:gap-3"><Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary-500" /> {reservation.time}</span>
        </div>
        <div className="flex flex-col justify-center gap-2 sm:gap-3 text-xs sm:text-sm font-bold dark:text-gray-300 text-slate-700">
          <span className="flex items-center gap-2 sm:gap-3"><Users className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-500" /> {reservation.partySize} Kishi</span>
          <span className="flex items-center gap-2 sm:gap-3 font-black"><span className="w-3.5 text-center text-amber-500 text-base">#</span> Stol {reservation.tableNumber || 'Auto'}</span>
        </div>
      </div>

      {reservation.notes && (
        <p className="text-xs font-bold dark:text-amber-400 text-amber-700 italic bg-amber-500/10 p-3 sm:p-4 rounded-xl sm:rounded-[24px] border border-amber-500/20">
          "{reservation.notes}"
        </p>
      )}

      <div className="flex gap-3 mt-auto pt-4">
        {reservation.status === 'pending' && (
          <button 
            onClick={() => onConfirm && onConfirm(reservation)}
            className="flex-1 py-3 rounded-[20px] bg-primary-500 hover:bg-primary-600 text-white font-black text-[10px] uppercase tracking-widest transition-all shadow-[0_8px_30px_rgb(14,165,233,0.3)] hover:-translate-y-0.5 hover:shadow-primary-500/50 flex items-center justify-center gap-1.5"
          >
            <Check className="w-3.5 h-3.5" /> Tasdiqlash
          </button>
        )}
        <button 
          onClick={() => onEdit && onEdit(reservation)}
          className={`py-3 px-4 rounded-[20px] border-2 dark:border-white/[0.08] border-slate-200/80 font-black text-[10px] uppercase tracking-widest dark:text-slate-300 text-slate-700 hover:bg-slate-100 dark:hover:bg-white/10 transition-all flex items-center justify-center gap-1.5 shadow-sm ${reservation.status === 'pending' ? '' : 'flex-1'}`}
        >
          Tahrirlash
        </button>
        <button 
          onClick={() => onCancel && onCancel(reservation)}
          className={`py-3 px-4 rounded-[20px] border-2 dark:border-white/[0.08] border-slate-200/80 font-black text-[10px] uppercase tracking-widest text-red-500 hover:bg-red-500 hover:text-white hover:border-red-500 transition-all flex items-center justify-center gap-1.5 shadow-sm`}
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </motion.div>
  );
};

export default ReservationCard;
