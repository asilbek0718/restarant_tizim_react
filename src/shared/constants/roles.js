export const ROLES = {
  ADMIN: 'admin',
  MANAGER: 'manager',
  CASHIER: 'cashier',
  WAITER: 'waiter',
  KITCHEN: 'kitchen',
};

export const ALL_ROLES = Object.values(ROLES);

export const ADMIN_ONLY = [ROLES.ADMIN];
export const STAFF_ROLES = [ROLES.ADMIN, ROLES.MANAGER, ROLES.CASHIER, ROLES.WAITER, ROLES.KITCHEN];
export const KITCHEN_ROLES = [ROLES.ADMIN, ROLES.MANAGER, ROLES.KITCHEN];
export const ORDER_ROLES = [ROLES.ADMIN, ROLES.MANAGER, ROLES.CASHIER, ROLES.WAITER];