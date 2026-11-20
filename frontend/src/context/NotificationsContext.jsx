import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { notificationApi } from '../api/endpoints';
import { useAuth } from './AuthContext';

// Polls the unread counter (cheap endpoint) while the tab is visible.
const NotificationsContext = createContext({ unread: 0, refresh: () => {} });
const POLL_MS = 60000;

export function NotificationsProvider({ children }) {
  const { user } = useAuth();
  const [unread, setUnread] = useState(0);

  const refresh = useCallback(() => {
    if (!user) return Promise.resolve();
    return notificationApi.unreadCount().then(({ data }) => setUnread(data.count || 0)).catch(() => {});
  }, [user]);

  useEffect(() => {
    if (!user) return undefined;
    refresh();
    const timer = setInterval(() => { if (!document.hidden) refresh(); }, POLL_MS);
    return () => clearInterval(timer);
  }, [user, refresh]);

  return (
    <NotificationsContext.Provider value={{ unread: user ? unread : 0, refresh }}>
      {children}
    </NotificationsContext.Provider>
  );
}

export const useNotifications = () => useContext(NotificationsContext);
