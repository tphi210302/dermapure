'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { getErrorMessage } from '@/lib/utils';
import toast from 'react-hot-toast';

const inputCls = `w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900
                  placeholder:text-gray-400
                  focus:bg-white focus:border-primary-400 focus:ring-2 focus:ring-primary-500/20
                  focus:outline-none transition-all duration-200`;

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();
  const [form, setForm]       = useState({ name: '', email: '', password: '', phone: '' });
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw]   = useState(false);
  const [errors, setErrors]   = useState<Record<string, string>>({});

  const set = (k: string, v: string) => {
    setForm((p) => ({ ...p, [k]: v }));
    if (errors[k]) setErrors((p) => ({ ...p, [k]: '' }));
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name)  e.name  = 'Tên là bắt buộc';
    if (!form.phone) e.phone = 'Số điện thoại là bắt buộc';
    else if (!/^(0|\+84)(3|5|7|8|9)[0-9]{8}$/.test(form.phone)) e.phone = 'SĐT không hợp lệ (vd: 0912345678)';
    if (form.email && !/^\S+@\S+\.\S+$/.test(form.email)) e.email = 'Email không hợp lệ';
    if (!form.password) e.password = 'Mật khẩu là bắt buộc';
    else if (form.password.length < 8) e.password = 'Mật khẩu tối thiểu 8 ký tự';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await register({
        name: form.name,
        phone: form.phone,
        password: form.password,
        ...(form.email.trim() && { email: form.email.trim() }),
      });
      toast.success('Tạo tài khoản thành công! Chào mừng 🎉');
      router.push('/');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      {/* Title */}
      <div className="text-center mb-6">
        <h1 className="text-2xl font-extrabold text-gray-900">Tạo tài khoản</h1>
        <p className="text-gray-500 mt-1.5 text-sm">Bắt đầu mua sắm ngay — hoàn toàn miễn phí</p>
      </div>

      {/* Benefits row */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          { icon: '🚚', label: 'Giao hàng miễn phí' },
          { icon: '✅', label: 'Hàng chính hãng' },
          { icon: '🔒', label: 'Bảo mật' },
        ].map((b) => (
          <div key={b.label} className="bg-primary-50 rounded-xl py-2.5 px-3 text-center">
            <p className="text-lg">{b.icon}</p>
            <p className="text-[11px] font-semibold text-primary-700 mt-0.5">{b.label}</p>
          </div>
        ))}
      </div>

      {/* Card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-card-lg p-7">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">
              Họ và tên <span className="text-red-500">*</span>
            </label>
            <input
              className={inputCls}
              placeholder="Nguyen Van A"
              value={form.name}
              onChange={(e) => set('name', e.target.value)}
            />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
          </div>

          {/* Phone (required) */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">
              Số điện thoại <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              autoComplete="tel"
              className={inputCls}
              placeholder="0912345678"
              value={form.phone}
              onChange={(e) => set('phone', e.target.value)}
            />
            {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
          </div>

          {/* Email (optional) */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">
              Email <span className="text-gray-400 font-normal">(tuỳ chọn)</span>
            </label>
            <input
              type="email"
              autoComplete="email"
              className={inputCls}
              placeholder="you@example.com"
              value={form.email}
              onChange={(e) => set('email', e.target.value)}
            />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">
              Mật khẩu <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showPw ? 'text' : 'password'}
                autoComplete="new-password"
                className={`${inputCls} pr-11`}
                placeholder="Tối thiểu 6 ký tự"
                value={form.password}
                onChange={(e) => set('password', e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowPw((p) => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                {showPw ? (
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"/>
                  </svg>
                ) : (
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                  </svg>
                )}
              </button>
            </div>
            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}

            {/* Password strength hint */}
            {form.password.length > 0 && (
              <div className="flex gap-1 mt-2">
                {[1, 2, 3].map((n) => (
                  <div
                    key={n}
                    className={`h-1 flex-1 rounded-full transition-colors ${
                      form.password.length >= n * 3
                        ? form.password.length >= 9 ? 'bg-emerald-400' : form.password.length >= 6 ? 'bg-amber-400' : 'bg-red-400'
                        : 'bg-gray-100'
                    }`}
                  />
                ))}
              </div>
            )}
          </div>


          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-primary-600 text-white font-bold text-sm rounded-xl mt-2
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
                Đang tạo tài khoản…
              </>
            ) : 'Tạo tài khoản'}
          </button>
        </form>

        <div className="relative my-5">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-100" /></div>
          <div className="relative flex justify-center">
            <span className="bg-white px-3 text-xs text-gray-400">hoặc</span>
          </div>
        </div>

        <p className="text-center text-sm text-gray-500">
          Đã có tài khoản?{' '}
          <Link href="/login" className="text-primary-600 font-semibold hover:text-primary-700 hover:underline transition-colors">
            Đăng nhập
          </Link>
        </p>
      </div>

      <p className="text-center text-xs text-gray-400 mt-4">
        Khi tạo tài khoản, bạn đồng ý với{' '}
        <span className="text-gray-500 underline cursor-pointer">Điều khoản dịch vụ</span> và{' '}
        <span className="text-gray-500 underline cursor-pointer">Chính sách bảo mật</span> của chúng tôi.
      </p>
    </div>
  );
}
