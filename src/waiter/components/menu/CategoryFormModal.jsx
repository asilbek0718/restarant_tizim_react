import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, AlertCircle } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

const categorySchema = z.object({
  name: z.string().min(2, "Nom kamida 2 ta belgidan iborat bo'lishi kerak"),
  icon: z.string().default('🍽️'),
});

const CategoryFormModal = ({ isOpen, onClose, category, onSave }) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting }
  } = useForm({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: '',
      icon: '🍽️',
    }
  });

  useEffect(() => {
    if (category) {
      reset(category);
    } else {
      reset({ name: '', icon: '🍽️' });
    }
  }, [category, isOpen, reset]);

  const onSubmit = (data) => {
    onSave && onSave(data);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 z-[110] bg-slate-900/60 dark:bg-black/80 backdrop-blur-md" />
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="fixed inset-0 z-[120] flex items-center justify-center p-4 pointer-events-none">
            <div className="bg-white dark:bg-[#121212] w-full max-w-md rounded-[32px] shadow-2xl border dark:border-white/10 border-slate-200 overflow-hidden pointer-events-auto">
              <div className="p-6 border-b dark:border-white/10 border-slate-100 flex items-center justify-between">
                <h3 className="text-xl font-black dark:text-white text-slate-900 uppercase tracking-tight">{category ? 'Kategoriyani tahrirlash' : 'Yangi kategoriya'}</h3>
                <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-white/10 transition-colors">
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 ml-2">Kategoriya nomi</label>
                  <input 
                    type="text" 
                    {...register('name')}
                    className="w-full px-5 py-4 bg-slate-50 dark:bg-white/[0.03] border dark:border-white/10 border-slate-200 rounded-2xl text-base font-bold outline-none transition-all dark:text-white focus:border-primary-500" 
                    placeholder="Burgerlar" 
                  />
                  {errors.name && <p className="text-red-500 text-[10px] font-bold mt-2 ml-4 uppercase tracking-wider flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.name.message}</p>}
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 ml-2">Ikonka (Emoji)</label>
                  <input 
                    type="text" 
                    {...register('icon')}
                    className="w-full px-5 py-4 bg-slate-50 dark:bg-white/[0.03] border dark:border-white/10 border-slate-200 rounded-2xl text-base font-bold outline-none transition-all dark:text-white focus:border-primary-500" 
                    placeholder="🍔" 
                  />
                </div>

                <div className="flex gap-4 pt-4">
                  <button type="button" onClick={onClose} className="flex-1 py-4 rounded-2xl border-2 dark:border-white/10 border-slate-200 font-black text-xs uppercase tracking-widest text-slate-500">Bekor qilish</button>
                  <button type="submit" disabled={isSubmitting} className="flex-1 py-4 rounded-2xl bg-primary-500 text-white font-black text-xs uppercase tracking-widest shadow-lg shadow-primary-500/20 hover:bg-primary-600 transition-all">
                    {category ? 'Saqlash' : 'Yaratish'}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CategoryFormModal;
