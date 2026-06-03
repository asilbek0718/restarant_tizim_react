import { create } from 'zustand';

const activeTimeouts = new Map();

/**
 * Enterprise-grade Notification Store
 * Handles global toast/alert notifications.
 */
const useNotificationStore = create((set) => ({
  notifications: [],
  
  /**
   * Adds a new notification
   * @param {Object} notification - { message, type: 'success'|'error'|'info'|'warning', duration: 3000 }
   */
  notify: (notification) => {
    const id = Date.now();
    const duration = notification.duration || 3000;
    
    set((state) => ({
      notifications: [
        ...state.notifications, 
        { ...notification, id }
      ]
    }));
    
    // Auto-dismiss
    if (duration !== -1) {
      const timer = setTimeout(() => {
        set((state) => ({
          notifications: state.notifications.filter(n => n.id !== id)
        }));
        activeTimeouts.delete(id);
      }, duration);
      activeTimeouts.set(id, timer);
    }
    
    // Play Sound if requested
    if (notification.sound) {
      try {
        const audio = new Audio('/sounds/notification.mp3');
        audio.play().catch(() => console.log('Sound playback blocked by browser'));
      } catch (e) {}
    }
    
    return id;
  },
  
  removeNotification: (id) => {
    const timer = activeTimeouts.get(id);
    if (timer) {
      clearTimeout(timer);
      activeTimeouts.delete(id);
    }
    set((state) => ({
      notifications: state.notifications.filter(n => n.id !== id)
    }));
  },
  
  clearAll: () => {
    activeTimeouts.forEach((timer) => clearTimeout(timer));
    activeTimeouts.clear();
    set({ notifications: [] });
  },
}));

export default useNotificationStore;
