import api from '../api/axiosInstance';
import useOrderStore from '@/store/orders/orderStore';
import { ORDER_STATUS } from '../constants/statuses';

/**
 * Enterprise Analytics Engine
 * Processes operational data into business intelligence.
 */
class AnalyticsService {
  constructor() {
    this.getDashboardSummary = this.getDashboardSummary.bind(this);
    this.calculateLocalMetrics = this.calculateLocalMetrics.bind(this);
    this.getStaffPerformance = this.getStaffPerformance.bind(this);
  }
  /**
   * Generates comprehensive dashboard metrics
   */
  async getDashboardSummary() {
    try {
      const response = await api.get('/analytics/summary');
      return response.data;
    } catch (error) {
      // Logic-based fallback from store
      const orders = useOrderStore.getState().orders;
      return this.calculateLocalMetrics(orders);
    }
  }

  /**
   * Calculates metrics from local store data
   */
  calculateLocalMetrics(orders) {
    const safeOrders = Array.isArray(orders) ? orders : [];
    const paidOrders = safeOrders.filter(o => o.status === ORDER_STATUS.PAID || o.status === ORDER_STATUS.COMPLETED);
    
    // Revenue by day of week
    const revenueByDay = paidOrders.reduce((acc, order) => {
      const day = new Date(order.createdAt).toLocaleDateString('uz-UZ', { weekday: 'short' });
      acc[day] = (acc[day] || 0) + (order.total || 0);
      return acc;
    }, {});

    // Table Turnover Rate
    const tableUsage = safeOrders.reduce((acc, order) => {
      if (order.tableId) acc[order.tableId] = (acc[order.tableId] || 0) + 1;
      return acc;
    }, {});
    
    // Category sales mapping
    const categorySales = {};
    paidOrders.forEach(order => {
      if (order.items) {
        order.items.forEach(item => {
          const cat = item.category || 'Boshqa';
          categorySales[cat] = (categorySales[cat] || 0) + (item.price * item.quantity);
        });
      }
    });

    // Busy Hours (Orders per hour)
    const busyHours = safeOrders.reduce((acc, order) => {
      const hour = new Date(order.createdAt).getHours();
      acc[hour] = (acc[hour] || 0) + 1;
      return acc;
    }, {});

    // Kitchen Performance (Average Prep Time)
    const completedPrep = safeOrders.filter(o => o.preparationStartTime && o.preparationEndTime);
    const avgPrepTime = completedPrep.length 
      ? completedPrep.reduce((acc, o) => acc + (new Date(o.preparationEndTime) - new Date(o.preparationStartTime)), 0) / completedPrep.length / 60000
      : 0;

    return {
      revenueByDay,
      categorySales,
      busyHours,
      avgPrepTime: Math.round(avgPrepTime),
      topTables: Object.entries(tableUsage).sort((a, b) => b[1] - a[1]).slice(0, 5),
      totalRevenue: paidOrders.reduce((sum, o) => sum + (o.total || 0), 0),
    };
  }

  /**
   * Staff Performance Analytics
   */
  getStaffPerformance(orders) {
    return orders.reduce((acc, order) => {
      const waiter = order.waiterName || 'Noma\'lum';
      if (!acc[waiter]) {
        acc[waiter] = { name: waiter, orders: 0, revenue: 0, avgTime: 0 };
      }
      acc[waiter].orders += 1;
      acc[waiter].revenue += (order.total || 0);
      return acc;
    }, {});
  }
}

export const analyticsService = new AnalyticsService();
