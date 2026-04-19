import api from '@/lib/axios';

export const adminService = {
  getDashboard: () => api.get('/admin/dashboard'),

  getUsers: (params?: { page?: number; limit?: number; search?: string; role?: string }) =>
    api.get('/users', { params }),

  createUser: (data: {
    name: string;
    email?: string;
    phone: string;
    password: string;
    role?: 'customer' | 'sales' | 'staff' | 'admin';
    isActive?: boolean;
    affiliateCode?: string;
  }) => api.post('/users', data),

  updateUser: (id: string, data: Record<string, unknown>) =>
    api.patch(`/users/${id}`, data),

  deleteUser: (id: string) =>
    api.delete(`/users/${id}`),
};
