import api from '../api/axiosInstance';
import useOrderStore from '@/store/orders/orderStore';
import useTableStore from '@/store/tables/tableStore';
import { ORDER_STATUS, TABLE_STATUS, VALID_TRANSITIONS } from '../constants/statuses';
import { financeUtils } from '../utils/finances';
import useNotificationStore from '@/store/notifications/notificationStore';

/** 
 * Enterprise Order Business Service
 * Orchestrates order lifecycle, payments, and cross-store sync.
 */
class OrderService {
  constructor() {
    this.fetchAll = this.fetchAll.bind(this);
    this.create = this.create.bind(this);
    this.transitionStatus = this.transitionStatus.bind(this);
    this.processPayment = this.processPayment.bind(this);
    this.updateItems = this.updateItems.bind(this);
    this.lastFetchId = 0;
  }
  /**
   * Fetches all orders and syncs store
   */
  async fetchAll(params = {}) {
    this.lastFetchId += 1;
    const fetchId = this.lastFetchId;
    try {
      const response = await api.get('/orders', { params });
      const serverOrders = response.data || [];

      // Professional Merge Logic:
      // We keep local orders that haven't been synced to server yet
      // but accept server truth for existing orders.
      const localOrders = useOrderStore.getState().orders;
      const mergedOrders = [...serverOrders];

      localOrders.forEach(local => {
        if (!mergedOrders.find(s => s.id === local.id)) {
          mergedOrders.push(local);
        }
      });

      if (fetchId === this.lastFetchId) {
        useOrderStore.getState().setOrders(mergedOrders);
      }
      return mergedOrders;
    } catch (error) {
      return useOrderStore.getState().orders;
    }
  }

  /**
   * Professional Order Creation
   * Automatically occupies the table.
   */
  async create(orderData) {
    try {
      const response = await api.post('/orders', orderData);
      const newOrder = response.data;

      useOrderStore.getState().addOrder(newOrder);

      // Auto-occupy table
      if (newOrder.tableId) {
        await useTableStore.getState().syncTableStatus(newOrder.tableId, TABLE_STATUS.OCCUPIED, newOrder.id);
      }

      useNotificationStore.getState().notify({
        message: `Yangi buyurtma #${newOrder.id} (Stol ${newOrder.tableNumber || '?'})`,
        type: 'info'
      });

      return newOrder;
    } catch (error) {
      console.error('[OrderService] Order creation failed:', error);
      throw error;
    }
  }

  /**
   * Advanced Status Transition
   * Handles side-effects based on target status.
   */
  async transitionStatus(orderId, status, note = '', skipTableSideEffects = false) {
    const order = useOrderStore.getState().orders.find(o => o.id === orderId);
    if (order) {
      const allowed = VALID_TRANSITIONS[order.status] || [];
      if (!allowed.includes(status) && order.status !== status) {
        console.warn(`[OrderService] Invalid status transition from ${order.status} to ${status} for order ${orderId}`);
        return false;
      }
    }

    const applyTableSideEffects = async (targetOrder) => {
      if (!targetOrder || !targetOrder.tableId || skipTableSideEffects) return;

      const allTableOrders = useOrderStore.getState().orders.filter(o => o.tableId === targetOrder.tableId);
      const activeOrders = allTableOrders.filter(o => ![ORDER_STATUS.COMPLETED, ORDER_STATUS.CANCELLED, ORDER_STATUS.REFUNDED].includes(o.status));

      if (activeOrders.length === 0) {
        await useTableStore.getState().syncTableStatus(targetOrder.tableId, TABLE_STATUS.EMPTY, null);
        return;
      }

      if (activeOrders.every(o => o.status === ORDER_STATUS.PAID)) {
        await useTableStore.getState().syncTableStatus(targetOrder.tableId, TABLE_STATUS.CLEANING, activeOrders[0].id);
        return;
      }

      if (activeOrders.every(o => o.status === ORDER_STATUS.DELIVERED)) {
        await useTableStore.getState().syncTableStatus(targetOrder.tableId, TABLE_STATUS.WAITING_PAYMENT, activeOrders[0].id);
        return;
      }

      await useTableStore.getState().syncTableStatus(targetOrder.tableId, TABLE_STATUS.OCCUPIED, activeOrders[0].id);
    };

    try {
      await api.patch(`/orders/${orderId}/status`, { status, note });
      useOrderStore.getState().updateOrderStatus(orderId, status, note);

      const updatedOrder = useOrderStore.getState().orders.find(o => o.id === orderId);

      // Side-effect: Notifications
      if (status === ORDER_STATUS.READY) {
        useNotificationStore.getState().notify({
          message: `Buyurtma tayyor! #${orderId} (Stol ${updatedOrder?.tableNumber})`,
          type: 'success',
          duration: 5000
        });
      }

      if (status === ORDER_STATUS.PAID) {
        useNotificationStore.getState().notify({
          message: `To'lov qabul qilindi: #${orderId}`,
          type: 'success'
        });
      }

      await applyTableSideEffects(updatedOrder);

      return true;
    } catch (error) {
      console.error('[OrderService] Transition status failed:', error);
      throw error;
    }
  }

  /**
   * Payment Processing
   */
  async processPayment(orderId, paymentData) {
    const { method, amount, discount = 0 } = paymentData;
    try {
      const response = await api.post(`/orders/${orderId}/pay`, { method, amount, discount });

      const note = `To'landi: ${financeUtils.formatCurrency(amount)} (${method})`;
      await this.transitionStatus(orderId, ORDER_STATUS.PAID, note);

      return response.data;
    } catch (error) {
      console.error('[OrderService] Process payment failed:', error);
      throw error;
    }
  }

  /**
   * Order Modification
   */
  async updateItems(orderId, items) {
    try {
      await api.put(`/orders/${orderId}/items`, { items });
      useOrderStore.getState().updateOrderItems(orderId, items);
    } catch (error) {
      console.error('[OrderService] Update items failed:', error);
      throw error;
    }
  }

  /**
   * Fast Occupancy
   * Creates an empty order to mark table as busy
   */
  async occupyTable(tableId, tableNumber) {
    const orderData = {
      tableId,
      tableNumber,
      customerName: `Stol ${tableNumber}`,
      items: [],
      draftItems: [],
      status: ORDER_STATUS.DRAFT,
      id: `ORD-${Date.now()}`
    };
    return this.create(orderData);
  }

  async addItem(orderId, item) {
    useOrderStore.getState().addItemToOrder(orderId, item);
    // In production, this would also call an API
  }
}

export const orderService = new OrderService();
