import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './index.css';
import App from './App.jsx';
import ErrorBoundary from './components/ErrorBoundary';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { FavoritesProvider } from './context/FavoritesContext';
import { PreviewNoticeProvider } from './context/PreviewNoticeContext';
import { NotificationsProvider } from './context/NotificationsContext';
import { I18nProvider } from './i18n';
import { initTheme } from './utils/theme';

initTheme();

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <I18nProvider>
        <AuthProvider>
        <NotificationsProvider>
          <CartProvider>
            <FavoritesProvider>
              <PreviewNoticeProvider>
                <App />
              </PreviewNoticeProvider>
            </FavoritesProvider>
          </CartProvider>
        </NotificationsProvider>
        </AuthProvider>
        </I18nProvider>
      </BrowserRouter>
    </ErrorBoundary>
  </StrictMode>
);

// Installable PWA: only in production builds (a worker in `vite dev` caches stale modules).
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {});
  });
}
