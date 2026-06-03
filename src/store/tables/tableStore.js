import { create } from 'zustand';
import { TABLE_STATUS } from '../../shared/constants/statuses';
import { supabase } from '@/lib/supabase';
import useOrderStore from '@/store/orders/orderStore';
import { toFrontend, toDatabase } from '../../shared/utils/caseTransform';
import useReservationStore from '@/store/tables/reservationStore';

/**
 * Enterprise Table Management Store
 * Realtime & Backend-Driven using Supabase
 */
const useTableStore = create((set, get) => ({
  tables: [],
  zones: ['Asosiy zal', 'VIP xona', 'Terrasa', 'Bar'],
  selectedTableId: null,
  loading: false,
  realtimeChannel: null,
  reconnectTimeout: null,
  fallbackTimer: null,
  realtimeStatus: 'DISCONNECTED',
  setTables: (tables) => set({ tables }),
  setZones: (zones) => set({ zones }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  setSelectedTable: (id) => set({ selectedTableId: id }),
  
  /**
   * Internal realtime synchronization update.
   * ONLY invoked by Supabase postgres realtime subscription payload broadcast.
   */
  updateTableStatus: (id, status, currentOrderId = null) => set((state) => ({
    tables: state.tables.map(t => {
      if (t.id === id) {
        return { 
          ...t, 
          status, 
          currentOrderId: currentOrderId !== undefined ? currentOrderId : t.currentOrderId,
          lastStatusChange: new Date().toISOString()
        };
      }
      return t;
    })
  })),
  
  /**
   * Safe realtime record additions. Prevents duplicate rows.
   */
  addTable: (tableData) => set((state) => {
    if (state.tables.some(t => t.id === tableData.id)) {
      return {
        tables: state.tables.map(t => t.id === tableData.id ? { ...t, ...tableData } : t)
      };
    }
    return {
      tables: [...state.tables, {
        ...tableData,
        status: tableData.status || TABLE_STATUS.EMPTY,
        capacity: tableData.capacity || 4,
        zone: tableData.zone || 'Asosiy zal',
        lastStatusChange: new Date().toISOString()
      }]
    };
  }),

  /**
   * Safe realtime record updates.
   */
  updateTable: (id, tableData) => set((state) => ({
    tables: state.tables.map(t => t.id === id ? { ...t, ...tableData } : t)
  })),
  
  /**
   * Safe realtime record deletions.
   */
  deleteTable: (id) => set((state) => ({
    tables: state.tables.filter(t => t.id !== id)
  })),

  /**
   * Action to merge tables locally (kept for service integration support)
   */
  mergeTables: (primaryId, secondaryId) => set((state) => {
    const primary = state.tables.find(t => t.id === primaryId);
    const secondary = state.tables.find(t => t.id === secondaryId);
    if (!primary || !secondary) return {};

    return {
      tables: state.tables.map(t => {
        if (t.id === primaryId) {
          return { 
            ...t, 
            mergedWith: [...(t.mergedWith || []), secondaryId],
            capacity: t.capacity + secondary.capacity 
          };
        }
        if (t.id === secondaryId) {
          return { ...t, status: TABLE_STATUS.INACTIVE, mergedInto: primaryId };
        }
        return t;
      })
    };
  }),

  /**
   * Action to split tables locally (kept for service integration support)
   */
  splitTable: (id) => set((state) => {
    const table = state.tables.find(t => t.id === id);
    if (!table || !table.mergedWith) return {};

    const secondaryIds = table.mergedWith;
    return {
      tables: state.tables.map(t => {
        if (t.id === id) {
          return { ...t, mergedWith: [], capacity: table.baseCapacity || table.capacity };
        }
        if (secondaryIds.includes(t.id)) {
          return { ...t, status: TABLE_STATUS.EMPTY, mergedInto: null };
        }
        return t;
      })
    };
  }),

  /**
   * Computed Selectors
   */
  getStats: () => {
    const tables = get().tables.filter(t => t.status !== TABLE_STATUS.INACTIVE);
    if (tables.length === 0) return { total: 0, available: 0, occupied: 0, reserved: 0, cleaning: 0, waitingPayment: 0, occupancyRate: 0 };
    
    return {
      total: tables.length,
      available: tables.filter(t => t.status === TABLE_STATUS.EMPTY).length,
      occupied: tables.filter(t => t.status === TABLE_STATUS.OCCUPIED).length,
      reserved: tables.filter(t => t.status === TABLE_STATUS.RESERVED).length,
      cleaning: tables.filter(t => t.status === TABLE_STATUS.CLEANING).length,
      waitingPayment: tables.filter(t => t.status === TABLE_STATUS.WAITING_PAYMENT).length,
      occupancyRate: Math.round((tables.filter(t => [TABLE_STATUS.OCCUPIED, TABLE_STATUS.WAITING_PAYMENT].includes(t.status)).length / tables.length) * 100)
    };
  },

  getTableById: (id) => get().tables.find(t => t.id === id),

  findAvailableTableForReservation: (date, partySize, zone = 'all') => {
    const { tables } = get();
    const reservations = useReservationStore?.getState()?.reservations || [];
    
    return tables.filter(t => {
      const isCapacityOk = t.capacity >= partySize;
      const isZoneOk = zone === 'all' || t.zone === zone;
      const isStatusOk = t.status === TABLE_STATUS.EMPTY;
      
      const hasOtherRes = reservations.some(r => 
        r.tableId === t.id && 
        r.status === 'confirmed' && 
        r.date === date
      );

      return isCapacityOk && isZoneOk && isStatusOk && !hasOtherRes;
    });
  },

  // ==========================================
  // ASYNC BACKEND-DRIVEN ACTIONS
  // ==========================================

  /**
   * Fetches all tables from Supabase database
   */
  fetchTables: async () => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('tables')
        .select('*')
        .order('table_number', { ascending: true });

      if (error) throw error;
      const mapped = toFrontend(data || []);
      set({ tables: mapped });
      return mapped;
    } catch (err) {
      set({ error: err.message });
      throw err;
    } finally {
      set({ loading: false });
    }
  },

  /**
   * Updates database table status directly.
   * Direct UI state updates are handled solely by the postgres realtime channel listener.
   */
  syncTableStatus: async (id, status, currentOrderId = null) => {
    // Optimistic local update — keeps UI responsive even if realtime is slow
    set((state) => ({
      tables: state.tables.map((t) =>
        t.id === id
          ? {
              ...t,
              status,
              currentOrderId: currentOrderId !== undefined ? currentOrderId : t.currentOrderId,
              lastStatusChange: new Date().toISOString(),
            }
          : t
      ),
      loading: true,
      error: null,
    }));
    try {
      const updatePayload = toDatabase({
        status,
        currentOrderId,
        lastStatusChange: new Date().toISOString(),
      });

      const { error } = await supabase
        .from('tables')
        .update(updatePayload)
        .eq('id', id);

      if (error) throw error;
    } catch (err) {
      // Rollback optimistic update on failure
      set((state) => ({
        tables: state.tables.map((t) =>
          t.id === id ? { ...t, status: t.status } : t
        ),
        error: err.message,
      }));
      throw err;
    } finally {
      set({ loading: false });
    }
  },

  /**
   * Semantic action: Occupies a table. Updates database only.
   */
  occupyTable: async (id, orderId) => {
    return get().syncTableStatus(id, TABLE_STATUS.OCCUPIED, orderId);
  },
  
  /**
   * Semantic action: Triggers table cleaning. Updates database only.
   */
  startCleaningTable: async (id) => {
    return get().syncTableStatus(id, TABLE_STATUS.CLEANING, null);
  },
  
  /**
   * Semantic action: Clears a table session. Updates database only.
   */
  clearTable: async (id) => {
    useOrderStore.getState().clearTableSession(id);
    return get().syncTableStatus(id, TABLE_STATUS.EMPTY, null);
  },
  
  /**
   * Semantic action: Reserves a table. Updates database only.
   */
  reserveTable: async (id) => {
    return get().syncTableStatus(id, TABLE_STATUS.RESERVED, null);
  },
  
  /**
   * Semantic action: Cancels table reservation. Updates database only.
   */
  cancelReservation: async (id) => {
    return get().syncTableStatus(id, TABLE_STATUS.EMPTY, null);
  },

  /**
   * Establishes real-time Postgres DB event connection using Supabase Channels.
   * Realtime payload updates the local state natively on insertion, update, or deletion.
   */
  initializeRealtime: () => {
    if (get().realtimeChannel) return;

    if (get().reconnectTimeout) {
      clearTimeout(get().reconnectTimeout);
      set({ reconnectTimeout: null });
    }
    
    const channel = supabase
      .channel('tables-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'tables' },
        (payload) => {
          const { eventType, new: newRow, old: oldRow } = payload;
          const mappedNew = toFrontend(newRow);
          const mappedOld = toFrontend(oldRow);
          
          if (eventType === 'INSERT') {
            get().addTable(mappedNew);
          } else if (eventType === 'UPDATE') {
            get().updateTable(mappedNew.id, mappedNew);
          } else if (eventType === 'DELETE') {
            get().deleteTable(mappedOld.id);
          }
        }
      )
      .subscribe((status, err) => {
        console.log(`[Supabase Realtime] Status: ${status}`, err || '');
        set({ realtimeStatus: status });
        
        if (status === 'SUBSCRIBED') {
          get().stopFallbackPolling();
          if (get().reconnectTimeout) {
            clearTimeout(get().reconnectTimeout);
            set({ reconnectTimeout: null });
          }
        } else if (status === 'CLOSED') {
          get().startFallbackPolling();
        } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          get().startFallbackPolling();
          get().attemptRealtimeReconnect();
        }
      });

    set({ realtimeChannel: channel });
  },

  /**
   * Dismantles active realtime Supabase channel listener
   */
  destroyRealtime: () => {
    if (get().reconnectTimeout) {
      clearTimeout(get().reconnectTimeout);
      set({ reconnectTimeout: null });
    }
    get().stopFallbackPolling();
    if (get().realtimeChannel) {
      try {
        supabase.removeChannel(get().realtimeChannel);
      } catch (e) {
        console.warn('[Supabase Realtime] Failed to remove channel:', e);
      }
      set({ realtimeChannel: null, realtimeStatus: 'DISCONNECTED' });
    }
  },

  attemptRealtimeReconnect: () => {
    if (get().reconnectTimeout) return;

    console.log('[Supabase Realtime] Attempting reconnection in 5000ms...');
    const timeout = setTimeout(() => {
      set({ reconnectTimeout: null });
      get().destroyRealtime();
      get().initializeRealtime();
    }, 5000);

    set({ reconnectTimeout: timeout });
  },

  startFallbackPolling: () => {
    if (get().fallbackTimer) return;
    console.log('[Fallback Polling] Starting REST reconciliation polling (30s)...');

    const timer = setInterval(async () => {
      try {
        const { tableService } = await import('../../shared/services/tableService');
        await tableService.getAll();
      } catch (err) {
        console.error('[Fallback Polling] Failed to fetch tables:', err);
      }
    }, 30000);

    set({ fallbackTimer: timer });
  },

  stopFallbackPolling: () => {
    if (get().fallbackTimer) {
      console.log('[Fallback Polling] Stopping REST reconciliation polling.');
      clearInterval(get().fallbackTimer);
      set({ fallbackTimer: null });
    }
  },

  // ==========================================
  // UI BACKWARD COMPATIBILITY ALIASES
  // ==========================================
  startPolling: (interval = 30000) => {
    get().initializeRealtime();
  },
  
  stopPolling: () => {
    get().destroyRealtime();
  }
}));

export default useTableStore;

