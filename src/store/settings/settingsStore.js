import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

/**
 * Enterprise Settings Store
 * Complete restaurant ERP configuration center.
 * Supabase-ready: all data normalised for direct table mapping.
 */
const useSettingsStore = create(
  persist(
    (set, get) => ({
      /* ═══════════════════════════════════════════
         1. UMUMIY — General Restaurant Info
      ═══════════════════════════════════════════ */
      restaurant: {
        name: '',
        phone: '',
        email: '',
        address: '',
        currency: 'UZS',
        timezone: 'Asia/Tashkent',
        workingHours: { open: '09:00', close: '23:00' },
        logo: null,
        qrEnabled: false,
        tablePrefix: 'S',
        orderPrefix: 'B',
      },

      /* ═══════════════════════════════════════════
         2. FILIALLAR — Branches & Halls
      ═══════════════════════════════════════════ */
      branches: [],
      halls: [],

      /* ═══════════════════════════════════════════
         3. STOL — Table Config
      ═══════════════════════════════════════════ */
      tables: {
        autoNumbering: true,
        reservationTimeout: 30,
        cleaningTimeout: 10,
        maxSeats: 12,
        vipEnabled: true,
        statusColors: {
          available: '#22c55e',
          occupied: '#ef4444',
          reserved: '#f59e0b',
          cleaning: '#8b5cf6',
        },
      },

      /* ═══════════════════════════════════════════
         4. BUYURTMA — Order Config
      ═══════════════════════════════════════════ */
      orders: {
        taxRate: 12,
        serviceFee: 10,
        minOrderAmount: 0,
        splitPayment: true,
        cancelReasons: [
          "Mijoz bekor qildi",
          "Taom tugadi",
          "Kutish vaqti oshdi",
          "Xato buyurtma",
        ],
        statusWorkflow: ['pending', 'preparing', 'ready', 'delivered', 'paid'],
        autoSendKitchen: true,
      },

      /* ═══════════════════════════════════════════
         5. OSHXONA — Kitchen Config
      ═══════════════════════════════════════════ */
      kitchen: {
        autoRefresh: true,
        refreshInterval: 15,
        readyTimeout: 5,
        sections: ['Issiq taomlar', 'Salatlar', 'Ichimliklar', 'Desertlar'],
        prepTimeLimit: 30,
        priorityColors: {
          normal: '#22c55e',
          high: '#f59e0b',
          urgent: '#ef4444',
        },
      },

      /* ═══════════════════════════════════════════
         6. KASSA — Cashier Config
      ═══════════════════════════════════════════ */
      cashier: {
        paymentMethods: [
          { id: 'cash', name: 'Naqd pul', enabled: true },
          { id: 'card', name: 'Bank kartasi', enabled: true },
          { id: 'qr', name: 'QR / Payme', enabled: true },
          { id: 'transfer', name: "Bank o'tkazmasi", enabled: false },
        ],
        printReceipt: true,
        shiftCloseRules: { requireReport: true, requireCashCount: true },
        refundEnabled: true,
        refundTimeLimit: 24,
      },

      /* ═══════════════════════════════════════════
         7. RUXSATLAR — Permissions
      ═══════════════════════════════════════════ */
      permissions: {
        admin:   { dashboard: true, tables: true, menu: true, orders: true, kitchen: true, cashier: true, analytics: true, staff: true, settings: true },
        manager: { dashboard: true, tables: true, menu: true, orders: true, kitchen: true, cashier: true, analytics: true, staff: false, settings: false },
        cashier: { dashboard: false, tables: false, menu: false, orders: true, kitchen: false, cashier: true, analytics: false, staff: false, settings: false },
        waiter:  { dashboard: false, tables: true, menu: true, orders: true, kitchen: false, cashier: false, analytics: false, staff: false, settings: false },
        kitchen: { dashboard: false, tables: false, menu: false, orders: false, kitchen: true, cashier: false, analytics: false, staff: false, settings: false },
      },

      /* ═══════════════════════════════════════════
         8. TIZIM — System Config
      ═══════════════════════════════════════════ */
      system: {
        language: 'uz',
        notifications: true,
        soundEnabled: true,
        autoBackup: false,
        sessionTimeout: 60,
        lowStockThreshold: 10,
      },

      /* ═══════════════════════════════════════════
         META
      ═══════════════════════════════════════════ */
      loading: false,
      error: null,
      _saveToast: null,

      /* ═══════════════════════════════════════════
         ACTIONS
      ═══════════════════════════════════════════ */
      setLoading: (loading) => set({ loading }),
      setError: (error) => set({ error }),

      // Generic section updater
      updateSection: (section, data) => set((state) => ({
        [section]: { ...(state[section] || {}), ...data },
      })),

      // Convenience aliases
      updateRestaurant: (data) => get().updateSection('restaurant', data),
      updateTables: (data) => get().updateSection('tables', data),
      updateOrders: (data) => get().updateSection('orders', data),
      updateKitchen: (data) => get().updateSection('kitchen', data),
      updateCashier: (data) => get().updateSection('cashier', data),
      updateSystem: (data) => get().updateSection('system', data),

      // Permission helpers
      updatePermissions: (role, perms) => set((state) => ({
        permissions: { ...state.permissions, [role]: { ...(state.permissions[role] || {}), ...perms } }
      })),

      // Branch CRUD
      addBranch: (branch) => set((state) => ({
        branches: [...state.branches, { ...branch, id: `BR-${Date.now()}`, is_active: true }]
      })),
      updateBranch: (id, data) => set((state) => ({
        branches: state.branches.map(b => b.id === id ? { ...b, ...data } : b)
      })),
      removeBranch: (id) => set((state) => ({
        branches: state.branches.filter(b => b.id !== id)
      })),

      // Hall CRUD
      addHall: (hall) => set((state) => ({
        halls: [...state.halls, { ...hall, id: `HL-${Date.now()}`, is_active: true }]
      })),
      updateHall: (id, data) => set((state) => ({
        halls: state.halls.map(h => h.id === id ? { ...h, ...data } : h)
      })),
      removeHall: (id) => set((state) => ({
        halls: state.halls.filter(h => h.id !== id)
      })),

      // Cancel reason CRUD
      addCancelReason: (reason) => set((state) => ({
        orders: { ...state.orders, cancelReasons: [...(state.orders.cancelReasons || []), reason] }
      })),
      removeCancelReason: (idx) => set((state) => ({
        orders: { ...state.orders, cancelReasons: state.orders.cancelReasons.filter((_, i) => i !== idx) }
      })),

      // Kitchen section CRUD
      addKitchenSection: (section) => set((state) => ({
        kitchen: { ...state.kitchen, sections: [...(state.kitchen.sections || []), section] }
      })),
      removeKitchenSection: (idx) => set((state) => ({
        kitchen: { ...state.kitchen, sections: state.kitchen.sections.filter((_, i) => i !== idx) }
      })),

      // Payment method toggle
      togglePaymentMethod: (id) => set((state) => ({
        cashier: {
          ...state.cashier,
          paymentMethods: state.cashier.paymentMethods.map(m =>
            m.id === id ? { ...m, enabled: !m.enabled } : m
          )
        }
      })),

      // Hydrate from Supabase
      hydrateSettings: (data) => {
        const state = get();
        const next = {};
        const sections = ['restaurant', 'tables', 'orders', 'kitchen', 'cashier', 'system', 'permissions', 'branches', 'halls'];
        sections.forEach(key => {
          if (data[key] !== undefined) {
            if (Array.isArray(data[key])) {
              next[key] = data[key];
            } else {
              next[key] = { ...(state[key] || {}), ...data[key] };
            }
          }
        });
        set(next);
      },

      resetToDefaults: () => set({
        restaurant: { name: '', phone: '', email: '', address: '', currency: 'UZS', timezone: 'Asia/Tashkent', workingHours: { open: '09:00', close: '23:00' }, logo: null, qrEnabled: false, tablePrefix: 'S', orderPrefix: 'B' },
        branches: [],
        halls: [],
        tables: { autoNumbering: true, reservationTimeout: 30, cleaningTimeout: 10, maxSeats: 12, vipEnabled: true, statusColors: { available: '#22c55e', occupied: '#ef4444', reserved: '#f59e0b', cleaning: '#8b5cf6' } },
        orders: { taxRate: 12, serviceFee: 10, minOrderAmount: 0, splitPayment: true, cancelReasons: ["Mijoz bekor qildi", "Taom tugadi", "Kutish vaqti oshdi", "Xato buyurtma"], statusWorkflow: ['pending', 'preparing', 'ready', 'delivered', 'paid'], autoSendKitchen: true },
        kitchen: { autoRefresh: true, refreshInterval: 15, readyTimeout: 5, sections: ['Issiq taomlar', 'Salatlar', 'Ichimliklar', 'Desertlar'], prepTimeLimit: 30, priorityColors: { normal: '#22c55e', high: '#f59e0b', urgent: '#ef4444' } },
        cashier: { paymentMethods: [{ id: 'cash', name: 'Naqd pul', enabled: true }, { id: 'card', name: 'Bank kartasi', enabled: true }, { id: 'qr', name: 'QR / Payme', enabled: true }, { id: 'transfer', name: "Bank o'tkazmasi", enabled: false }], printReceipt: true, shiftCloseRules: { requireReport: true, requireCashCount: true }, refundEnabled: true, refundTimeLimit: 24 },
        permissions: { admin: { dashboard: true, tables: true, menu: true, orders: true, kitchen: true, cashier: true, analytics: true, staff: true, settings: true }, manager: { dashboard: true, tables: true, menu: true, orders: true, kitchen: true, cashier: true, analytics: true, staff: false, settings: false }, cashier: { dashboard: false, tables: false, menu: false, orders: true, kitchen: false, cashier: true, analytics: false, staff: false, settings: false }, waiter: { dashboard: false, tables: true, menu: true, orders: true, kitchen: false, cashier: false, analytics: false, staff: false, settings: false }, kitchen: { dashboard: false, tables: false, menu: false, orders: false, kitchen: true, cashier: false, analytics: false, staff: false, settings: false } },
        system: { language: 'uz', notifications: true, soundEnabled: true, autoBackup: false, sessionTimeout: 60, lowStockThreshold: 10 },
      }),
    }),
    {
      name: 'enterprise-settings-storage-v1',
      storage: createJSONStorage(() => localStorage),
    }
  )
);

export default useSettingsStore;
