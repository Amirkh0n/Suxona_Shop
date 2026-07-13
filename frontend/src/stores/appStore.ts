/**
 * appStore — global application state.
 *
 * Owns: Telegram mode flag, network status, app version.
 * Not persisted.
 *
 * networkStatus is driven by browser online/offline events wired in main.tsx.
 * telegramMode is set by the Telegram bootstrap module before first render.
 */
import { create } from 'zustand'

type NetworkStatus = 'online' | 'offline'

interface AppState {
  // State
  telegramMode: boolean
  networkStatus: NetworkStatus
  appVersion: string

  // Actions
  setTelegramMode: (active: boolean) => void
  setNetworkStatus: (status: NetworkStatus) => void
}

export const useAppStore = create<AppState>()((set) => ({
  telegramMode: false,
  networkStatus: 'online',
  appVersion: __APP_VERSION__,

  setTelegramMode: (active) => set({ telegramMode: active }),
  setNetworkStatus: (status) => set({ networkStatus: status }),
}))

// Expose __APP_VERSION__ declaration so TypeScript is happy.
// The value is injected by Vite's define config (set in vite.config.ts).
declare const __APP_VERSION__: string
