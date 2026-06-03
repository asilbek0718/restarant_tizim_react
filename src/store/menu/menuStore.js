import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

/**
 * Enterprise Menu Store
 * Backend-ready: handles products, categories, stock, and availability.
 */
const useMenuStore = create(
  persist(
    (set, get) => ({
      items: [],
      categories: [],
      loading: false,
      error: null,
      
      // Actions
      setItems: (items) => set({ items }),
      setCategories: (categories) => set({ categories }),
      setLoading: (loading) => set({ loading }),
      setError: (error) => set({ error }),

      // Categories
      addCategory: (category) => set((state) => ({
        categories: [...state.categories, { 
          ...category, 
          id: category.id || `CAT-${Date.now()}` 
        }]
      })),

      updateCategory: (id, updates) => set((state) => ({
        categories: state.categories.map(c => c.id === id ? { ...c, ...updates } : c)
      })),

      deleteCategory: (id) => set((state) => ({
        categories: state.categories.filter(c => c.id !== id)
      })),

      addItem: (item) => set((state) => ({ 
        items: [...state.items, { 
          ...item, 
          id: item.id || `PRD-${Date.now()}`,
          variants: item.variants || [],
          modifiers: item.modifiers || [],
          stock: item.stock ?? 0,
          isAvailable: item.isAvailable ?? true,
          status: item.status || 'available', // available, unavailable, hidden, out_of_stock
          spicyLevel: item.spicyLevel || 0,
          cookingTime: item.cookingTime || 0,
          discountPrice: item.discountPrice || null,
          tags: item.tags || [],
          ingredients: item.ingredients || []
        }] 
      })),

      updateItem: (id, updates) => set((state) => ({
        items: state.items.map(item => item.id === id ? { ...item, ...updates } : item)
      })),

      deleteItem: (id) => set((state) => ({
        items: state.items.filter(item => item.id !== id)
      })),

      // Business Logic
      getStats: () => {
        const items = get().items;
        if (items.length === 0) return { total: 0, available: 0, lowStock: 0, outOfStock: 0, hidden: 0 };
        return {
          total: items.length,
          available: items.filter(i => i.status === 'available' && (i.stock === undefined || i.stock > 0)).length,
          lowStock: items.filter(i => i.stock !== undefined && i.stock < 10 && i.stock > 0).length,
          outOfStock: items.filter(i => i.status === 'out_of_stock' || i.stock === 0).length,
          hidden: items.filter(i => i.status === 'hidden').length,
        };
      },

      getItemsByCategory: (categoryId) => {
        if (categoryId === 'all') return get().items;
        return get().items.filter(item => item.categoryId === categoryId || item.category === categoryId);
      },

      /**
       * Deduct stock based on order items
       * Will be moved to Supabase Database Functions (Triggers) in production
       */
      deductStock: (orderItems) => set((state) => ({
        items: state.items.map(item => {
          const ordered = orderItems.find(oi => oi.id === item.id);
          if (ordered) {
            const newStock = Math.max(0, item.stock - (ordered.quantity || 1));
            return { 
              ...item, 
              stock: newStock,
              isAvailable: newStock > 0
            };
          }
          return item;
        })
      }))
    }),
    {
      name: 'enterprise-menu-storage-v1',
      storage: createJSONStorage(() => localStorage),
    }
  )
);

export default useMenuStore;
