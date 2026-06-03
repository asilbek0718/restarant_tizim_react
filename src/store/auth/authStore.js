import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { ROLES } from '@/shared/constants/roles';
import { hasPermission } from '@/shared/utils/permissions';
import { setSupabaseAuthToken } from '@/lib/supabase';

/**
 * Enterprise-grade Auth Store
 * Handles authentication state, role normalization, and persistence validation.
 */
const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      refreshToken: null,
      expiresAt: null,
      isAuthenticated: false,
      role: null,

      /**
       * Normalizes and sets user authentication state
       */
      login: (userData, token, refreshToken, expiresIn = 3600) => {
        const role = userData?.role?.toLowerCase()?.trim() || 'guest';
        const expiresAt = Date.now() + expiresIn * 1000;
        
        set({
          user: { ...userData, role },
          token,
          refreshToken,
          expiresAt,
          isAuthenticated: !!token && role !== 'guest',
          role,
        });

        // Task A — attach custom JWT to Supabase client so RLS can identify caller
        setSupabaseAuthToken(token || null);
      },

      isAdmin: () => get().role === ROLES.ADMIN,
      isManager: () => get().role === ROLES.MANAGER,
      hasRole: (roles) => roles.includes(get().role),
      can: (permission) => {
        const role = get().role;
        return hasPermission(role, permission);
      },

      /**
       * Clears all auth data and local storage
       */
      logout: () => {
        set({
          user: null,
          token: null,
          refreshToken: null,
          expiresAt: null,
          isAuthenticated: false,
          role: null,
        });
        localStorage.removeItem('enterprise-auth-storage-v1');

        // Task A — clear JWT from Supabase client
        setSupabaseAuthToken(null);
      },

      /**
       * Safely updates user profile data
       */
      updateUser: (userData) => {
        set((state) => {
          const newRole = userData?.role?.toLowerCase()?.trim() || state.role;
          return {
            user: state.user ? { ...state.user, ...userData, role: newRole } : null,
            role: newRole,
          };
        });
      },

      /**
       * Action to manually validate/normalize the state
       * Useful for fixing corrupted storage on the fly
       */
      validateAuthState: () => {
        const { role, token, user, isAuthenticated } = get();
        const validRoles = Object.values(ROLES);
        
        // If we have a role but it's invalid or missing token, reset
        if (role && !validRoles.includes(role)) {
          get().logout();
          return false;
        }

        if (isAuthenticated && (!token || !role)) {
          get().logout();
          return false;
        }

        return true;
      },
    }),
    {
      name: 'enterprise-auth-storage-v1',
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        if (state) {
          // Normalize role on load
          if (state.role) {
            state.role = state.role.toLowerCase().trim();
          }

          // Basic validation: if role is missing but authenticated, force logout
          if (state.isAuthenticated && (!state.role || state.role === 'guest')) {
            state.logout?.();
          }

          // Ensure user.role matches state.role
          if (state.user && state.user.role !== state.role) {
            state.user.role = state.role;
          }

          // Task A — re-attach JWT to Supabase after page reload hydration
          if (state.token && state.isAuthenticated) {
            setSupabaseAuthToken(state.token);
          }

          // Task D — cross-tab logout synchronization
          // Listen for storage events so that if the auth key is wiped
          // in another tab (via logout), this tab immediately kills its session.
          if (typeof window !== 'undefined') {
            window.addEventListener('storage', (event) => {
              if (event.key === 'enterprise-auth-storage-v1') {
                if (!event.newValue) {
                  // Key was removed → another tab logged out
                  const store = useAuthStore.getState();
                  if (store.isAuthenticated) {
                    setSupabaseAuthToken(null);
                    store.logout();
                  }
                } else {
                  // Key was updated → parse and sync role/token changes
                  try {
                    const parsed = JSON.parse(event.newValue);
                    const newState = parsed?.state;
                    if (newState) {
                      const currentStore = useAuthStore.getState();
                      // Only act on meaningful differences to avoid loops
                      if (newState.token !== currentStore.token) {
                        if (newState.isAuthenticated && newState.token) {
                          currentStore.login(
                            newState.user || {},
                            newState.token,
                            newState.refreshToken,
                          );
                        } else {
                          setSupabaseAuthToken(null);
                          currentStore.logout();
                        }
                      }
                    }
                  } catch (_) {
                    // Corrupt storage payload — ignore
                  }
                }
              }
            });
          }
        }
      },
    }
  )
);

export default useAuthStore;
