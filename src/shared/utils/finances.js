/**
 * Enterprise Financial Utility
 * Handles safe calculations for taxes, fees, and bill splitting.
 */

const DEFAULT_TAX_RATE = 0.12;
const DEFAULT_SERVICE_RATE = 0.10;

export const financeUtils = {
  /**
   * Formats numbers to Uzbek so'm currency
   */
  formatCurrency: (amount) => {
    return new Intl.NumberFormat('uz-UZ', {
      style: 'currency',
      currency: 'UZS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount || 0);
  },

  /**
   * Calculates order totals with breakdown
   */
  calculateOrderTotals: (items = [], discount = 0, taxRate = DEFAULT_TAX_RATE, serviceRate = DEFAULT_SERVICE_RATE) => {
    const subtotal = items.reduce((sum, item) => sum + ((item.price || 0) * (item.quantity || 1)), 0);
    
    // Apply discount to subtotal
    const discountAmount = discount > 0 && discount < 1 ? subtotal * discount : discount;
    const discountedSubtotal = Math.max(0, subtotal - discountAmount);
    
    const serviceFee = Math.round(discountedSubtotal * serviceRate);
    const tax = Math.round(discountedSubtotal * taxRate);
    const total = discountedSubtotal + serviceFee + tax;

    return {
      subtotal,
      discountAmount,
      discountedSubtotal,
      serviceFee,
      tax,
      total
    };
  },

  /**
   * Logic for splitting bills
   */
  splitBill: (total, personCount) => {
    if (!personCount || personCount <= 0) return total;
    return Math.ceil(total / personCount);
  }
};
