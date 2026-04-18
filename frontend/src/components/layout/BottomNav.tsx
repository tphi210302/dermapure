'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';

export default function BottomNav() {
  const pathname  = usePathname();
  const { cartCount }     = useCart();
  const { isAuthenticated } = useAuth();

  const isActive = (path: string) =>
    path === '/' ? pathname === '/' : pathname.startsWith(path);

  return (
    <>
      {/* ══════════════════════════════════════
          MOBILE BOTTOM NAVIGATION (< md)
      ══════════════════════════════════════ */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-50 bg-white border-t border-gray-100"
        style={{ boxShadow: '0 -4px 24px rgba(0,0,0,0.07)' }}>
        <div className="flex items-end h-16 px-1">

          {/* Home */}
          <Link href="/"
            className={cn('flex-1 flex flex-col items-center justify-center gap-0.5 py-2 rounded-xl transition-colors',
              isActive('/') ? 'text-primary-600' : 'text-gray-400 hover:text-gray-600')}>
            <svg className="h-[22px] w-[22px]" fill={isActive('/') ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={isActive('/') ? 0 : 1.8} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
            </svg>
            <span className={cn('text-[10px] font-semibold', isActive('/') ? 'text-primary-600' : 'text-gray-400')}>
              Trang chủ
            </span>
          </Link>

          {/* Products */}
          <Link href="/products"
            className={cn('flex-1 flex flex-col items-center justify-center gap-0.5 py-2 rounded-xl transition-colors',
              isActive('/products') ? 'text-primary-600' : 'text-gray-400 hover:text-gray-600')}>
            <svg className="h-[22px] w-[22px]" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/>
            </svg>
            <span className={cn('text-[10px] font-semibold', isActive('/products') ? 'text-primary-600' : 'text-gray-400')}>
              Sản phẩm
            </span>
          </Link>

          {/* Cart — raised center button */}
          <Link href="/cart"
            className="flex-1 flex flex-col items-center justify-end pb-1 -mt-3">
            <div className={cn(
              'relative flex h-[52px] w-[52px] items-center justify-center rounded-2xl shadow-lg transition-all duration-200',
              isActive('/cart')
                ? 'bg-primary-700 shadow-primary-600/50'
                : 'bg-primary-600 shadow-primary-500/40'
            )}>
              <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/>
              </svg>
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white text-[10px] font-extrabold ring-2 ring-white">
                  {cartCount > 9 ? '9+' : cartCount}
                </span>
              )}
            </div>
            <span className="text-[10px] font-bold text-primary-600 mt-1">Giỏ hàng</span>
          </Link>

          {/* Orders */}
          <Link href="/orders"
            className={cn('flex-1 flex flex-col items-center justify-center gap-0.5 py-2 rounded-xl transition-colors',
              isActive('/orders') ? 'text-primary-600' : 'text-gray-400 hover:text-gray-600')}>
            <svg className="h-[22px] w-[22px]" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
            </svg>
            <span className={cn('text-[10px] font-semibold', isActive('/orders') ? 'text-primary-600' : 'text-gray-400')}>
              Đơn hàng
            </span>
          </Link>

          {/* Account */}
          <Link href={isAuthenticated ? '/profile' : '/login'}
            className={cn('flex-1 flex flex-col items-center justify-center gap-0.5 py-2 rounded-xl transition-colors',
              (isActive('/profile') || isActive('/login') || isActive('/register')) ? 'text-primary-600' : 'text-gray-400 hover:text-gray-600')}>
            <svg className="h-[22px] w-[22px]" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
            </svg>
            <span className={cn('text-[10px] font-semibold',
              (isActive('/profile') || isActive('/login') || isActive('/register')) ? 'text-primary-600' : 'text-gray-400')}>
              {isAuthenticated ? 'Tài khoản' : 'Đăng nhập'}
            </span>
          </Link>

        </div>
        {/* iOS safe area */}
        <div className="bg-white" style={{ height: 'env(safe-area-inset-bottom, 0px)' }} />
      </nav>

      {/* ══════════════════════════════════════
          DESKTOP FLOATING CART (≥ md)
          FloatContact (right-4) handles contacts.
          Cart pill sits at right-6, bottom-8 —
          FloatContact is repositioned to bottom-28
          so they never overlap.
      ══════════════════════════════════════ */}
      <div className="hidden md:block fixed bottom-8 right-6 z-50">
        <Link href="/cart"
          className="flex items-center gap-2.5 bg-primary-600 hover:bg-primary-700 text-white pl-4 pr-5 py-3 rounded-2xl shadow-xl transition-all duration-200 hover:-translate-y-0.5"
          style={{ boxShadow: '0 8px 24px rgba(37,99,235,0.32)' }}
          aria-label="Giỏ hàng">
          <div className="relative">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/>
            </svg>
            {cartCount > 0 && (
              <span className="absolute -top-2.5 -right-2.5 h-[18px] w-[18px] flex items-center justify-center rounded-full bg-red-500 text-white text-[10px] font-extrabold ring-2 ring-primary-600">
                {cartCount > 9 ? '9+' : cartCount}
              </span>
            )}
          </div>
          <span className="text-sm font-bold">
            {cartCount > 0 ? `Giỏ hàng (${cartCount})` : 'Giỏ hàng'}
          </span>
        </Link>
      </div>
    </>
  );
}
