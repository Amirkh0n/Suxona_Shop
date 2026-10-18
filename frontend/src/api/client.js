import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

const ACCESS_KEY = 'suxona_access';
const REFRESH_KEY = 'suxona_refresh';

export const tokenStore = {
  getAccess: () => localStorage.getItem(ACCESS_KEY),
  getRefresh: () => localStorage.getItem(REFRESH_KEY),
  setTokens: (access, refresh) => {
    if (access) localStorage.setItem(ACCESS_KEY, access);
    if (refresh) localStorage.setItem(REFRESH_KEY, refresh);
  },
  clear: () => {
    localStorage.removeItem(ACCESS_KEY);
    localStorage.removeItem(REFRESH_KEY);
  },
};

const api = axios.create({
  baseURL: `${BASE_URL}/api/v1`,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const access = tokenStore.getAccess();
  if (access) config.headers.Authorization = `Bearer ${access}`;
  return config;
});

let onUnauthorized = null;
export function setUnauthorizedHandler(fn) {
  onUnauthorized = fn;
}

// --- Silent access-token refresh -------------------------------------------
// Access tokens are short-lived (30 min). On a 401 we exchange the refresh
// token for a new pair via POST /auth/refresh and replay the original request.
// A single in-flight refresh is shared by all concurrent 401s so parallel
// requests don't each burn (or race on) the refresh token. A plain axios call
// (not `api`) is used so this request skips our own interceptors and can't loop.
let refreshPromise = null;

function refreshTokens() {
  const refresh = tokenStore.getRefresh();
  if (!refresh) return Promise.reject(new Error('no refresh token'));
  if (!refreshPromise) {
    refreshPromise = axios
      .post(`${BASE_URL}/api/v1/auth/refresh`, { refresh })
      .then(({ data }) => {
        tokenStore.setTokens(data.access, data.refresh);
        return data.access;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
}

const AUTH_PATHS = ['/auth/login', '/auth/register', '/auth/refresh'];

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    const status = error.response?.status;
    const isAuthCall = AUTH_PATHS.some((p) => original?.url?.includes(p));

    if (status === 401 && original && !original._retried && !isAuthCall && tokenStore.getRefresh()) {
      original._retried = true;
      try {
        const access = await refreshTokens();
        original.headers.Authorization = `Bearer ${access}`;
        return api(original);
      } catch {
        // Refresh token is expired/invalid: fall through to logout.
      }
    }

    if (status === 401 && !isAuthCall) {
      tokenStore.clear();
      if (onUnauthorized) onUnauthorized();
    }
    return Promise.reject(error);
  }
);

export function extractErrorMessage(error, fallback = "Nimadir xato ketdi. Qaytadan urinib ko'ring.") {
  const detail = error?.response?.data?.detail;
  if (typeof detail === 'string') return detail;
  if (error?.response?.data && typeof error.response.data === 'object') {
    const firstKey = Object.keys(error.response.data)[0];
    const firstVal = error.response.data[firstKey];
    if (Array.isArray(firstVal)) return firstVal[0];
    if (typeof firstVal === 'string') return firstVal;
  }
  return fallback;
}

export default api;
