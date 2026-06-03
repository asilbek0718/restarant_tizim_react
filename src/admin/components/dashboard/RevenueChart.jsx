import React from 'react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import SafeChartContainer from './SafeChartContainer';

/**
 * Premium Dashboard Revenue Chart
 * Uses Recharts for high-fidelity visualization.
 */
const RevenueChart = ({ data = [], title = "Daromad xulosasi" }) => {
  // Safe rendering guard for empty data state
  if (!data || data.length === 0) {
    return (
      <div className="glass-card p-4 sm:p-6 rounded-2xl sm:rounded-3xl border dark:border-white/[0.08] border-slate-200/80 bg-white/60 dark:bg-[#111111]/80 backdrop-blur-2xl flex flex-col h-full min-h-[300px] sm:min-h-[400px]">
        <div className="flex items-center justify-between mb-4 sm:mb-8">
          <div>
            <h3 className="text-base sm:text-xl font-black dark:text-white text-slate-900 tracking-tight">{title}</h3>
            <p className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">So'nggi 7 kunlik trend</p>
          </div>
        </div>
        <div className="w-full min-w-0 h-[300px] flex items-center justify-center text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider text-xs">
          Ma'lumot yo'q
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card p-4 sm:p-6 rounded-2xl sm:rounded-3xl border dark:border-white/[0.08] border-slate-200/80 bg-white/60 dark:bg-[#111111]/80 backdrop-blur-2xl flex flex-col h-full min-h-[300px] sm:min-h-[400px]">
      <div className="flex items-center justify-between mb-4 sm:mb-8">
        <div>
          <h3 className="text-base sm:text-xl font-black dark:text-white text-slate-900 tracking-tight">{title}</h3>
          <p className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">So'nggi 7 kunlik trend</p>
        </div>
        <select className="bg-slate-100 dark:bg-white/5 px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg sm:rounded-xl text-[10px] sm:text-xs font-black dark:text-slate-400 text-slate-500 outline-none cursor-pointer hover:text-primary-500 transition-all border border-transparent hover:border-primary-500/20">
          <option value="week">Shu hafta</option>
          <option value="month">Shu oy</option>
        </select>
      </div>
      
      <SafeChartContainer height={300}>
        {(width, height) => (
          <AreaChart width={width} height={height} data={data} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
            <defs>
              <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorPv" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.05} />
            <XAxis 
              dataKey="name" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#94a3b8', fontSize: 9, fontWeight: 700 }}
              dy={10}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#94a3b8', fontSize: 9, fontWeight: 700 }}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#0f172a', 
                border: 'none', 
                borderRadius: '12px', 
                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)',
                padding: '8px'
              }}
              itemStyle={{ fontSize: '10px', fontWeight: 900, textTransform: 'uppercase' }}
              labelStyle={{ color: '#94a3b8', marginBottom: '2px', fontWeight: 800 }}
            />
            <Area 
              type="monotone" 
              dataKey="uv" 
              name="Daromad"
              stroke="#3b82f6" 
              strokeWidth={3}
              fillOpacity={1} 
              fill="url(#colorUv)" 
              animationDuration={1500}
            />
            <Area 
              type="monotone" 
              dataKey="pv" 
              name="Foyda"
              stroke="#10b981" 
              strokeWidth={2}
              strokeDasharray="5 5"
              fillOpacity={1} 
              fill="url(#colorPv)" 
              animationDuration={2000}
            />
          </AreaChart>
        )}
      </SafeChartContainer>

      <div className="mt-4 sm:mt-6 flex flex-wrap items-center gap-4 sm:gap-6 pt-4 sm:pt-6 border-t dark:border-white/5 border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
          <span className="text-[9px] sm:text-[10px] font-black dark:text-slate-400 text-slate-500 uppercase tracking-widest">Umumiy Savdo</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
          <span className="text-[9px] sm:text-[10px] font-black dark:text-slate-400 text-slate-500 uppercase tracking-widest">Sof foyda (taxminan)</span>
        </div>
      </div>
    </div>
  );
};

export default RevenueChart;
