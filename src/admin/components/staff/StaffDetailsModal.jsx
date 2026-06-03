import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Clock, Activity, Calendar, Phone, DollarSign, Briefcase, Shield } from 'lucide-react';
import { TRANSLATIONS } from '@/shared/constants/translations';
import useStaffStore from '@/store/staff/staffStore';
import StaffRoleBadge from './StaffRoleBadge';

const StaffDetailsModal = ({ isOpen, onClose, staff }) => {
  const t = TRANSLATIONS.staff;
  const common = TRANSLATIONS.common;
  const { getEmployeeActivity, getEmployeeAttendance } = useStaffStore();

  if (!isOpen || !staff) return null;

  const activity = getEmployeeActivity(staff.id);
  const attendance = getEmployeeAttendance(staff.id);

  const formatTime = (isoString) => {
    if (!isoString) return '-';
    return new Date(isoString).toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (isoString) => {
    if (!isoString) return '-';
    return new Date(isoString).toLocaleDateString('uz-UZ', { day: '2-digit', month: 'long', year: 'numeric' });
  };

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        exit={{ opacity: 0 }} 
        onClick={onClose} 
        className="fixed inset-0 z-[110] bg-slate-900/60 dark:bg-black/80 backdrop-blur-md" 
      />
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, x: '100%' }} 
        animate={{ opacity: 1, scale: 1, x: 0 }} 
        exit={{ opacity: 0, scale: 0.95, x: '100%' }} 
        transition={{ type: "spring", damping: 25, stiffness: 200 }} 
        className="fixed top-0 right-0 h-full z-[110] w-full max-w-2xl pointer-events-none"
      >
        <div className="bg-white dark:bg-[#0f0f0f] h-full shadow-2xl border-l dark:border-white/[0.08] border-slate-200 pointer-events-auto flex flex-col overflow-hidden">
          {/* Header */}
          <div className="p-8 border-b dark:border-white/[0.08] border-slate-100 flex items-center justify-between bg-slate-50/50 dark:bg-white/[0.02]">
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 rounded-[28px] overflow-hidden border-4 border-white dark:border-white/10 shadow-xl">
                {staff.avatar ? (
                  <img src={staff.avatar} alt={staff.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-primary-500/10 flex items-center justify-center text-primary-500 font-black text-3xl">
                    {staff.name?.charAt(0)}
                  </div>
                )}
              </div>
              <div>
                <h2 className="text-2xl font-black dark:text-white text-slate-900 leading-tight">{staff.name}</h2>
                <div className="flex items-center gap-3 mt-2">
                  <StaffRoleBadge role={staff.role} />
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">ID: {staff.employeeId || '—'}</span>
                </div>
              </div>
            </div>
            <button 
              onClick={onClose} 
              className="p-3 rounded-2xl hover:bg-slate-200 dark:hover:bg-white/10 transition-all bg-white dark:bg-black/20 shadow-sm border border-slate-100 dark:border-white/5"
            >
              <X className="w-5 h-5 dark:text-slate-400 text-slate-500" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar p-8 space-y-10">
            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-50 dark:bg-white/[0.03] p-6 rounded-[32px] border border-slate-100 dark:border-white/5">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">{t.salary}</p>
                <p className="text-xl font-black dark:text-white text-slate-900">{(staff.salary || 0).toLocaleString()} <span className="text-xs text-slate-400 font-bold uppercase">sum</span></p>
              </div>
              <div className="bg-slate-50 dark:bg-white/[0.03] p-6 rounded-[32px] border border-slate-100 dark:border-white/5">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">{t.performance}</p>
                <div className="flex items-center gap-2">
                   <div className="flex-1 h-2 bg-slate-200 dark:bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full bg-primary-500 rounded-full" style={{ width: `${staff.performance || 0}%` }} />
                   </div>
                   <span className="text-sm font-black dark:text-white text-slate-900">{staff.performance || 0}%</span>
                </div>
              </div>
            </div>

            {/* Info Section */}
            <div className="space-y-4">
               <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] ml-2">Asosiy ma'lumotlar</h4>
               <div className="grid grid-cols-1 gap-3">
                  <div className="flex items-center gap-4 p-5 bg-white dark:bg-white/[0.02] rounded-[24px] border border-slate-100 dark:border-white/5">
                     <div className="p-3 rounded-xl bg-primary-500/10 text-primary-500">
                        <Phone className="w-4 h-4" />
                     </div>
                     <div>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">{t.phone}</p>
                        <p className="text-sm font-bold dark:text-white text-slate-900">{staff.phone || '—'}</p>
                     </div>
                  </div>
                  <div className="flex items-center gap-4 p-5 bg-white dark:bg-white/[0.02] rounded-[24px] border border-slate-100 dark:border-white/5">
                     <div className="p-3 rounded-xl bg-amber-500/10 text-amber-500">
                        <Clock className="w-4 h-4" />
                     </div>
                     <div>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">{t.shift}</p>
                        <p className="text-sm font-bold dark:text-white text-slate-900">{t.shifts[staff.shift] || staff.shift || '—'}</p>
                     </div>
                  </div>
               </div>
            </div>

            {/* Activity Tabs */}
            <div className="space-y-6">
               <div className="flex items-center gap-6 border-b dark:border-white/10 border-slate-100 pb-4">
                  <button className="text-sm font-black dark:text-white text-slate-900 uppercase tracking-widest relative">
                     {t.activity}
                     <div className="absolute -bottom-4 left-0 right-0 h-1 bg-primary-500 rounded-t-full" />
                  </button>
                  <button className="text-sm font-black text-slate-400 uppercase tracking-widest hover:text-slate-600 transition-colors">
                     {t.attendance}
                  </button>
               </div>

               <div className="space-y-6">
                  {activity.length > 0 ? activity.map((log, idx) => (
                    <div key={log.id} className="flex gap-4 relative">
                       {idx !== activity.length - 1 && <div className="absolute left-6 top-10 bottom-0 w-0.5 bg-slate-100 dark:bg-white/5" />}
                       <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 z-10 border-2 border-white dark:border-[#0f0f0f] shadow-sm ${
                         log.action === 'check_in' ? 'bg-green-500/10 text-green-500' : 
                         log.action === 'check_out' ? 'bg-red-500/10 text-red-500' :
                         'bg-primary-500/10 text-primary-500'
                       }`}>
                          <Activity className="w-5 h-5" />
                       </div>
                       <div className="flex-1 pt-1">
                          <p className="text-sm font-bold dark:text-white text-slate-900">{log.description}</p>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">
                             {formatDate(log.timestamp)} • {formatTime(log.timestamp)}
                          </p>
                       </div>
                    </div>
                  )) : (
                    <div className="py-10 text-center opacity-40">
                       <Activity className="w-10 h-10 mx-auto mb-3" />
                       <p className="text-xs font-bold">Faollik tarixi mavjud emas</p>
                    </div>
                  )}
               </div>
            </div>

            {/* Notes Section */}
            {staff.notes && (
              <div className="p-6 bg-amber-500/5 rounded-[32px] border border-amber-500/10">
                 <h4 className="text-[10px] font-black text-amber-600 uppercase tracking-widest mb-3 flex items-center gap-2">
                    <Shield className="w-3 h-3" /> {t.notes}
                 </h4>
                 <p className="text-sm font-medium text-slate-700 dark:text-slate-300 italic leading-relaxed">
                    "{staff.notes}"
                 </p>
              </div>
            )}
          </div>
          
          <div className="p-8 border-t dark:border-white/[0.08] border-slate-100 bg-slate-50/50 dark:bg-white/[0.02]">
             <button 
               onClick={onClose}
               className="w-full py-5 rounded-[24px] bg-slate-900 dark:bg-white text-white dark:text-black font-black text-xs uppercase tracking-widest hover:scale-[1.02] transition-all shadow-xl"
             >
                Yopish
             </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default StaffDetailsModal;
