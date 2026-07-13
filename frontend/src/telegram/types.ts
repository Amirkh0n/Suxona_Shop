/**
 * Minimal TypeScript typings for the native Telegram WebApp API.
 *
 * Covers only the surface we actually use. No @telegram-apps/sdk is added
 * (approved decision). The raw global is accessed via the webapp wrapper
 * (src/telegram/webapp.ts) rather than directly in feature code.
 *
 * Reference: https://core.telegram.org/bots/webapps
 */

/** Telegram user object as returned by window.Telegram.WebApp.initDataUnsafe */
export interface TelegramUser {
  id: number
  first_name: string
  last_name?: string
  username?: string
  language_code?: string
  is_premium?: boolean
  photo_url?: string
}

/** Theme parameters passed by the Telegram client. */
export interface TelegramTheme {
  bg_color?: string
  text_color?: string
  hint_color?: string
  link_color?: string
  button_color?: string
  button_text_color?: string
  secondary_bg_color?: string
  header_bg_color?: string
  accent_text_color?: string
  section_bg_color?: string
  section_header_text_color?: string
  subtitle_text_color?: string
  destructive_text_color?: string
}

/** The relevant subset of the WebApp object we interact with. */
export interface TelegramWebApp {
  ready: () => void
  expand: () => void
  close: () => void
  /** Raw initData string (for future server-side validation). */
  initData: string
  /** Parsed initData — do NOT send to backend directly; use initData string. */
  initDataUnsafe: {
    user?: TelegramUser
    query_id?: string
    auth_date?: number
    hash?: string
  }
  themeParams: TelegramTheme
  colorScheme: 'light' | 'dark'
  isExpanded: boolean
  viewportHeight: number
  viewportStableHeight: number
  /** Call when the Mini App is ready to be displayed. */
  MainButton: {
    text: string
    color: string
    textColor: string
    isVisible: boolean
    isActive: boolean
    show: () => void
    hide: () => void
    enable: () => void
    disable: () => void
    onClick: (fn: () => void) => void
    offClick: (fn: () => void) => void
  }
  BackButton: {
    isVisible: boolean
    show: () => void
    hide: () => void
    onClick: (fn: () => void) => void
    offClick: (fn: () => void) => void
  }
  onEvent: (eventType: string, handler: () => void) => void
  offEvent: (eventType: string, handler: () => void) => void
  sendData: (data: string) => void
  openLink: (url: string) => void
  openTelegramLink: (url: string) => void
  showAlert: (message: string, callback?: () => void) => void
  showConfirm: (message: string, callback: (ok: boolean) => void) => void
}

/** The global `window.Telegram` object injected by the Telegram client. */
export interface TelegramGlobal {
  WebApp: TelegramWebApp
}

// Augment the Window interface so TypeScript knows about the global.
declare global {
  interface Window {
    Telegram?: TelegramGlobal
  }
}
