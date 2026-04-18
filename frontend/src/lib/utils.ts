import { type ClassValue, clsx } from 'clsx';
import { OrderStatus } from '@/types';

export const cn = (...inputs: ClassValue[]) => clsx(inputs);

export const formatPrice = (price: number, currency = 'VND') =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency }).format(price);

export const formatDate = (dateStr: string) =>
  new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(dateStr));

export const truncate = (str: string, maxLength: number) =>
  str.length > maxLength ? `${str.slice(0, maxLength)}…` : str;

export const getErrorMessage = (error: unknown): string => {
  if (error && typeof error === 'object' && 'response' in error) {
    const axiosError = error as { response?: { data?: { message?: string } } };
    return axiosError.response?.data?.message || 'An error occurred';
  }
  if (error instanceof Error) return error.message;
  return 'An unexpected error occurred';
};

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending:    'Chờ xác nhận',
  confirmed:  'Đã xác nhận',
  processing: 'Đang xử lý',
  shipped:    'Đang giao hàng',
  delivered:  'Đã giao',
  cancelled:  'Đã hủy',
};

export const ORDER_STATUS_BADGE: Record<OrderStatus, string> = {
  pending:    'badge-yellow',
  confirmed:  'badge-blue',
  processing: 'badge-blue',
  shipped:    'badge-blue',
  delivered:  'badge-green',
  cancelled:  'badge-red',
};

export const DISCOUNT_PERCENT = (price: number, comparePrice?: number) => {
  if (!comparePrice || comparePrice <= price) return 0;
  return Math.round(((comparePrice - price) / comparePrice) * 100);
};
