import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { cartApi } from '../api/endpoints';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const { user } = useAuth();
  const [cart, setCart] = useState(null); // { stores: [{ store_id, store_name, items? }] }
  const [loading, setLoading] = useState(false);

  const itemCount = (cart?.stores || []).reduce((sum, group) => sum + (group.items?.length || 0), 0);

  const refresh = useCallback(async () => {
    if (!user) { setCart(null); return; }
    setLoading(true);
    try {
      const { data } = await cartApi.get();
      setCart(data);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { refresh(); }, [refresh]);

  const addItem = async (productId, quantity = 1) => {
    await cartApi.addItem(productId, quantity);
    await refresh();
  };
  const updateItem = async (itemId, quantity) => {
    await cartApi.updateItem(itemId, quantity);
    await refresh();
  };
  const removeItem = async (itemId) => {
    await cartApi.removeItem(itemId);
    await refresh();
  };
  const clearCart = async () => {
    await cartApi.clear();
    await refresh();
  };

  return (
    <CartContext.Provider value={{ cart, loading, itemCount, refresh, addItem, updateItem, removeItem, clearCart }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
