/**
 * Enterprise Realtime Event Bus
 * Decouples realtime providers (WS, Pusher, Supabase) from UI components.
 */
class EventBus {
  constructor() {
    this.events = {};
  }

  /**
   * Subscribe to a realtime event
   * @param {string} event - e.g., 'ORDER_UPDATED'
   * @param {Function} callback 
   */
  subscribe(event, callback) {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(callback);
    
    // Return unsubscribe function for useEffect cleanup
    return () => {
      this.events[event] = this.events[event].filter(cb => cb !== callback);
    };
  }

  /**
   * Broadcast an event to all subscribers
   * @param {string} event 
   * @param {any} data 
   */
  publish(event, data) {
    if (!this.events[event]) return;
    this.events[event].forEach(callback => callback(data));
  }

  /**
   * Standardized Event Names
   */
  static EVENTS = {
    ORDER_CREATED: 'ORDER_CREATED',
    ORDER_STATUS_CHANGED: 'ORDER_STATUS_CHANGED',
    TABLE_STATUS_CHANGED: 'TABLE_STATUS_CHANGED',
    KITCHEN_READY: 'KITCHEN_READY',
    PAYMENT_COMPLETED: 'PAYMENT_COMPLETED',
    STOCK_LOW: 'STOCK_LOW',
  };
}

export const eventBus = new EventBus();
