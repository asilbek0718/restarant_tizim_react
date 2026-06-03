import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

/**
 * Enterprise Cashier & POS Store
 * Backend-ready: tracks real transactions and shift state.
 */
const useCashierStore = create(
  persist(
    (set, get) => ({
      transactions: [],
      dailyBalance: 0,
      isOpen: false,
      loading: false,
      error: null,
      
      // Basic Setters
      setTransactions: (transactions) => set({ transactions }),
      setDailyBalance: (balance) => set({ dailyBalance: balance }),
      setLoading: (loading) => set({ loading }),
      setError: (error) => set({ error }),

      /**
       * Logs a transaction in the state
       */
      logTransaction: (transaction) => set((state) => ({
        transactions: [{ 
          ...transaction, 
          id: transaction.id || `TRX-${Date.now()}`, 
          timestamp: transaction.timestamp || new Date().toISOString() 
        }, ...state.transactions],
        dailyBalance: state.dailyBalance + (transaction.amount || 0)
      })),

      openRegister: (initialAmount = 0) => set({ 
        isOpen: true, 
        dailyBalance: initialAmount,
        transactions: [] 
      }),

      closeRegister: () => set({ isOpen: false }),

      getStats: () => {
        const transactions = get().transactions;
        if (transactions.length === 0) return { totalTransactions: 0, totalRevenue: 0, cashPayments: 0, cardPayments: 0, qrPayments: 0 };
        
        return {
          totalTransactions: transactions.length,
          totalRevenue: get().dailyBalance,
          cashPayments: transactions.filter(t => t.method === 'cash').length,
          cardPayments: transactions.filter(t => t.method === 'card').length,
          qrPayments: transactions.filter(t => t.method === 'qr').length,
        };
      },
    }),
    {
      name: 'enterprise-cashier-storage-v1',
      storage: createJSONStorage(() => localStorage),
    }
  )
);

export default useCashierStore;
