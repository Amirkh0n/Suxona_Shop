import { createContext, useContext, useEffect, useState } from 'react';

// Wishlist/favorites has no backend support in schema.yml (no endpoint to
// persist it against the user's account). Rather than fake an account-level
// feature, this keeps a real, working favorites list — just scoped to this
// browser via localStorage, not synced anywhere. Honest about what it is.
const STORAGE_KEY = 'suxona_favorites';

const FavoritesContext = createContext(null);

function readStored() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function FavoritesProvider({ children }) {
  const [ids, setIds] = useState(readStored);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
    } catch {
      /* storage unavailable (private mode etc.) — favorites just won't persist */
    }
  }, [ids]);

  const isFavorite = (productId) => ids.includes(productId);
  const toggleFavorite = (productId) => {
    setIds((prev) => (prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId]));
  };

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
