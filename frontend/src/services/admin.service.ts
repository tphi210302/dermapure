import api from '@/lib/axios';

export const adminService = {
  getDashboard: () => api.get('/admin/dashboard'),

  getUsers: (params?: { page?: number; limit?: number; search?: string; role?: string }) =>
    api.get('/users', { params }),

  updateUser: (id: string, data: Record<string, unknown>) =>
    api.patch(`/users/${id}`, data),

  deleteUser: (id: string) =>
    api.delete(`/users/${id}`),
};
