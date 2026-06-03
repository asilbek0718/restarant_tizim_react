import React from 'react';
import { motion } from 'framer-motion';
import { Ghost, Home, Search, MoveLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { TRANSLATIONS } from '@/shared/constants/translations';

const NotFound = () => {
  const navigate = useNavigate();
  const t = TRANSLATIONS.errors;

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#050505] p-6 relative overflow-hidden">
      {/* Dynamic Background */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute top-[20%] left-[10%] w-72 h-72 bg-primary-600/10 rounded-full blur-[100px] animate-pulse" />
        <div className="absolute bottom-[20%] right-[10%] w-72 h-72 bg-accent-600/10 rounded-full blur-[100px] animate-pulse" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-xl w-full text-center relative z-10"
      >
        <div className="relative mb-16 inline-block">
          <motion.div
            animate={{ 
              y: [0, -20, 0],
              rotate: [0, 5, -5, 0]
            }}
            transition={{ 
              duration: 6, 
              repeat: Infinity, 
              ease: "easeInOut" 
            }}
            className="relative z-10"
          >
            <Ghost className="w-40 h-40 text-white/10 stroke-[0.5]" />
          </motion.div>
          
          <h2 className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-9xl font-black text-white/5 tracking-tighter">
            404
          </h2>
        </div>

        <h1 className="text-4xl font-black text-white mb-6 tracking-tight">{t.notFoundTitle}</h1>
        <p className="text-gray-400 text-lg mb-12 leading-relaxed">
          {t.notFoundDesc}
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button 
            onClick={() => navigate(-1)}
            className="btn-secondary py-4 px-10 group"
          >
            <MoveLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            {t.goBack}
          </button>
          <button 
            onClick={() => navigate('/')}
            className="btn-primary py-4 px-10 shadow-2xl shadow-primary-500/40"
          >
            <Home className="w-5 h-5" />
            {t.returnHome}
          </button>
        </div>

        <div className="mt-20">
          <p className="text-xs text-gray-700 font-bold uppercase tracking-[10px]">LUXE RESTO SYSTEM</p>
        </div>
      </motion.div>
    </div>
  );
};

export default NotFound;
