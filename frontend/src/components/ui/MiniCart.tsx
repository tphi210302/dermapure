'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '@/context/CartContext';
import { formatPrice } from '@/lib/utils';
import { CartItem, Product } from '@/types';

export default function MiniCart() {
  const {
    cart,
    cartCount,
    cartTotal,
    showMiniCart,
    closeMiniCart,
    updateQuantity,
    removeFromCart,
  } = useCart();

  const items = cart?.items ?? [];

  return (
    <>
      {/* ── Backdrop ───────────────────────────────────── */}
      <div
        onClick={closeMiniCart}
        className={[
          'fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm transition-opacity duration-300',
          showMiniCart ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none',
        ].join(' ')}
      />

      {/* ── Slide-in panel ─────────────────────────────── */}
      <div
        className={[
          'fixed right-0 top-0 bottom-0 z-[61] w-full max-w-[360px] bg-white shadow-2xl',
          'flex flex-col transition-transform duration-300 ease-in-out',
          showMiniCart ? 'translate-x-0' : 'translate-x-full',
        ].join(' ')}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 shrink-0">
          <div className="flex items-center gap-2.5">
            <svg className="h-5 w-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/>
            </svg>
            <h2 className="font-bold text-gray-900 text-base">Giỏ hàng</h2>
            {cartCount > 0 && (
              <span className="bg-primary-600 text-white text-[11px] font-bold px-2 py-0.5 rounded-full">
                {cartCount}
              </span>
            )}
          </div>
          <button
            onClick={closeMiniCart}
            className="p-2 rounded-xl hover:bg-gray-100 transition-colors text-gray-500 hover:text-gray-700"
            aria-label="Đóng"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full py-16 text-center">
              <div className="h-16 w-16 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
                <svg className="h-8 w-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/>
                </svg>
              </div>
              <p className="text-gray-500 font-medium text-sm">Giỏ hàng trống</p>
              <p className="text-gray-400 text-xs mt-1">Thêm sản phẩm để bắt đầu mua sắm</p>
              <Link
                href="/products"
                onClick={closeMiniCart}
                className="mt-5 inline-flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors"
              >
                Xem sản phẩm
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item: CartItem) => {
                const p = typeof item.product === 'object' ? (item.product as Product) : null;
                if (!p) return null;
                const thumbnail = p.images?.[0] || 'https://placehold.co/64x64/f0f9ff/0369a1?text=💊';

                return (
                  <div key={p._id} className="flex gap-3 py-3 border-b border-gray-50 last:border-0">
                    {/* Image */}
                    <div className="h-16 w-16 rounded-xl bg-gray-50 overflow-hidden shrink-0">
                      <Image
                        src={thumbnail}
                        alt={p.name}
                        width={64}
                        height={64}
                        className="h-full w-full object-cover"
                      />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 line-clamp-2 leading-snug">{p.name}</p>
                      <p className="text-sm font-bold text-primary-600 mt-1">{formatPrice(p.price)}</p>

                      {/* Qty controls */}
                      <div className="flex items-center gap-1.5 mt-2">
                        <button
                          onClick={() =>
                            item.quantity > 1
                              ? updateQuantity(p._id, item.quantity - 1)
                              : removeFromCart(p._id)
                          }
                          className="h-6 w-6 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 font-bold text-sm transition-colors"
                        >
                          −
                        </button>
                        <span className="w-6 text-center text-sm font-semibold text-gray-800">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(p._id, item.quantity + 1)}
                          className="h-6 w-6 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 font-bold text-sm transition-colors"
                        >
                          +
                        </button>
                        <span className="text-xs text-gray-400 ml-1">/{p.unit}</span>
                      </div>
                    </div>

                    {/* Remove */}
                    <button
                      onClick={() => removeFromCart(p._id)}
                      className="h-7 w-7 rounded-lg hover:bg-red-50 flex items-center justify-center text-gray-300 hover:text-red-400 transition-colors shrink-0 self-start"
                      aria-label="Xóa"
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
                      </svg>
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer — only when there are items */}
        {items.length > 0 && (
          <div className="border-t border-gray-100 px-5 py-4 space-y-3 shrink-0 bg-gray-50/50">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">Tổng cộng ({cartCount} sản phẩm)</span>
              <span className="text-lg font-extrabold text-gray-900">{formatPrice(cartTotal)}</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Link
                href="/cart"
                onClick={closeMiniCart}
                className="flex items-center justify-center gap-1.5 border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 font-semibold text-sm py-2.5 rounded-xl transition-colors"
              >
                Xem giỏ hàng
              </Link>
              <Link
                href="/checkout"
                onClick={closeMiniCart}
                className="flex items-center justify-center gap-1.5 bg-primary-600 hover:bg-primary-700 text-white font-semibold text-sm py-2.5 rounded-xl transition-colors shadow-sm"
              >
                Thanh toán
                <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6"/>
                </svg>
              </Link>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
