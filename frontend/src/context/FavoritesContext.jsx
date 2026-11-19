import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { favoriteApi } from '../api/endpoints';
import { useAuth } from './AuthContext';

// Logged-in shoppers: favourites live on the server (synced across devices).
// Guests: nothing is stored; toggling asks the caller to log in.
const FavoritesContext = createContext(null);

export function FavoritesProvider({ children }) {
  const { user } = useAuth();
  const [ids, setIds] = useState([]);

  useEffect(() => {
    if (!user) { setIds([]); return; }
    favoriteApi.ids().then(({ data }) => setIds(data.ids || [])).catch(() => {});
  }, [user]);

  const isFavorite = (productId) => ids.includes(productId);

  // Returns false when the shopper must log in first.
  const toggleFavorite = useCallback(async (productId) => {
    if (!user) return false;
    const was = ids.includes(productId);
    setIds((prev) => (was ? prev.filter((i) => i !== productId) : [...prev, productId])); // optimistic
    try {
      await (was ? favoriteApi.remove(productId) : favoriteApi.add(productId));
    } catch {
      setIds((prev) => (was ? [...prev, productId] : prev.filter((i) => i !== productId)));
    }
    return true;
  }, [user, ids]);

  return (
    <FavoritesContext.Provider value={{ ids, isFavorite, toggleFavorite }}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const ctx = useContext(FavoritesContext);
  if (!ctx) throw new Error('useFavorites must be used within FavoritesProvider');
  return ctx;
}
