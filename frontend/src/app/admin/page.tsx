'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { adminService } from '@/services/admin.service';
import { useAuth } from '@/context/AuthContext';
import { DashboardStats, Order } from '@/types';
import { formatPrice, formatDate, ORDER_STATUS_BADGE, ORDER_STATUS_LABELS, cn } from '@/lib/utils';

interface StatCardProps {
  label: string;
  value: string | number;
  sub?: string | null;
  icon: React.ReactNode;
  gradient: string;
}

const StatCard = ({ label, value, sub, icon, gradient }: StatCardProps) => (
  <div className={`relative overflow-hidden rounded-2xl p-5 text-white ${gradient}`}>
    <div className="h-10 w-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm mb-3">
      {icon}
    </div>
    <p className="text-3xl font-extrabold mb-0.5">{value}</p>
    <p className="text-white/70 text-sm font-medium">{label}</p>
    {sub && <p className="text-white/50 text-xs mt-0.5">{sub}</p>}
    <div className="absolute -right-6 -bottom-6 h-24 w-24 rounded-full bg-white/10" />
    <div className="absolute -right-2 -bottom-10 h-16 w-16 rounded-full bg-white/10" />
  </div>
);

const SkeletonCard = () => <div className="skeleton rounded-2xl h-36" />;

