import React from 'react';
import { motion } from 'framer-motion';
import { TRANSLATIONS } from '@/shared/constants/translations';

const ReportTable = ({ title, data = [], columns = [] }) => {
  return (
    <div className="glass-card rounded-[24px] sm:rounded-[32px] border dark:border-white/[0.08] border-slate-200/80 bg-white/60 dark:bg-[#111111]/80 backdrop-blur-2xl overflow-hidden shadow-md">
      {title && (
        <div className="p-4 sm:p-8 border-b dark:border-white/5 border-slate-100 bg-slate-50/50 dark:bg-white/[0.04] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h3 className="text-base sm:text-2xl font-bold tracking-tight dark:text-white text-slate-900 tracking-tight">{title}</h3>
          <div className="flex gap-2 self-start sm:self-center">
            <button className="text-[10px] sm:text-xs font-black text-primary-500 uppercase tracking-widest hover:text-primary-600 transition-colors bg-primary-500/10 hover:bg-primary-500/20 px-3 py-1.5 sm:px-4 sm:py-2 rounded-[20px]">
              {TRANSLATIONS.analytics.export.excel}
            </button>
            <button className="text-[10px] sm:text-xs font-black text-primary-500 uppercase tracking-widest hover:text-primary-600 transition-colors bg-primary-500/10 hover:bg-primary-500/20 px-3 py-1.5 sm:px-4 sm:py-2 rounded-[20px]">
              {TRANSLATIONS.analytics.export.pdf}
            </button>
          </div>
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[600px]">
          <thead>
            <tr className="bg-slate-50/30 dark:bg-white/[0.02]">
              {columns.map((col, idx) => (
                <th key={col.key || idx} className={`p-3.5 sm:p-6 text-[10px] sm:text-xs font-black dark:text-slate-400 text-slate-500 uppercase tracking-widest ${idx === 0 ? 'pl-4 sm:pl-8' : ''} ${idx === columns.length - 1 ? 'pr-4 sm:pr-8 text-right' : ''}`}>
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y dark:divide-white/5 divide-slate-100/80">
            {data.map((row, idx) => (
              <motion.tr 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                key={row.id || idx} 
                className="hover:bg-white dark:hover:bg-white/5 transition-colors group"
              >
                {columns.map((col, colIdx) => (
                  <td key={col.key || colIdx} className={`p-3.5 sm:p-6 text-xs sm:text-sm font-bold dark:text-gray-300 text-slate-700 ${colIdx === 0 ? 'pl-4 sm:pl-8 font-black dark:text-white text-slate-900' : ''} ${colIdx === columns.length - 1 ? 'pr-4 sm:pr-8 text-right' : ''}`}>
                    {col.render ? col.render(row[col.key], row) : row[col.key]}
                  </td>
                ))}
              </motion.tr>
            ))}
            {data.length === 0 && (
              <tr>
                <td colSpan={columns.length} className="p-24 text-center text-sm font-bold dark:text-slate-500 text-slate-400">
                  <div className="text-6xl mb-6 opacity-20">📊</div>
                  {TRANSLATIONS.common.noOrders || "Ma'lumot topilmadi."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ReportTable;
