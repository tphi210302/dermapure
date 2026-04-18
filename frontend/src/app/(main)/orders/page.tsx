'use client';

import { useEffect, useState } from 'react';
import { Order, PaginatedResponse } from '@/types';
import { orderService } from '@/services/order.service';
import OrderCard from '@/components/order/OrderCard';
import Spinner from '@/components/ui/Spinner';
import PaginationComp from '@/components/ui/Pagination';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';

export default function OrdersPage() {
  const { isAuthenticated } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [pagination, setPagination] = useState<PaginatedResponse<Order>['data']['pagination'] | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  useEffect(() => {
    if (!isAuthenticated) return;
    setLoading(true);
    orderService.getMyOrders({ page, limit: 10 })
      .then(({ data }) => {
        const resp = data as PaginatedResponse<Order>;
        setOrders(resp.data.items);
        setPagination(resp.data.pagination);
      })
      .finally(() => setLoading(false));
  }, [isAuthenticated, page]);

  if (!isAuthenticated) {
    return (
      <div className="max-w-xl mx-auto px-4 py-24 text-center">
        <p className="text-5xl mb-4">📦</p>
        <h2 className="text-xl font-bold mb-2">Xem đơn hàng của bạn</h2>
        <Link href="/login" className="btn-primary btn mt-4">Đăng nhập</Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Đơn hàng của tôi</h1>

      {loading ? (
        <div className="flex justify-center py-24"><Spinner size="lg" /></div>
      ) : orders.length === 0 ? (
        <div className="text-center py-24 text-gray-500">
          <p className="text-5xl mb-4">📦</p>
          <p className="text-lg font-medium mb-2">Chưa có đơn hàng nào</p>
          <Link href="/products" className="btn-primary btn">Bắt đầu mua sắm</Link>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {orders.map((order) => <OrderCard key={order._id} order={order} />)}
          </div>
          {pagination && <PaginationComp pagination={pagination} onPageChange={setPage} />}
        </>
      )}
    </div>
  );
}
