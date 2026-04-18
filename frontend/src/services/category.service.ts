import api from '@/lib/axios';

export const categoryService = {
  getAll: () => api.get('/categories'),

  getById: (id: string) => api.get(`/categories/${id}`),

  create: (data: Record<string, unknown>) => api.post('/categories', data),

  update: (id: string, data: Record<string, unknown>) => api.patch(`/categories/${id}`, data),

  delete: (id: string) => api.delete(`/categories/${id}`),
};
