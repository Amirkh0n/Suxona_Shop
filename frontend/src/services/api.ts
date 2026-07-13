/**
 * Axios API client — the single HTTP gateway for all backend communication.
 *
 * Architecture rules:
 *   - ONLY this module may import and use Axios.
 *   - Service modules (src/services/*.service.ts) import from here.
 *   - Feature hooks import from service modules.
 *   - Components NEVER call Axios directly.
 *
 * Interceptors:
 *   Request  — attach Bearer token from authStore.
 *   Response — normalize errors; handle 401 (clear session + redirect).
 */
import axios from 'axios'
import { useAuthStore } from '@/stores/authStore'
import { normalizeError } from '@/utils/normalizeError'

// ---------------------------------------------------------------------------
// Instance
// ---------------------------------------------------------------------------

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30_000,
})

// ---------------------------------------------------------------------------
// Request interceptor — attach Authorization header (Req 2.2, Property 1)
// ---------------------------------------------------------------------------

api.interceptors.request.use(
  (config) => {
    // Read the token directly from the store state (outside React) so the
    // interceptor works in any context including outside component trees.
    const token = useAuthStore.getState().accessToken
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(normalizeError(error)),
)

// ---------------------------------------------------------------------------
// Response interceptor — error normalization + 401 handling (Req 2.4, 2.5)
// ---------------------------------------------------------------------------

/**
 * Redirects to the login page. Wrapped in a try/catch so that a routing
 * failure does not prevent the session from being cleared (Req 2.5).
 */
function redirectToLogin(): void {
  // Use the history API directly so this works outside the React tree.
  // React Router will pick up the new URL on next render.
  window.location.href = '/login'
}

api.interceptors.response.use(
  // Success — pass through unchanged.
  (response) => response,

  // Failure — normalize and handle 401.
  (error) => {
    const appError = normalizeError(error)

    if (appError.status === 401) {
      // Clear the session unconditionally (Req 2.4).
      useAuthStore.getState().clearUser()

      // Attempt redirect — if it throws, the cleared state is still retained
      // and the user can navigate manually (Req 2.5).
      try {
        redirectToLogin()
      } catch {
        // Intentionally swallowed.
      }
    }

    return Promise.reject(appError)
  },
)

export default api
