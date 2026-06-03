import React from 'react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip,
  Legend
} from 'recharts';
import SafeChartContainer from './SafeChartContainer';

/**
 * Premium Sales Category Overview
 * Visualizes sales distribution across menu categories.
 */
const SalesOverview = ({ data = [], title = "Kategoriyalar bo'yicha" }) => {
  // Safe rendering guard for empty data state
  if (!data || data.length === 0) {
    return (
      <div className="glass-card p-4 sm:p-6 rounded-2xl sm:rounded-3xl border dark:border-white/[0.08] border-slate-200/80 bg-white/60 dark:bg-[#111111]/80 backdrop-blur-2xl h-full flex flex-col">
        <div className="flex items-center justify-between mb-4 sm:mb-8">
          <h3 className="text-base sm:text-xl font-black dark:text-white text-slate-900 tracking-tight">{title}</h3>
        </div>
        <div className="w-full min-w-0 h-[300px] flex items-center justify-center text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider text-xs">
          Ma'lumot yo'q
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card p-4 sm:p-6 rounded-2xl sm:rounded-3xl border dark:border-white/[0.08] border-slate-200/80 bg-white/60 dark:bg-[#111111]/80 backdrop-blur-2xl h-full flex flex-col">
      <div className="flex items-center justify-between mb-4 sm:mb-8">
        <h3 className="text-base sm:text-xl font-black dark:text-white text-slate-900 tracking-tight">{title}</h3>
      </div>

      <SafeChartContainer height={300}>
        {(width, height) => (
          <>
            <PieChart width={width} height={height}>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={45}
                outerRadius={65}
                paddingAngle={6}
                dataKey="value"
                animationBegin={0}
                animationDuration={1500}
              >
                {data.map((entry) => (
                  <Cell key={entry.name} fill={entry.color} stroke="none" />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#0f172a', 
                  border: 'none', 
                  borderRadius: '12px',
                  padding: '6px 10px'
                }}
                itemStyle={{ fontSize: '10px', fontWeight: 900, textTransform: 'uppercase' }}
              />
            </PieChart>
            
            {/* Total Center Label */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
               <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Jami</p>
               <p className="text-xl sm:text-2xl font-black dark:text-white text-slate-900">
                 {data.reduce((acc, curr) => acc + (typeof curr.value === 'number' ? curr.value : 0), 0)}
               </p>
            </div>
          </>
        )}
      </SafeChartContainer>

      <div className="mt-2 sm:mt-6 space-y-1.5 sm:space-y-3">
        {data.slice(0, 4).map((item) => (
          <div key={item.name} className="flex items-center justify-between p-1.5 sm:p-3 rounded-xl sm:rounded-2xl hover:bg-white/5 transition-colors group">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
              <span className="text-[9px] sm:text-xs font-black dark:text-slate-300 text-slate-700 uppercase tracking-wider truncate max-w-[100px] sm:max-w-none">{item.name}</span>
            </div>
            <span className="text-xs sm:text-sm font-black dark:text-white text-slate-900 shrink-0">{item.value} ta</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SalesOverview;
