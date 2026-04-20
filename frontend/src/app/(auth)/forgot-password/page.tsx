'use client';

import { useState } from 'react';
import Link from 'next/link';
import { authService } from '@/services/auth.service';
import { getErrorMessage } from '@/lib/utils';
import toast from 'react-hot-toast';

const inputCls = `w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900
                  placeholder:text-gray-400
                  focus:bg-white focus:border-primary-400 focus:ring-2 focus:ring-primary-500/20
                  focus:outline-none transition-all duration-200`;

export default function ForgotPasswordPage() {
  const [email, setEmail]     = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent]       = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
      toast.error('Email không hợp lệ');
      return;
    }
    setLoading(true);
    try {
      await authService.forgotPassword(email.trim().toLowerCase());
      setSent(true);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-extrabold text-gray-900">Quên mật khẩu?</h1>
        <p className="text-gray-500 mt-1.5 text-sm">
          Nhập email đăng ký — chúng tôi sẽ gửi link đặt lại mật khẩu.
        </p>
      </div>

      {sent ? (
        <div className="bg-emerald-50 border-2 border-emerald-200 rounded-2xl p-6 text-center">
          <div className="text-4xl mb-3">📧</div>
          <h2 className="font-extrabold text-gray-900 mb-2">Đã gửi email!</h2>
          <p className="text-sm text-gray-600 leading-relaxed">
            Nếu email <strong>{email}</strong> tồn tại trong hệ thống, bạn sẽ nhận được link đặt lại mật khẩu trong vòng vài phút.
          </p>
          <p className="text-xs text-gray-500 mt-3">Kiểm tra cả hộp thư <strong>Spam / Quảng cáo</strong> nếu chưa thấy. Link hết hạn sau 30 phút.</p>
          <div className="mt-5 flex gap-2">
            <button
              onClick={() => { setSent(false); setEmail(''); }}
              className="flex-1 py-2.5 border-2 border-gray-200 text-gray-700 rounded-xl text-sm font-bold hover:bg-gray-50"
            >
              Gửi lại
            </button>
            <Link href="/login"
              className="flex-1 py-2.5 bg-primary-600 text-white rounded-xl text-sm font-bold hover:bg-primary-700 text-center">
              Đăng nhập
            </Link>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">Email <span className="text-red-500">*</span></label>
            <input
              type="email"
              autoFocus
              autoComplete="email"
              className={inputCls}
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
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
                Đang gửi…
              </>
            ) : 'Gửi link đặt lại'}
          </button>

          <p className="text-center text-xs text-gray-500 pt-2">
            Nhớ mật khẩu rồi?{' '}
            <Link href="/login" className="text-primary-600 font-semibold hover:underline">Đăng nhập</Link>
          </p>
        </form>
      )}
    </div>
  );
}
