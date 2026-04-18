'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Order, OrderStatus } from '@/types';
import { orderService } from '@/services/order.service';
import { formatPrice, formatDate, ORDER_STATUS_LABELS, ORDER_STATUS_BADGE, cn } from '@/lib/utils';
import Spinner from '@/components/ui/Spinner';
import toast from 'react-hot-toast';

const STATUS_STEPS: OrderStatus[] = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'];
const STEP_LABELS = ['Chờ xử lý', 'Đã xác nhận', 'Đang xử lý', 'Đang giao', 'Đã giao'];
const STEP_ICONS  = ['🕐', '✅', '⚙️', '🚚', '📦'];

const STATUS_GRADIENT: Record<string, string> = {
  pending:    'linear-gradient(135deg,#92400e,#d97706,#fbbf24)',
  confirmed:  'linear-gradient(135deg,#1e40af,#2563eb,#60a5fa)',
  processing: 'linear-gradient(135deg,#5b21b6,#7c3aed,#a78bfa)',
  shipped:    'linear-gradient(135deg,#0e7490,#0891b2,#22d3ee)',
  delivered:  'linear-gradient(135deg,#065f46,#059669,#34d399)',
  cancelled:  'linear-gradient(135deg,#374151,#6b7280,#9ca3af)',
};

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [order, setOrder]       = useState<Order | null>(null);
  const [loading, setLoading]   = useState(true);
  const [cancelling, setCancelling] = useState(false);

  const fetchOrder = () => {
    orderService.getOrderById(id)
      .then(({ data }: any) => setOrder(data.data))
      .catch(() => { toast.error('Không tìm thấy đơn hàng'); router.push('/orders'); })
      .finally(() => setLoading(false));
  };

  useEffect(fetchOrder, [id]); // eslint-disable-line

  const handleCancel = async () => {
    if (!confirm('Bạn có chắc muốn hủy đơn hàng này?')) return;
    setCancelling(true);
    try {
      await orderService.cancelOrder(id);
      toast.success('Đã hủy đơn hàng');
      fetchOrder();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Không thể hủy đơn hàng');
    } finally {
      setCancelling(false);
    }
  };

  if (loading) return <div className="flex justify-center py-24"><Spinner size="lg" /></div>;
  if (!order)  return null;

  const addr = order.shippingAddress;
  const isCancelled = order.status === 'cancelled';
  const currentStep = isCancelled ? -1 : STATUS_STEPS.indexOf(order.status);
  const addrLine = [addr?.street, addr?.ward, addr?.city, addr?.state].filter(Boolean).join(', ');

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-5">

      {/* Gradient hero banner */}
      <div className="rounded-2xl px-5 py-5 flex items-center gap-4 flex-wrap"
        style={{ background: STATUS_GRADIENT[order.status] || STATUS_GRADIENT.pending }}>
        <button onClick={() => router.push('/orders')}
          className="p-2 rounded-xl bg-white/20 hover:bg-white/30 text-white transition-colors shrink-0">
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/>
          </svg>
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="text-lg font-extrabold text-white">
            Đơn hàng #{order._id.slice(-8).toUpperCase()}
          </h1>
          <p className="text-sm text-white/70 mt-0.5">{formatDate(order.createdAt)}</p>
        </div>
        <span className={cn('badge shrink-0', ORDER_STATUS_BADGE[order.status])}>
          {ORDER_STATUS_LABELS[order.status]}
        </span>
      </div>

      {/* Progress tracker */}
      {!isCancelled && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-md p-4 sm:p-6">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">Tiến trình đơn hàng</p>
          <div className="flex items-center overflow-x-auto pb-1">
            {STATUS_STEPS.map((step, i) => (
              <div key={step} className="flex items-center flex-1 last:flex-none min-w-0">
                <div className="flex flex-col items-center gap-1 min-w-[48px]">
                  <div className={`h-9 w-9 sm:h-10 sm:w-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0 transition-colors
                    ${i <= currentStep ? 'text-white shadow-lg' : 'bg-gray-100 text-gray-400'}`}
                    style={i <= currentStep ? { background: STATUS_GRADIENT[step] } : {}}>
                    {i < currentStep ? '✓' : STEP_ICONS[i]}
                  </div>
                  <span className={`text-[10px] sm:text-[11px] font-semibold text-center leading-tight w-14 ${
                    i <= currentStep ? 'text-gray-900' : 'text-gray-400'
                  }`}>{STEP_LABELS[i]}</span>
                </div>
                {i < STATUS_STEPS.length - 1 && (
                  <div className={`flex-1 h-1 mb-5 mx-0.5 sm:mx-1 rounded-full transition-colors ${
                    i < currentStep ? 'bg-emerald-500' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {isCancelled && (
        <div className="bg-red-50 border border-red-200 rounded-2xl px-5 py-4">
          <p className="text-sm font-semibold text-red-700">❌ Đơn hàng đã bị hủy</p>
          <p className="text-xs text-red-500 mt-0.5">Tồn kho đã được hoàn lại.</p>
        </div>
      )}

      {/* Status history timeline */}
      {order.statusHistory && order.statusHistory.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-md p-5">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">📋 Lịch sử đơn hàng</p>
          <ol className="space-y-4">
            {[...order.statusHistory].reverse().map((h, i) => (
              <li key={i} className="flex gap-3">
                <div className="flex flex-col items-center shrink-0">
                  <div className="h-3 w-3 rounded-full mt-1.5"
                    style={{ background: STATUS_GRADIENT[h.status] || '#9ca3af' }} />
                  {i < order.statusHistory.length - 1 && <div className="flex-1 w-0.5 bg-gray-200 mt-1" />}
                </div>
                <div className="flex-1 pb-3">
                  <p className="font-semibold text-sm text-gray-900">{ORDER_STATUS_LABELS[h.status]}</p>
                  <p className="text-[11px] text-gray-400">{formatDate(h.changedAt)}</p>
                  {h.note && <p className="text-xs text-gray-600 mt-1 italic">"{h.note}"</p>}
                </div>
              </li>
            ))}
          </ol>
        </div>
      )}

      {/* Tracking code */}
      {order.trackingCode && (
        <div className="bg-cyan-50 border-2 border-cyan-200 rounded-2xl p-4 flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-cyan-600 text-white flex items-center justify-center text-xl">🔎</div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-cyan-700">Mã vận đơn</p>
            <p className="font-mono font-bold text-gray-900 text-sm break-all">{order.trackingCode}</p>
          </div>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-5">
        {/* Shipping address */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-md p-5">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Địa chỉ giao hàng</p>
          {addr?.recipientName && (
            <p className="font-bold text-gray-900 text-sm mb-1">{addr.recipientName}</p>
          )}
          {addr?.phone && <p className="text-sm text-gray-700 mb-2">📞 {addr.phone}</p>}
          {addrLine && <p className="text-sm text-gray-600">{addrLine}</p>}
          {order.note && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl px-3 py-2 mt-3">
              <p className="text-xs text-amber-600 font-semibold mb-0.5">Ghi chú</p>
              <p className="text-sm text-amber-800">{order.note}</p>
            </div>
          )}
        </div>

        {/* Payment summary */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-md p-5">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Thanh toán</p>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-gray-600">
              <span>Tạm tính</span>
              <span>{formatPrice(order.totalAmount)}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Vận chuyển</span>
              <span className="text-emerald-600 font-semibold">Miễn phí</span>
            </div>
            <div className="flex justify-between font-extrabold text-gray-900 pt-2 border-t border-gray-100 text-base">
              <span>Tổng cộng</span>
              <span className="text-rose-600 text-lg">{formatPrice(order.totalAmount)}</span>
            </div>
          </div>
          <p className="text-[11px] text-gray-400 mt-2">💰 COD — Thanh toán khi nhận hàng</p>
        </div>
      </div>

      {/* Order items */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-md p-5">
        <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">
          Sản phẩm ({order.items.length})
        </p>
        <div className="space-y-4">
          {order.items.map((item) => {
            const product = typeof item.product === 'object' ? item.product : null;
            const thumb   = product?.images?.[0] || 'https://placehold.co/56x56/f0f9ff/0369a1?text=SP';
            return (
              <div key={item._id} className="flex items-center gap-3">
                <div className="relative h-14 w-14 rounded-xl overflow-hidden bg-slate-50 shrink-0 border border-gray-100">
                  <Image src={thumb} alt={product?.name || 'Sản phẩm'} fill className="object-cover" sizes="56px" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {product?.name || 'Sản phẩm đã bị xóa'}
                  </p>
                  <p className="text-xs text-gray-400">{formatPrice(item.price)} × {item.quantity}</p>
                </div>
                <p className="text-sm font-bold text-gray-900 shrink-0">
                  {formatPrice(item.price * item.quantity)}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between">
        <Link href="/orders" className="text-sm text-rose-600 hover:underline font-medium">
          ← Đơn hàng của tôi
        </Link>
        {order.status === 'pending' && (
          <button
            onClick={handleCancel}
            disabled={cancelling}
            className="text-sm font-semibold text-red-500 hover:text-red-700 border-2 border-red-200 hover:border-red-400 hover:bg-red-50 px-4 py-2 rounded-xl transition-colors disabled:opacity-50"
          >
            {cancelling ? 'Đang hủy...' : 'Hủy đơn hàng'}
          </button>
        )}
        {order.status !== 'pending' && !isCancelled && order.status !== 'delivered' && (
          <p className="text-xs text-gray-400 italic">Đơn đã xác nhận, không thể hủy</p>
        )}
      </div>
    </div>
  );
}
