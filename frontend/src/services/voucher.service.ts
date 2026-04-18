import api from '@/lib/axios';

export interface AppliedVoucher {
  code: string;
  type: 'percent' | 'fixed' | 'free-shipping';
  discount: number;
  freeShipping: boolean;
  note: string;
}

export const voucherService = {
  listActive: () => api.get('/vouchers'),

  // Auto-detect applicable voucher (first-order discount etc.)
  auto: (subtotal: number) =>
    api.get('/vouchers/auto', { params: { subtotal } }),

  apply: (code: string, subtotal: number) =>
    api.post('/vouchers/apply', { code, subtotal }),
};
