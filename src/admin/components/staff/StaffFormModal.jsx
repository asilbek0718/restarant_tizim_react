import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, Upload, User as UserIcon, Phone, Briefcase, DollarSign, Clock, FileText } from 'lucide-react';
import { TRANSLATIONS } from '@/shared/constants/translations';
import useStaffStore from '@/store/staff/staffStore';

const StaffFormModal = ({ isOpen, onClose, staff, onSave }) => {
  const t = TRANSLATIONS.staff;
  const common = TRANSLATIONS.common;
  const { shifts } = useStaffStore();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: '',
    status: 'offline',
    shift: 'morning',
    salary: '',
    notes: '',
    avatar: null,
    employeeId: ''
  });

  useEffect(() => {
    if (staff) {
      setFormData({
        ...staff,
        salary: staff.salary || '',
        notes: staff.notes || '',
        shift: staff.shift || 'morning',
        status: staff.status || 'offline'
      });
    } else {
      setFormData({
        name: '',
        email: '',
        phone: '',
        role: '',
        status: 'offline',
        shift: 'morning',
        salary: '',
        notes: '',
        avatar: null,
        employeeId: ''
      });
    }
  }, [staff, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave && onSave({
      ...formData,
      salary: Number(formData.salary) || 0
    });
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            onClick={onClose} 
            className="fixed inset-0 z-[100] bg-slate-900/60 dark:bg-black/80 backdrop-blur-md" 
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }} 
            animate={{ opacity: 1, scale: 1, y: 0 }} 
            exit={{ opacity: 0, scale: 0.95, y: 20 }} 
            transition={{ type: "spring", damping: 25, stiffness: 300 }} 
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 pointer-events-none"
          >
            <div className="bg-white/95 dark:bg-[#121212]/95 backdrop-blur-3xl w-full max-w-5xl h-full sm:h-auto sm:max-h-[95vh] rounded-none sm:rounded-[40px] shadow-2xl border-0 sm:border dark:border-white/[0.08] border-slate-200/80 flex flex-col pointer-events-auto overflow-hidden">
              <div className="p-4 sm:p-8 border-b dark:border-white/[0.08] border-slate-100 flex items-center justify-between bg-slate-50/50 dark:bg-white/[0.04]">
                <div>
                  <h2 className="text-xl sm:text-3xl font-black tracking-tight dark:text-white text-slate-900">
                    {staff ? t.editEmployee : t.addEmployee}
                  </h2>
                  <p className="text-[10px] sm:text-sm font-bold dark:text-slate-400 text-slate-500 mt-1 sm:mt-2">
                    Professional xodim ma'lumotlarini boshqarish tizimi
                  </p>
                </div>
                <button 
                  onClick={onClose} 
                  className="p-2 sm:p-3 rounded-2xl hover:bg-slate-200 dark:hover:bg-white/10 transition-all bg-white dark:bg-black/20 shadow-sm border border-slate-100 dark:border-white/5"
                >
                  <X className="w-5 h-5 dark:text-slate-400 text-slate-500" />
                </button>
              </div>

              <div className="p-4 sm:p-8 overflow-y-auto flex-1 custom-scrollbar">
                <form id="staff-form" onSubmit={handleSubmit} className="space-y-4 sm:space-y-8">
                  <div className="flex flex-col lg:flex-row gap-6 lg:gap-10">
                    {/* Left Column: Avatar and Status */}
                    <div className="w-full lg:w-[320px] flex flex-col gap-4 sm:gap-6 lg:gap-8">
                      <div className="aspect-[4/3] sm:aspect-square rounded-2xl sm:rounded-[40px] border-2 border-dashed dark:border-white/20 border-slate-300 bg-slate-50 dark:bg-white/[0.04] flex flex-col items-center justify-center relative overflow-hidden group cursor-pointer hover:border-primary-500 dark:hover:border-primary-500 transition-all duration-500">
                        {formData.avatar ? (
                          <>
                            <img src={formData.avatar} alt="Avatar" className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm">
                              <span className="text-white font-black text-xs uppercase tracking-widest bg-white/20 px-6 py-3 rounded-2xl border border-white/30">O'zgartirish</span>
                            </div>
                          </>
                        ) : (
                          <div className="text-center p-6">
                            <div className="w-20 h-20 bg-white dark:bg-black/40 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl border border-slate-100 dark:border-white/5">
                              <UserIcon className="w-10 h-10 text-slate-300 dark:text-slate-500" />
                            </div>
                            <p className="text-sm font-black dark:text-white text-slate-700 uppercase tracking-widest mb-2">Rasm yuklash</p>
                            <p className="text-[10px] font-bold dark:text-slate-500 text-slate-400 uppercase">Max: 2MB, JPG/PNG</p>
                          </div>
                        )}
                        <input type="file" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" accept="image/*" />
                      </div>
                      
                      <div className="space-y-6">
                        <div>
                          <label className="flex items-center gap-2 text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-3 ml-2">
                            <Clock className="w-3 h-3" /> {t.status}
                          </label>
                          <select 
                            name="status" 
                            value={formData.status} 
                            onChange={handleChange} 
                            className="w-full px-6 py-4 bg-slate-50 dark:bg-white/[0.04] border dark:border-white/[0.08] border-slate-200/80 focus:border-primary-500 focus:bg-white dark:focus:bg-[#1a1a1a] rounded-3xl text-sm font-bold outline-none transition-all dark:text-white appearance-none shadow-sm cursor-pointer"
                          >
                            {Object.entries(t.statuses).map(([key, value]) => (
                              <option key={key} value={key}>{value}</option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="flex items-center gap-2 text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-3 ml-2">
                            <Clock className="w-3 h-3" /> {t.shift}
                          </label>
                          <select 
                            name="shift" 
                            value={formData.shift} 
                            onChange={handleChange} 
                            className="w-full px-6 py-4 bg-slate-50 dark:bg-white/[0.04] border dark:border-white/[0.08] border-slate-200/80 focus:border-primary-500 focus:bg-white dark:focus:bg-[#1a1a1a] rounded-3xl text-sm font-bold outline-none transition-all dark:text-white appearance-none shadow-sm cursor-pointer"
                          >
                            {shifts.map(s => (
                              <option key={s.id} value={s.id}>{s.name}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Right Column: Information */}
                    <div className="flex-1 space-y-8">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="col-span-1 md:col-span-2">
                          <label className="flex items-center gap-2 text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-3 ml-2">
                            <UserIcon className="w-3 h-3" /> To'liq ism
                          </label>
                          <input 
                            type="text" 
                            name="name" 
                            required 
                            value={formData.name} 
                            onChange={handleChange} 
                            className="w-full px-6 py-4 bg-slate-50 dark:bg-white/[0.04] border dark:border-white/[0.08] border-slate-200/80 focus:border-primary-500 focus:bg-white dark:focus:bg-[#1a1a1a] rounded-3xl text-sm font-bold outline-none transition-all dark:text-white shadow-sm" 
                            placeholder="Sardor Aliyev" 
                          />
                        </div>
                        
                        <div>
                          <label className="flex items-center gap-2 text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-3 ml-2">
                            <Phone className="w-3 h-3" /> {t.phone}
                          </label>
                          <input 
                            type="tel" 
                            name="phone" 
                            required 
                            value={formData.phone} 
                            onChange={handleChange} 
                            className="w-full px-6 py-4 bg-slate-50 dark:bg-white/[0.04] border dark:border-white/[0.08] border-slate-200/80 focus:border-primary-500 focus:bg-white dark:focus:bg-[#1a1a1a] rounded-3xl text-sm font-bold outline-none transition-all dark:text-white shadow-sm" 
                            placeholder="+998 90 123 45 67" 
                          />
                        </div>

                        <div>
                          <label className="flex items-center gap-2 text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-3 ml-2">
                            <Briefcase className="w-3 h-3" /> {t.permissions}
                          </label>
                          <select 
                            name="role" 
                            required 
                            value={formData.role} 
                            onChange={handleChange} 
                            className="w-full px-6 py-4 bg-slate-50 dark:bg-white/[0.04] border dark:border-white/[0.08] border-slate-200/80 focus:border-primary-500 focus:bg-white dark:focus:bg-[#1a1a1a] rounded-3xl text-sm font-bold outline-none transition-all dark:text-white appearance-none shadow-sm cursor-pointer"
                          >
                            <option value="">Tanlang</option>
                            {Object.entries(t.roles).map(([key, value]) => (
                              <option key={key} value={key}>{value}</option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="flex items-center gap-2 text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-3 ml-2">
                            <DollarSign className="w-3 h-3" /> {t.salary}
                          </label>
                          <input 
                            type="number" 
                            name="salary" 
                            value={formData.salary} 
                            onChange={handleChange} 
                            className="w-full px-6 py-4 bg-slate-50 dark:bg-white/[0.04] border dark:border-white/[0.08] border-slate-200/80 focus:border-primary-500 focus:bg-white dark:focus:bg-[#1a1a1a] rounded-3xl text-sm font-bold outline-none transition-all dark:text-white shadow-sm" 
                            placeholder="5 000 000" 
                          />
                        </div>

                        <div>
                          <label className="flex items-center gap-2 text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-3 ml-2">
                            <FileText className="w-3 h-3" /> Xodim ID
                          </label>
                          <input 
                            type="text" 
                            name="employeeId" 
                            value={formData.employeeId} 
                            onChange={handleChange} 
                            className="w-full px-6 py-4 bg-slate-50 dark:bg-white/[0.04] border dark:border-white/[0.08] border-slate-200/80 focus:border-primary-500 focus:bg-white dark:focus:bg-[#1a1a1a] rounded-3xl text-sm font-bold outline-none transition-all dark:text-white shadow-sm" 
                            placeholder="EMP-001" 
                          />
                        </div>
                      </div>

                      <div>
                        <label className="flex items-center gap-2 text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-3 ml-2">
                          <FileText className="w-3 h-3" /> {t.notes}
                        </label>
                        <textarea 
                          name="notes" 
                          rows={4}
                          value={formData.notes} 
                          onChange={handleChange} 
                          className="w-full px-6 py-4 bg-slate-50 dark:bg-white/[0.04] border dark:border-white/[0.08] border-slate-200/80 focus:border-primary-500 focus:bg-white dark:focus:bg-[#1a1a1a] rounded-3xl text-sm font-bold outline-none transition-all dark:text-white shadow-sm resize-none" 
                          placeholder="Qo'shimcha ma'lumotlar..." 
                        />
                      </div>
                    </div>
                  </div>
                </form>
              </div>

              <div className="p-4 sm:p-8 border-t dark:border-white/[0.08] border-slate-100 bg-slate-50/80 dark:bg-black/20 flex flex-col-reverse sm:flex-row justify-end gap-3 sm:gap-4 backdrop-blur-2xl">
                <button 
                  onClick={onClose} 
                  className="w-full sm:w-auto px-6 sm:px-10 py-3 sm:py-5 rounded-xl sm:rounded-3xl border-2 dark:border-white/[0.08] border-slate-200/80 font-black text-xs dark:text-white text-slate-700 hover:bg-slate-100 dark:hover:bg-white/10 transition-all uppercase tracking-widest"
                >
                  {common.cancel}
                </button>
                <button 
                  type="submit" 
                  form="staff-form" 
                  className="w-full sm:w-auto px-6 sm:px-10 py-3 sm:py-5 rounded-xl sm:rounded-3xl bg-primary-500 hover:bg-primary-600 text-white font-black text-xs transition-all shadow-[0_20px_50px_rgba(14,165,233,0.3)] hover:shadow-primary-500/50 hover:-translate-y-1 flex items-center justify-center gap-2 sm:gap-3 uppercase tracking-widest"
                >
                  <Save className="w-4 h-4 sm:w-5 sm:h-5" /> {staff ? common.save : t.addEmployee}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default StaffFormModal;
