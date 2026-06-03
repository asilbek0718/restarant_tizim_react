import { ROLES } from '../constants/roles';
import useSettingsStore from '@/store/settings/settingsStore';

/**
 * Enterprise Permission Registry
 * Categorized by VIEW, MANAGE, and ACTIONS.
 * Serves as the single source of truth for dynamic capability mappings.
 */
export const PERMISSIONS = {
  VIEW: {
    DASHBOARD: 'view:dashboard',
    ANALYTICS: 'view:analytics',
    REPORTS: 'view:reports',
    ORDERS: 'view:orders',
    TABLES: 'view:tables',
  },
  MANAGE: {
    MENU: 'manage:menu',
    STAFF: 'manage:staff',
    SETTINGS: 'manage:settings',
    ORDERS: 'manage:orders',
    KITCHEN: 'manage:kitchen',
    TABLES: 'manage:tables',
  },
  ACTIONS: {
    COMPLETE_PAYMENT: 'actions:complete_payment',
    CANCEL_ORDER: 'actions:cancel_order',
    DELETE_MENU_ITEM: 'actions:delete_menu_item',
    CLOSE_SHIFT: 'actions:close_shift',
    EXPORT_REPORTS: 'actions:export_reports',
  }
};

/**
 * Maps granular permission string to their parent module settings key
 */
export const PERMISSION_TO_MODULE = {
  // VIEW
  [PERMISSIONS.VIEW.DASHBOARD]: 'dashboard',
  'VIEW_DASHBOARD': 'dashboard',
  
  [PERMISSIONS.VIEW.ANALYTICS]: 'analytics',
  'VIEW_ANALYTICS': 'analytics',
  
  [PERMISSIONS.VIEW.REPORTS]: 'analytics',
  
  [PERMISSIONS.VIEW.ORDERS]: 'orders',
  'VIEW_ORDERS': 'orders',
  
  [PERMISSIONS.VIEW.TABLES]: 'tables',
  'VIEW_TABLES': 'tables',
  
  // MANAGE
  [PERMISSIONS.MANAGE.MENU]: 'menu',
  'MANAGE_MENU': 'menu',
  
  [PERMISSIONS.MANAGE.STAFF]: 'staff',
  'MANAGE_STAFF': 'staff',
  
  [PERMISSIONS.MANAGE.SETTINGS]: 'settings',
  'MANAGE_SETTINGS': 'settings',
  
  [PERMISSIONS.MANAGE.ORDERS]: 'orders',
  'MANAGE_ORDERS': 'orders',
  
  [PERMISSIONS.MANAGE.KITCHEN]: 'kitchen',
  'VIEW_KITCHEN': 'kitchen',
  
  [PERMISSIONS.MANAGE.TABLES]: 'tables',
  'MANAGE_TABLES': 'tables',
  
  'view:cashier': 'cashier',
  'VIEW_CASHIER': 'cashier',
  'cashier': 'cashier',
  
  // ACTIONS
  [PERMISSIONS.ACTIONS.COMPLETE_PAYMENT]: 'cashier',
  [PERMISSIONS.ACTIONS.CANCEL_ORDER]: 'orders',
  [PERMISSIONS.ACTIONS.DELETE_MENU_ITEM]: 'menu',
  [PERMISSIONS.ACTIONS.CLOSE_SHIFT]: 'cashier',
  [PERMISSIONS.ACTIONS.EXPORT_REPORTS]: 'analytics',
};

// Static default fallback permission matrix (used when Settings matrix is unhydrated)
const DEFAULT_ROLE_PERMISSIONS = {
  [ROLES.ADMIN]: {
    dashboard: true, tables: true, menu: true, orders: true, kitchen: true, cashier: true, analytics: true, staff: true, settings: true
  },
  [ROLES.MANAGER]: {
    dashboard: true, tables: true, menu: true, orders: true, kitchen: true, cashier: true, analytics: true, staff: false, settings: false
  },
  [ROLES.CASHIER]: {
    dashboard: false, tables: false, menu: false, orders: true, kitchen: false, cashier: true, analytics: false, staff: false, settings: false
  },
  [ROLES.WAITER]: {
    dashboard: false, tables: true, menu: true, orders: true, kitchen: false, cashier: false, analytics: false, staff: false, settings: false
  },
  [ROLES.KITCHEN]: {
    dashboard: false, tables: false, menu: false, orders: false, kitchen: true, cashier: false, analytics: false, staff: false, settings: false
  }
};

/**
 * Checks if a specific role has access to a parent settings module.
 * Fully integrates with useSettingsStore permissions matrix.
 */
export const hasModuleAccess = (role, moduleName) => {
  if (!role) return false;
  if (role === ROLES.ADMIN) return true;

  // Retrieve dynamic settings permissions
  try {
    const storePermissions = useSettingsStore.getState().permissions;
    if (storePermissions && storePermissions[role]) {
      return !!storePermissions[role][moduleName];
    }
  } catch (e) {
    console.warn('[RBAC Engine] Failed to read from settings store. Using fallbacks.', e);
  }

  // Fallback to static rules
  const fallback = DEFAULT_ROLE_PERMISSIONS[role] || {};
  return !!fallback[moduleName];
};

/**
 * Evaluates whether a role is authorized to perform a specific action.
 * Enforces security boundaries and custom role capabilities.
 */
export const canPerformAction = (role, action) => {
  if (!role) return false;
  if (role === ROLES.ADMIN) return true;

  // 1. Map action to parent module and check if that module is enabled for user
  const moduleName = PERMISSION_TO_MODULE[action];
  if (moduleName && !hasModuleAccess(role, moduleName)) {
    return false;
  }

  // 2. Apply action-level role restrictions
  switch (action) {
    case PERMISSIONS.ACTIONS.CANCEL_ORDER:
    case PERMISSIONS.ACTIONS.DELETE_MENU_ITEM:
    case PERMISSIONS.ACTIONS.EXPORT_REPORTS:
      // High-privilege actions restricted to manager and admin
      return role === ROLES.MANAGER;
      
    case PERMISSIONS.ACTIONS.COMPLETE_PAYMENT:
    case PERMISSIONS.ACTIONS.CLOSE_SHIFT:
      // Cashier and manager can complete payments / manage cashier shifts
      return [ROLES.CASHIER, ROLES.MANAGER].includes(role);
      
    default:
      // By default, if the parent module is enabled, allow the action
      return true;
  }
};

/**
 * Main compatibility helper to check permissions
 */
export const hasPermission = (role, permission) => {
  if (!role) return false;
  if (role === ROLES.ADMIN) return true;

  // Check if it's an action-level check
  if (permission && permission.startsWith('actions:')) {
    return canPerformAction(role, permission);
  }

  // Map other string permissions to modules
  const moduleName = PERMISSION_TO_MODULE[permission];
  if (moduleName) {
    return hasModuleAccess(role, moduleName);
  }

  return false;
};
