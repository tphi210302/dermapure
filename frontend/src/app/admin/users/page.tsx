'use client';

import { useEffect, useState } from 'react';
import { User, PaginatedResponse } from '@/types';
import { adminService } from '@/services/admin.service';
import { formatDate, getErrorMessage } from '@/lib/utils';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Spinner from '@/components/ui/Spinner';
import PaginationComp from '@/components/ui/Pagination';
import toast from 'react-hot-toast';

export default function AdminUsersPage() {
  const [users, setUsers]             = useState<User[]>([]);
  const [pagination, setPagination]   = useState<PaginatedResponse<User>['data']['pagination'] | null>(null);
  const [loading, setLoading]         = useState(true);
  const [page, setPage]               = useState(1);
  const [search, setSearch]           = useState('');

  // Password reset state
  const [resetId, setResetId]         = useState<string | null>(null);
  const [resetPw, setResetPw]         = useState('');
  const [showResetPw, setShowResetPw] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);

  // Create-user state
  const [createOpen,    setCreateOpen]    = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [showCreatePw,  setShowCreatePw]  = useState(false);
  const [newUser, setNewUser] = useState({
    name: '', email: '', phone: '', password: '', role: 'staff' as 'staff' | 'admin' | 'customer',
  });

  const fetchUsers = (p = page, q = search) => {
    setLoading(true);
    adminService.getUsers({ page: p, limit: 15, search: q })
      .then(({ data }) => {
        const resp = data as PaginatedResponse<User>;
        setUsers(resp.data.items);
        setPagination(resp.data.pagination);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchUsers(page, search); }, [page]); // eslint-disable-line

  const toggleActive = async (user: User) => {
    try {
      await adminService.updateUser(user._id, { isActive: !user.isActive });
      toast.success(user.isActive ? 'Đã vô hiệu hóa tài khoản' : 'Đã kích hoạt tài khoản');
      fetchUsers(page, search);
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const handleDelete = async (user: User) => {
    if (!confirm(`Xóa vĩnh viễn tài khoản "${user.name}" (${user.email})?\n\nHành động này không thể hoàn tác.`)) return;
    try {
      await adminService.deleteUser(user._id);
      toast.success('Đã xóa tài khoản');
      fetchUsers(page, search);
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchUsers(1, search);
  };

  const openReset = (userId: string) => {
    setResetId(userId);
    setResetPw('');
    setShowResetPw(false);
  };

  const cancelReset = () => {
    setResetId(null);
    setResetPw('');
  };

  const resetCreateForm = () => {
    setNewUser({ name: '', email: '', phone: '', password: '', role: 'staff' });
    setShowCreatePw(false);
  };

  const handleCreateUser = async () => {
    const { name, phone, password, email, role } = newUser;
    if (!name.trim() || name.trim().length < 2) { toast.error('Họ tên tối thiểu 2 ký tự'); return; }
    if (!/^(0|\+84)(3|5|7|8|9)[0-9]{8}$/.test(phone.trim())) { toast.error('SĐT không hợp lệ (vd: 0912345678)'); return; }
    if (password.length < 8) { toast.error('Mật khẩu tối thiểu 8 ký tự'); return; }
    if (email && !/^\S+@\S+\.\S+$/.test(email.trim())) { toast.error('Email không hợp lệ'); return; }

    setCreateLoading(true);
    try {
      await adminService.createUser({
        name: name.trim(),
        phone: phone.trim(),
        password,
        role,
        ...(email.trim() && { email: email.trim() }),
      });
      toast.success(`Đã tạo tài khoản ${role === 'staff' ? 'nhân viên' : role} thành công`);
      setCreateOpen(false);
      resetCreateForm();
      fetchUsers(page, search);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setCreateLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!resetId) return;
    if (resetPw.length < 6) {
      toast.error('Mật khẩu tối thiểu 6 ký tự');
      return;
    }
    setResetLoading(true);
    try {
      await adminService.updateUser(resetId, { password: resetPw });
      toast.success('Đã đặt lại mật khẩu');
      cancelReset();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="text-xl font-bold text-gray-900">Người dùng</h2>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => setCreateOpen(true)}
            className="px-3 py-2 text-xs sm:text-sm font-bold text-white rounded-xl shadow-sm hover:shadow active:scale-[0.98] flex items-center gap-1.5"
            style={{ background: 'linear-gradient(135deg,#e11d48,#f43f5e)' }}
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"/>
            </svg>
            Tạo tài khoản
          </button>
          <form onSubmit={handleSearch} className="flex gap-2">
            <Input placeholder="Tìm tên hoặc email…" value={search} onChange={(e) => setSearch(e.target.value)} />
            <Button type="submit" variant="secondary">Tìm kiếm</Button>
          </form>
        </div>
      </div>

      {/* Create user modal */}
      {createOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 max-h-[90dvh] overflow-y-auto">
            <div className="flex items-center gap-3 mb-5">
              <div className="h-10 w-10 bg-rose-100 rounded-full flex items-center justify-center text-xl">👥</div>
              <div>
                <h3 className="font-extrabold text-gray-900 text-lg">Tạo tài khoản mới</h3>
                <p className="text-xs text-gray-500">Cấp quyền cho nhân viên hoặc admin</p>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">Vai trò *</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['staff', 'admin', 'customer'] as const).map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setNewUser((p) => ({ ...p, role: r }))}
                      className={`py-2 px-2 text-xs font-bold rounded-xl border-2 transition-all ${
                        newUser.role === r
                          ? 'border-rose-500 bg-rose-50 text-rose-700'
                          : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300'
                      }`}
                    >
                      {r === 'staff' ? '👔 Nhân viên' : r === 'admin' ? '🛡️ Admin' : '🛒 Khách'}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">Họ và tên *</label>
                <input
                  className="w-full px-3 py-2.5 bg-gray-50 border-2 border-gray-200 rounded-xl text-sm focus:bg-white focus:border-rose-400 focus:outline-none"
                  placeholder="Nguyễn Văn A"
                  value={newUser.name}
                  onChange={(e) => setNewUser((p) => ({ ...p, name: e.target.value }))}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">Số điện thoại *</label>
                <input
                  type="tel"
                  className="w-full px-3 py-2.5 bg-gray-50 border-2 border-gray-200 rounded-xl text-sm focus:bg-white focus:border-rose-400 focus:outline-none"
                  placeholder="0912345678"
                  value={newUser.phone}
                  onChange={(e) => setNewUser((p) => ({ ...p, phone: e.target.value }))}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">Email (tùy chọn)</label>
                <input
                  type="email"
                  className="w-full px-3 py-2.5 bg-gray-50 border-2 border-gray-200 rounded-xl text-sm focus:bg-white focus:border-rose-400 focus:outline-none"
                  placeholder="staff@dermapure.com"
                  value={newUser.email}
                  onChange={(e) => setNewUser((p) => ({ ...p, email: e.target.value }))}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">Mật khẩu * (≥8 ký tự)</label>
                <div className="relative">
                  <input
                    type={showCreatePw ? 'text' : 'password'}
                    className="w-full px-3 py-2.5 pr-10 bg-gray-50 border-2 border-gray-200 rounded-xl text-sm focus:bg-white focus:border-rose-400 focus:outline-none"
                    placeholder="••••••••"
                    value={newUser.password}
                    onChange={(e) => setNewUser((p) => ({ ...p, password: e.target.value }))}
                  />
                  <button
                    type="button"
                    onClick={() => setShowCreatePw((p) => !p)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showCreatePw ? '🙈' : '👁'}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                type="button"
                onClick={() => { setCreateOpen(false); resetCreateForm(); }}
                disabled={createLoading}
                className="flex-1 py-2.5 font-bold rounded-xl border-2 border-gray-200 text-gray-700 hover:bg-gray-50 text-sm disabled:opacity-60"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleCreateUser}
                disabled={createLoading}
                className="flex-1 py-2.5 font-extrabold text-white rounded-xl shadow-lg text-sm disabled:opacity-60 disabled:cursor-not-allowed"
                style={{ background: 'linear-gradient(135deg,#e11d48,#f43f5e)' }}
              >
                {createLoading ? 'Đang tạo…' : '✓ Tạo tài khoản'}
              </button>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-20"><Spinner size="lg" /></div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden md:block card overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 border-b">
                  <th className="pb-3 pr-4">Tên</th>
                  <th className="pb-3 pr-4">Email</th>
                  <th className="pb-3 pr-4">Mật khẩu</th>
                  <th className="pb-3 pr-4">Vai trò</th>
                  <th className="pb-3 pr-4">Trạng thái</th>
                  <th className="pb-3 pr-4">Ngày tham gia</th>
                  <th className="pb-3">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {users.map((u) => (
                  <tr key={u._id} className="hover:bg-gray-50 align-top">
                    <td className="py-3 pr-4 font-medium text-gray-900">{u.name}</td>
                    <td className="py-3 pr-4 text-gray-600">{u.email}</td>

                    {/* Password column */}
                    <td className="py-3 pr-4">
                      {resetId === u._id ? (
                        <div className="flex items-center gap-1.5">
                          <div className="relative">
                            <input
                              type={showResetPw ? 'text' : 'password'}
                              value={resetPw}
                              onChange={(e) => setResetPw(e.target.value)}
                              placeholder="Mật khẩu mới"
                              className="w-36 px-2.5 py-1.5 pr-8 text-xs border border-primary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-400/30 bg-white"
                              autoFocus
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') handleResetPassword();
                                if (e.key === 'Escape') cancelReset();
                              }}
                            />
                            <button
                              type="button"
                              onClick={() => setShowResetPw((p) => !p)}
                              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                              {showResetPw ? (
                                <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                    d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"/>
                                </svg>
                              ) : (
                                <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                                </svg>
                              )}
                            </button>
                          </div>
                          <button
                            onClick={handleResetPassword}
                            disabled={resetLoading}
                            className="px-2 py-1.5 bg-primary-600 hover:bg-primary-700 text-white text-xs font-semibold rounded-lg disabled:opacity-60 transition-colors"
                          >
                            {resetLoading ? '…' : 'Lưu'}
                          </button>
                          <button
                            onClick={cancelReset}
                            className="px-2 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-600 text-xs font-semibold rounded-lg transition-colors"
                          >
                            Hủy
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => openReset(u._id)}
                          className="group flex items-center gap-1.5 text-gray-400 hover:text-primary-600 transition-colors"
                          title="Đặt lại mật khẩu"
                        >
                          <span className="font-mono text-xs tracking-widest">••••••••</span>
                          <svg className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                              d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/>
                          </svg>
                        </button>
                      )}
                    </td>

                    <td className="py-3 pr-4">
                      <div className="flex flex-col gap-1">
                        <span className={u.role === 'admin' ? 'badge badge-blue' : u.role === 'staff' ? 'badge badge-green' : 'badge badge-gray'}>{u.role}</span>
                        {u.affiliateCode && (u.role === 'staff' || u.role === 'admin') && (
                          <span className="font-mono text-[10px] font-bold text-rose-600" title="Mã giới thiệu">🎯 {u.affiliateCode}</span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 pr-4">
                      <span className={u.isActive ? 'badge-green' : 'badge-red'}>{u.isActive ? 'Hoạt động' : 'Tắt'}</span>
                    </td>
                    <td className="py-3 pr-4 text-gray-500 text-xs">{formatDate(u.createdAt)}</td>
                    <td className="py-3">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => toggleActive(u)}
                          className={`text-xs font-medium hover:underline ${u.isActive ? 'text-amber-600' : 'text-green-600'}`}
                        >
                          {u.isActive ? 'Vô hiệu hóa' : 'Kích hoạt'}
                        </button>
                        <button
                          onClick={() => handleDelete(u)}
                          className="text-xs font-medium text-red-500 hover:underline"
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

          {/* Mobile cards */}
          <div className="md:hidden space-y-3">
            {users.map((u) => (
              <div key={u._id} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4">
                {/* Header */}
                <div className="flex items-start gap-3 mb-3">
                  <div className="h-11 w-11 rounded-xl flex items-center justify-center font-black text-sm shrink-0 shadow-sm"
                    style={{ background: u.role === 'admin' ? 'linear-gradient(135deg,#e11d48,#f43f5e)' : '#f3f4f6', color: u.role === 'admin' ? '#fff' : '#6b7280' }}>
                    {u.name?.[0]?.toUpperCase() || '?'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-gray-900 truncate">{u.name}</p>
                    <p className="text-xs text-gray-500 truncate">{u.email || u.phone || '—'}</p>
                    <div className="flex gap-1.5 mt-1.5 flex-wrap">
                      <span className={u.role === 'admin' ? 'badge badge-blue' : u.role === 'staff' ? 'badge badge-green' : 'badge badge-gray'}>{u.role}</span>
                      <span className={u.isActive ? 'badge-green' : 'badge-red'}>{u.isActive ? 'Hoạt động' : 'Tắt'}</span>
                      <span className="text-[10px] text-gray-400 self-center">· {formatDate(u.createdAt)}</span>
                    </div>
                  </div>
                </div>

                {/* Reset password — inline form when active */}
                {resetId === u._id ? (
                  <div className="bg-rose-50 border border-rose-200 rounded-xl p-2.5 mb-3 space-y-2">
                    <p className="text-[11px] font-bold text-rose-700">Đặt lại mật khẩu</p>
                    <div className="flex gap-1.5">
                      <input
                        type={showResetPw ? 'text' : 'password'}
                        value={resetPw}
                        onChange={(e) => setResetPw(e.target.value)}
                        placeholder="Mật khẩu mới (≥8 ký tự)"
                        className="flex-1 px-2.5 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-400/30 bg-white"
                        autoFocus
                      />
                      <button type="button" onClick={() => setShowResetPw((p) => !p)}
                        className="px-2 py-1.5 border border-gray-200 rounded-lg text-xs text-gray-500 hover:bg-gray-50">
                        {showResetPw ? '🙈' : '👁'}
                      </button>
                    </div>
                    <div className="flex gap-1.5">
                      <button onClick={handleResetPassword} disabled={resetLoading}
                        className="flex-1 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-lg disabled:opacity-60">
                        {resetLoading ? '...' : 'Lưu mật khẩu'}
                      </button>
                      <button onClick={cancelReset}
                        className="px-3 py-2 border border-gray-200 text-xs text-gray-600 rounded-lg hover:bg-gray-50">
                        Hủy
                      </button>
                    </div>
                  </div>
                ) : (
                  <button onClick={() => openReset(u._id)}
                    className="w-full mb-3 py-2 bg-gray-50 border border-gray-200 text-gray-600 hover:bg-rose-50 hover:border-rose-200 hover:text-rose-600 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-colors">
                    🔑 Đặt lại mật khẩu
                  </button>
                )}

                {/* Actions */}
                <div className="flex gap-2 pt-2 border-t border-gray-100">
                  <button onClick={() => toggleActive(u)}
                    className={`flex-1 py-2 text-xs font-bold rounded-lg ${u.isActive ? 'bg-amber-50 text-amber-700 hover:bg-amber-100' : 'bg-green-50 text-green-700 hover:bg-green-100'}`}>
                    {u.isActive ? 'Vô hiệu hóa' : 'Kích hoạt'}
                  </button>
                  <button onClick={() => handleDelete(u)}
                    className="flex-1 py-2 bg-red-50 text-red-600 hover:bg-red-100 text-xs font-bold rounded-lg">
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
