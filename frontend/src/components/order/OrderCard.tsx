import Link from 'next/link';
import { Order } from '@/types';
import { formatPrice, formatDate, ORDER_STATUS_LABELS, ORDER_STATUS_BADGE } from '@/lib/utils';
import { cn } from '@/lib/utils';

interface Props {
  order: Order;
}

const STATUS_STYLE: Record<string, { gradient: string; icon: string; lightBg: string }> = {
  pending:    { gradient: 'linear-gradient(135deg,#b45309,#d97706,#fbbf24)', icon: '🕐', lightBg: 'bg-amber-50' },
  confirmed:  { gradient: 'linear-gradient(135deg,#1e40af,#2563eb,#60a5fa)', icon: '✅', lightBg: 'bg-blue-50' },
  processing: { gradient: 'linear-gradient(135deg,#5b21b6,#7c3aed,#a78bfa)', icon: '⚙️', lightBg: 'bg-violet-50' },
  shipped:    { gradient: 'linear-gradient(135deg,#0e7490,#0891b2,#22d3ee)', icon: '🚚', lightBg: 'bg-cyan-50' },
  delivered:  { gradient: 'linear-gradient(135deg,#065f46,#059669,#34d399)', icon: '📦', lightBg: 'bg-emerald-50' },
  cancelled:  { gradient: 'linear-gradient(135deg,#374151,#6b7280,#9ca3af)', icon: '❌', lightBg: 'bg-gray-100' },
};

export default function OrderCard({ order }: Props) {
  const style = STATUS_STYLE[order.status] ?? STATUS_STYLE.pending;

  return (
    <div className="rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-shadow border border-gray-200">
      {/* Header */}
      <div className="px-5 py-3.5 flex items-center justify-between gap-3"
        style={{ background: style.gradient }}>
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="text-xl leading-none shrink-0">{style.icon}</span>
          <div className="min-w-0">
            <p className="text-[11px] text-white/70 font-medium">Mã đơn hàng</p>
            <p className="font-mono text-sm font-extrabold text-white tracking-wide">
              #{order._id.slice(-8).toUpperCase()}
            </p>
          </div>
        </div>
        <div className="text-right shrink-0">
          <span className={cn('badge bg-white/25 text-white border border-white/20', ORDER_STATUS_BADGE[order.status])}>
            {ORDER_STATUS_LABELS[order.status]}
          </span>
          <p className="text-[11px] text-white/70 mt-1">{formatDate(order.createdAt)}</p>
        </div>
      </div>

      {/* Items */}
      <div className={cn('px-5 py-4 space-y-2', style.lightBg)}>
        {order.items.map((item) => (
          <div key={item._id} className="flex items-center justify-between text-sm">
            <span className="text-gray-700 flex-1 truncate">
              {typeof item.product === 'object' ? item.product.name : 'Sản phẩm'} × {item.quantity}
            </span>
            <span className="text-gray-900 font-semibold shrink-0 ml-2">
              {formatPrice(item.price * item.quantity)}
            </span>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="px-5 py-3.5 bg-white border-t border-gray-100 flex items-center justify-between gap-3 flex-wrap">
        <div>
          <p className="text-[11px] text-gray-400 font-medium">Tổng tiền</p>
          <p className="font-extrabold text-rose-600 text-base">{formatPrice(order.totalAmount)}</p>
        </div>
        <Link
          href={`/orders/${order._id}`}
          className="text-xs font-bold px-4 py-2 rounded-lg text-white transition-all hover:shadow-md active:scale-[0.98]"
          style={{ background: style.gradient }}
        >
          Xem chi tiết →
        </Link>
      </div>
    </div>
  );
}
