import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { authApi, storeApi } from '../api/endpoints';
import { tokenStore, setUnauthorizedHandler } from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [myStore, setMyStore] = useState(null); // null = not a seller (or unknown yet)
  const [initializing, setInitializing] = useState(true);

  const loadMe = useCallback(async () => {
    try {
      const { data } = await authApi.me();
      setUser(data);
      // Not every customer owns a store; a 404 here just means "not a seller".
      // Awaited (not fire-and-forget) so `initializing` only clears once this
      // is settled — otherwise SellerRoute could redirect before it resolves.
      try {
        const { data: store } = await storeApi.myStore();
        setMyStore(store);
      } catch {
        setMyStore(null);
      }
      return data;
    } catch {
      tokenStore.clear();
      setUser(null);
      setMyStore(null);
      return null;
    }
  }, []);

  useEffect(() => {
    setUnauthorizedHandler(() => { setUser(null); setMyStore(null); });
    if (tokenStore.getAccess() || tokenStore.getRefresh()) {
      loadMe().finally(() => setInitializing(false));
    } else {
      setInitializing(false);
    }
  }, [loadMe]);

  const login = async (phone, password) => {
    const { data } = await authApi.login(phone, password);
    tokenStore.setTokens(data.access, data.refresh);
    return loadMe();
  };

  const register = async (payload) => {
    const { data } = await authApi.register(payload);
    return data;
  };

  const logout = () => {
    tokenStore.clear();
    setUser(null);
    setMyStore(null);
  };

  const refreshMyStore = async () => {
    try {
      const { data } = await storeApi.myStore();
      setMyStore(data);
      return data;
    } catch {
      setMyStore(null);
      return null;
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, myStore, initializing, login, register, logout, refreshUser: loadMe, refreshMyStore }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
