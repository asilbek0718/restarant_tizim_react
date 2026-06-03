import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * Enterprise-grade UI Store
 * Manages global layout, theme, and interaction states.
 */
const useUIStore = create(
  persist(
    (set, get) => ({
      // Theme State
      theme: 'dark', // 'dark' | 'light'
      
      // Layout State
      isSidebarOpen: false,
      
      // Loading State
      isGlobalLoading: false,
      
      // Modal Management
      activeModal: null, // id of the current modal
      modalData: null,
      
      // Actions
      toggleTheme: () => set((state) => ({ 
        theme: state.theme === 'dark' ? 'light' : 'dark' 
      })),
      
      setTheme: (theme) => set({ theme }),
      
      toggleSidebar: () => set((state) => ({ 
        isSidebarOpen: !state.isSidebarOpen 
      })),
      
      setSidebar: (isOpen) => set({ isSidebarOpen: isOpen }),
      
      setLoading: (isLoading) => set({ isGlobalLoading: isLoading }),
      
      openModal: (modalId, data = null) => set({ 
        activeModal: modalId, 
        modalData: data 
      }),
      
      closeModal: () => set({ 
        activeModal: null, 
        modalData: null 
      }),
    }),
    {
      name: 'ui-storage',
      // Only persist theme and layout preferences
      partialize: (state) => ({ 
        theme: state.theme,
        isSidebarOpen: state.isSidebarOpen 
      }),
    }
  )
);

export default useUIStore;
