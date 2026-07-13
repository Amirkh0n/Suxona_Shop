/**
 * Application entry point.
 *
 * Sequence before React renders:
 *   1. Run Telegram bootstrap (detect SDK, populate stores, apply theme).
 *   2. Wire browser online/offline events → appStore.networkStatus.
 *   3. Mount React with AppProviders (ErrorBoundary → QueryClient → Router).
 */
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'

import { bootstrapTelegram } from '@/telegram/bootstrap'
import { useAppStore } from '@/stores/appStore'
import { AppProviders } from '@/app/providers'

// 1. Telegram bootstrap (non-throwing, safe in all environments).
bootstrapTelegram()

// 2. Network status listeners.
window.addEventListener('online', () => {
  useAppStore.getState().setNetworkStatus('online')
})
window.addEventListener('offline', () => {
  useAppStore.getState().setNetworkStatus('offline')
})

// 3. Mount React.
const root = document.getElementById('root')
if (!root) throw new Error('Root element #root not found in index.html')

createRoot(root).render(
  <StrictMode>
    <AppProviders />
  </StrictMode>,
)
