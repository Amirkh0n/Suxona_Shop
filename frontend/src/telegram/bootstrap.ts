/**
 * Telegram bootstrap — runs once before the React tree renders (called from
 * src/main.tsx).
 *
 * Responsibilities:
 *   1. Detect the native Telegram WebApp SDK.
 *   2. If detected, call ready() + expand() and populate the stores.
 *   3. Apply Telegram theme params as CSS variables.
 *   4. Mark appStore.telegramMode = true.
 *
 * NOT responsible for (future work):
 *   - initData → JWT exchange (Telegram auto-login).
 *   - Any server request.
 *
 * The function is intentionally non-throwing: if any step fails the app
 * continues running in browser mode (Req 5.5).
 */
import {
  isTelegramEnvironment,
  telegramReady,
  telegramExpand,
  getTelegramUser,
  getTelegramTheme,
  getTelegramInitData,
  applyTelegramTheme,
} from './webapp'
import { useTelegramStore } from '@/stores/telegramStore'
import { useAppStore } from '@/stores/appStore'

export function bootstrapTelegram(): void {
  try {
    if (!isTelegramEnvironment()) return

    // 1. Signal readiness to the Telegram client.
    telegramReady()
    telegramExpand()

    // 2. Collect data from the native SDK.
    const user = getTelegramUser()
    const theme = getTelegramTheme()
    const initData = getTelegramInitData()

    // 3. Populate the Telegram store.
    useTelegramStore.getState().initializeTelegram(user, theme, initData)

    // 4. Mark app as running in Telegram mode.
    //    If this specific step throws we still continue (Req 5.5).
    try {
      useAppStore.getState().setTelegramMode(true)
    } catch {
      // Intentionally swallowed — Telegram detection succeeded but the store
      // update failed. The app should continue uninterrupted.
    }

    // 5. Apply theme colours as CSS variables if available.
    if (theme) {
      applyTelegramTheme(theme)
    }
  } catch {
    // Any unexpected SDK error must not crash the app.
    // The app falls back to normal browser mode.
  }
}
