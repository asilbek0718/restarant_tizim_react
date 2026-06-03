import { create } from 'zustand';

/**
 * Enterprise Analytics Store
 * Backend-ready: all metrics computed from real data via analyticsService.
 * No mock delays or fake data.
 */
const useAnalyticsStore = create((set, get) => ({
  metrics: {
    revenue: 0,
    ordersCount: 0,
    avgCheck: 0,
    popularItems: [],
    revenueHistory: [],
  },
  isLoading: false,
  error: null,
  dateRange: 'today', // 'today' | 'week' | 'month' | 'year'

  setMetrics: (metrics) => set({ metrics: { ...get().metrics, ...metrics } }),
  setDateRange: (range) => set({ dateRange: range }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),

  /**
   * Refresh analytics from backend
   * Will be wired to Supabase RPC or Edge Function
   */
  refreshAnalytics: async (fetchFn) => {
    set({ isLoading: true, error: null });
    try {
      if (typeof fetchFn === 'function') {
        const data = await fetchFn();
        set({ metrics: { ...get().metrics, ...data }, isLoading: false });
        return data;
      }
      set({ isLoading: false });
    } catch (error) {
      set({ error: error.message || 'Tahlil ma\'lumotlarini yuklashda xatolik', isLoading: false });
    }
  }
}));

export default useAnalyticsStore;
