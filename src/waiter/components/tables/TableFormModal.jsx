import React, { useState, useEffect } from 'react';
import { X, Save, Trash2 } from 'lucide-react';
import { tableService } from '@/shared/services/tableService';
import useTableStore from '@/store/tables/tableStore';

const TableFormModal = ({ isOpen, onClose, table }) => {
  const tables = useTableStore(state => state.tables);
  const [formData, setFormData] = useState({
    number: '',
    capacity: 4,
    zone: 'Main'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setError('');
    if (table) {
      setFormData({
        number: table.number,
        capacity: table.capacity,
        zone: table.zone
      });
    } else {
      setFormData({
        number: '',
        capacity: 4,
        zone: 'Main'
      });
    }
  }, [table, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const normalizedNumber = formData.number.toString().trim().toLowerCase();

    // Realtime-safe verification: check against all active tables
    const isDuplicate = tables.some(t => {
      if (table && t.id === table.id) return false;
      return String(t.number || '').trim().toLowerCase() === normalizedNumber ||
             String(t.tableNumber || '').trim().toLowerCase() === normalizedNumber;
    });

    if (isDuplicate) {
      setError("Bu stol raqami allaqachon mavjud");
      setLoading(false);
      return;
    }

    try {
      if (table) {
        await tableService.updateTable(table.id, formData);
      } else {
        await tableService.createTable(formData);
      }

      onClose();
    } catch (err) {
      console.error('TABLE_SAVE_ERROR:', err);
      setError(err.message || 'Stolni saqlashda xatolik yuz berdi');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Haqiqatan ham ushbu stolni o\'chirmoqchimisiz?')) {
      try {
        await tableService.deleteTable(table.id);
        onClose();
      } catch (error) {
        console.error('TABLE_DELETE_ERROR:', error);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-md glass-card rounded-2xl sm:rounded-[32px] overflow-hidden animate-in fade-in zoom-in duration-300">
        <div className="p-5 sm:p-8">
          <div className="flex justify-between items-center mb-6 sm:mb-8">
            <h2 className="text-xl sm:text-2xl font-black dark:text-white text-slate-900 uppercase tracking-tighter">
              {table ? 'Stolni tahrirlash' : 'Yangi stol qo\'shish'}
            </h2>
            <button onClick={onClose} className="p-1.5 sm:p-2 hover:bg-slate-100 dark:hover:bg-white/10 rounded-full transition-all">
              <X className="w-5 h-5 sm:w-6 sm:h-6 text-slate-500" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            <div className="space-y-1.5 sm:space-y-2">
              <label className="text-[10px] sm:text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Stol raqami</label>
              <input
                type="text"
                required
                value={formData.number}
                onChange={(e) => {
                  setError('');
                  setFormData({ ...formData, number: e.target.value });
                }}
                placeholder="Masalan: 01"
                className={`w-full px-4 sm:px-6 py-2.5 sm:py-4 bg-slate-50 dark:bg-white/[0.04] border ${error ? 'border-red-500 focus:border-red-500' : 'border-slate-200 dark:border-white/[0.08] focus:border-primary-500'} rounded-xl sm:rounded-[24px] outline-none transition-all font-bold dark:text-white text-xs sm:text-sm`}
              />
              {error && (
                <p className="text-xs font-bold text-red-500 mt-1 sm:mt-1.5 animate-pulse ml-1">
                  {error}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5 sm:space-y-2">
                <label className="text-[10px] sm:text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Sig'imi</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={formData.capacity}
                  onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) })}
                  className="w-full px-4 sm:px-6 py-2.5 sm:py-4 bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] rounded-xl sm:rounded-[24px] outline-none focus:border-primary-500 transition-all font-bold dark:text-white text-xs sm:text-sm"
                />
              </div>
              <div className="space-y-1.5 sm:space-y-2">
                <label className="text-[10px] sm:text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Zona</label>
                <select
                  value={formData.zone}
                  onChange={(e) => setFormData({ ...formData, zone: e.target.value })}
                  className="w-full px-4 sm:px-6 py-2.5 sm:py-4 bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] rounded-xl sm:rounded-[24px] outline-none focus:border-primary-500 transition-all font-bold dark:text-white appearance-none text-xs sm:text-sm"
                >
                  <option value="Main">Asosiy zal</option>
                  <option value="Patio">Veranda</option>
                  <option value="Bar">Bar</option>
                  <option value="VIP">VIP xona</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3 sm:gap-4 pt-2 sm:pt-4">
              {table && (
                <button
                  type="button"
                  onClick={handleDelete}
                  className="p-2.5 sm:p-4 rounded-xl sm:rounded-[24px] bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white transition-all group"
                >
                  <Trash2 className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>
              )}
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-2.5 sm:py-4 bg-primary-500 hover:bg-primary-600 text-white font-black rounded-xl sm:rounded-[24px] shadow-xl shadow-primary-500/30 transition-all active:scale-95 flex items-center justify-center gap-1.5 sm:gap-2 text-xs sm:text-sm uppercase tracking-widest"
              >
                {loading ? (
                  <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Save className="w-4 h-4 sm:w-5 sm:h-5" />
                    Saqlash
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default TableFormModal;
