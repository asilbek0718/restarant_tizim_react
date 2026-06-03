import React, { Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { ROUTES } from './config';
import ProtectedRoute, { PublicRoute } from '@/shared/components/ProtectedRoute';
import AdminLayout from '@/admin/pages/layouts/AdminLayout';
import NotFound from '@/shared/pages/NotFound';
import ErrorBoundary from '@/shared/components/ErrorBoundary';

/**
 * AppRouter Component
 * The central routing hub of the application.
 * Dynamically renders routes from the config and handles layouts/protection using module access keys.
 */
const AppRouter = () => {
  return (
    <ErrorBoundary>
      <Suspense fallback={
        <div className="h-screen w-full flex items-center justify-center dark:bg-[#050505]">
          <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      }>
      <Routes>
        {/* Step 1: Handle Root Routes (Login, Unauthorized, etc.) */}
        {ROUTES.filter(route => route.isRoot).map(route => (
          <Route 
            key={route.path}
            path={route.path}
            element={
              route.isPublic ? (
                <PublicRoute>
                  <route.component />
                </PublicRoute>
              ) : (
                <ProtectedRoute>
                  <route.component />
                </ProtectedRoute>
              )
            }
          />
        ))}

        {/* Step 2: Handle Protected Main Layout Routes */}
        <Route element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }>
          {ROUTES.filter(route => !route.isRoot).map(route => (
            <Route 
              key={route.path}
              path={route.path}
              element={
                route.module ? (
                  <ProtectedRoute module={route.module}>
                    <route.component />
                  </ProtectedRoute>
                ) : (
                  <route.component />
                )
              }
            />
          ))}
        </Route>

        {/* Step 3: Global Fallbacks */}
        <Route path="*" element={<NotFound />} />
      </Routes>
      </Suspense>
    </ErrorBoundary>
  );
};

export default AppRouter;
