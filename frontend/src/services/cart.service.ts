import api from '@/lib/axios';

export const cartService = {
  getCart: () => api.get('/cart'),

  addItem: (productId: string, quantity: number) =>
    api.post('/cart/items', { productId, quantity }),

  updateItem: (productId: string, quantity: number) =>
    api.patch(`/cart/items/${productId}`, { quantity }),

  removeItem: (productId: string) =>
    api.delete(`/cart/items/${productId}`),

  clearCart: () => api.delete('/cart'),
};
