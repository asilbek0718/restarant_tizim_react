import React from 'react';
import { motion } from 'framer-motion';
import { Eye, Edit, Trash2, Phone, Briefcase, Clock, DollarSign, RotateCcw } from 'lucide-react';
import StaffRoleBadge from './StaffRoleBadge';
import { TRANSLATIONS } from '@/shared/constants/translations';

const StaffTable = ({ staff = [], onView, onEdit, onDelete, onRestore }) => {
  const t = TRANSLATIONS.staff;
  const common = TRANSLATIONS.common;

  const getStatusStyle = (status) => {
    switch (status) {
      case 'active': return 'bg-green-500/10 text-green-600 border-green-500/20 dark:text-green-400';
      case 'busy': return 'bg-amber-500/10 text-amber-600 border-amber-500/20 dark:text-amber-400';
      case 'break': return 'bg-blue-500/10 text-blue-600 border-blue-500/20 dark:text-blue-400';
      case 'offline': return 'bg-slate-500/10 text-slate-600 border-slate-500/20 dark:text-slate-400';
      case 'vacation': return 'bg-purple-500/10 text-purple-600 border-purple-500/20 dark:text-purple-400';
      case 'sick': return 'bg-red-500/10 text-red-600 border-red-500/20 dark:text-red-400';
      case 'inactive': return 'bg-red-700/10 text-red-700 border-red-700/20 dark:text-red-500';
      default: return 'bg-slate-500/10 text-slate-600 border-slate-500/20 dark:text-slate-400';
    }
  };

  return (
    <div className="w-full overflow-x-auto rounded-3xl sm:rounded-[32px] border dark:border-white/[0.08] border-slate-200/80 bg-white/60 dark:bg-[#111111]/80 backdrop-blur-2xl shadow-sm">
      <table className="w-full text-left border-collapse min-w-[600px] sm:min-w-[800px] lg:min-w-[1000px]">
        <thead>
          <tr className="bg-slate-50/80 dark:bg-white/[0.04] border-b dark:border-white/[0.08] border-slate-200/80">
            <th className="p-3 sm:p-6 pl-4 sm:pl-8 text-[9px] sm:text-[10px] font-black dark:text-slate-400 text-slate-500 uppercase tracking-widest">{t.allStaff}</th>
            <th className="p-3 sm:p-6 text-[9px] sm:text-[10px] font-black dark:text-slate-400 text-slate-500 uppercase tracking-widest">{t.permissions}</th>
            <th className="p-3 sm:p-6 text-[9px] sm:text-[10px] font-black dark:text-slate-400 text-slate-500 uppercase tracking-widest hidden md:table-cell">{t.shift}</th>
            <th className="p-3 sm:p-6 text-[9px] sm:text-[10px] font-black dark:text-slate-400 text-slate-500 uppercase tracking-widest hidden sm:table-cell">{t.salary}</th>
            <th className="p-3 sm:p-6 text-[9px] sm:text-[10px] font-black dark:text-slate-400 text-slate-500 uppercase tracking-widest">{t.status}</th>
            <th className="p-3 sm:p-6 pr-4 sm:pr-8 text-[9px] sm:text-[10px] font-black dark:text-slate-400 text-slate-500 uppercase tracking-widest text-right">{common.actions}</th>
          </tr>
        </thead>
        <tbody className="divide-y dark:divide-white/5 divide-slate-100">
          {staff.map((member, idx) => (
            <motion.tr 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(idx * 0.05, 0.5) }}
              key={member.id} 
              className={`hover:bg-white dark:hover:bg-white/10 transition-all group cursor-default ${!member.is_active ? 'opacity-50' : ''}`}
            >
              <td className="p-3 sm:p-6 pl-4 sm:pl-8">
                <div className="flex items-center gap-2 sm:gap-4">
                  <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl overflow-hidden bg-slate-100 dark:bg-white/10 shrink-0 border border-slate-200/80 dark:border-white/[0.08] group-hover:rotate-2 transition-transform duration-500">
                    {member.avatar ? (
                      <img src={member.avatar} alt={member.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-primary-500 font-black text-sm sm:text-xl bg-primary-500/10">
                        {member.name?.charAt(0)}
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm font-black dark:text-white text-slate-900 group-hover:text-primary-500 transition-colors">{member.name}</p>
                    <div className="flex items-center gap-1 sm:gap-2 mt-1 sm:mt-1.5">
                       <Phone className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-slate-400" />
                       <span className="text-[9px] sm:text-[10px] font-bold dark:text-slate-500 text-slate-400 tracking-tight">{member.phone || '—'}</span>
                    </div>
                  </div>
                </div>
              </td>
              <td className="p-3 sm:p-6">
                <StaffRoleBadge role={member.role} />
              </td>
              <td className="p-3 sm:p-6 hidden md:table-cell">
                <div className="flex items-center gap-1.5 sm:gap-2">
                   <Clock className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-slate-400" />
                   <span className="text-[10px] sm:text-xs font-bold dark:text-slate-300 text-slate-600">{t.shifts[member.shift] || member.shift || '—'}</span>
                </div>
              </td>
              <td className="p-3 sm:p-6 hidden sm:table-cell">
                <div className="flex items-center gap-1.5 sm:gap-2">
                   <DollarSign className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-primary-500" />
                   <span className="text-xs sm:text-sm font-black dark:text-white text-slate-900">{(member.salary || 0).toLocaleString()}</span>
                </div>
              </td>
              <td className="p-3 sm:p-6">
                <span className={`px-2 py-1 sm:px-4 sm:py-2 rounded-lg sm:rounded-xl text-[8px] sm:text-[9px] font-black uppercase tracking-widest border transition-all ${getStatusStyle(member.status)}`}>
                  {t.statuses[member.status] || member.status || 'Offline'}
                </span>
              </td>
              <td className="p-3 sm:p-6 pr-4 sm:pr-8 text-right">
                <div className="flex justify-end gap-1 sm:gap-2 lg:opacity-0 lg:group-hover:opacity-100 transition-all duration-300">
                  <button 
                    onClick={() => onView && onView(member)} 
                    className="p-2 sm:p-3 rounded-xl sm:rounded-2xl text-slate-400 hover:text-primary-500 hover:bg-primary-500/10 transition-all border border-transparent hover:border-primary-500/20"
                    title={t.viewDetails}
                  >
                    <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </button>
                  <button 
                    onClick={() => onEdit && onEdit(member)} 
                    className="p-2 sm:p-3 rounded-xl sm:rounded-2xl text-slate-400 hover:text-amber-500 hover:bg-amber-500/10 transition-all border border-transparent hover:border-amber-500/20"
                    title={common.edit}
                  >
                    <Edit className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </button>
                  {member.is_active ? (
                    <button 
                      onClick={() => onDelete && onDelete(member)} 
                      className="p-2 sm:p-3 rounded-xl sm:rounded-2xl text-slate-400 hover:text-red-500 hover:bg-red-500/10 transition-all border border-transparent hover:border-red-500/20"
                      title={common.delete}
                    >
                      <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    </button>
                  ) : (
                    <button 
                      onClick={() => onRestore && onRestore(member)} 
                      className="p-2 sm:p-3 rounded-xl sm:rounded-2xl text-slate-400 hover:text-green-500 hover:bg-green-500/10 transition-all border border-transparent hover:border-green-500/20"
                      title="Tiklash"
                    >
                      <RotateCcw className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    </button>
                  )}
                </div>
              </td>
            </motion.tr>
          ))}
          {staff.length === 0 && (
            <tr>
              <td colSpan="6" className="p-12 sm:p-24 text-center">
                <div className="flex flex-col items-center justify-center">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 bg-slate-100 dark:bg-white/5 rounded-2xl sm:rounded-[32px] flex items-center justify-center mb-4 sm:mb-6 opacity-50">
                    <Briefcase className="w-8 h-8 sm:w-10 sm:h-10 text-slate-400" />
                  </div>
                  <p className="text-base sm:text-xl font-black dark:text-white text-slate-900">{t.messages.noStaff}</p>
                  <p className="text-xs sm:text-sm font-bold dark:text-slate-500 text-slate-400 mt-1.5 sm:mt-2">Hozircha hech qanday xodim ro'yxatga olinmagan.</p>
                </div>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default StaffTable;
