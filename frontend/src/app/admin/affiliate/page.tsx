'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/axios';
import { formatPrice, getErrorMessage } from '@/lib/utils';
import Spinner from '@/components/ui/Spinner';
import toast from 'react-hot-toast';

interface MyStats {
  code?: string;
  orderCount: number;
  totalRevenue: number;
  user: { name: string; email: string; role: string };
}

interface LeaderboardRow {
  staffId: string;
  name: string;
  email: string;
  role: string;
  affiliateCode: string;
  orderCount: number;
  totalRevenue: number;
}

export default function AffiliatePage() {
  const { user } = useAuth();
  const [me,    setMe]    = useState<MyStats | null>(null);
  const [board, setBoard] = useState<LeaderboardRow[] | null>(null);
  const [loading, setLoading] = useState(true);

  const isAdmin = user?.role === 'admin';
  const siteOrigin = typeof window !== 'undefined' ? window.location.origin : 'https://dermapure.vercel.app';

  useEffect(() => {
    Promise.all([
      api.get('/users/me/affiliate').then((r) => setMe(r.data.data)).catch(() => {}),
      isAdmin
        ? api.get('/users/affiliate/leaderboard').then((r) => setBoard(r.data.data)).catch(() => {})
        : Promise.resolve(),
    ]).finally(() => setLoading(false));
  }, [isAdmin]);

  const refLink = me?.code ? `${siteOrigin}/?ref=${me.code}` : '';

  const copy = async (text: string, label = 'Đã sao chép') => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(label);
    } catch {
      toast.error('Không sao chép được');
    }
  };

  if (loading) {
    return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900">🎯 Chương trình giới thiệu</h2>
        <p className="text-sm text-gray-500 mt-0.5">Chia sẻ mã/link để khách hàng đặt — đơn đặt qua link của bạn được tính cho bạn.</p>
      </div>

      {/* My card */}
      {me?.code ? (
        <div className="rounded-2xl p-6 text-white shadow-lg"
          style={{ background: 'linear-gradient(135deg,#4c0519 0%,#be123c 50%,#f43f5e 100%)' }}>
          <p className="text-xs font-bold uppercase tracking-widest opacity-70 mb-2">Mã giới thiệu của bạn</p>
          <div className="flex items-center gap-3 flex-wrap">
            <div className="font-mono text-2xl sm:text-3xl font-black tracking-wider bg-white/15 border border-white/25 rounded-xl px-4 py-2 backdrop-blur-sm">
              {me.code}
            </div>
            <button onClick={() => copy(me.code!, 'Đã sao chép mã')}
              className="px-3 py-2 text-xs font-bold bg-white text-rose-700 rounded-xl shadow-md hover:bg-rose-50">
              📋 Copy mã
            </button>
          </div>

          <div className="mt-5">
            <p className="text-xs font-bold uppercase tracking-widest opacity-70 mb-2">Link giới thiệu</p>
            <div className="flex items-center gap-2 flex-wrap">
              <code className="flex-1 min-w-0 truncate bg-black/25 rounded-lg px-3 py-2 text-xs font-mono break-all">
                {refLink}
              </code>
              <button onClick={() => copy(refLink, 'Đã sao chép link')}
                className="px-3 py-2 text-xs font-bold bg-white text-rose-700 rounded-xl shadow-md hover:bg-rose-50 whitespace-nowrap">
                📋 Copy link
              </button>
            </div>
            <p className="text-[11px] opacity-75 mt-2">Khách click link → cookie lưu 30 ngày → khi đặt đơn, đơn được gán cho bạn.</p>
          </div>

          <div className="grid grid-cols-2 gap-3 mt-6">
            <div className="bg-white/15 border border-white/25 rounded-xl p-4 backdrop-blur-sm">
              <p className="text-xs uppercase tracking-wider opacity-80">Đơn hàng</p>
              <p className="text-2xl font-black mt-1">{me.orderCount}</p>
            </div>
            <div className="bg-white/15 border border-white/25 rounded-xl p-4 backdrop-blur-sm">
              <p className="text-xs uppercase tracking-wider opacity-80">Doanh thu</p>
              <p className="text-2xl font-black mt-1">{formatPrice(me.totalRevenue)}</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-5 text-sm text-amber-800">
          Chưa có mã giới thiệu. Liên hệ admin để được cấp mã.
        </div>
      )}

      {/* Admin — leaderboard */}
      {isAdmin && board && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h3 className="font-bold text-gray-900">🏆 Bảng xếp hạng nhân viên</h3>
            <p className="text-xs text-gray-500 mt-0.5">Tổng hợp đơn giới thiệu theo từng nhân viên (không tính đơn đã hủy)</p>
          </div>
          {board.length === 0 ? (
            <p className="p-5 text-sm text-gray-500 text-center">Chưa có đơn nào qua mã giới thiệu.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50 text-left text-xs text-gray-500 uppercase">
                  <tr>
                    <th className="px-4 py-3">#</th>
                    <th className="px-4 py-3">Nhân viên</th>
                    <th className="px-4 py-3">Mã</th>
                    <th className="px-4 py-3">Vai trò</th>
                    <th className="px-4 py-3 text-right">Đơn</th>
                    <th className="px-4 py-3 text-right">Doanh thu</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {board.map((r, i) => (
                    <tr key={r.staffId} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-semibold text-gray-400">{i + 1}</td>
                      <td className="px-4 py-3">
                        <p className="font-bold text-gray-900">{r.name}</p>
                        <p className="text-xs text-gray-500">{r.email}</p>
                      </td>
                      <td className="px-4 py-3 font-mono text-xs font-bold text-rose-600">{r.affiliateCode}</td>
                      <td className="px-4 py-3">
                        <span className={r.role === 'admin' ? 'badge badge-blue' : 'badge badge-green'}>{r.role}</span>
                      </td>
                      <td className="px-4 py-3 text-right font-bold">{r.orderCount}</td>
                      <td className="px-4 py-3 text-right font-bold text-rose-600">{formatPrice(r.totalRevenue)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
