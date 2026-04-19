'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/axios';
import { getErrorMessage } from '@/lib/utils';
import VietnamAddressPicker from '@/components/address/VietnamAddressPicker';
import StreetAutocomplete from '@/components/address/StreetAutocomplete';
import Spinner from '@/components/ui/Spinner';
import toast from 'react-hot-toast';

const inputCls = `w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl text-sm text-gray-900
                  placeholder:text-gray-400
                  focus:bg-white focus:border-rose-400 focus:ring-2 focus:ring-rose-500/20
                  focus:outline-none transition-all duration-200`;

type Tab = 'info' | 'address' | 'password';

export default function ProfilePage() {
  const router = useRouter();
  const { user, isLoading, isAuthenticated, refreshUser, logout } = useAuth();
  const [tab, setTab] = useState<Tab>('info');
  const [saving, setSaving] = useState(false);

  const [info, setInfo] = useState({ name: '', email: '', phone: '' });
  const [addr, setAddr] = useState({ street: '', ward: '', city: '', state: '' });
  const [pwd,  setPwd]  = useState({ current: '', next: '', confirm: '' });

  useEffect(() => {
    if (user) {
      setInfo({ name: user.name || '', email: user.email || '', phone: user.phone || '' });
      setAddr({
        street: user.address?.street || '',
        ward:   user.address?.ward   || '',
        city:   user.address?.city   || '',
        state:  user.address?.state  || '',
      });
    }
  }, [user]);

  const saveInfo = async () => {
    setSaving(true);
    try {
      await api.patch('/users/me', {
        name: info.name,
        email: info.email || '',
        phone: info.phone,
      });
      await refreshUser();
      toast.success('Cập nhật thông tin thành công');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const saveAddress = async () => {
    setSaving(true);
    try {
      await api.patch('/users/me', { address: addr });
      await refreshUser();
      toast.success('Cập nhật địa chỉ thành công');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const changePwd = async () => {
    if (!pwd.current || !pwd.next) { toast.error('Vui lòng nhập đủ mật khẩu'); return; }
    if (pwd.next.length < 8) { toast.error('Mật khẩu mới tối thiểu 8 ký tự'); return; }
    if (pwd.next !== pwd.confirm) { toast.error('Mật khẩu xác nhận không khớp'); return; }
    setSaving(true);
    try {
      await api.post('/auth/change-password', { currentPassword: pwd.current, newPassword: pwd.next });
      toast.success('Đổi mật khẩu thành công');
      setPwd({ current: '', next: '', confirm: '' });
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  // Loading state — wait for auth context to resolve
  if (isLoading) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center">
        <Spinner size="lg" />
        <p className="text-sm text-gray-500 mt-4">Đang tải thông tin tài khoản...</p>
      </div>
    );
  }

  // Not authenticated — show inline login prompt (no auto-redirect)
  if (!isAuthenticated || !user) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center">
        <div className="bg-white rounded-3xl border-2 border-rose-100 shadow-lg p-8">
          <div className="h-20 w-20 mx-auto rounded-2xl flex items-center justify-center text-4xl mb-5 shadow-md"
            style={{ background: 'linear-gradient(135deg,#fff1f2,#fecdd3)' }}>
            👤
          </div>
          <h2 className="text-xl font-extrabold text-gray-900 mb-2">Tài khoản của tôi</h2>
          <p className="text-sm text-gray-500 mb-6">
            Vui lòng đăng nhập để xem thông tin cá nhân, quản lý địa chỉ và đổi mật khẩu.
          </p>
          <div className="flex gap-3">
            <Link href="/login?redirect=/profile"
              className="flex-1 py-3 text-white font-bold rounded-xl shadow-md hover:shadow-lg active:scale-[0.98] transition-all"
              style={{ background: 'linear-gradient(135deg,#e11d48,#f43f5e)' }}>
              Đăng nhập
            </Link>
            <Link href="/register"
              className="flex-1 py-3 bg-white border-2 border-rose-200 text-rose-600 font-bold rounded-xl hover:bg-rose-50 transition-colors">
              Đăng ký
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

      {/* Hero card */}
      <div className="rounded-2xl p-5 mb-6 flex items-center gap-4 flex-wrap text-white shadow-lg"
        style={{ background: 'linear-gradient(135deg,#4c0519 0%,#be123c 50%,#f43f5e 100%)' }}>
        <div className="h-14 w-14 rounded-2xl bg-white/25 flex items-center justify-center text-2xl font-black backdrop-blur-sm shrink-0">
          {user.name?.[0]?.toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-extrabold truncate">{user.name}</h1>
          <p className="text-sm text-white/80 truncate">{user.phone || user.email}</p>
        </div>
        {(user.role === 'admin' || user.role === 'staff' || user.role === 'sales') && (
          <Link href="/admin" className="px-4 py-2 text-xs font-bold bg-white text-rose-700 rounded-xl shadow-md hover:shadow-lg shrink-0">
            📊 Quản trị
          </Link>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 bg-white p-1.5 rounded-2xl border border-gray-200 shadow-sm overflow-x-auto">
        {[
          { k: 'info',     label: 'Thông tin', icon: '👤' },
          { k: 'address',  label: 'Địa chỉ',   icon: '📍' },
          { k: 'password', label: 'Mật khẩu',  icon: '🔒' },
        ].map((t) => (
          <button key={t.k} onClick={() => setTab(t.k as Tab)}
            className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${
              tab === t.k ? 'text-white shadow-md' : 'text-gray-600 hover:bg-gray-50'
            }`}
            style={tab === t.k ? { background: 'linear-gradient(135deg,#e11d48,#f43f5e)' } : {}}>
            <span>{t.icon}</span>{t.label}
          </button>
        ))}
      </div>

      {/* Content card */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-md p-6">

        {tab === 'info' && (
          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1.5">Họ và tên *</label>
              <input className={inputCls} value={info.name}
                onChange={(e) => setInfo((p) => ({ ...p, name: e.target.value }))} />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1.5">
                Số điện thoại * <span className="font-normal text-gray-400">(dùng để đăng nhập)</span>
              </label>
              <input type="tel" className={inputCls} value={info.phone}
                onChange={(e) => setInfo((p) => ({ ...p, phone: e.target.value }))} />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1.5">
                Email <span className="font-normal text-gray-400">(tuỳ chọn)</span>
              </label>
              <input type="email" className={inputCls} value={info.email}
                onChange={(e) => setInfo((p) => ({ ...p, email: e.target.value }))} />
            </div>
            <button onClick={saveInfo} disabled={saving}
              className="w-full py-3 text-white font-extrabold rounded-xl shadow-md hover:shadow-lg active:scale-[0.98] transition-all disabled:opacity-60"
              style={{ background: 'linear-gradient(135deg,#e11d48,#f43f5e)' }}>
              {saving ? 'Đang lưu...' : '💾 Lưu thông tin'}
            </button>
          </div>
        )}

        {tab === 'address' && (
          <div className="space-y-4">
            <VietnamAddressPicker
              value={{ state: addr.state, ward: addr.ward }}
              onChange={(a) => setAddr((p) => ({ ...p, state: a.state, ward: a.ward, city: a.city ?? '' }))}
            />
            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1.5">
                Số nhà, tên đường <span className="text-[10px] font-normal text-rose-500">(gõ để xem gợi ý)</span>
              </label>
              <StreetAutocomplete
                className={inputCls}
                value={addr.street}
                onChange={(v) => setAddr((p) => ({ ...p, street: v }))}
                state={addr.state}
                city={addr.city}
                ward={addr.ward}
                placeholder="Số nhà, tên đường"
              />
            </div>
            <button onClick={saveAddress} disabled={saving}
              className="w-full py-3 text-white font-extrabold rounded-xl shadow-md hover:shadow-lg active:scale-[0.98] transition-all disabled:opacity-60"
              style={{ background: 'linear-gradient(135deg,#e11d48,#f43f5e)' }}>
              {saving ? 'Đang lưu...' : '📍 Lưu địa chỉ'}
            </button>
          </div>
        )}

        {tab === 'password' && (
          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1.5">Mật khẩu hiện tại</label>
              <input type="password" className={inputCls} value={pwd.current}
                onChange={(e) => setPwd((p) => ({ ...p, current: e.target.value }))} />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1.5">Mật khẩu mới (tối thiểu 8 ký tự)</label>
              <input type="password" className={inputCls} value={pwd.next}
                onChange={(e) => setPwd((p) => ({ ...p, next: e.target.value }))} />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1.5">Xác nhận mật khẩu mới</label>
              <input type="password" className={inputCls} value={pwd.confirm}
                onChange={(e) => setPwd((p) => ({ ...p, confirm: e.target.value }))} />
            </div>
            <button onClick={changePwd} disabled={saving}
              className="w-full py-3 text-white font-extrabold rounded-xl shadow-md hover:shadow-lg active:scale-[0.98] transition-all disabled:opacity-60"
              style={{ background: 'linear-gradient(135deg,#e11d48,#f43f5e)' }}>
              {saving ? 'Đang lưu...' : '🔒 Đổi mật khẩu'}
            </button>
          </div>
        )}
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-2 gap-3 mt-6">
        <Link href="/orders" className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 flex items-center gap-3 hover:shadow-md active:scale-[0.98] transition-all">
          <div className="h-10 w-10 rounded-xl bg-rose-100 flex items-center justify-center text-xl">📦</div>
          <div className="min-w-0">
            <p className="font-bold text-gray-900 text-sm">Đơn hàng</p>
            <p className="text-xs text-gray-500">Xem lịch sử mua</p>
          </div>
        </Link>
        <button onClick={async () => { await logout(); router.push('/'); }}
          className="bg-white rounded-2xl border border-red-200 shadow-sm p-4 flex items-center gap-3 hover:shadow-md hover:bg-red-50 active:scale-[0.98] transition-all text-left">
          <div className="h-10 w-10 rounded-xl bg-red-100 flex items-center justify-center text-xl">🚪</div>
          <div className="min-w-0">
            <p className="font-bold text-red-600 text-sm">Đăng xuất</p>
            <p className="text-xs text-gray-500">Thoát tài khoản</p>
          </div>
        </button>
      </div>
    </div>
  );
}
