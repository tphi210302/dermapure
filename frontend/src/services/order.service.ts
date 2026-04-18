import api from '@/lib/axios';
import { Address } from '@/types';

export const orderService = {
  checkout: (payload: { shippingAddress: Address; note?: string; voucherCode?: string }) =>
    api.post('/orders/checkout', payload),

  getMyOrders: (params?: { page?: number; limit?: number }) =>
    api.get('/orders/my', { params }),

  getOrderById: (id: string) =>
    api.get(`/orders/${id}`),

  // Customer
  cancelOrder: (id: string) =>
    api.patch(`/orders/${id}/cancel`),

  // Admin
  getAllOrders: (params?: { page?: number; limit?: number; status?: string; search?: string }) =>
    api.get('/orders', { params }),

  updateStatus: (id: string, payload: { status: string; note?: string; trackingCode?: string }) =>
    api.patch(`/orders/${id}/status`, payload),

  deleteOrder: (id: string) =>
    api.delete(`/orders/${id}`),
};
