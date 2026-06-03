import React from 'react';
import { motion } from 'framer-motion';

const DataTable = ({ columns = [], data = [], keyField = 'id', onRowClick, emptyMessage = "No data available" }) => {
  return (
    <div className="w-full overflow-x-auto rounded-3xl border dark:border-white/[0.08] border-slate-200/80 bg-white/60 dark:bg-[#111111]/80 backdrop-blur-2xl shadow-md">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-slate-50/80 dark:bg-white/[0.04] border-b dark:border-white/[0.08] border-slate-200/80">
            {columns.map((col, idx) => (
              <th 
                key={col.key || idx} 
                className={`p-5 text-xs font-black dark:text-slate-400 text-slate-500 uppercase tracking-widest ${col.headerClassName || ''} ${idx === 0 ? 'pl-8' : ''} ${idx === columns.length - 1 ? 'pr-8' : ''}`}
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y dark:divide-white/5 divide-slate-100">
          {data.map((row, idx) => (
            <motion.tr 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(idx * 0.05, 0.5) }}
              key={row[keyField] || idx} 
              onClick={() => onRowClick && onRowClick(row)}
              className={`transition-colors group ${onRowClick ? 'cursor-pointer hover:bg-white dark:hover:bg-white/10' : 'hover:bg-white dark:hover:bg-white/5'}`}
            >
              {columns.map((col, colIdx) => (
                <td 
                  key={col.key || colIdx} 
                  className={`p-5 text-sm ${col.cellClassName || ''} ${colIdx === 0 ? 'pl-8' : ''} ${colIdx === columns.length - 1 ? 'pr-8' : ''}`}
                >
                  {col.render ? col.render(row[col.key], row) : <span className="font-bold dark:text-gray-300 text-slate-700">{row[col.key]}</span>}
                </td>
              ))}
            </motion.tr>
          ))}
          {data.length === 0 && (
            <tr>
              <td colSpan={columns.length} className="p-16 text-center text-sm font-bold dark:text-slate-500 text-slate-400">
                <div className="flex flex-col items-center justify-center">
                  <span className="text-4xl mb-4 opacity-30">📋</span>
                  <p>{emptyMessage}</p>
                </div>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default DataTable;
