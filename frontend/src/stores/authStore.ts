/**
 * authStore — client-side authentication session.
 *
 * Owns: user object, JWT access/refresh tokens, authentication status.
 * Persists: accessToken, refreshToken, user to localStorage (tokens are the
 * only sensitive values stored there — development rule).
 *
 * IMPORTANT: Server state (profile data fetched from the API) must NOT be
 * duplicated here. Use the profile query hook for fresh server data.
 * This store only tracks the session identity needed to attach the Bearer
 * token to requests and render role-gated UI.
 */
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User, TokenPair } from '@/types'

interface AuthState {
  // State
  user: User | null
  accessToken: string | null
  refreshToken: string | null
  isAuthenticated: boolean
  isLoading: boolean

  // Actions
  /** Called after a successful login. Stores the token pair and optionally the
   *  user. isAuthenticated is set to true immediately on token receipt; the
   *  caller should follow up with setUser() once /auth/me resolves. */
  login: (tokens: TokenPair, user?: User) => void
  /** Clears the entire session. Called on logout or from the 401 interceptor. */
  logout: () => void
  /** Update the user after /auth/me resolves. */
  setUser: (user: User) => void
  /** Alias for logout — used by the Axios 401 interceptor to keep semantics
   *  clear (a forced clear differs conceptually from a user-initiated logout). */
  clearUser: () => void
  setLoading: (loading: boolean) => void
}

/** Keys persisted to localStorage. Never persist anything other than tokens
 *  and the lightweight user object. */
type PersistedState = Pick<AuthState, 'accessToken' | 'refreshToken' | 'user'>

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      // Initial state
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,

      login: (tokens, user) =>
        set({
          accessToken: tokens.access,
          refreshToken: tokens.refresh,
          isAuthenticated: true,
          ...(user ? { user } : {}),
        }),

      logout: () =>
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
          isLoading: false,
        }),

      setUser: (user) => set({ user, isAuthenticated: true }),

      clearUser: () =>
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
          isLoading: false,
        }),

      setLoading: (loading) => set({ isLoading: loading }),
    }),
    {
      name: 'suxona-auth',
      // Only persist the token pair and user — never UI or loading flags.
      partialize: (state): PersistedState => ({
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        user: state.user,
      }),
      // Rehydrate isAuthenticated from the persisted tokens.
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.isAuthenticated = state.accessToken !== null
        }
      },
    },
  ),
)
