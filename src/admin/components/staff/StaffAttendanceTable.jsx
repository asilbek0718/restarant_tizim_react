import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, XCircle, Clock, Calendar } from 'lucide-react';
import { TRANSLATIONS } from '@/shared/constants/translations';
import useStaffStore from '@/store/staff/staffStore';

const StaffAttendanceTable = ({ records = [] }) => {
  const t = TRANSLATIONS.staff;
  const { staff } = useStaffStore();

  const getStatusIcon = (status) => {
    switch(status) {
      case 'present': return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case 'absent': return <XCircle className="w-4 h-4 text-red-500" />;
      case 'late': return <Clock className="w-4 h-4 text-amber-500" />;
      default: return null;
    }
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'present': return 'bg-green-500/10 text-green-600 border-green-500/20 dark:text-green-400';
      case 'absent': return 'bg-red-500/10 text-red-600 border-red-500/20 dark:text-red-400';
      case 'late': return 'bg-amber-500/10 text-amber-600 border-amber-500/20 dark:text-amber-400';
      default: return 'bg-slate-500/10 text-slate-600 border-slate-500/20';
    }
  };

  const formatTime = (isoString) => {
    if (!isoString) return '-';
    return new Date(isoString).toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (isoString) => {
    if (!isoString) return '-';
    return new Date(isoString).toLocaleDateString('uz-UZ', { day: '2-digit', month: '2-digit' });
  };

  return (
    <div className="glass-card rounded-[24px] sm:rounded-[32px] border dark:border-white/[0.08] border-slate-200/80 bg-white/60 dark:bg-[#111111]/80 backdrop-blur-2xl overflow-hidden shadow-sm h-full flex flex-col">
      <div className="p-4 sm:p-6 border-b dark:border-white/5 border-slate-100 bg-slate-50/50 dark:bg-white/[0.04] flex items-center justify-between">
        <h3 className="text-lg sm:text-xl font-black tracking-tight dark:text-white text-slate-900">{t.attendance}</h3>
        <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-slate-400" />
      </div>
      <div className="overflow-x-auto flex-1 custom-scrollbar">
        <table className="w-full text-left border-collapse min-w-[500px]">
          <thead>
            <tr className="border-b dark:border-white/[0.08] border-slate-200/80">
              <th className="p-3 sm:p-5 pl-4 sm:pl-8 text-[9px] sm:text-[10px] font-black dark:text-slate-400 text-slate-500 uppercase tracking-widest">Sana</th>
              <th className="p-3 sm:p-5 text-[9px] sm:text-[10px] font-black dark:text-slate-400 text-slate-500 uppercase tracking-widest">Xodim</th>
              <th className="p-3 sm:p-5 text-[9px] sm:text-[10px] font-black dark:text-slate-400 text-slate-500 uppercase tracking-widest">Kelish / Ketish</th>
              <th className="p-3 sm:p-5 pr-4 sm:pr-8 text-[9px] sm:text-[10px] font-black dark:text-slate-400 text-slate-500 uppercase tracking-widest text-right">Holat</th>
            </tr>
          </thead>
          <tbody className="divide-y dark:divide-white/5 divide-slate-100">
            {records.slice(0, 10).map((record, idx) => {
              const employee = staff.find(s => s.id === record.staffId);
              return (
                <motion.tr 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(idx * 0.05, 0.5) }}
                  key={record.id || idx} 
                  className="hover:bg-white dark:hover:bg-white/5 transition-all group"
                >
                  <td className="p-3 sm:p-5 pl-4 sm:pl-8 text-xs sm:text-sm font-black dark:text-white text-slate-900 group-hover:text-primary-500 transition-colors">
                    {formatDate(record.checkIn)}
                  </td>
                  <td className="p-3 sm:p-5">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl overflow-hidden bg-primary-500/10 text-primary-500 flex items-center justify-center font-black text-xs shrink-0 border border-primary-500/20 shadow-sm">
                        {employee?.avatar ? (
                          <img src={employee.avatar} alt="Avatar" className="w-full h-full object-cover" />
                        ) : (
                          employee?.name?.charAt(0) || '?'
                        )}
                      </div>
                      <span className="text-xs font-bold dark:text-gray-300 text-slate-700 truncate max-w-[100px] sm:max-w-[120px]">
                        {employee?.name || 'Noma\'lum'}
                      </span>
                    </div>
                  </td>
                  <td className="p-3 sm:p-5">
                    <div className="flex flex-col gap-0.5">
                       <span className="text-xs font-black dark:text-white text-slate-900">{formatTime(record.checkIn)}</span>
                       <span className="text-[10px] font-bold text-slate-400">{formatTime(record.checkOut)}</span>
                    </div>
                  </td>
                  <td className="p-3 sm:p-5 pr-4 sm:pr-8 text-right">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 sm:px-3 sm:py-1.5 rounded-lg sm:rounded-xl text-[8px] sm:text-[9px] font-black uppercase tracking-widest border transition-all ${getStatusBadge(record.status)}`}>
                      {getStatusIcon(record.status)}
                      {record.status === 'present' ? 'KELDİ' : record.status === 'late' ? 'KECHİKDİ' : 'YO\'Q'}
                    </span>
                  </td>
                </motion.tr>
              );
            })}
            {records.length === 0 && (
              <tr>
                <td colSpan="4" className="p-20 text-center">
                  <div className="flex flex-col items-center justify-center">
                    <div className="w-16 h-16 bg-slate-50 dark:bg-white/5 rounded-2xl flex items-center justify-center mb-4 opacity-50">
                       <Calendar className="w-8 h-8 text-slate-400" />
                    </div>
                    <p className="text-sm font-bold dark:text-slate-500 text-slate-400">Davomat ma'lumotlari mavjud emas</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StaffAttendanceTable;
