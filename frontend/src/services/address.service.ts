import api from '@/lib/axios';
import type { SavedAddress } from '@/types';

export type AddressInput = Omit<SavedAddress, '_id' | 'createdAt' | 'updatedAt'>;

export const addressService = {
  list: () => api.get<{ data: SavedAddress[] }>('/users/me/addresses'),
  add: (data: Partial<AddressInput>) => api.post('/users/me/addresses', data),
  update: (id: string, data: Partial<AddressInput>) => api.patch(`/users/me/addresses/${id}`, data),
  remove: (id: string) => api.delete(`/users/me/addresses/${id}`),
  setDefault: (id: string) => api.patch(`/users/me/addresses/${id}/default`),
};
