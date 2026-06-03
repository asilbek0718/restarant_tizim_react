import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, Clock, Users, FileText, CheckCircle2 } from 'lucide-react';
import useTableStore from '@/store/tables/tableStore';
import useReservationStore from '@/store/tables/reservationStore';
import { TABLE_STATUS } from '@/shared/constants/statuses';

const ReservationFormModal = ({ isOpen, onClose, reservation = null }) => {
  const { tables, findAvailableTableForReservation, syncTableStatus } = useTableStore();
  const { reservations, addReservation, updateReservation } = useReservationStore();
  
  const getLocalDateString = () => {
    const now = new Date();
    return now.toLocaleDateString('en-CA'); // Returns YYYY-MM-DD in local time
  };

  const [formData, setFormData] = useState({
    customerName: '',
    phone: '',
    date: getLocalDateString(),
    time: '19:00',
    partySize: 2,
    tableId: '',
    notes: '',
    status: 'confirmed'
  });
  
  const [error, setError] = useState('');
  const [activeZone, setActiveZone] = useState('all');
  const zones = ['all', ...new Set(tables.map(t => t.zone))];

  useEffect(() => {
    if (isOpen) {
      if (reservation) {
        setFormData(reservation);
        const t = tables.find(tab => tab.id === reservation.tableId);
        if (t) setActiveZone(t.zone);
      } else {
        setFormData({
          customerName: '',
          phone: '',
          date: getLocalDateString(),
          time: '19:00',
          partySize: 2,
          tableId: '',
          notes: '',
          status: 'confirmed'
        });
        setActiveZone('all');
      }
      setError('');
    }
    // We explicitly exclude 'tables' to prevent form resets during background polling
  }, [isOpen, reservation]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    const today = getLocalDateString();

    if (!formData.customerName || !formData.phone || !formData.tableId) {
      setError("Iltimos, barcha majburiy maydonlarni to'ldiring (Ism, Telefon, Stol).");
      return;
    }

    const tableObj = tables.find(t => t.id === formData.tableId);
    if (!tableObj) {
      setError("Tanlangan stol topilmadi.");
      return;
    }

    const resData = {
      ...formData,
      tableNumber: tableObj.number,
      zone: tableObj.zone
    };

    // 1. Handle Reservation State
    if (reservation?.id) {
      // If table changed, clear the old table first
      if (reservation.tableId !== formData.tableId && reservation.date === today) {
        syncTableStatus(reservation.tableId, TABLE_STATUS.EMPTY);
      }
      updateReservation(reservation.id, resData);
    } else {
      addReservation(resData);
    }

    // 2. Handle Table Status Sync (Only for today's confirmed reservations)
    if (resData.status === 'confirmed' && resData.date === today) {
      syncTableStatus(formData.tableId, TABLE_STATUS.RESERVED);
    }

    onClose();
  };

  const getAvailableTablesForSelection = () => {
    return tables.filter(t => {
      // Must be EMPTY or already be the table of the reservation being edited
      const isStatusOk = t.status === TABLE_STATUS.EMPTY || (reservation && t.id === reservation.tableId);
      const isZoneOk = activeZone === 'all' || t.zone === activeZone;
      
      // Prevent selecting tables that already have a confirmed reservation for today
      // (Except for the one we are editing)
      const hasOtherRes = reservations.some(r => 
        r.tableId === t.id && 
        r.status === 'confirmed' && 
        r.date === formData.date && 
        (!reservation || r.id !== reservation.id)
      );

      return isStatusOk && isZoneOk && !hasOtherRes;
    });
  };

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
      >
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="w-full max-w-xl bg-white dark:bg-[#111111] border dark:border-white/10 border-slate-200 rounded-2xl sm:rounded-[32px] shadow-2xl overflow-hidden flex flex-col max-h-[95vh] sm:max-h-[90vh]"
        >
          <div className="p-4 sm:p-8 flex items-center justify-between border-b dark:border-white/5 border-slate-100">
            <div>
              <h2 className="text-lg sm:text-xl font-black dark:text-white text-slate-900 tracking-tight">
                {reservation ? 'Band qilishni tahrirlash' : 'Yangi bron qilish'}
              </h2>
              <p className="text-[9px] sm:text-[10px] font-bold text-slate-500 uppercase tracking-[2px] mt-1">Professional Bron Tizimi</p>
            </div>
            <button 
              onClick={onClose}
              className="p-2 sm:p-2.5 rounded-full bg-slate-100 dark:bg-white/5 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>

          <div className="p-4 sm:p-8 overflow-y-auto custom-scrollbar">
            {error && (
              <div className="mb-4 sm:mb-6 p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs sm:text-sm font-bold flex items-center gap-2">
                <X className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
                {error}
              </div>
            )}

            <form id="reservation-form" onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
              {/* Step 1: Hall & Table Selection */}
              <div className="p-4 sm:p-5 rounded-2xl sm:rounded-3xl bg-slate-50 dark:bg-white/[0.02] border dark:border-white/5 space-y-3 sm:space-y-4">
                <div className="flex items-center gap-2 mb-1 sm:mb-2">
                  <div className="w-1 h-3.5 sm:w-1 sm:h-4 bg-primary-500 rounded-full" />
                  <h4 className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest">Joylashuvni tanlang</h4>
                </div>
                
                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-slate-500">Zal tanlash</label>
                    <select 
                      value={activeZone}
                      onChange={(e) => setActiveZone(e.target.value)}
                      className="w-full bg-white dark:bg-white/5 border dark:border-white/10 border-slate-200 rounded-xl sm:rounded-2xl px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm focus:ring-2 focus:ring-primary-500/50 outline-none transition-all font-bold dark:text-white text-slate-900"
                    >
                      {zones.map(z => (
                        <option key={z} value={z} className="text-slate-900">{z === 'all' ? 'Barcha zallar' : z}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-slate-500">Bo'sh stollar</label>
                    <select 
                      value={formData.tableId}
                      onChange={(e) => setFormData({...formData, tableId: e.target.value})}
                      className="w-full bg-white dark:bg-white/5 border dark:border-white/10 border-slate-200 rounded-xl sm:rounded-2xl px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm focus:ring-2 focus:ring-primary-500/50 outline-none transition-all font-bold dark:text-white text-slate-900"
                      required
                    >
                      <option value="" className="text-slate-900">Stol tanlang...</option>
                      {getAvailableTablesForSelection().map(t => (
                        <option key={t.id} value={t.id} className="text-slate-900">
                          #{t.number} ({t.capacity} kishilik, {t.zone})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Step 2: Customer Details */}
              <div className="grid grid-cols-2 gap-3 sm:gap-5">
                <div className="col-span-2 space-y-1.5">
                  <label className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-slate-500">Mijozning To'liq Ismi</label>
                  <input 
                    type="text" 
                    value={formData.customerName}
                    onChange={(e) => setFormData({...formData, customerName: e.target.value})}
                    placeholder="Masalan: Aziz Karimov"
                    className="w-full bg-slate-50 dark:bg-white/5 border dark:border-white/10 border-slate-200 rounded-xl sm:rounded-2xl px-3 sm:px-5 py-2.5 sm:py-3.5 text-xs sm:text-sm focus:ring-2 focus:ring-primary-500/50 outline-none transition-all font-bold dark:text-white text-slate-900"
                    required
                  />
                </div>
                
                <div className="col-span-1 space-y-1.5">
                  <label className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-slate-500">Telefon raqami</label>
                  <input 
                    type="tel" 
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    placeholder="+998 90 123 45 67"
                    className="w-full bg-slate-50 dark:bg-white/5 border dark:border-white/10 border-slate-200 rounded-xl sm:rounded-2xl px-3 sm:px-5 py-2.5 sm:py-3.5 text-xs sm:text-sm focus:ring-2 focus:ring-primary-500/50 outline-none transition-all font-bold dark:text-white text-slate-900"
                    required
                  />
                </div>

                <div className="col-span-1 space-y-1.5">
                  <label className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-slate-500">Vaqt</label>
                  <input 
                    type="time" 
                    value={formData.time}
                    onChange={(e) => setFormData({...formData, time: e.target.value})}
                    className="w-full bg-slate-50 dark:bg-white/5 border dark:border-white/10 border-slate-200 rounded-xl sm:rounded-2xl px-3 sm:px-5 py-2.5 sm:py-3.5 text-xs sm:text-sm focus:ring-2 focus:ring-primary-500/50 outline-none transition-all font-bold dark:text-white text-slate-900"
                    required
                  />
                </div>

                <div className="col-span-1 space-y-1.5">
                  <label className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-slate-500">Sana</label>
                  <input 
                    type="date" 
                    value={formData.date}
                    min={new Date().toISOString().split('T')[0]}
                    onChange={(e) => setFormData({...formData, date: e.target.value})}
                    className="w-full bg-slate-50 dark:bg-white/5 border dark:border-white/10 border-slate-200 rounded-xl sm:rounded-2xl px-3 sm:px-5 py-2.5 sm:py-3.5 text-xs sm:text-sm focus:ring-2 focus:ring-primary-500/50 outline-none transition-all font-bold dark:text-white text-slate-900"
                    required
                  />
                </div>

                <div className="col-span-1 space-y-1.5">
                  <label className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-slate-500 text-center">Kishi soni</label>
                  <input 
                    type="number" 
                    min="1"
                    value={formData.partySize}
                    onChange={(e) => setFormData({...formData, partySize: parseInt(e.target.value) || 1})}
                    className="w-full bg-slate-50 dark:bg-white/5 border dark:border-white/10 border-slate-200 rounded-xl sm:rounded-2xl px-3 sm:px-5 py-2.5 sm:py-3.5 text-xs sm:text-sm focus:ring-2 focus:ring-primary-500/50 outline-none transition-all font-bold dark:text-white text-slate-900"
                    required
                  />
                </div>

                <div className="col-span-2 space-y-1.5">
                  <label className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-slate-500">Izohlar (ixtiyoriy)</label>
                  <textarea 
                    value={formData.notes}
                    onChange={(e) => setFormData({...formData, notes: e.target.value})}
                    placeholder="Qo'shimcha ma'lumotlar..."
                    rows={2}
                    className="w-full bg-slate-50 dark:bg-white/5 border dark:border-white/10 border-slate-200 rounded-xl sm:rounded-2xl px-3 sm:px-5 py-2 sm:py-3 text-xs sm:text-sm focus:ring-2 focus:ring-primary-500/50 outline-none transition-all font-bold dark:text-white text-slate-900 resize-none"
                  />
                </div>

                {reservation && (
                  <div className="col-span-2 space-y-1.5 mt-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Holati</label>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setFormData({...formData, status: 'pending'})}
                        className={`flex-1 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${formData.status === 'pending' ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/30' : 'bg-slate-100 dark:bg-white/5 text-slate-500 hover:bg-amber-500/10 hover:text-amber-500'}`}
                      >
                        Kutilmoqda
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormData({...formData, status: 'confirmed'})}
                        className={`flex-1 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${formData.status === 'confirmed' ? 'bg-green-500 text-white shadow-lg shadow-green-500/30' : 'bg-slate-100 dark:bg-white/5 text-slate-500 hover:bg-green-500/10 hover:text-green-500'}`}
                      >
                        Tasdiqlangan
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </form>
          </div>

          <div className="p-4 sm:p-8 border-t dark:border-white/5 border-slate-100 bg-slate-50/50 dark:bg-white/[0.02]">
            <button 
              type="submit"
              form="reservation-form"
              className="w-full py-3 sm:py-4 rounded-xl sm:rounded-[20px] bg-primary-500 hover:bg-primary-600 text-white font-black text-xs sm:text-sm transition-all shadow-[0_8px_30px_rgb(14,165,233,0.3)] hover:-translate-y-1 hover:shadow-primary-500/50 flex items-center justify-center gap-2 uppercase tracking-widest"
            >
              <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5" />
              {reservation ? 'Saqlash' : 'Band qilish'}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ReservationFormModal;
