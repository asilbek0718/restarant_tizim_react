import React, { useMemo } from 'react';
import { Navigate, useLocation, Outlet } from 'react-router-dom';
import useAuthStore from '@/store/auth/authStore';
import { ROLES } from '@/shared/constants/roles';
import { hasModuleAccess } from '@/shared/utils/permissions';

/**
 * Enterprise-grade Protected Route
 * Rebuilt to use dynamic, settings-driven module-level access checking.
 * Features:
 * 1. Admin Bypass (Always allowed)
 * 2. Settings Matrix Resolution
 * 3. Selector-based subscriptions for performance
 * 4. Stale-state protection
 */
export const ProtectedRoute = ({ module, children }) => {
  const role = useAuthStore((state) => state.role);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const location = useLocation();

  const hasAccess = useMemo(() => {
    if (!isAuthenticated) return false;
    
    // Admin always bypasses all restrictions
    if (role === ROLES.ADMIN) return true;
    
    // If no module is specified, only authentication is required
    if (!module) return true;
    
    // Verify module access dynamically via settings store matrix
    return hasModuleAccess(role, module);
  }, [isAuthenticated, role, module]);

  if (!isAuthenticated) {
    // Redirect to login while saving current location for post-login redirect
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!hasAccess) {
    // Redirect to unauthorized if authenticated but no permission
    console.warn(`[RBAC] Access denied for role: ${role}. Required Module: [${module}]`);
    return <Navigate to="/unauthorized" replace />;
  }

  return children ? children : <Outlet />;
};

/**
 * PublicRoute - Prevents authenticated users from seeing Login pages
 */
export const PublicRoute = ({ children }) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const role = useAuthStore((state) => state.role);
  
  if (isAuthenticated) {
    // Smart redirect based on role landing pages
    const redirectMap = {
      [ROLES.ADMIN]: '/',
      [ROLES.MANAGER]: '/',
      [ROLES.WAITER]: '/tables',
      [ROLES.KITCHEN]: '/kitchen',
      [ROLES.CASHIER]: '/cashier'
    };
    const targetPath = redirectMap[role] || '/';
    return <Navigate to={targetPath} replace />;
  }

  return children ? children : <Outlet />;
};

export default ProtectedRoute;
