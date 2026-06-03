import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

/**
 * Enterprise Reservation Management Store
 * Backend-ready: dedicated to booking lifecycles and scheduling.
 */
const useReservationStore = create(
  persist(
    (set, get) => ({
      reservations: [],
      loading: false,
      error: null,
      
      // Actions
      setReservations: (reservations) => set({ reservations }),
      setLoading: (loading) => set({ loading }),
      setError: (error) => set({ error }),
      
      addReservation: (resData) => set((state) => {
        const newRes = {
          ...resData,
          id: resData.id || `RES-${Date.now()}`,
          status: resData.status || 'pending',
          createdAt: resData.createdAt || new Date().toISOString()
        };
        return { reservations: [...state.reservations, newRes] };
      }),

      updateReservation: (id, resData) => set((state) => ({
        reservations: state.reservations.map(r => r.id === id ? { ...r, ...resData, updatedAt: new Date().toISOString() } : r)
      })),

      deleteReservation: (id) => set((state) => ({
        reservations: state.reservations.filter(r => r.id !== id)
      }),),

      // Computed Selectors
      getStats: () => {
        const reservations = get().reservations;
        if (reservations.length === 0) return { total: 0, today: 0, pending: 0, confirmed: 0, cancelled: 0 };
        
        const today = new Date().toISOString().split('T')[0];
        const todaysRes = reservations.filter(r => r.date === today);
        
        return {
          total: reservations.length,
          today: todaysRes.length,
          pending: todaysRes.filter(r => r.status === 'pending').length,
          confirmed: todaysRes.filter(r => r.status === 'confirmed').length,
          cancelled: todaysRes.filter(r => r.status === 'cancelled').length,
        };
      },

      getReservationsByDate: (date) => get().reservations.filter(r => r.date === date),
    }),
    {
      name: 'enterprise-reservation-storage-v1',
      storage: createJSONStorage(() => localStorage),
    }
  )
);

export default useReservationStore;
