import React, { useState, useMemo, useEffect } from 'react';
import { TRANSLATIONS } from '@/shared/constants/translations';
import { PageContainer, SectionHeader } from '@/shared/ui';
import MetricCard from '../components/analytics/MetricCard';
import ChartCard from '../components/analytics/ChartCard';
import ReportTable from '../components/analytics/ReportTable';
import DateRangePicker from '../components/analytics/DateRangePicker';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Users, 
  ShoppingBag,
  Activity,
  Clock,
  Utensils,
  Layout,
  CreditCard,
  ChefHat,
  Star,
  FileDown,
  RefreshCw,
  Search,
  Filter
} from 'lucide-react';

import { financeUtils } from '@/shared/utils/finances';
import useOrderStore from '@/store/orders/orderStore';
import useTableStore from '@/store/tables/tableStore';
import useMenuStore from '@/store/menu/menuStore';
import useReservationStore from '@/store/tables/reservationStore';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, 
  Tooltip as RechartsTooltip, ResponsiveContainer, 
  BarChart, Bar, Cell, PieChart, Pie, Legend, LineChart, Line
} from 'recharts';
import { ORDER_STATUS } from '@/shared/constants/statuses';
import SafeChartContainer from '../components/dashboard/SafeChartContainer';

const Analytics = () => {
  const t = TRANSLATIONS.analytics;
  const common = TRANSLATIONS.common;
  const statusLabels = TRANSLATIONS?.orders?.statuses || {};

  // Real-time store data
  const { orders } = useOrderStore();
  const { tables } = useTableStore();
  const { items: menuItems } = useMenuStore();
  const { reservations } = useReservationStore();

  const [dateFilter, setDateFilter] = useState('7d'); // 7d, 30d, today, custom
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // 1. ADVANCED DATA PROCESSING (Memoized)
  const analyticsData = useMemo(() => {
    // Filter orders by date
    const now = new Date();
    const filteredOrders = (orders || []).filter(o => {
      if (!o?.createdAt) return false;
      const orderDate = new Date(o.createdAt);
      if (dateFilter === 'today') return orderDate.toDateString() === now.toDateString();
      if (dateFilter === '7d') return (now - orderDate) <= 7 * 24 * 60 * 60 * 1000;
      if (dateFilter === '30d') return (now - orderDate) <= 30 * 24 * 60 * 60 * 1000;
      return true;
    });

    const paidOrders = filteredOrders.filter(o => [ORDER_STATUS.PAID, ORDER_STATUS.COMPLETED].includes(o.status));
    
    // KPI Metrics
    const totalRevenue = paidOrders.reduce((sum, o) => sum + (o.total || 0), 0);
    const todayRevenue = paidOrders
      .filter(o => new Date(o.createdAt).toDateString() === now.toDateString())
      .reduce((sum, o) => sum + (o.total || 0), 0);
    
    const avgOrderValue = paidOrders.length ? Math.round(totalRevenue / paidOrders.length) : 0;
    
    // Growth Trend (Real logic would compare current vs previous period)
    const revenueGrowth = 0; 

    // Revenue by Day for AreaChart
    const revenueByDayMap = paidOrders.reduce((acc, o) => {
      const date = new Date(o.createdAt).toLocaleDateString('uz-UZ', { day: '2-digit', month: 'short' });
      acc[date] = (acc[date] || 0) + (o.total || 0);
      return acc;
    }, {});
    const revenueByDayData = Object.entries(revenueByDayMap).map(([name, value]) => ({ name, value }));

    // Busy Hours for BarChart
    const busyHoursMap = filteredOrders.reduce((acc, o) => {
      const hour = new Date(o.createdAt).getHours();
      acc[hour] = (acc[hour] || 0) + 1;
      return acc;
    }, {});
    const busyHoursData = Array.from({ length: 24 }, (_, i) => ({
      name: `${i}:00`,
      value: busyHoursMap[i] || 0
    }));

    // Payment Methods for PieChart
    const paymentMethodsMap = paidOrders.reduce((acc, o) => {
      const method = o.payment?.method || 'Cash';
      acc[method] = (acc[method] || 0) + 1;
      return acc;
    }, {});
    const paymentMethodsData = Object.entries(paymentMethodsMap).map(([name, value]) => ({ name, value }));

    // Category Sales
    const categorySalesMap = {};
    paidOrders.forEach(o => {
      o.items?.forEach(item => {
        const cat = item.category || 'Other';
        categorySalesMap[cat] = (categorySalesMap[cat] || 0) + (item.price * item.quantity);
      });
    });
    const categorySalesData = Object.entries(categorySalesMap).map(([name, value]) => ({ name, value }));

    // Top Selling Items
    const itemPerformance = {};
    filteredOrders.forEach(o => {
      o.items?.forEach(item => {
        if (!itemPerformance[item.name]) {
          itemPerformance[item.name] = { name: item.name, quantity: 0, revenue: 0, category: item.category };
        }
        itemPerformance[item.name].quantity += item.quantity;
        itemPerformance[item.name].revenue += item.price * item.quantity;
      });
    });

    const topSelling = Object.values(itemPerformance)
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 10);

    const lowPerforming = Object.values(itemPerformance)
      .sort((a, b) => a.quantity - b.quantity)
      .slice(0, 5);

    // Kitchen Efficiency
    const completedPrep = filteredOrders.filter(o => o.preparationStartTime && o.preparationEndTime);
    const avgPrepTime = completedPrep.length 
      ? Math.round(completedPrep.reduce((acc, o) => acc + (new Date(o.preparationEndTime) - new Date(o.preparationStartTime)), 0) / completedPrep.length / 60000)
      : 0; // Fresh system starts at 0

    // Table Stats
    const tableStats = {
      busy: tables.filter(t => t.status === 'occupied').length,
      available: tables.filter(t => t.status === 'empty').length,
    };

    // Employee Performance
    const staffStats = {};
    paidOrders.forEach(o => {
      const waiter = o.waiterName || 'Staff';
      if (!staffStats[waiter]) staffStats[waiter] = { name: waiter, count: 0, revenue: 0 };
      staffStats[waiter].count += 1;
      staffStats[waiter].revenue += o.total;
    });
    const staffData = Object.values(staffStats).sort((a, b) => b.revenue - a.revenue);

    return {
      metrics: {
        totalRevenue,
        todayRevenue,
        avgOrderValue,
        activeOrders: (orders || []).filter(o => o?.status && !['completed', 'cancelled', 'paid'].includes(o.status)).length,
        completedOrders: paidOrders.length,
        busyTables: tableStats.busy,
        availableTables: tableStats.available,
        reservationsCount: (reservations || []).filter(r => r?.status === 'pending').length,
        kitchenLoad: Math.round(((orders || []).filter(o => o?.status === 'preparing').length / Math.max(1, (orders || []).length)) * 100),
        customersToday: (orders || []).filter(o => o?.createdAt && new Date(o.createdAt).toDateString() === now.toDateString()).reduce((sum, o) => sum + (o.customerCount || 1), 0)
      },
      charts: {
        revenueByDay: revenueByDayData,
        busyHours: busyHoursData,
        paymentMethods: paymentMethodsData,
        categorySales: categorySalesData,
      },
      topSelling,
      lowPerforming,
      avgPrepTime,
      staffData,
      reportData: (filteredOrders || []).slice(0, 20).map(o => {
        const orderStatus = o?.status || '';
        const resolvedStatus = statusLabels[orderStatus] || orderStatus || '-';
        return {
          id: o?.id || '-',
          time: o?.createdAt ? new Date(o.createdAt).toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' }) : '-',
          table: o?.tableNumber || '-',
          waiter: o?.waiterName || '-',
          total: financeUtils.formatCurrency(o?.total || 0),
          status: resolvedStatus
        };
      })
    };
  }, [orders, tables, reservations, dateFilter, statusLabels]);

  const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f97316', '#10b981', '#64748b'];

  if (!t) return null;

  return (
    <PageContainer>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-6 mb-6 sm:mb-10">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black dark:text-white text-slate-900 tracking-tight">{t.title}</h1>
          <p className="text-slate-500 font-bold mt-0.5 sm:mt-1 text-xs sm:text-sm">{t.subtitle}</p>
        </div>
        
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex bg-slate-100 dark:bg-white/5 p-1 rounded-xl sm:rounded-[24px] border dark:border-white/5">
            {['today', '7d', '30d'].map((range) => (
              <button 
                key={range}
                onClick={() => setDateFilter(range)}
                className={`px-3 sm:px-6 py-2 sm:py-2.5 rounded-lg sm:rounded-[20px] text-[9px] sm:text-xs font-black uppercase tracking-widest transition-all ${dateFilter === range ? 'bg-primary-500 text-white shadow-lg' : 'dark:text-slate-400 text-slate-500 hover:text-primary-500'}`}
              >
                {range === 'today' ? 'Bugun' : range === '7d' ? '7 kun' : '30 kun'}
              </button>
            ))}
          </div>
          
          <button className="flex items-center gap-1.5 sm:gap-2 px-4 sm:px-6 py-2 sm:py-3.5 bg-white dark:bg-white/5 border dark:border-white/10 rounded-xl sm:rounded-[24px] shadow-sm hover:border-primary-500 transition-all group">
            <FileDown className="w-4 h-4 sm:w-5 sm:h-5 text-primary-500 group-hover:scale-110 transition-transform" />
            <span className="text-[9px] sm:text-xs font-black uppercase tracking-widest dark:text-white">{t.export.button}</span>
          </button>
        </div>
      </div>

      {/* KPI GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4 mb-6">
        <MetricCard 
          title={t.metrics.totalRevenue} 
          value={financeUtils.formatCurrency(analyticsData.metrics.totalRevenue)} 
          icon={DollarSign} 
          colorClass="text-primary-500 bg-primary-500" 
        />
        <MetricCard 
          title={t.metrics.todayRevenue} 
          value={financeUtils.formatCurrency(analyticsData.metrics.todayRevenue)} 
          icon={TrendingUp} 
          colorClass="text-emerald-500 bg-emerald-500" 
        />
        <MetricCard 
          title={t.metrics.activeOrders} 
          value={analyticsData.metrics.activeOrders} 
          icon={ShoppingBag} 
          colorClass="text-blue-500 bg-blue-500" 
        />
        <MetricCard 
          title={t.metrics.avgOrderValue} 
          value={financeUtils.formatCurrency(analyticsData.metrics.avgOrderValue)} 
          icon={CreditCard} 
          colorClass="text-purple-500 bg-purple-500" 
        />
        <MetricCard 
          title={t.metrics.kitchenLoad} 
          value={`${analyticsData.metrics.kitchenLoad}%`} 
          icon={ChefHat} 
          colorClass="text-orange-500 bg-orange-500" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">
        <MetricCard 
          title={t.metrics.busyTables} 
          value={`${analyticsData.metrics.busyTables} / ${tables.length}`} 
          icon={Layout} 
          trendValue={`${analyticsData.metrics.availableTables} bo'sh`} 
          colorClass="text-amber-500 bg-amber-500" 
        />
        <MetricCard 
          title={t.metrics.reservationsCount} 
          value={analyticsData.metrics.reservationsCount} 
          icon={Clock} 
          colorClass="text-pink-500 bg-pink-500" 
        />
        <MetricCard 
          title={t.metrics.dailyCustomers} 
          value={analyticsData.metrics.customersToday} 
          icon={Users} 
          colorClass="text-indigo-500 bg-indigo-500" 
        />
      </div>

      {/* MAIN CHARTS SECTION */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
        <ChartCard title={t.charts.revenueDynamics}>
          <SafeChartContainer height={350}>
            {(width, height) => (
              <AreaChart width={width} height={height} data={analyticsData.charts.revenueByDay}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.05} />
                <XAxis dataKey="name" fontSize={11} tickLine={false} axisLine={false} tick={{ fill: '#94a3b8' }} />
                <YAxis fontSize={11} tickLine={false} axisLine={false} tick={{ fill: '#94a3b8' }} tickFormatter={(val) => `${val/1000}k`} />
                <RechartsTooltip 
                  contentStyle={{ backgroundColor: '#111', border: 'none', borderRadius: '16px', fontSize: '12px', color: '#fff', boxShadow: '0 20px 50px rgba(0,0,0,0.5)' }}
                  itemStyle={{ color: '#3b82f6' }}
                />
                <Area type="monotone" dataKey="value" stroke="#3b82f6" fillOpacity={1} fill="url(#colorRev)" strokeWidth={4} />
              </AreaChart>
            )}
          </SafeChartContainer>
        </ChartCard>

        <ChartCard title={t.charts.busyHours}>
          <SafeChartContainer height={350}>
            {(width, height) => (
              <BarChart width={width} height={height} data={analyticsData.charts.busyHours}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.05} />
                <XAxis dataKey="name" fontSize={10} tickLine={false} axisLine={false} tick={{ fill: '#94a3b8' }} />
                <YAxis hide />
                <RechartsTooltip 
                   contentStyle={{ backgroundColor: '#111', border: 'none', borderRadius: '16px', fontSize: '12px', color: '#fff' }}
                   cursor={{ fill: 'rgba(59, 130, 246, 0.05)' }}
                />
                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                  {analyticsData.charts.busyHours.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.value > 10 ? '#ef4444' : entry.value > 5 ? '#f59e0b' : '#3b82f6'} fillOpacity={0.8} />
                  ))}
                </Bar>
              </BarChart>
            )}
          </SafeChartContainer>
        </ChartCard>
      </div>

      {/* SECONDARY ANALYTICS (PIE & CATEGORY) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
        <ChartCard title={t.charts.paymentMethods} className="lg:col-span-1">
          <SafeChartContainer height={300}>
            {(width, height) => (
              <PieChart width={width} height={height}>
                <Pie
                  data={analyticsData.charts.paymentMethods}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {analyticsData.charts.paymentMethods.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip contentStyle={{ backgroundColor: '#111', border: 'none', borderRadius: '12px', fontSize: '11px' }} />
                <Legend iconType="circle" />
              </PieChart>
            )}
          </SafeChartContainer>
        </ChartCard>

        <ChartCard title={t.charts.categorySales} className="lg:col-span-2">
          <SafeChartContainer height={300}>
            {(width, height) => (
              <BarChart width={width} height={height} data={analyticsData.charts.categorySales} layout="vertical" margin={{ left: 40 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} strokeOpacity={0.05} />
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" fontSize={12} tickLine={false} axisLine={false} tick={{ fill: '#94a3b8', fontWeight: 'bold' }} />
                <RechartsTooltip contentStyle={{ backgroundColor: '#111', border: 'none', borderRadius: '12px' }} />
                <Bar dataKey="value" fill="#8b5cf6" radius={[0, 10, 10, 0]} barSize={20} />
              </BarChart>
            )}
          </SafeChartContainer>
        </ChartCard>
      </div>

      {/* PRODUCT PERFORMANCE & KITCHEN */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-8 mb-6 sm:mb-10">
        <ChartCard title={t.charts.topSelling} className="xl:col-span-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[3px] mb-4">Eng yaxshi sotuvlar</h4>
              {analyticsData.topSelling.slice(0, 5).map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border dark:border-white/5 group hover:border-primary-500/30 transition-all">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-primary-500/10 flex items-center justify-center text-primary-500 font-black text-xs">#{idx + 1}</div>
                    <div>
                      <p className="font-black dark:text-white text-slate-900 text-sm">{item.name}</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{item.category}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-black dark:text-white text-slate-900 text-sm">{financeUtils.formatCurrency(item.revenue)}</p>
                    <p className="text-[10px] font-bold text-primary-500">{item.quantity} ta</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-4">
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[3px] mb-4">{t.charts.lowPerforming}</h4>
              {analyticsData.lowPerforming.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-4 rounded-2xl bg-white dark:bg-white/[0.02] border border-dashed dark:border-white/10 opacity-60 hover:opacity-100 transition-all">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-400 font-black text-xs">#{analyticsData.topSelling.length - idx}</div>
                    <div>
                      <p className="font-black dark:text-white text-slate-900 text-sm">{item.name}</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{item.category}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-black dark:text-white text-slate-900 text-sm">{financeUtils.formatCurrency(item.revenue)}</p>
                    <p className="text-[10px] font-bold text-slate-400">{item.quantity} ta</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </ChartCard>

        <div className="space-y-8">
           <ChartCard title={t.charts.kitchenEfficiency}>
              <div className="text-center py-6">
                <div className="relative inline-block">
                  <p className="text-7xl font-black dark:text-white text-slate-900 tabular-nums">
                    {analyticsData.avgPrepTime}
                  </p>
                  <span className="absolute -top-1 -right-8 text-sm font-black text-slate-400 uppercase tracking-widest">{t.kitchen.min}</span>
                </div>
                <p className="text-xs font-black text-slate-500 uppercase tracking-[4px] mt-4">{t.kitchen.avgPrepTime}</p>
                
                <div className="mt-6 sm:mt-10 px-0 sm:px-4">
                  <div className="flex justify-between text-[10px] font-black uppercase tracking-widest mb-3">
                    <span className="text-slate-400">{t.kitchen.target}: 15 min</span>
                    <span className={analyticsData.avgPrepTime > 15 ? 'text-amber-500' : 'text-green-500'}>
                      {analyticsData.avgPrepTime > 15 ? t.kitchen.delayed : t.kitchen.normal}
                    </span>
                  </div>
                  <div className="w-full h-3 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(100, (analyticsData.avgPrepTime / 15) * 100)}%` }}
                      className={`h-full ${analyticsData.avgPrepTime > 15 ? 'bg-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.5)]' : 'bg-green-500 shadow-[0_0_15px_rgba(16,185,129,0.5)]'}`}
                    />
                  </div>
                </div>
              </div>
           </ChartCard>

           <ChartCard title={t.employees.title}>
              <div className="space-y-4">
                {analyticsData.staffData.slice(0, 3).map((staff, idx) => (
                  <div key={idx} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-white/10 flex items-center justify-center text-slate-500 font-bold">{staff.name[0]}</div>
                      <div>
                        <p className="text-sm font-black dark:text-white text-slate-900">{staff.name}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{staff.count} buyurtma</p>
                      </div>
                    </div>
                    <p className="text-sm font-black text-primary-500">{financeUtils.formatCurrency(staff.revenue)}</p>
                  </div>
                ))}
              </div>
           </ChartCard>
        </div>
      </div>

      <ReportTable 
        title="So'nggi buyurtmalar hisoboti" 
        data={analyticsData.reportData} 
        columns={[
          { key: 'id', label: 'ID' },
          { key: 'time', label: 'Vaqt' },
          { key: 'table', label: 'Stol' },
          { key: 'waiter', label: 'Xizmatchi' },
          { key: 'total', label: 'Summa' },
          { key: 'status', label: 'Holat', render: (val) => (
            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
              val.includes('landi') ? 'bg-green-500/10 text-green-500' : 'bg-amber-500/10 text-amber-500'
            }`}>
              {val}
            </span>
          )}
        ]}
      />
    </PageContainer>
  );
};

export default Analytics;
