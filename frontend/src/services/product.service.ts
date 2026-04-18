import api from '@/lib/axios';
import { ProductQuery } from '@/types';

export const productService = {
  getAll: (params?: ProductQuery) =>
    api.get('/products', { params }),

  getById: (id: string) =>
    api.get(`/products/${id}`),

  getBySlug: (slug: string) =>
    api.get(`/products/slug/${slug}`),

  create: (data: FormData | Record<string, unknown>) =>
    api.post('/products', data),

  update: (id: string, data: Record<string, unknown>) =>
    api.patch(`/products/${id}`, data),

  delete: (id: string) =>
    api.delete(`/products/${id}`),
};
