import api from '@/lib/axios';
import { SolutionType } from '@/types';

export const bundleService = {
  getAll: (params?: { solutionType?: SolutionType }) =>
    api.get('/bundles', { params }),

  getBySolutionType: (slug: SolutionType) =>
    api.get(`/bundles/solution/${slug}`),

  getBySlug: (slug: string) =>
    api.get(`/bundles/slug/${slug}`),

  getById: (id: string) =>
    api.get(`/bundles/${id}`),

  create: (data: Record<string, unknown>) =>
    api.post('/bundles', data),

  update: (id: string, data: Record<string, unknown>) =>
    api.patch(`/bundles/${id}`, data),

  delete: (id: string) =>
    api.delete(`/bundles/${id}`),
};
