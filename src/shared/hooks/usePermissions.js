import useAuthStore from '@/store/auth/authStore';
import { ROLES } from '@/shared/constants/roles';
import { 
  hasPermission, 
  hasModuleAccess, 
  canPerformAction,
  PERMISSION_TO_MODULE
} from '@/shared/utils/permissions';

/**
 * Enterprise-grade usePermissions Hook
 * Provides reactive access control helpers, role validation, and granular capability checks.
 * Connects directly to Zustand store states for reactive sidebar and route protection.
 */
export const usePermissions = () => {
  const role = useAuthStore((state) => state.role);
  
  // Quick role identifiers
  const isAdmin = role === ROLES.ADMIN;
  const isManager = role === ROLES.MANAGER;
  const isCashier = role === ROLES.CASHIER;
  const isWaiter = role === ROLES.WAITER;
  const isKitchen = role === ROLES.KITCHEN;

  /**
   * Evaluates if the current user can access a specific module
   */
  const canAccessModule = (moduleName) => {
    return hasModuleAccess(role, moduleName);
  };

  /**
   * Evaluates if the current user can perform a specific operational action
   */
  const canPerformActionHook = (actionName) => {
    return canPerformAction(role, actionName);
  };

  /**
   * Evaluates if the current user can view a specific module/screen
   */
  const canView = (viewName) => {
    const moduleName = PERMISSION_TO_MODULE[viewName] || viewName;
    return hasModuleAccess(role, moduleName);
  };

  /**
   * Helper to verify if the user possesses a specific role
   */
  const hasRole = (roleName) => {
    return role === roleName;
  };

  /**
   * Helper to verify if the user possesses at least one of the specified roles
   */
  const hasAnyRole = (rolesArray = []) => {
    if (!role) return false;
    return rolesArray.includes(role);
  };

  /**
   * Helper to verify if the user possesses all the specified permissions
   */
  const hasAllPermissions = (permissionsArray = []) => {
    if (!role) return false;
    return permissionsArray.every(permission => hasPermission(role, permission));
  };

  /**
   * Centralized capability check (compatibility wrapper)
   */
  const can = (permission) => {
    return hasPermission(role, permission);
  };

  return {
    role,
    isAdmin,
    isManager,
    isCashier,
    isWaiter,
    isKitchen,
    canAccessModule,
    canPerformAction: canPerformActionHook,
    canView,
    hasRole,
    hasAnyRole,
    hasAllPermissions,
    can,
  };
};

export default usePermissions;
