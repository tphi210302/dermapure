'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

export default function AboutCtaButtons() {
  const { isAuthenticated } = useAuth();
  return (
    <div className="flex gap-3 justify-center flex-wrap">
      <Link href="/products" className="bg-white text-primary-700 font-bold text-sm px-6 py-2.5 rounded-xl hover:bg-blue-50 transition-colors shadow-md">
        Mua sắm ngay
      </Link>
      {!isAuthenticated && (
        <Link href="/register" className="border-2 border-white/30 text-white font-semibold text-sm px-6 py-2.5 rounded-xl hover:bg-white/10 transition-colors">
          Tạo tài khoản
        </Link>
      )}
    </div>
  );
}
