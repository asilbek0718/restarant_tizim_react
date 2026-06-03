import React from 'react';
import { TRANSLATIONS } from '@/shared/constants/translations';

// Shared UI
import { PageContainer } from '@/shared/ui';

// Dashboard Widgets & Sections
import DashboardHeader from '../components/dashboard/DashboardHeader';
import StatCard from '../components/dashboard/StatCard';
import RevenueChart from '../components/dashboard/RevenueChart';
import SalesOverview from '../components/dashboard/SalesOverview';
import ActivityTimeline from '../components/dashboard/ActivityTimeline';
import QuickActionCard from '../components/dashboard/QuickActionCard';
import RecentOrders from '../components/dashboard/RecentOrders';
import TopSellingFoods from '../components/dashboard/TopSellingFoods';
import AnalyticsCard from '../components/dashboard/AnalyticsCard';
import {
  TrendingUp,
  ShoppingBag,
  Users,
  Clock,
  Plus,
  Utensils,
  Receipt
} from 'lucide-react';
import { ORDER_STATUS } from '@/shared/constants/statuses';

import useOrderStore from '@/store/orders/orderStore';
import useTableStore from '@/store/tables/tableStore';
import useMenuStore from '@/store/menu/menuStore';
import useReservationStore from '@/store/tables/reservationStore';
import { usePermissions } from '@/shared/hooks/usePermissions';
import { useFetch } from '@/shared/hooks/useFetch';
import { orderService } from '@/shared/services/orderService';
import { tableService } from '@/shared/services/tableService';
import { menuService } from '@/shared/services/menuService';
import { analyticsService } from '@/shared/services/analyticsService';

import { useNavigate } from 'react-router-dom';
import { useEffect, useMemo } from 'react';

