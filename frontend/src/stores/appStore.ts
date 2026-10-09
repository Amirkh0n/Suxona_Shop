/**
 * appStore — global application state.
 *
 * Owns: Telegram mode flag, network status, app version, toast notifications, user authentication and role.
 * Not persisted.
 *
 * networkStatus is driven by browser online/offline events wired in main.tsx.
 * telegramMode is set by the Telegram bootstrap module before first render.
 */
import { create } from 'zustand'

type NetworkStatus = 'online' | 'offline'

interface Toast {
  id: string
  message: string
  type: 'success' | 'error' | 'warning' | 'info'
  duration?: number
}

interface AppState {
  // State
  telegramMode: boolean
  networkStatus: NetworkStatus
  appVersion: string
  toast: Toast | null
  toasts: Toast[]
  isUserAuthenticated: boolean
  isUserSeller: boolean
  isUserLoading: boolean

  // Actions
  setTelegramMode: (active: boolean) => void
  setNetworkStatus: (status: NetworkStatus) => void
  setUserAuthenticated: (authenticated: boolean) => void
  setUserSeller: (seller: boolean) => void
  setUserLoading: (loading: boolean) => void
  showToast: (message: string, type: Toast['type'], duration?: number) => void
  hideToast: () => void
  removeToast: (id: string) => void
}

export const useAppStore = create<AppState>((set, get) => ({
  telegramMode: false,
  networkStatus: 'online',
  appVersion: __APP_VERSION__,
  toast: null,
  toasts: [],
  isUserAuthenticated: false,
  isUserSeller: false,
  isUserLoading: true,

  setTelegramMode: (active) => set({ telegramMode: active }),
  setNetworkStatus: (status) => set({ networkStatus: status }),
  setUserAuthenticated: (authenticated) => set({ isUserAuthenticated: authenticated }),
  setUserSeller: (seller) => set({ isUserSeller: seller }),
  setUserLoading: (loading) => set({ isUserLoading: loading }),

  showToast: (message, type = 'info', duration = 3000) => {
    const id = `toast-${Date.now()}-${Math.random()}`
    const toast = { id, message, type, duration }

    set((state) => ({
      toast: toast,
      toasts: [toast, ...state.toasts],
    }))

    // Auto-hide after duration
    if (duration > 0) {
      setTimeout(() => {
        get().removeToast(id)
      }, duration)
    }
  },

  hideToast: () => {
    set({ toast: null })
  },

  removeToast: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    }))
  },
}))

// Expose __APP_VERSION__ declaration so TypeScript is happy.
// The value is injected by Vite's define config (set in vite.config.ts).
declare const __APP_VERSION__: string
