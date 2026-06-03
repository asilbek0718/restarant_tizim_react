import React from 'react';
import { motion } from 'framer-motion';
import { Phone, Edit, Star, ShieldCheck, Clock, User, Briefcase } from 'lucide-react';
import StaffRoleBadge from './StaffRoleBadge';
import { TRANSLATIONS } from '@/shared/constants/translations';

const StaffCard = ({ staff, onEdit, onViewDetails }) => {
  const t = TRANSLATIONS.staff;

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'busy': return 'bg-amber-500';
      case 'break': return 'bg-blue-500';
      case 'offline': return 'bg-slate-400';
      case 'vacation': return 'bg-purple-500';
      case 'sick': return 'bg-red-500';
      case 'inactive': return 'bg-red-700';
      default: return 'bg-slate-400';
    }
  };

  return (
    <motion.div
      whileHover={{ y: -5 }}
      className={`glass-card rounded-[40px] border dark:border-white/[0.08] border-slate-200/80 bg-white/60 dark:bg-[#111111]/80 backdrop-blur-2xl overflow-hidden shadow-sm hover:shadow-2xl hover:shadow-primary-500/10 transition-all flex flex-col group h-full relative ${!staff.is_active ? 'opacity-60 grayscale' : ''}`}
    >
      <div className="absolute top-5 right-5 z-10 flex gap-2">
        <button 
          onClick={(e) => {
            e.stopPropagation();
            onEdit && onEdit(staff);
          }} 
          className="p-3 rounded-2xl bg-white/80 dark:bg-black/60 backdrop-blur-md text-slate-600 dark:text-gray-300 hover:text-primary-500 hover:bg-white dark:hover:bg-white/10 transition-all opacity-0 group-hover:opacity-100 shadow-xl border border-slate-200/80 dark:border-white/20"
        >
          <Edit className="w-4 h-4" />
        </button>
      </div>

      <div className="p-8 flex flex-col items-center text-center bg-gradient-to-b from-slate-50/80 to-transparent dark:from-white/5">
        <div className="relative mb-5">
          <div className="w-24 h-24 rounded-[32px] overflow-hidden border-[4px] border-white dark:border-[#1a1a1a] shadow-2xl group-hover:scale-105 transition-transform duration-500">
            {staff.avatar ? (
              <img src={staff.avatar} alt={staff.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-primary-500/20 to-primary-500/5 text-primary-500 flex items-center justify-center">
                <User className="w-10 h-10" />
              </div>
            )}
          </div>
          <div className={`absolute -bottom-2 -right-2 w-8 h-8 rounded-full border-4 border-white dark:border-[#1a1a1a] shadow-lg flex items-center justify-center ${getStatusColor(staff.status)}`}>
             {staff.status === 'active' && <ShieldCheck className="w-4 h-4 text-white" />}
          </div>
        </div>

        <h3 className="font-black text-xl dark:text-white text-slate-900 tracking-tight group-hover:text-primary-500 transition-colors leading-tight">{staff.name}</h3>
        <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mt-1">{staff.employeeId || 'ID MOJUD EMAS'}</p>
        <div className="mt-4">
          <StaffRoleBadge role={staff.role} />
        </div>
      </div>

      <div className="px-8 pb-8 flex-1 flex flex-col gap-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white/60 dark:bg-white/[0.04] p-4 rounded-3xl border dark:border-white/5 border-slate-100 shadow-sm">
             <div className="flex items-center gap-2 mb-2">
                <Clock className="w-3 h-3 text-slate-400" />
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t.shift}</span>
             </div>
             <p className="text-xs font-bold dark:text-white text-slate-700 truncate">{t.shifts[staff.shift] || staff.shift || '—'}</p>
          </div>
          <div className="bg-white/60 dark:bg-white/[0.04] p-4 rounded-3xl border dark:border-white/5 border-slate-100 shadow-sm">
             <div className="flex items-center gap-2 mb-2">
                <Star className="w-3 h-3 text-amber-500" />
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t.performance}</span>
             </div>
             <p className="text-xs font-black dark:text-white text-slate-700">{staff.performance || 0}%</p>
          </div>
        </div>

        <div className="flex items-center gap-4 text-sm font-bold dark:text-gray-300 text-slate-600 bg-slate-50/50 dark:bg-white/[0.02] p-4 rounded-[24px] border border-slate-100 dark:border-white/5">
          <div className="p-2 rounded-xl bg-white dark:bg-white/10 shadow-sm">
            <Phone className="w-4 h-4 text-primary-500" />
          </div>
          <span className="tracking-tight">{staff.phone || '—'}</span>
        </div>

        <div className="flex justify-between items-center mt-auto pt-6 border-t dark:border-white/[0.08] border-slate-200/80">
          <div className="flex flex-col">
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">{t.salary}</span>
            <span className="font-black text-sm dark:text-white text-slate-900">{(staff.salary || 0).toLocaleString()} <span className="text-[10px] text-slate-400 uppercase">sum</span></span>
          </div>
          <button 
            onClick={() => onViewDetails && onViewDetails(staff)}
            className="px-5 py-2.5 rounded-2xl bg-primary-500/10 hover:bg-primary-500 text-primary-500 hover:text-white text-[10px] font-black uppercase tracking-widest transition-all duration-300 border border-primary-500/20"
          >
            {t.viewDetails}
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default StaffCard;
