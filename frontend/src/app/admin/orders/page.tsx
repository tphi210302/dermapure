'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Order, OrderStatus, PaginatedResponse } from '@/types';
import { orderService } from '@/services/order.service';
import { formatPrice, formatDate, ORDER_STATUS_LABELS, ORDER_STATUS_BADGE } from '@/lib/utils';
import { cn, getErrorMessage } from '@/lib/utils';
import Spinner from '@/components/ui/Spinner';
import PaginationComp from '@/components/ui/Pagination';
import toast from 'react-hot-toast';

const STATUS_OPTIONS: OrderStatus[] = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];

export default function AdminOrdersPage() {
  const [orders, setOrders]         = useState<Order[]>([]);
  const [pagination, setPagination] = useState<PaginatedResponse<Order>['data']['pagination'] | null>(null);
  const [loading, setLoading]       = useState(true);
  const [page, setPage]             = useState(1);
  const [statusFilter, setStatusFilter] = useState('');

  const fetchOrders = (p = page, s = statusFilter) => {
    setLoading(true);
    orderService.getAllOrders({ page: p, limit: 15, status: s || undefined })
      .then(({ data }) => {
        const resp = data as PaginatedResponse<Order>;
        setOrders(resp.data.items);
        setPagination(resp.data.pagination);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchOrders(page, statusFilter); }, [page, statusFilter]); // eslint-disable-line

  const updateStatus = async (id: string, status: OrderStatus) => {
    try {
      await orderService.updateStatus(id, { status });
      toast.success('Cập nhật trạng thái thành công');
      fetchOrders(page, statusFilter);
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const handleDelete = async (order: Order) => {
    if (!confirm(`Xóa vĩnh viễn đơn hàng #${order._id.slice(-8).toUpperCase()}?\n\nHành động này không thể hoàn tác.`)) return;
    try {
      await orderService.deleteOrder(order._id);
      toast.success('Đã xóa đơn hàng');
      fetchOrders(page, statusFilter);
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="text-xl font-bold text-gray-900">Đơn hàng</h2>
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-600">Lọc:</label>
          <select
            className="input w-40"
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          >
            <option value="">Tất cả trạng thái</option>
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>{ORDER_STATUS_LABELS[s]}</option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Spinner size="lg" /></div>
      ) : (
        <>
          {/* ── Desktop table ────────────────────────────── */}
          <div className="hidden md:block card overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 border-b">
                  <th className="pb-3 pr-4">Mã đơn</th>
                  <th className="pb-3 pr-4">Khách hàng</th>
                  <th className="pb-3 pr-4">SP</th>
                  <th className="pb-3 pr-4">Tổng tiền</th>
                  <th className="pb-3 pr-4">Ngày</th>
                  <th className="pb-3 pr-4">Trạng thái</th>
                  <th className="pb-3 pr-4">Cập nhật</th>
                  <th className="pb-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {orders.map((order) => (
                  <tr key={order._id} className="hover:bg-gray-50">
                    <td className="py-3 pr-4 font-mono text-xs text-gray-600">#{order._id.slice(-8).toUpperCase()}</td>
                    <td className="py-3 pr-4 text-gray-800">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span>{order.user && typeof order.user === 'object' ? order.user.name : '—'}</span>
                        {order.affiliateStaff && (
                          <span className="inline-flex items-center text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200 rounded px-1.5 py-0.5" title={`Giới thiệu bởi ${order.affiliateStaff.name}`}>
                            🎯 {order.affiliateStaff.name}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 pr-4 text-gray-600">{order.items.length}</td>
                    <td className="py-3 pr-4 font-semibold">{formatPrice(order.totalAmount)}</td>
                    <td className="py-3 pr-4 text-gray-500 text-xs">{formatDate(order.createdAt)}</td>
                    <td className="py-3 pr-4">
                      <span className={cn(ORDER_STATUS_BADGE[order.status])}>{ORDER_STATUS_LABELS[order.status]}</span>
                    </td>
                    <td className="py-3 pr-4">
                      <select
                        className="input text-xs py-1 w-32"
                        value={order.status}
                        onChange={(e) => updateStatus(order._id, e.target.value as OrderStatus)}
                        disabled={order.status === 'delivered' || order.status === 'cancelled'}
                      >
                        {STATUS_OPTIONS.map((s) => (
                          <option key={s} value={s}>{ORDER_STATUS_LABELS[s]}</option>
                        ))}
                      </select>
                    </td>
                    <td className="py-3 text-right">
                      <div className="flex items-center gap-2 justify-end">
                        <Link
                          href={`/admin/orders/${order._id}`}
                          className="text-xs font-semibold text-rose-600 hover:text-rose-800 hover:underline"
                        >
                          Chi tiết
                        </Link>
                        <button
                          onClick={() => handleDelete(order)}
                          className="text-xs font-medium text-red-500 hover:text-red-700 hover:underline"
                        >
                          Xóa
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* ── Mobile cards ─────────────────────────────── */}
          <div className="md:hidden space-y-3">
            {orders.map((order) => (
              <div key={order._id} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-mono text-xs text-gray-500">#{order._id.slice(-8).toUpperCase()}</p>
                    <p className="font-semibold text-gray-900 truncate">
                      {order.user && typeof order.user === 'object' ? order.user.name : '—'}
                    </p>
                    {order.affiliateStaff && (
                      <p className="text-[10px] font-bold text-rose-700 mt-0.5">🎯 {order.affiliateStaff.name}</p>
                    )}
                    <p className="text-[11px] text-gray-400">{formatDate(order.createdAt)}</p>
                  </div>
                  <span className={cn('shrink-0', ORDER_STATUS_BADGE[order.status])}>{ORDER_STATUS_LABELS[order.status]}</span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs bg-gray-50 rounded-lg p-2.5">
                  <div>
                    <p className="text-gray-500">Sản phẩm</p>
                    <p className="font-semibold text-gray-800">{order.items.length}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Tổng tiền</p>
                    <p className="font-bold text-rose-600">{formatPrice(order.totalAmount)}</p>
                  </div>
                </div>

                <div>
                  <label className="text-[11px] text-gray-500 font-semibold block mb-1">Cập nhật trạng thái</label>
                  <select
                    className="input text-xs py-2 w-full"
                    value={order.status}
                    onChange={(e) => updateStatus(order._id, e.target.value as OrderStatus)}
                    disabled={order.status === 'delivered' || order.status === 'cancelled'}
                  >
                    {STATUS_OPTIONS.map((s) => (
                      <option key={s} value={s}>{ORDER_STATUS_LABELS[s]}</option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
                  <Link
                    href={`/admin/orders/${order._id}`}
                    className="flex-1 py-2 text-center text-xs font-bold text-rose-600 bg-rose-50 rounded-lg hover:bg-rose-100"
                  >
                    Chi tiết
                  </Link>
                  <button
                    onClick={() => handleDelete(order)}
                    className="flex-1 py-2 text-xs font-bold text-red-500 bg-red-50 rounded-lg hover:bg-red-100"
                  >
                    Xóa
                  </button>
                </div>
              </div>
            ))}
          </div>

          {pagination && <PaginationComp pagination={pagination} onPageChange={setPage} />}
        </>
      )}
    </div>
  );
}
