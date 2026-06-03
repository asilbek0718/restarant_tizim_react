import { lazy } from 'react';

// Root Pages (Directly imported for initial load)
import Login from '@/shared/pages/Login';
import Unauthorized from '@/shared/pages/Unauthorized';
import NotFound from '@/shared/pages/NotFound';

/**
 * Route definition object
 * @property {string} path - The URL path
 * @property {React.Component} component - Lazy loaded component
 * @property {string} module - The name of the settings permission module required to view this route (empty for public/authenticated only)
 * @property {boolean} isPublic - If true, bypasses auth
 * @property {boolean} isRoot - If true, doesn't use the main layout (e.g. Login, Unauthorized)
 */
export const ROUTES = [
  {
    path: '/login',
    component: Login,
    isPublic: true,
    isRoot: true,
  },
  {
    path: '/unauthorized',
    component: Unauthorized,
    isPublic: false,
    isRoot: true, // Render as root to prevent nesting inside main layout and layout distortions
  },
  {
    path: '/',
    label: 'Dashboard',
    component: lazy(() => import('@/admin/pages/Dashboard')),
    module: 'dashboard',
  },
  {
    path: '/analytics',
    label: 'Analytics',
    component: lazy(() => import('@/admin/pages/Analytics')),
    module: 'analytics',
  },
  {
    path: '/tables',
    label: 'Tables',
    component: lazy(() => import('@/waiter/pages/Tables')),
    module: 'tables',
  },
  {
    path: '/menu',
    label: 'Menu',
    component: lazy(() => import('@/waiter/pages/Menu')),
    module: 'menu',
  },
  {
    path: '/orders',
    label: 'Orders',
    component: lazy(() => import('@/waiter/pages/Orders')),
    module: 'orders',
  },
  {
    path: '/kitchen',
    label: 'Kitchen',
    component: lazy(() => import('@/kitchen/pages/Kitchen')),
    module: 'kitchen',
  },
  {
    path: '/cashier',
    label: 'Cashier',
    component: lazy(() => import('@/cashier/pages/Cashier')),
    module: 'cashier',
  },
  {
    path: '/staff',
    label: 'Staff',
    component: lazy(() => import('@/admin/pages/Staff')),
    module: 'staff',
  },
  {
    path: '/settings',
    label: 'Settings',
    component: lazy(() => import('@/admin/pages/Settings')),
    module: 'settings',
  },
];
