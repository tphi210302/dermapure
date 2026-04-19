'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Order, OrderStatus, User } from '@/types';
import { orderService } from '@/services/order.service';
import { formatPrice, formatDate, ORDER_STATUS_LABELS, ORDER_STATUS_BADGE, cn } from '@/lib/utils';
import Spinner from '@/components/ui/Spinner';
import toast from 'react-hot-toast';

const STATUS_OPTIONS: OrderStatus[] = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];

const STATUS_GRADIENT: Record<string, string> = {
  pending:    'linear-gradient(135deg,#92400e,#d97706,#fbbf24)',
  confirmed:  'linear-gradient(135deg,#1e40af,#2563eb,#60a5fa)',
  processing: 'linear-gradient(135deg,#5b21b6,#7c3aed,#a78bfa)',
  shipped:    'linear-gradient(135deg,#0e7490,#0891b2,#22d3ee)',
  delivered:  'linear-gradient(135deg,#065f46,#059669,#34d399)',
  cancelled:  'linear-gradient(135deg,#374151,#6b7280,#9ca3af)',
};

export default function AdminOrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [order, setOrder]   = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);

  const [statusForm, setStatusForm] = useState<{ status: OrderStatus; note: string; trackingCode: string }>({
    status: 'pending',
    note: '',
    trackingCode: '',
  });

  const fetchOrder = () => {
    setLoading(true);
    orderService.getOrderById(id)
      .then(({ data }: any) => {
        const o = data.data as Order;
        setOrder(o);
        setStatusForm({
          status: o.status,
          note: '',
          trackingCode: o.trackingCode || '',
        });
      })
      .catch(() => { toast.error('Không tìm thấy đơn hàng'); router.push('/admin/orders'); })
      .finally(() => setLoading(false));
  };

  useEffect(fetchOrder, [id]); // eslint-disable-line

  const handleSave = async () => {
    if (!order) return;
    setSaving(true);
    try {
      await orderService.updateStatus(order._id, {
        status: statusForm.status,
        note: statusForm.note.trim() || undefined,
        trackingCode: statusForm.trackingCode.trim() || undefined,
      });
      toast.success('Đã cập nhật đơn hàng');
      fetchOrder();
      setStatusForm((p) => ({ ...p, note: '' }));
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Không thể cập nhật');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex justify-center py-24"><Spinner size="lg" /></div>;
  if (!order)  return null;

  const addr = order.shippingAddress;
  const user = typeof order.user === 'object' ? order.user as User : null;
  const addrLine = [addr?.street, addr?.ward, addr?.city, addr?.state].filter(Boolean).join(', ');
  const isFinal  = order.status === 'delivered' || order.status === 'cancelled';

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-5">
      {/* Header */}
      <div className="rounded-2xl px-5 py-5 flex items-center gap-4 flex-wrap"
        style={{ background: STATUS_GRADIENT[order.status] || STATUS_GRADIENT.pending }}>
        <button onClick={() => router.push('/admin/orders')}
          className="p-2 rounded-xl bg-white/20 hover:bg-white/30 text-white transition-colors shrink-0">
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/>
          </svg>
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-lg font-extrabold text-white">
              Đơn hàng #{order._id.slice(-8).toUpperCase()}
            </h1>
            <span className="text-xs text-white/70 font-mono">{order._id}</span>
          </div>
          <p className="text-sm text-white/70 mt-0.5">Tạo lúc: {formatDate(order.createdAt)}</p>
        </div>
        <span className={cn('badge shrink-0', ORDER_STATUS_BADGE[order.status])}>
          {ORDER_STATUS_LABELS[order.status]}
        </span>
      </div>

      <div className="grid lg:grid-cols-3 gap-5">

        {/* ── LEFT: Customer / Address / Items ── */}
        <div className="lg:col-span-2 space-y-5">

          {/* Customer */}
          {user && (
            <div className="bg-white rounded-2xl border border-gray-200 shadow-md p-5">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Khách hàng</p>
              <div className="flex items-start gap-3">
                <div className="h-12 w-12 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center font-bold text-lg">
                  {user.name?.[0]?.toUpperCase() || '?'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-gray-900">{user.name}</p>
                  <p className="text-sm text-gray-600">📧 {user.email}</p>
                  {user.phone && <p className="text-sm text-gray-600">📞 {user.phone}</p>}
                </div>
              </div>
            </div>
          )}

          {/* Shipping address */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-md p-5">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Địa chỉ giao hàng</p>
            {addr?.recipientName && (
              <p className="font-bold text-gray-900 text-sm mb-1">👤 {addr.recipientName}</p>
            )}
            {addr?.phone && <p className="text-sm text-gray-700 mb-1">📞 {addr.phone}</p>}
            {addrLine && <p className="text-sm text-gray-600">📍 {addrLine}</p>}
            {order.note && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl px-3 py-2 mt-3">
                <p className="text-xs text-amber-700 font-semibold mb-0.5">Ghi chú của khách</p>
                <p className="text-sm text-amber-800">{order.note}</p>
              </div>
            )}
          </div>

          {/* Items */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-md p-5">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">
              Sản phẩm ({order.items.length})
            </p>
            <div className="space-y-3">
              {order.items.map((item) => {
                const product = typeof item.product === 'object' ? item.product : null;
                const thumb = product?.images?.[0] || 'https://placehold.co/56x56/f0f9ff/0369a1?text=SP';
                return (
                  <div key={item._id} className="flex items-center gap-3 border-b border-gray-100 last:border-b-0 pb-3 last:pb-0">
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

            {/* Payment breakdown */}
            <div className="pt-4 mt-4 border-t-2 border-gray-200 space-y-1.5 text-sm">
              {(() => {
                const subtotal    = order.subtotal    ?? (order.totalAmount + (order.discount || 0) - (order.shippingFee || 0));
                const shippingFee = order.shippingFee ?? 0;
                const discount    = order.discount    ?? 0;
                return (
                  <>
                    <div className="flex justify-between text-gray-600">
                      <span>Tạm tính</span>
                      <span>{formatPrice(subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span>Phí vận chuyển</span>
                      {shippingFee === 0
                        ? <span className="text-emerald-600 font-semibold">Miễn phí</span>
                        : <span>{formatPrice(shippingFee)}</span>}
                    </div>
                    {discount > 0 && (
                      <div className="flex justify-between text-emerald-600 font-semibold">
                        <span className="truncate">{order.discountNote || (order.voucherCode ? `Mã ${order.voucherCode}` : 'Giảm giá')}</span>
                        <span className="shrink-0 ml-2">-{formatPrice(discount)}</span>
                      </div>
                    )}
                    <div className="flex justify-between font-extrabold text-gray-900 pt-2 border-t border-gray-100 text-base">
                      <span>Tổng cộng</span>
                      <span className="text-rose-600 text-xl">{formatPrice(order.totalAmount)}</span>
                    </div>
                  </>
                );
              })()}
            </div>
          </div>

          {/* Status history */}
          {order.statusHistory && order.statusHistory.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-200 shadow-md p-5">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">📋 Lịch sử đơn hàng</p>
              <ol className="space-y-4">
                {[...order.statusHistory].reverse().map((h, i) => {
                  const changedBy = typeof h.changedBy === 'object' ? h.changedBy as User : null;
                  return (
                    <li key={i} className="flex gap-3">
                      <div className="flex flex-col items-center shrink-0">
                        <div className="h-3 w-3 rounded-full mt-1.5"
                          style={{ background: STATUS_GRADIENT[h.status] || '#9ca3af' }} />
                        {i < order.statusHistory.length - 1 && <div className="flex-1 w-0.5 bg-gray-200 mt-1" />}
                      </div>
                      <div className="flex-1 pb-3">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={cn('badge', ORDER_STATUS_BADGE[h.status])}>
                            {ORDER_STATUS_LABELS[h.status]}
                          </span>
                          <span className="text-[11px] text-gray-400">{formatDate(h.changedAt)}</span>
                        </div>
                        {h.note && <p className="text-xs text-gray-700 mt-1 italic">"{h.note}"</p>}
                        {changedBy && (
                          <p className="text-[11px] text-gray-400 mt-0.5">Cập nhật bởi: {changedBy.name} ({changedBy.role})</p>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ol>
            </div>
          )}
        </div>

        {/* ── RIGHT: Action panel ── */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl border-2 border-rose-200 shadow-lg p-5 sticky top-24">
            <h3 className="font-extrabold text-gray-900 mb-4 flex items-center gap-2">
              <span className="text-xl">⚡</span> Cập nhật đơn hàng
            </h3>

            {isFinal ? (
              <div className="bg-gray-100 rounded-xl p-4 text-center">
                <p className="text-sm font-semibold text-gray-500">
                  Đơn đã {order.status === 'delivered' ? 'hoàn thành' : 'bị hủy'} — không thể thay đổi
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1.5">Trạng thái mới</label>
                  <select
                    value={statusForm.status}
                    onChange={(e) => setStatusForm((p) => ({ ...p, status: e.target.value as OrderStatus }))}
                    className="w-full px-3 py-2.5 bg-gray-50 border-2 border-gray-200 rounded-xl text-sm
                               focus:border-rose-400 focus:ring-2 focus:ring-rose-500/20 focus:outline-none"
                  >
                    {STATUS_OPTIONS.map((s) => (
                      <option key={s} value={s}>{ORDER_STATUS_LABELS[s]}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1.5">Mã vận đơn</label>
                  <input
                    type="text"
                    value={statusForm.trackingCode}
                    onChange={(e) => setStatusForm((p) => ({ ...p, trackingCode: e.target.value }))}
                    placeholder="VD: GHN123456789"
                    className="w-full px-3 py-2.5 bg-gray-50 border-2 border-gray-200 rounded-xl text-sm
                               focus:border-rose-400 focus:ring-2 focus:ring-rose-500/20 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1.5">Ghi chú nội bộ <span className="font-normal text-gray-400">(tùy chọn)</span></label>
                  <textarea
                    value={statusForm.note}
                    onChange={(e) => setStatusForm((p) => ({ ...p, note: e.target.value }))}
                    rows={3}
                    placeholder="VD: Đã liên hệ khách xác nhận địa chỉ…"
                    className="w-full px-3 py-2.5 bg-gray-50 border-2 border-gray-200 rounded-xl text-sm resize-none
                               focus:border-rose-400 focus:ring-2 focus:ring-rose-500/20 focus:outline-none"
                  />
                </div>

                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="w-full py-3 text-white font-extrabold rounded-xl shadow-md hover:shadow-lg active:scale-[0.98] transition-all disabled:opacity-60"
                  style={{ background: 'linear-gradient(135deg,#e11d48,#f43f5e)' }}
                >
                  {saving ? 'Đang lưu...' : '💾 Lưu thay đổi'}
                </button>
              </div>
            )}

            <div className="mt-6 pt-4 border-t border-gray-100 space-y-2 text-xs text-gray-500">
              <p>💰 <span className="font-semibold">{formatPrice(order.totalAmount)}</span> · COD</p>
              <p>📦 {order.items.length} sản phẩm · {order.items.reduce((s, i) => s + i.quantity, 0)} món</p>
              <p>📅 {formatDate(order.createdAt)}</p>
              {order.trackingCode && <p className="font-mono break-all">🔎 {order.trackingCode}</p>}
            </div>
          </div>
        </div>
      </div>

      <Link href="/admin/orders" className="inline-flex items-center gap-1 text-sm text-rose-600 font-medium hover:underline">
        ← Tất cả đơn hàng
      </Link>
    </div>
  );
}
