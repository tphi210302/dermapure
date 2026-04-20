import api from '@/lib/axios';
import { LoginPayload, RegisterPayload, User } from '@/types';

export const authService = {
  login:    (payload: LoginPayload)    => api.post('/auth/login', payload),
  register: (payload: RegisterPayload) => api.post('/auth/register', payload),
  logout:   ()                         => api.post('/auth/logout'),
  getMe:    ()                         => api.get<{ data: User }>('/auth/me'),
  refresh:  (refreshToken: string)     => api.post('/auth/refresh-token', { refreshToken }),
  forgotPassword: (email: string)      => api.post('/auth/forgot-password', { email }),
  resetPassword:  (token: string, password: string) =>
    api.post('/auth/reset-password', { token, password }),
};