const Dashboard = () => {
  const t = TRANSLATIONS.dashboard;
  const common = TRANSLATIONS.common;
  const { canAccessModule } = usePermissions();
  const navigate = useNavigate();

  const orders = useOrderStore(state => state.orders);
  const getOrderStats = useOrderStore(state => state.getStats);
  const startPolling = useOrderStore(state => state.startPolling);
  const stopPolling = useOrderStore(state => state.stopPolling);

  const tables = useTableStore(state => state.tables);
  const getTableStats = useTableStore(state => state.getStats);

  const menuItems = useMenuStore(state => state.items);

  const reservations = useReservationStore(state => state.reservations);
  const getResStats = useReservationStore(state => state.getStats);

  const { loading: ordersLoading, error: ordersError, refresh: refreshOrders } = useFetch(orderService.fetchAll, [], []);
  const { loading: tablesLoading, error: tablesError } = useFetch(tableService.getAll, [], []);
  const { loading: menuLoading } = useFetch(menuService.fetchMenuItems, [], []);

  useEffect(() => {
    startPolling('dashboard', 10000); // 10s sync
    return () => stopPolling('dashboard');
  }, [startPolling, stopPolling]);

  const orderStats = useMemo(() => getOrderStats() || {
    totalRevenue: 0,
    completedTodayCount: 0,
    activeOrdersCount: 0,
    pendingOrdersCount: 0,
    kitchenQueueCount: 0,
    avgPrepTime: 0
  }, [orders, getOrderStats]);

  const tableStats = useMemo(() => getTableStats() || { occupied: 0, total: 0, available: 0, reserved: 0, occupancyRate: 0 }, [tables, getTableStats]);
  const resStats = useMemo(() => getResStats() || { today: 0, pending: 0 }, [reservations, getResStats]);

  const isLoading = ordersLoading || tablesLoading || menuLoading;

  const analytics = useMemo(() => analyticsService.calculateLocalMetrics(orders), [orders]);

  const realRevenueData = useMemo(() => Object.entries(analytics.revenueByDay || {}).map(([day, revenue]) => ({
    name: day,
    uv: revenue,
  })), [analytics.revenueByDay]);

  // Pass real data directly to components to trigger their professional empty state guards
  const chartData = realRevenueData;

  const chartSalesData = useMemo(() => Object.entries(analytics.categorySales || {}).map(([name, value], i) => {
    const colors = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];
    return { name, value, color: colors[i % colors.length] };
  }), [analytics.categorySales]);

  const finalSalesData = chartSalesData;

  const realTimeline = useMemo(() => (Array.isArray(orders) ? orders : [])
    .filter(o => o.status !== ORDER_STATUS.PENDING)
    .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
    .slice(0, 5)
    .map(o => ({
      id: o.id,
      title: `Buyurtma #${o.id} - ${o.status}`,
      description: `${o.items?.length || 0} ta taom - ${(o.total || 0).toLocaleString()} so'm`,
      time: o.updatedAt ? new Date(o.updatedAt).toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' }) : '',
      type: 'order'
    })), [orders]);

  // Top foods based on order occurrences
  const topFoods = useMemo(() => {
    const itemCounts = {};
    orders.forEach(o => {
      if (o.items) {
        o.items.forEach(i => {
          itemCounts[i.id] = (itemCounts[i.id] || 0) + i.quantity;
        });
      }
    });

    return (Array.isArray(menuItems) ? menuItems : [])
      .map(i => ({
        ...i,
        sales: itemCounts[i.id] || 0,
        revenue: (itemCounts[i.id] || 0) * (i.price || 0)
      }))
      .filter(i => i.sales > 0)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);
  }, [orders, menuItems]);

  if (isLoading && !orders.length) {
    return (
      <PageContainer>
        <div className="h-[60vh] w-full flex flex-col items-center justify-center gap-4">
          <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-black text-slate-500 uppercase tracking-widest animate-pulse">Ma'lumotlar yuklanmoqda...</p>
        </div>
      </PageContainer>
    );
  }

  if (ordersError || tablesError) {
    return (
      <PageContainer>
        <div className="h-[60vh] w-full flex flex-col items-center justify-center gap-6 text-center">
          <div className="p-6 bg-red-500/10 rounded-[40px]">
            <Utensils className="w-16 h-16 text-red-500 opacity-50" />
          </div>
          <div>
            <h2 className="text-2xl font-black dark:text-white text-slate-900 uppercase tracking-tighter mb-2">Ma'lumotlarni yuklashda xatolik</h2>
            <p className="text-slate-500 max-w-xs mx-auto">{ordersError || tablesError}</p>
          </div>
          <button
            onClick={() => refreshOrders()}
            className="px-8 py-3 bg-primary-500 text-white rounded-[20px] font-black uppercase tracking-widest hover:bg-primary-600 transition-all shadow-xl shadow-primary-500/30"
          >
            Qayta urinish
          </button>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <DashboardHeader
          title={t?.welcome || 'Xush kelibsiz'}
          subtitle={t?.subtitle || ''}
          date={new Date().toLocaleDateString('uz-UZ', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        />
        <div className="flex items-center gap-2 bg-green-500/10 text-green-500 px-4 py-2 rounded-full border border-green-500/20 self-start sm:self-center">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <span className="text-[10px] font-black uppercase tracking-widest">Real vaqtda sinxronizatsiya faol</span>
        </div>
      </div>

      {/* KPI Stats — Balanced & Intentional */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {canAccessModule('analytics') && (
          <StatCard
            icon={TrendingUp}
            label={t?.totalRevenue}
            value={`${(orderStats?.totalRevenue || 0).toLocaleString()} ${common?.currency || 'so\'m'}`}
            trend={orderStats?.totalRevenue > 0 ? "up" : "neutral"}
            trendValue={`Bugun: ${orderStats?.completedTodayCount || 0} ta buyurtma`}
            colorClass="text-primary-500 bg-primary-500"
          />
        )}
        <StatCard
          icon={ShoppingBag}
          label="Faol buyurtmalar"
          value={String(orderStats?.activeOrdersCount ?? 0)}
          trend="up"
          trendValue={`Kutilmoqda: ${orderStats?.pendingOrdersCount ?? 0} | Oshxonada: ${orderStats?.kitchenQueueCount ?? 0}`}
          colorClass="text-blue-500 bg-blue-500"
        />
        <StatCard
          icon={Users}
          label={t?.activeTables}
          value={`${tableStats?.occupied || 0}/${tableStats?.total || 0}`}
          trend={(tableStats?.occupied || 0) > 10 ? "up" : "down"}
          trendValue={`Bandlik: ${tableStats?.occupancyRate}%`}
          colorClass="text-amber-500 bg-amber-500"
        />
        <StatCard
          icon={Clock}
          label="Oshxona tezligi"
          value={`${orderStats?.avgPrepTime} min`}
          trend="up"
          trendValue={`O'rtacha tayyorlash vaqti`}
          colorClass="text-green-500 bg-green-500"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
        {/* Revenue Chart — Dominant Section (8 cols) */}
        {canAccessModule('analytics') && (
          <div className="lg:col-span-8 min-w-0">
            <RevenueChart data={chartData} title="Daromad tahlili" />
          </div>
        )}

        {/* Sales Overview — (4 cols) */}
        <div className={canAccessModule('analytics') ? "lg:col-span-4 min-w-0" : "lg:col-span-12 min-w-0"}>
          <SalesOverview data={finalSalesData} title="Kategoriyalar bo'yicha" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
        {/* Recent Orders — Main focus (7 cols) */}
        <div className="lg:col-span-7">
          <RecentOrders orders={(Array.isArray(orders) ? orders : []).slice(0, 6)} onViewAll={() => navigate('/orders')} />
        </div>

        {/* Activity Timeline — Side focus (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-8">
          <ActivityTimeline activities={realTimeline.length ? realTimeline : [{ id: 1, title: 'Faollik yo\'q', description: 'Hozircha buyurtmalar mavjud emas', time: '', type: 'system' }]} title="So'nggi faollik" />
          <TopSellingFoods foods={topFoods} title="Eng ko'p sotilganlar" />
        </div>
      </div>

      {/* Quick Actions — Clean Footer Section */}
      <div className="border-t dark:border-white/5 border-slate-200 pt-10">
        <h3 className="text-sm font-black text-slate-500 uppercase tracking-widest mb-6">Tezkor amallar</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <QuickActionCard
            title="Yangi buyurtma"
            description="Yangi zal yoki olib ketish buyurtmasi"
            icon={Plus}
            onClick={() => navigate('/orders')}
            colorClass="text-blue-500 bg-blue-500"
          />
          {canAccessModule('menu') && (
            <QuickActionCard
              title="Menyuni boshqarish"
              description="Taomlar va narxlarni yangilash"
              icon={Utensils}
              onClick={() => navigate('/menu')}
              colorClass="text-primary-500 bg-primary-500"
            />
          )}
          {canAccessModule('analytics') && (
            <QuickActionCard
              title="Hisobotlar"
              description="Kunlik savdo natijalari"
              icon={Receipt}
              onClick={() => navigate('/analytics')}
              colorClass="text-green-500 bg-green-500"
            />
          )}
        </div>
      </div>
    </PageContainer>

  );
};

export default Dashboard;
