import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, Image as ImageIcon, AlertCircle } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

const foodSchema = z.object({
  name: z.string().min(3, "Nom kamida 3 ta belgidan iborat bo'lishi kerak"),
  category: z.string().min(1, "Kategoriya tanlanishi shart"),
  price: z.coerce.number().min(0, "Narx 0 dan katta bo'lishi kerak"),
  discountPrice: z.coerce.number().nullable().optional(),
  description: z.string().optional(),
  status: z.enum(['available', 'unavailable', 'hidden', 'out_of_stock']).default('available'),
  spicyLevel: z.coerce.number().min(0).max(3).default(0),
  cookingTime: z.coerce.number().min(0).default(15),
  ingredients: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
  image: z.any().optional(),
});

const FoodFormModal = ({ isOpen, onClose, food, onSave, categories = [] }) => {
  const [imagePreview, setImagePreview] = useState(null);
  const [activeTab, setActiveTab] = useState('general'); // general, details, status

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting }
  } = useForm({
    resolver: zodResolver(foodSchema),
    defaultValues: {
      name: '',
      category: '',
      price: '',
      discountPrice: null,
      description: '',
      status: 'available',
      spicyLevel: 0,
      cookingTime: 15,
      ingredients: [],
      tags: [],
    }
  });

  useEffect(() => {
    if (food) {
      reset({
        ...food,
        price: food.price?.toString() || '',
        discountPrice: food.discountPrice?.toString() || null,
        cookingTime: food.cookingTime?.toString() || '15',
        spicyLevel: food.spicyLevel || 0,
        ingredients: food.ingredients || [],
        tags: food.tags || [],
      });
      setImagePreview(food.image);
    } else {
      reset({
        name: '',
        category: '',
        price: '',
        discountPrice: null,
        description: '',
        status: 'available',
        spicyLevel: 0,
        cookingTime: 15,
        ingredients: [],
        tags: [],
      });
      setImagePreview(null);
    }
    setActiveTab('general');
  }, [food, isOpen, reset]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("Rasm hajmi 5MB dan oshmasligi kerak");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
        setValue('image', reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = (data) => {
    onSave && onSave({ ...food, ...data });
  };

  if (!isOpen) return null;

  const tabs = [
    { id: 'general', label: 'Asosiy', icon: Save },
    { id: 'details', label: 'Tafsilotlar', icon: ImageIcon },
    { id: 'status', label: 'Holati', icon: AlertCircle },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 z-[100] bg-slate-900/60 dark:bg-black/80 backdrop-blur-md" />
          <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} transition={{ type: "spring", damping: 25, stiffness: 300 }} className="fixed inset-0 z-[100] flex items-center justify-center p-0 sm:p-6 pointer-events-none">
            <div className="bg-white/95 dark:bg-[#121212]/95 backdrop-blur-3xl w-full max-w-5xl h-full sm:h-auto sm:max-h-[90vh] rounded-none sm:rounded-[32px] lg:rounded-[40px] shadow-2xl border-0 sm:border dark:border-white/[0.08] border-slate-200/80 flex flex-col pointer-events-auto overflow-hidden">
              {/* Header */}
              <div className="p-4 sm:p-8 border-b dark:border-white/[0.08] border-slate-100 flex items-center justify-between bg-slate-50/50 dark:bg-white/[0.02]">
                <div>
                  <h2 className="text-lg sm:text-3xl font-black tracking-tight dark:text-white text-slate-900">{food ? 'Taomni tahrirlash' : 'Yangi taom qo\'shish'}</h2>
                  <p className="text-[10px] sm:text-xs font-bold dark:text-slate-400 text-slate-500 mt-1 sm:mt-2 uppercase tracking-widest opacity-60">Menyu katalogini boshqarish</p>
                </div>
                <button onClick={onClose} className="p-2 sm:p-3 rounded-xl sm:rounded-2xl hover:bg-red-500/10 hover:text-red-500 transition-all bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 shadow-sm group">
                  <X className="w-5 h-5 sm:w-6 sm:h-6 dark:text-slate-400 text-slate-500 group-hover:rotate-90 transition-transform" />
                </button>
              </div>

              {/* Tabs Navigation */}
              <div className="flex px-4 py-3 sm:px-8 sm:py-4 gap-1.5 sm:gap-2 border-b dark:border-white/[0.04] border-slate-100 bg-white dark:bg-transparent overflow-x-auto no-scrollbar">
                {tabs.map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-4 py-2 sm:px-6 sm:py-3 rounded-xl sm:rounded-2xl text-[9px] sm:text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-1.5 sm:gap-2 whitespace-nowrap ${activeTab === tab.id ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/30' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-white/5'}`}
                  >
                    <tab.icon className="w-3 sm:w-3.5 h-3 sm:h-3.5" />
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="p-4 sm:p-8 overflow-y-auto flex-1 custom-scrollbar">
                <form id="food-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4 sm:space-y-8">
                  {activeTab === 'general' && (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-10">
                      <div className="lg:col-span-4 space-y-4">
                        <div className="aspect-[4/3] sm:aspect-square rounded-2xl sm:rounded-[40px] border-2 border-dashed dark:border-white/10 border-slate-200 bg-slate-50/50 dark:bg-white/[0.02] flex flex-col items-center justify-center relative overflow-hidden group cursor-pointer hover:border-primary-500 transition-all">
                          {imagePreview ? (
                            <>
                              <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center backdrop-blur-sm">
                                <span className="px-4 py-2 sm:px-6 sm:py-3 bg-white/20 border border-white/30 rounded-xl sm:rounded-2xl text-white font-black text-[9px] sm:text-[10px] uppercase tracking-widest">O'zgartirish</span>
                              </div>
                            </>
                          ) : (
                            <div className="text-center p-4 sm:p-8">
                              <div className="w-12 h-12 sm:w-20 sm:h-20 bg-white dark:bg-white/5 rounded-2xl sm:rounded-3xl flex items-center justify-center mx-auto mb-3 sm:mb-6 border border-slate-100 dark:border-white/5 shadow-sm">
                                <ImageIcon className="w-6 h-6 sm:w-10 sm:h-10 text-slate-300 dark:text-slate-600" />
                              </div>
                              <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-slate-500">Rasm yuklash</p>
                            </div>
                          )}
                          <input type="file" onChange={handleImageChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" accept="image/*" />
                        </div>
                      </div>

                      <div className="lg:col-span-8 space-y-4 sm:space-y-6">
                        <div>
                          <label className="block text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-[2px] mb-1.5 sm:mb-3 ml-1 sm:ml-2">Taom nomi</label>
                          <input 
                            type="text" 
                            {...register('name')}
                            className="w-full px-4 py-3 sm:px-6 sm:py-5 bg-slate-50/50 dark:bg-white/[0.03] border dark:border-white/[0.08] border-slate-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 rounded-xl sm:rounded-[24px] text-xs sm:text-base font-bold outline-none transition-all dark:text-white" 
                            placeholder="Klassik Burger" 
                          />
                          {errors.name && <p className="text-red-500 text-[9px] sm:text-[10px] font-black mt-1.5 ml-2 uppercase tracking-wider flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.name.message}</p>}
                        </div>

                        <div className="grid grid-cols-2 gap-4 sm:gap-6">
                          <div>
                            <label className="block text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-[2px] mb-1.5 sm:mb-3 ml-1 sm:ml-2">Kategoriya</label>
                            <select 
                              {...register('category')}
                              className="w-full px-4 py-3 sm:px-6 sm:py-5 bg-slate-50/50 dark:bg-white/[0.03] border dark:border-white/[0.08] border-slate-200 focus:border-primary-500 rounded-xl sm:rounded-[24px] text-xs sm:text-base font-bold outline-none transition-all dark:text-white cursor-pointer"
                            >
                              <option value="" className="text-slate-900">Tanlang</option>
                              {categories.map(c => <option key={c.id} value={c.id} className="text-slate-900">{c.name}</option>)}
                            </select>
                            {errors.category && <p className="text-red-500 text-[9px] sm:text-[10px] font-black mt-1.5 ml-2 uppercase tracking-wider flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.category.message}</p>}
                          </div>
                          <div>
                            <label className="block text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-[2px] mb-1.5 sm:mb-3 ml-1 sm:ml-2">Vaqti (daq.)</label>
                            <input 
                              type="number" 
                              {...register('cookingTime')}
                              className="w-full px-4 py-3 sm:px-6 sm:py-5 bg-slate-50/50 dark:bg-white/[0.03] border dark:border-white/[0.08] border-slate-200 focus:border-primary-500 rounded-xl sm:rounded-[24px] text-xs sm:text-base font-bold outline-none transition-all dark:text-white" 
                              placeholder="15" 
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 sm:gap-6">
                          <div>
                            <label className="block text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-[2px] mb-1.5 sm:mb-3 ml-1 sm:ml-2">Asosiy narxi (so'm)</label>
                            <input 
                              type="number" 
                              {...register('price')}
                              className="w-full px-4 py-3 sm:px-6 sm:py-5 bg-slate-50/50 dark:bg-white/[0.03] border dark:border-white/[0.08] border-slate-200 focus:border-primary-500 rounded-xl sm:rounded-[24px] text-xs sm:text-base font-bold outline-none transition-all dark:text-white" 
                              placeholder="0" 
                            />
                            {errors.price && <p className="text-red-500 text-[9px] sm:text-[10px] font-black mt-1.5 ml-2 uppercase tracking-wider flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.price.message}</p>}
                          </div>
                          <div>
                            <label className="block text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-[2px] mb-1.5 sm:mb-3 ml-1 sm:ml-2">Chegirma (so'm)</label>
                            <input 
                              type="number" 
                              {...register('discountPrice')}
                              className="w-full px-4 py-3 sm:px-6 sm:py-5 bg-slate-50/50 dark:bg-white/[0.03] border dark:border-white/[0.08] border-slate-200 focus:border-primary-500 rounded-xl sm:rounded-[24px] text-xs sm:text-base font-bold outline-none transition-all dark:text-white" 
                              placeholder="0" 
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'details' && (
                    <div className="space-y-4 sm:space-y-8">
                      <div>
                        <label className="block text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-[2px] mb-1.5 sm:mb-3 ml-1 sm:ml-2">Achchiqlik darajasi (0-3)</label>
                        <div className="flex gap-2 sm:gap-4 p-2 sm:p-4 rounded-2xl sm:rounded-[28px] bg-slate-50 dark:bg-white/[0.02] border dark:border-white/[0.08] border-slate-200">
                          {[0, 1, 2, 3].map(level => (
                            <button
                              key={level}
                              type="button"
                              onClick={() => setValue('spicyLevel', level)}
                              className={`flex-1 py-2 sm:py-4 rounded-xl sm:rounded-2xl font-black text-xs sm:text-sm transition-all ${watch('spicyLevel') === level ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20' : 'bg-white dark:bg-white/5 text-slate-400'}`}
                            >
                              {level === 0 ? 'Yo\'q' : '🌶️'.repeat(level)}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="block text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-[2px] mb-1.5 sm:mb-3 ml-1 sm:ml-2">Tavsif (Ingredients & Info)</label>
                        <textarea 
                          {...register('description')}
                          rows="4" 
                          className="w-full px-4 py-3 sm:px-8 sm:py-6 bg-slate-50/50 dark:bg-white/[0.03] border dark:border-white/[0.08] border-slate-200 focus:border-primary-500 rounded-2xl sm:rounded-[32px] text-xs sm:text-base font-medium outline-none transition-all dark:text-white resize-none leading-relaxed" 
                          placeholder="Taom tarkibi va tayyorlanishi haqida ma'lumot..." 
                        />
                      </div>
                    </div>
                  )}

                  {activeTab === 'status' && (
                    <div className="grid grid-cols-2 gap-3 sm:gap-6">
                      {['available', 'out_of_stock', 'unavailable', 'hidden'].map(status => (
                        <button
                          key={status}
                          type="button"
                          onClick={() => setValue('status', status)}
                          className={`p-4 sm:p-8 rounded-2xl sm:rounded-[32px] border-2 transition-all flex flex-col items-start gap-2.5 sm:gap-4 text-left ${watch('status') === status ? 'bg-primary-500/5 border-primary-500 shadow-xl' : 'bg-slate-50/50 dark:bg-white/[0.02] dark:border-white/10 border-slate-100 hover:bg-slate-100'}`}
                        >
                          <div className={`w-8 h-8 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl flex items-center justify-center ${watch('status') === status ? 'bg-primary-500 text-white' : 'bg-slate-200 dark:bg-white/10 text-slate-500'}`}>
                            {status === 'available' ? <Save className="w-4 h-4 sm:w-6 sm:h-6" /> : status === 'out_of_stock' ? <AlertCircle className="w-4 h-4 sm:w-6 sm:h-6" /> : <X className="w-4 h-4 sm:w-6 sm:h-6" />}
                          </div>
                          <div>
                            <p className="font-black text-xs sm:text-sm uppercase tracking-widest dark:text-white text-slate-900">
                              {status === 'available' ? 'Bor' : status === 'out_of_stock' ? 'Tugagan' : status === 'unavailable' ? 'Yo\'q' : 'Yashirin'}
                            </p>
                            <p className="text-[8px] sm:text-[10px] font-bold text-slate-400 mt-0.5 sm:mt-1 uppercase tracking-wider">
                              {status === 'available' ? 'Sotuvda bor' : 'Ko\'rinmaydi'}
                            </p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </form>
              </div>

              {/* Footer */}
              <div className="p-4 sm:p-8 border-t dark:border-white/[0.08] border-slate-100 bg-slate-50/80 dark:bg-black/20 flex flex-col-reverse sm:flex-row justify-end gap-3 sm:gap-6 backdrop-blur-3xl">
                <button onClick={onClose} className="w-full sm:w-auto px-6 sm:px-12 py-3 sm:py-5 rounded-xl sm:rounded-[24px] border-2 dark:border-white/[0.08] border-slate-200 font-black text-xs sm:text-sm dark:text-white text-slate-700 hover:bg-slate-100 dark:hover:bg-white/10 transition-all uppercase tracking-[2px]">
                  Bekor qilish
                </button>
                <button type="submit" form="food-form" disabled={isSubmitting} className="w-full sm:w-auto px-6 sm:px-12 py-3 sm:py-5 rounded-xl sm:rounded-[24px] bg-primary-500 hover:bg-primary-600 text-white font-black text-xs sm:text-sm transition-all shadow-[0_12px_40px_rgb(14,165,233,0.3)] hover:-translate-y-1.5 flex items-center justify-center gap-3 uppercase tracking-[2px] disabled:opacity-50">
                  {isSubmitting ? <ImageIcon className="w-4.5 h-4.5 animate-spin" /> : <Save className="w-4.5 h-4.5" />}
                  {food ? 'Saqlash' : 'Yaratish'}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default FoodFormModal;