const MonthlyChart = ({ data }: { data: DashboardStats['revenueByMonth'] }) => {
  if (!data.length) {
    return (
      <div className="flex items-center justify-center h-48 text-gray-400 text-sm">
        Chưa có dữ liệu đơn hàng đã giao
      </div>
    );
  }

  const maxVal = Math.max(...data.map((d) => d.revenue), 1);
  const shortMonth = (m: string) => {
    const [y, mo] = m.split('-');
    return `T${parseInt(mo)}/${y.slice(2)}`;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-5 text-xs font-medium text-gray-500">
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />Doanh thu
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />Vốn
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-violet-400" />Lợi nhuận
        </span>
      </div>
      <div className="flex items-end gap-1.5 sm:gap-3 h-32 sm:h-44 overflow-x-auto">
        {data.map((d) => {
          const scale = typeof window !== 'undefined' && window.innerWidth < 640 ? 100 : 160;
          const revH  = Math.round((d.revenue / maxVal) * scale);
          const costH = Math.round((d.cost    / maxVal) * scale);
          const profH = Math.max(Math.round((Math.abs(d.profit) / maxVal) * scale), 2);
          const profPos = d.profit >= 0;
          return (
            <div key={d.month} className="flex-1 min-w-[32px] flex flex-col items-center gap-1 group">
              <div className="hidden group-hover:flex flex-col items-center bg-gray-900 text-white text-[10px] rounded-lg px-2 py-1.5 shadow-lg whitespace-nowrap z-10 mb-1 gap-0.5">
                <span className="font-bold text-xs">{shortMonth(d.month)}</span>
                <span className="text-emerald-300">DT: {formatPrice(d.revenue)}</span>
                <span className="text-amber-300">Vốn: {formatPrice(d.cost)}</span>
                <span className={profPos ? 'text-violet-300' : 'text-red-300'}>
                  LN: {profPos ? '+' : '-'}{formatPrice(Math.abs(d.profit))}
                </span>
              </div>
              <div className="flex items-end gap-0.5 w-full justify-center">
                <div className="w-1/3 rounded-t-md bg-emerald-400 transition-all duration-500" style={{ height: revH }} />
                <div className="w-1/3 rounded-t-md bg-amber-400 transition-all duration-500" style={{ height: costH }} />
                <div className={`w-1/3 rounded-t-md transition-all duration-500 ${profPos ? 'bg-violet-400' : 'bg-red-400'}`} style={{ height: profH }} />
              </div>
              <span className="text-[9px] sm:text-[10px] text-gray-400 font-medium">{shortMonth(d.month)}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default function AdminDashboard() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const [stats, setStats]     = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  // Only admin can view dashboard — redirect staff/sales to their default page
  useEffect(() => {
    if (authLoading) return;
    if (user && user.role !== 'admin') {
      router.replace('/admin/orders');
    }
  }, [authLoading, user, router]);

  useEffect(() => {
    if (user?.role !== 'admin') return;
    adminService.getDashboard()
      .then(({ data }) => setStats(data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user?.role]);

  if (authLoading || (user && user.role !== 'admin') || loading) {
    return (
      <div className="space-y-8">
        <div className="skeleton h-8 w-40 rounded" />
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
          {[1,2,3,4].map(i => <SkeletonCard key={i} />)}
        </div>
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2 skeleton rounded-2xl h-80" />
          <div className="skeleton rounded-2xl h-80" />
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <p className="text-4xl mb-4">⚠️</p>
        <p className="text-red-500 font-medium">Không thể tải dữ liệu dashboard.</p>
        <button onClick={() => window.location.reload()} className="mt-4 btn btn-primary btn-sm">
          Thử lại
        </button>
      </div>
    );
  }

  const profitMargin = stats.totalRevenue > 0
    ? Math.round((stats.totalProfit / stats.totalRevenue) * 100) : 0;

  const statCards = [
    {
      label:    'Doanh thu (đơn đặt)',
      value:    formatPrice(stats.totalRevenue),
      sub:      `Vốn nhập: ${formatPrice(stats.totalCost)}`,
      gradient: 'bg-gradient-to-br from-emerald-500 to-teal-600',
      icon: (
        <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
        </svg>
      ),
    },
    {
      label:    'Lợi nhuận thực',
      value:    formatPrice(stats.totalProfit),
      sub:      `Biên lợi nhuận: ${profitMargin}%`,
      gradient: stats.totalProfit >= 0
        ? 'bg-gradient-to-br from-violet-500 to-purple-600'
        : 'bg-gradient-to-br from-red-500 to-rose-600',
      icon: (
        <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/>
        </svg>
      ),
    },
    {
      label:    'Tổng đơn hàng',
      value:    stats.totalOrders.toLocaleString(),
      sub:      null,
      gradient: 'bg-gradient-to-br from-blue-500 to-indigo-600',
      icon: (
        <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
        </svg>
      ),
    },
    {
      label:    'Sản phẩm / Người dùng',
      value:    `${stats.totalProducts} / ${stats.totalUsers}`,
      sub:      null,
      gradient: 'bg-gradient-to-br from-orange-500 to-pink-600',
      icon: (
        <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/>
        </svg>
      ),
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-extrabold text-gray-900">Bảng điều khiển</h2>
        <p className="text-sm text-gray-500 mt-0.5">Chào mừng trở lại, đây là tình hình hôm nay.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        {statCards.map((card) => (
          <StatCard key={card.label} {...card} />
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Monthly chart + table */}
        <div className="xl:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-card overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-50">
            <div>
              <h3 className="font-bold text-gray-900">Doanh thu &amp; Lợi nhuận theo tháng</h3>
              <p className="text-xs text-gray-400 mt-0.5">6 tháng gần nhất · đơn chưa hủy</p>
            </div>
            {stats.revenueByMonth.length > 0 && (
              <div className="text-right">
                <p className="text-xs text-gray-400">Tổng LN</p>
                <p className={`text-sm font-extrabold ${stats.totalProfit >= 0 ? 'text-violet-600' : 'text-red-500'}`}>
                  {stats.totalProfit >= 0 ? '+' : ''}{formatPrice(stats.totalProfit)}
                </p>
              </div>
            )}
          </div>
          <div className="p-6">
            <MonthlyChart data={stats.revenueByMonth} />
          </div>
          {stats.revenueByMonth.length > 0 && (
            <div className="border-t border-gray-50 overflow-x-auto">
              <table className="min-w-full text-xs">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-4 py-2 text-left text-gray-500 font-semibold">Tháng</th>
                    <th className="px-4 py-2 text-right text-emerald-600 font-semibold">Doanh thu</th>
                    <th className="px-4 py-2 text-right text-amber-600 font-semibold">Vốn</th>
                    <th className="px-4 py-2 text-right text-violet-600 font-semibold">Lợi nhuận</th>
                    <th className="px-4 py-2 text-right text-gray-500 font-semibold">Biên %</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {stats.revenueByMonth.map((d) => {
                    const margin = d.revenue > 0 ? Math.round((d.profit / d.revenue) * 100) : 0;
                    const pos = d.profit >= 0;
                    return (
                      <tr key={d.month} className="hover:bg-gray-50">
                        <td className="px-4 py-2 font-medium text-gray-700">{d.month}</td>
                        <td className="px-4 py-2 text-right font-bold text-emerald-700">{formatPrice(d.revenue)}</td>
                        <td className="px-4 py-2 text-right text-amber-700">{formatPrice(d.cost)}</td>
                        <td className={`px-4 py-2 text-right font-bold ${pos ? 'text-violet-700' : 'text-red-500'}`}>
                          {pos ? '+' : ''}{formatPrice(d.profit)}
                        </td>
                        <td className={`px-4 py-2 text-right font-semibold ${pos ? 'text-violet-500' : 'text-red-400'}`}>
                          {margin}%
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="space-y-6">
          {/* Orders by status */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-card overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-50">
              <h3 className="font-bold text-gray-900">Đơn hàng theo trạng thái</h3>
            </div>
            <div className="p-6 space-y-4">
              {stats.ordersByStatus.map(({ status, count }) => {
                const pct = stats.totalOrders > 0 ? Math.round((count / stats.totalOrders) * 100) : 0;
                return (
                  <div key={status}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className={cn('badge text-xs', ORDER_STATUS_BADGE[status])}>
                        {ORDER_STATUS_LABELS[status]}
                      </span>
                      <span className="text-sm font-bold text-gray-900">{count}</span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-primary-500 rounded-full transition-all duration-500"
                        style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recent orders */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-card overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-50">
              <h3 className="font-bold text-gray-900">Đơn hàng gần đây</h3>
              <span className="text-xs text-gray-400">10 mới nhất</span>
            </div>
            <div className="divide-y divide-gray-50">
              {stats.recentOrders.map((order: Order) => (
                <div key={order._id} className="px-5 py-3 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-mono font-bold text-gray-600">
                        #{order._id.slice(-6).toUpperCase()}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {order.user && typeof order.user === 'object' ? order.user.name : '—'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-gray-900">{formatPrice(order.totalAmount)}</p>
                      <span className={cn('badge text-[10px]', ORDER_STATUS_BADGE[order.status])}>
                        {ORDER_STATUS_LABELS[order.status]}
                      </span>
                    </div>
                  </div>
                  <p className="text-[10px] text-gray-300 mt-1">{formatDate(order.createdAt)}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
