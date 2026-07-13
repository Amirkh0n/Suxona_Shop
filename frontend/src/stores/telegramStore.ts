/**
 * telegramStore — Telegram Mini App integration state.
 *
 * Populated by src/telegram/bootstrap.ts before the React tree renders.
 * Components can read isTelegram to adapt their layout for the Mini App shell.
 *
 * IMPORTANT: initData is stored as a raw string only. JWT exchange from
 * initData is FUTURE functionality and must NOT be implemented here.
 * When Telegram auto-login is added, it will live in the auth feature and
 * read initData from this store via a dedicated auth hook.
 */
import { create } from 'zustand'
import type { TelegramUser, TelegramTheme } from '@/telegram/types'

interface TelegramState {
  // State
  isTelegram: boolean
  telegramUser: TelegramUser | null
  themeParams: TelegramTheme | null
  /** Raw initData string from window.Telegram.WebApp.initData.
   *  Do NOT parse or send this to the backend in Phase 2. */
  initData: string | null

  // Actions
  /** Called by the bootstrap module once the SDK is detected. */
  initializeTelegram: (
    user: TelegramUser | null,
    theme: TelegramTheme | null,
    initData: string,
  ) => void
  setTelegramUser: (user: TelegramUser | null) => void
  setTheme: (theme: TelegramTheme | null) => void
}

export const useTelegramStore = create<TelegramState>()((set) => ({
  isTelegram: false,
  telegramUser: null,
  themeParams: null,
  initData: null,

  initializeTelegram: (user, theme, initData) =>
    set({ isTelegram: true, telegramUser: user, themeParams: theme, initData }),

  setTelegramUser: (user) => set({ telegramUser: user }),
  setTheme: (theme) => set({ themeParams: theme }),
}))
