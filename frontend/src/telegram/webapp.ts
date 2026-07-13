/**
 * Thin wrapper around the native window.Telegram.WebApp API.
 *
 * All access to the Telegram SDK goes through this module — never
 * access window.Telegram.WebApp directly from feature code.
 *
 * This wrapper:
 *   - Detects whether the app is running inside a Telegram Mini App.
 *   - Exposes safe accessors that return null/undefined when not in Telegram.
 *   - Does NOT perform any initData → JWT exchange (future feature).
 */
import type { TelegramWebApp, TelegramUser, TelegramTheme } from './types'

/** Returns the WebApp object if running inside Telegram, otherwise null. */
export function getWebApp(): TelegramWebApp | null {
  return window.Telegram?.WebApp ?? null
}

/** True when the app is running inside a Telegram Mini App client. */
export function isTelegramEnvironment(): boolean {
  const webApp = getWebApp()
  if (!webApp) return false
  // initData is non-empty only inside a real Telegram client.
  return webApp.initData.length > 0
}

/**
 * Signals to the Telegram client that the Mini App is ready to display.
 * Safe to call in any environment (no-ops when not in Telegram).
 */
export function telegramReady(): void {
  getWebApp()?.ready()
}

/**
 * Asks the Telegram client to expand the Mini App to full height.
 * Safe to call in any environment.
 */
export function telegramExpand(): void {
  getWebApp()?.expand()
}

/** Returns the Telegram user from initDataUnsafe, or null. */
export function getTelegramUser(): TelegramUser | null {
  return getWebApp()?.initDataUnsafe?.user ?? null
}

/** Returns the current Telegram theme params, or null. */
export function getTelegramTheme(): TelegramTheme | null {
  const webApp = getWebApp()
  if (!webApp) return null
  const params = webApp.themeParams
  // themeParams can be an empty object — treat it as null in that case.
  return Object.keys(params).length > 0 ? params : null
}

/** Returns the raw initData string for future server-side validation. */
export function getTelegramInitData(): string {
  return getWebApp()?.initData ?? ''
}

/**
 * Applies Telegram theme colours as CSS custom properties on :root so
 * Tailwind utilities can reference them when inside the Mini App.
 * Only called when a Telegram theme is available.
 */
export function applyTelegramTheme(theme: TelegramTheme): void {
  const root = document.documentElement
  const map: Record<keyof TelegramTheme, string> = {
    bg_color: '--tg-bg-color',
    text_color: '--tg-text-color',
    hint_color: '--tg-hint-color',
    link_color: '--tg-link-color',
    button_color: '--tg-button-color',
    button_text_color: '--tg-button-text-color',
    secondary_bg_color: '--tg-secondary-bg-color',
    header_bg_color: '--tg-header-bg-color',
    accent_text_color: '--tg-accent-text-color',
    section_bg_color: '--tg-section-bg-color',
    section_header_text_color: '--tg-section-header-text-color',
    subtitle_text_color: '--tg-subtitle-text-color',
    destructive_text_color: '--tg-destructive-text-color',
  }
  for (const [key, cssVar] of Object.entries(map) as [
    keyof TelegramTheme,
    string,
  ][]) {
    const value = theme[key]
    if (value) {
      root.style.setProperty(cssVar, value)
    }
  }
}
