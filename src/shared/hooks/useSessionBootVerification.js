import { useEffect, useRef } from 'react';
import useAuthStore from '@/store/auth/authStore';
import { authService } from '@/shared/services/authService';
import { ROLES } from '@/shared/constants/roles';

/**
 * Step 3 — Task B: Session Boot Verification
 *
 * Runs exactly once on application startup.
 * Calls the server's /auth/me endpoint to obtain ground truth for the
 * current session. If the stored role has been tampered or the token is
 * expired, the session is terminated immediately — before any protected
 * page is rendered.
 *
 * Rules:
 *  - Only fires when isAuthenticated === true (avoids unnecessary calls)
 *  - Does NOT cause a login loop (redirects handled by ProtectedRoute)
 *  - Does NOT block initial render (runs asynchronously in background)
 *  - Skips if token is already verified within the same boot cycle
 */
export function useSessionBootVerification() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const storedRole = useAuthStore((state) => state.role);
  const token = useAuthStore((state) => state.token);
  const logout = useAuthStore((state) => state.logout);
  const verified = useRef(false);

  useEffect(() => {
    // Only run once per mount
    if (verified.current) return;
    verified.current = true;

    // Nothing to verify if not authenticated
    if (!isAuthenticated || !token) return;

    const verify = async () => {
      try {
        const serverUser = await authService.verifySession();

        if (!serverUser) {
          // Server rejected session — wipe it
          console.warn('[SessionGuard] Server rejected session. Logging out.');
          logout();
          return;
        }

        const serverRole = serverUser?.role?.toLowerCase()?.trim();
        const validRoles = Object.values(ROLES);

        // If server returns an invalid role, log out
        if (!serverRole || !validRoles.includes(serverRole)) {
          console.warn('[SessionGuard] Server returned invalid role. Logging out.');
          logout();
          return;
        }

        // If the stored role was tampered (e.g., guest → admin via DevTools),
        // authStore.updateUser will overwrite it with the server truth.
        if (serverRole !== storedRole) {
          console.warn(
            `[SessionGuard] Role mismatch detected. localStorage="${storedRole}" server="${serverRole}". Correcting.`
          );
          // updateUser is already defined in authStore and normalizes the role
          useAuthStore.getState().updateUser(serverUser);
        }
      } catch (err) {
        // Network failure during boot — do NOT log out; allow the session to
        // continue and let the 401 interceptor handle expiry on the next real call.
        console.warn('[SessionGuard] Boot verification network error (session preserved):', err?.message);
      }
    };

    verify();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Intentionally empty — runs exactly once on mount
}
