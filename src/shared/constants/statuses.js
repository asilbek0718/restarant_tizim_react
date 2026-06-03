/**
 * Enterprise Restaurant Business Logic Constants
 */

export const ORDER_STATUS = {
  DRAFT: 'draft',         // Empty order, table just occupied
  PENDING: 'pending',     // Just created
  PREPARING: 'preparing', // Kitchen started cooking
  READY: 'ready',         // Food is ready to be served
  DELIVERED: 'delivered', // Food is on the table
  PAID: 'paid',           // Bill paid
  COMPLETED: 'completed', // Table cleared, order archived
  CANCELLED: 'cancelled', // Cancelled
  REFUNDED: 'refunded',   // Money returned
  REJECTED: 'rejected',    // Rejected by kitchen
};

/**
 * Strict Workflow Transitions
 * Defines allowed "next" statuses for each state.
 */
export const VALID_TRANSITIONS = {
  [ORDER_STATUS.DRAFT]: [ORDER_STATUS.PENDING, ORDER_STATUS.CANCELLED],
  [ORDER_STATUS.PENDING]: [ORDER_STATUS.PREPARING, ORDER_STATUS.CANCELLED],
  [ORDER_STATUS.PREPARING]: [ORDER_STATUS.READY, ORDER_STATUS.REJECTED],
  [ORDER_STATUS.READY]: [ORDER_STATUS.DELIVERED],
  [ORDER_STATUS.DELIVERED]: [ORDER_STATUS.PAID, ORDER_STATUS.CANCELLED],
  [ORDER_STATUS.PAID]: [ORDER_STATUS.COMPLETED, ORDER_STATUS.REFUNDED],
  [ORDER_STATUS.COMPLETED]: [],
  [ORDER_STATUS.CANCELLED]: [],
  [ORDER_STATUS.REFUNDED]: [],
  [ORDER_STATUS.REJECTED]: [],
};

export const TABLE_STATUS = {
  EMPTY: 'empty',
  RESERVED: 'reserved',
  OCCUPIED: 'occupied',
  WAITING_PAYMENT: 'waiting_payment',
  CLEANING: 'cleaning',
  INACTIVE: 'inactive',
};

export const PAYMENT_METHOD = {
  CASH: 'cash',
  CARD: 'card',
  QR: 'qr',
};

export const STATUS_COLORS = {
  [ORDER_STATUS.DRAFT]: 'bg-slate-400',
  [ORDER_STATUS.PENDING]: 'bg-slate-500',
  [ORDER_STATUS.PREPARING]: 'bg-amber-500',
  [ORDER_STATUS.READY]: 'bg-primary-500',
  [ORDER_STATUS.DELIVERED]: 'bg-green-500',
  [ORDER_STATUS.PAID]: 'bg-emerald-500',
  [ORDER_STATUS.COMPLETED]: 'bg-slate-900',
  [ORDER_STATUS.CANCELLED]: 'bg-red-500',
};

export const TABLE_COLORS = {
  [TABLE_STATUS.EMPTY]: 'bg-slate-100 dark:bg-white/5',
  [TABLE_STATUS.RESERVED]: 'bg-amber-500/20',
  [TABLE_STATUS.OCCUPIED]: 'bg-primary-500/20',
  [TABLE_STATUS.WAITING_PAYMENT]: 'bg-red-500/20',
  [TABLE_STATUS.CLEANING]: 'bg-green-500/20',
};

export const ITEM_STATUS = {
  PENDING: 'pending',     // Kutilmoqda
  PREPARING: 'preparing', // Tayyorlanmoqda
  READY: 'ready',         // Tayyor
  SERVED: 'served',       // Yetkazilgan
  CANCELLED: 'cancelled', // Bekor qilingan
};

export const ITEM_STATUS_COLORS = {
  [ITEM_STATUS.PENDING]: 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20',
  [ITEM_STATUS.PREPARING]: 'text-orange-500 bg-orange-500/10 border-orange-500/20',
  [ITEM_STATUS.READY]: 'text-green-500 bg-green-500/10 border-green-500/20',
  [ITEM_STATUS.SERVED]: 'text-slate-400 bg-slate-400/10 border-slate-400/10',
  [ITEM_STATUS.CANCELLED]: 'text-red-500 bg-red-500/10 border-red-500/20',
};

