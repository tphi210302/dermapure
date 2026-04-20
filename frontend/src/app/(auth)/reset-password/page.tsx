'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { authService } from '@/services/auth.service';
import { getErrorMessage } from '@/lib/utils';
import toast from 'react-hot-toast';

const inputCls = `w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900
                  placeholder:text-gray-400
                  focus:bg-white focus:border-primary-400 focus:ring-2 focus:ring-primary-500/20
                  focus:outline-none transition-all duration-200`;

function ResetPasswordContent() {
  const router = useRouter();
  const params = useSearchParams();
  const token  = params.get('token') || '';

  const [password, setPassword]   = useState('');
  const [confirm,  setConfirm]    = useState('');
  const [showPw,   setShowPw]     = useState(false);
  const [loading,  setLoading]    = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) { toast.error('Thiếu token — hãy truy cập từ link trong email'); return; }
    if (password.length < 8) { toast.error('Mật khẩu phải có ít nhất 8 ký tự'); return; }
    if (password !== confirm) { toast.error('Xác nhận mật khẩu không khớp'); return; }

    setLoading(true);
    try {
      await authService.resetPassword(token, password);
      toast.success('Đặt lại mật khẩu thành công! Đang chuyển sang trang đăng nhập…');
      setTimeout(() => router.replace('/login'), 1200);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="w-full max-w-md">
        <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-6 text-center">
          <div className="text-4xl mb-3">⚠️</div>
          <h2 className="font-extrabold text-gray-900 mb-2">Link không hợp lệ</h2>
          <p className="text-sm text-gray-600">Token đặt lại mật khẩu bị thiếu. Hãy yêu cầu link mới từ trang <Link href="/forgot-password" className="text-primary-600 underline">Quên mật khẩu</Link>.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-extrabold text-gray-900">Đặt mật khẩu mới</h1>
        <p className="text-gray-500 mt-1.5 text-sm">Nhập mật khẩu mới cho tài khoản của bạn.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1.5">
            Mật khẩu mới <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              type={showPw ? 'text' : 'password'}
              autoComplete="new-password"
              autoFocus
              className={inputCls}
              placeholder="Ít nhất 8 ký tự"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              type="button"
              onClick={() => setShowPw((p) => !p)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showPw ? '🙈' : '👁'}
            </button>
          </div>

          {/* Strength hint */}
          {password.length > 0 && (
            <div className="flex gap-1 mt-2">
              {[1, 2, 3].map((n) => (
                <div
                  key={n}
                  className={`h-1 flex-1 rounded-full transition-colors ${
                    password.length >= n * 3
                      ? password.length >= 9 ? 'bg-emerald-400' : password.length >= 6 ? 'bg-amber-400' : 'bg-red-400'
                      : 'bg-gray-100'
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1.5">
            Xác nhận mật khẩu <span className="text-red-500">*</span>
          </label>
          <input
            type={showPw ? 'text' : 'password'}
            autoComplete="new-password"
            className={inputCls}
            placeholder="Nhập lại mật khẩu mới"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
          />
          {confirm && password !== confirm && (
            <p className="text-red-500 text-xs mt-1">Mật khẩu không khớp</p>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-primary-600 text-white font-bold text-sm rounded-xl
                     hover:bg-primary-700 active:bg-primary-800 transition-colors shadow-sm
                     hover:shadow-md disabled:opacity-60 disabled:cursor-not-allowed
                     flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>
              Đang lưu…
            </>
          ) : '✓ Đặt lại mật khẩu'}
        </button>

        <p className="text-center text-xs text-gray-500 pt-2">
          <Link href="/login" className="text-primary-600 font-semibold hover:underline">← Quay lại đăng nhập</Link>
        </p>
      </form>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordContent />
    </Suspense>
  );
}
