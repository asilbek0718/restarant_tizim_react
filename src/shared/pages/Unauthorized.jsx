import React from 'react';
import { motion } from 'framer-motion';
import { ShieldAlert, ArrowLeft, Home, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Unauthorized = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#050505] p-6">
      <div className="max-w-md w-full text-center space-y-8">
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
          className="w-32 h-32 bg-red-500/10 rounded-[40px] flex items-center justify-center mx-auto relative overflow-hidden group"
        >
          <div className="absolute inset-0 bg-red-500/20 blur-2xl group-hover:blur-3xl transition-all" />
          <ShieldAlert className="w-16 h-16 text-red-500 relative z-10" />
        </motion.div>

        <div className="space-y-4">
          <h1 className="text-4xl font-black dark:text-white text-slate-900 uppercase tracking-tighter">
            Kirish ruxsati yo'q
          </h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium">
            Sizda ushbu sahifani ko'rish uchun yetarli huquqlar mavjud emas. 
            Iltimos, administratorga murojaat qiling.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4 justify-center">
          <button
            onClick={() => navigate(-1)}
            className="w-full sm:w-auto px-8 py-4 rounded-[24px] bg-white dark:bg-white/5 border dark:border-white/10 border-slate-200 text-slate-900 dark:text-white font-black text-sm uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-slate-50 dark:hover:bg-white/10 transition-all"
          >
            <ArrowLeft className="w-4 h-4" /> Orqaga
          </button>
          <button
            onClick={() => navigate('/')}
            className="w-full sm:w-auto px-8 py-4 rounded-[24px] bg-primary-500 text-white font-black text-sm uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-primary-600 shadow-xl shadow-primary-500/30 transition-all"
          >
            <Home className="w-4 h-4" /> Bosh sahifa
          </button>
        </div>

        <div className="pt-8 flex items-center justify-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
          <Lock className="w-3 h-3" /> Secure System ID: ACCESS_DENIED_03
        </div>
      </div>
    </div>
  );
};

export default Unauthorized;
