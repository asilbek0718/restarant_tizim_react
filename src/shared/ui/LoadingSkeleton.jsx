import React from 'react';
import { motion } from 'framer-motion';

const LoadingSkeleton = ({ type = 'card', count = 1 }) => {
  const renderSkeleton = (key) => {
    switch (type) {
      case 'card':
        return (
          <div key={key} className="glass-card p-6 rounded-3xl border dark:border-white/[0.08] border-slate-200/80 bg-white/60 dark:bg-[#111111]/80 backdrop-blur-2xl h-64 flex flex-col gap-4">
            <div className="w-full h-32 bg-slate-200 dark:bg-white/10 rounded-[24px] animate-pulse"></div>
            <div className="w-3/4 h-6 bg-slate-200 dark:bg-white/10 rounded-lg animate-pulse"></div>
            <div className="w-1/2 h-4 bg-slate-200 dark:bg-white/10 rounded-lg animate-pulse"></div>
            <div className="w-full h-10 bg-slate-200 dark:bg-white/10 rounded-[20px] animate-pulse mt-auto"></div>
          </div>
        );
      case 'list':
        return (
          <div key={key} className="flex items-center gap-4 p-4 border-b dark:border-white/[0.08] border-slate-100">
            <div className="w-12 h-12 rounded-full bg-slate-200 dark:bg-white/10 animate-pulse shrink-0"></div>
            <div className="flex-1 space-y-2">
              <div className="w-1/3 h-4 bg-slate-200 dark:bg-white/10 rounded-lg animate-pulse"></div>
              <div className="w-1/4 h-3 bg-slate-200 dark:bg-white/10 rounded-lg animate-pulse"></div>
            </div>
            <div className="w-16 h-8 bg-slate-200 dark:bg-white/10 rounded-[20px] animate-pulse"></div>
          </div>
        );
      case 'table':
        return (
          <div key={key} className="w-full h-12 bg-slate-200 dark:bg-white/10 rounded-[20px] animate-pulse my-2"></div>
        );
      default:
        return (
          <div key={key} className="w-full h-full bg-slate-200 dark:bg-white/10 rounded-[24px] animate-pulse min-h-[100px]"></div>
        );
    }
  };

  return (
    <>
      {Array.from({ length: count }).map((_, i) => renderSkeleton(i))}
    </>
  );
};

export default LoadingSkeleton;
