import api from '../api/axiosInstance';
import { orderService } from './orderService';
import { ORDER_STATUS } from '../constants/statuses';
import { financeUtils } from '../utils/finances';
import useSettingsStore from '@/store/settings/settingsStore';

/**
 * Enterprise POS Service
 * Specialized in payments, receipts, and shifts.
 */
class POSService {
  constructor() {
    this.processSinglePayment = this.processSinglePayment.bind(this);
    this.processSplitPayment = this.processSplitPayment.bind(this);
    this.processRefund = this.processRefund.bind(this);
    this.generateReceiptData = this.generateReceiptData.bind(this);
    this.closeShift = this.closeShift.bind(this);
    this.getShiftReport = this.getShiftReport.bind(this);
  }
  /**
   * Processes a full payment
   */
  async processSinglePayment(orderId, method, amount) {
    return orderService.processPayment(orderId, { method, amount });
  }

  /**
   * Handles complex bill splitting
   * @param {string} orderId 
   * @param {Array} splits - [{ method: 'cash', amount: 10000 }, { method: 'card', amount: 20000 }]
   */
  async processSplitPayment(orderId, splits) {
    try {
      const response = await api.post(`/pos/orders/${orderId}/split-pay`, { splits });
      
      const totalPaid = splits.reduce((sum, s) => sum + s.amount, 0);
      const note = `Split to'lov: ${splits.map(s => `${s.method}(${financeUtils.formatCurrency(s.amount)})`).join(', ')}`;
      
      await orderService.transitionStatus(orderId, ORDER_STATUS.PAID, note);
      return response.data;
    } catch (error) {
      console.error('[POS] Split payment failed:', error);
      throw error;
    }
  }

  /**
   * Processes a refund
   */
  async processRefund(orderId, reason) {
    try {
      await api.post(`/pos/orders/${orderId}/refund`, { reason });
      await orderService.transitionStatus(orderId, ORDER_STATUS.REFUNDED, `Qaytarish: ${reason}`);
    } catch (error) {
      console.error('[POS] Refund failed:', error);
      throw error;
    }
  }

  /**
   * Generates a printable receipt structure
   * Pulls restaurant info from settingsStore (configured by admin)
   */
  generateReceiptData(order) {
    if (!order) return null;
    const settings = useSettingsStore.getState();
    return {
      restaurant: settings?.restaurant?.name || 'Restoran',
      address: settings?.restaurant?.address || '',
      orderId: order.id,
      date: order.updatedAt ? new Date(order.updatedAt).toLocaleString('uz-UZ') : '',
      items: (order.items || []).map(i => ({
        name: i.name,
        qty: i.quantity,
        price: i.price,
        total: (i.price || 0) * (i.quantity || 0)
      })),
      totals: {
        subtotal: order.subtotal || 0,
        tax: order.tax || 0,
        service: order.serviceFee || 0,
        discount: order.discountAmount || 0,
        total: order.total || 0
      },
      footer: 'Xaridingiz uchun rahmat!'
    };
  }

  /**
   * Closes the current shift and generates a report
   */
  async closeShift(cashierId) {
    try {
      const response = await api.post('/pos/shifts/close', { cashierId });
      return response.data;
    } catch (error) {
      console.warn('[POS] Shift close failed, generating local summary.');
      return {
        success: false,
        summary: {
          totalSales: 0,
          ordersCount: 0,
          paymentBreakdown: { card: 0, cash: 0, qr: 0 }
        }
      };
    }
  }

  /**
   * Fetches current shift statistics
   */
  async getShiftReport() {
    try {
      const response = await api.get('/pos/shifts/current-stats');
      return response.data;
    } catch (error) {
      return {
        sales: 0,
        orders: 0,
        pendingPayments: 0
      };
    }
  }
}

export const posService = new POSService();
