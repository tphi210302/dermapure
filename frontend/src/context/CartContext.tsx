'use client';

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { Cart, CartItem } from '@/types';
import api from '@/lib/axios';
import { useAuth } from './AuthContext';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

interface CartContextValue {
  cart: Cart | null;
  cartCount: number;
  cartTotal: number;
  isLoading: boolean;
  showMiniCart: boolean;
  openMiniCart: () => void;
  closeMiniCart: () => void;
  addToCart: (productId: string, quantity?: number) => Promise<void>;
  updateQuantity: (productId: string, quantity: number) => Promise<void>;
  removeFromCart: (productId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const [cart, setCart] = useState<Cart | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showMiniCart, setShowMiniCart] = useState(false);
  const openMiniCart  = useCallback(() => setShowMiniCart(true),  []);
  const closeMiniCart = useCallback(() => setShowMiniCart(false), []);

  const fetchCart = useCallback(async () => {
    if (!isAuthenticated) { setCart(null); return; }
    try {
      setIsLoading(true);
      const { data } = await api.get('/cart');
      setCart(data.data);
    } catch {
      setCart(null);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => { fetchCart(); }, [fetchCart]);

  const addToCart = useCallback(async (productId: string, quantity = 1) => {
    if (!isAuthenticated) {
      toast.error('Vui lòng đăng nhập để thêm vào giỏ hàng');
      router.push('/login');
      return;
    }
    try {
      const { data } = await api.post('/cart/items', { productId, quantity });
      setCart(data.data);
      setShowMiniCart(true);
    } catch (err: unknown) {
      const msg = err && typeof err === 'object' && 'response' in err
        ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
        : 'Không thể thêm vào giỏ hàng';
      toast.error(msg || 'Không thể thêm vào giỏ hàng');
    }
  }, [isAuthenticated, router]);

  const updateQuantity = useCallback(async (productId: string, quantity: number) => {
    try {
      const { data } = await api.patch(`/cart/items/${productId}`, { quantity });
      setCart(data.data);
    } catch {
      toast.error('Failed to update cart');
    }
  }, []);

  const removeFromCart = useCallback(async (productId: string) => {
    try {
      const { data } = await api.delete(`/cart/items/${productId}`);
      setCart(data.data);
      toast.success('Item removed');
    } catch {
      toast.error('Failed to remove item');
    }
  }, []);

  const clearCart = useCallback(async () => {
    try {
      await api.delete('/cart');
      setCart(null);
    } catch {
      toast.error('Failed to clear cart');
    }
  }, []);

  const cartCount = useMemo(
    () => cart?.items.reduce((sum: number, item: CartItem) => sum + item.quantity, 0) ?? 0,
    [cart]
  );

  const cartTotal = useMemo(
    () =>
      cart?.items.reduce(
        (sum: number, item: CartItem) =>
          sum + item.quantity * (typeof item.product === 'object' ? item.product.price : 0),
        0
      ) ?? 0,
    [cart]
  );

  const value = useMemo<CartContextValue>(
    () => ({
      cart,
      cartCount,
      cartTotal,
      isLoading,
      showMiniCart,
      openMiniCart,
      closeMiniCart,
      addToCart,
      updateQuantity,
      removeFromCart,
      clearCart,
      refreshCart: fetchCart,
    }),
    [cart, cartCount, cartTotal, isLoading, showMiniCart, openMiniCart, closeMiniCart, addToCart, updateQuantity, removeFromCart, clearCart, fetchCart]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = (): CartContextValue => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
};
