'use client';

import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import CartItem from '@/components/cart/CartItem';
import { formatPrice } from '@/lib/utils';

const SHIPPING_FEE      = 30000;
const FREE_SHIPPING_MIN = 500000;

export default function CartPage() {
  const { cart, cartTotal, cartCount, isLoading, clearCart } = useCart();
  const { isAuthenticated } = useAuth();
  const shippingFee = cartTotal >= FREE_SHIPPING_MIN ? 0 : SHIPPING_FEE;
  const grandTotal  = cartTotal + shippingFee;
  const amountToFreeShipping = Math.max(0, FREE_SHIPPING_MIN - cartTotal);

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto px-4 py-24 text-center">
        <div className="h-24 w-24 bg-primary-50 rounded-full flex items-center justify-center text-4xl mx-auto mb-6">
          🛒
        </div>
        <h2 className="text-2xl font-extrabold text-gray-900 mb-3">Đăng nhập để xem giỏ hàng</h2>
        <p className="text-gray-500 mb-8">Giỏ hàng của bạn đang chờ — đăng nhập để xem.</p>
        <div className="flex gap-3 justify-center">
          <Link href="/login" className="btn btn-primary btn-lg">Đăng nhập</Link>
          <Link href="/products" className="btn btn-secondary btn-lg">Xem sản phẩm</Link>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="skeleton h-8 w-48 rounded mb-8" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex gap-4 py-5 border-b border-gray-50">
                <div className="skeleton h-20 w-20 rounded-xl shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="skeleton h-4 w-2/3 rounded" />
                  <div className="skeleton h-4 w-1/3 rounded" />
                  <div className="skeleton h-4 w-24 rounded" />
                </div>
              </div>
            ))}
          </div>
          <div className="skeleton h-48 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="max-w-md mx-auto px-4 py-24 text-center">
        <div className="h-24 w-24 bg-gray-100 rounded-full flex items-center justify-center text-4xl mx-auto mb-6">
          🛒
        </div>
        <h2 className="text-2xl font-extrabold text-gray-900 mb-3">Giỏ hàng trống</h2>
        <p className="text-gray-500 mb-8">Có vẻ bạn chưa thêm sản phẩm nào.</p>
        <Link href="/products" className="btn btn-primary btn-lg">Bắt đầu mua sắm</Link>
      </div>
    );
  }

  const savings = cart.items.reduce((sum, item) => {
    const compare = item.product.comparePrice ?? 0;
    return compare > item.product.price ? sum + (compare - item.product.price) * item.quantity : sum;
  }, 0);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">Giỏ hàng</h1>
          <p className="text-sm text-gray-500 mt-0.5">{cartCount} sản phẩm</p>
        </div>
        <button
          onClick={clearCart}
          className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-red-500 transition-colors font-medium"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
          </svg>
          Xóa giỏ hàng
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Items */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-card px-5">
            {cart.items.map((item) => (
              <CartItem key={item.product._id} item={item} />
            ))}
          </div>
          <Link href="/products"
            className="inline-flex items-center gap-2 mt-5 text-sm text-primary-600 hover:text-primary-700 font-medium transition-colors">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
            </svg>
            Tiếp tục mua sắm
          </Link>
        </div>

        {/* Summary */}
        <div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-5 sticky top-24">
            <h2 className="font-extrabold text-gray-900 text-lg mb-5">Tóm tắt đơn hàng</h2>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Tạm tính ({cartCount} sản phẩm)</span>
                <span className="font-medium text-gray-900">{formatPrice(cartTotal)}</span>
              </div>
              {savings > 0 && (
                <div className="flex justify-between text-emerald-600">
                  <span>Tiết kiệm</span>
                  <span className="font-semibold">-{formatPrice(savings)}</span>
                </div>
              )}
              <div className="flex justify-between text-gray-600">
                <span>Vận chuyển</span>
                {shippingFee === 0 ? (
                  <span className="font-semibold text-emerald-600">Miễn phí</span>
                ) : (
                  <span className="font-semibold text-gray-900">{formatPrice(shippingFee)}</span>
                )}
              </div>
              {amountToFreeShipping > 0 && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 text-[11px] text-amber-800">
                  💡 Mua thêm <strong>{formatPrice(amountToFreeShipping)}</strong> để được miễn phí vận chuyển
                </div>
              )}
            </div>

            <div className="border-t border-gray-100 mt-4 pt-4 flex justify-between items-center">
              <span className="font-bold text-gray-900">Tổng cộng</span>
              <div className="text-right">
                <p className="text-xl font-extrabold text-primary-600">{formatPrice(grandTotal)}</p>
                <p className="text-xs text-gray-400">Đã bao gồm VAT</p>
              </div>
            </div>

            {savings > 0 && (
              <div className="mt-3 py-2 px-3 bg-emerald-50 rounded-xl text-center">
                <p className="text-xs font-semibold text-emerald-700">
                  🎉 Bạn tiết kiệm được {formatPrice(savings)} cho đơn hàng này!
                </p>
              </div>
            )}

            <Link href="/checkout" className="block mt-5">
              <button className="w-full py-3 bg-primary-600 text-white font-bold text-sm rounded-xl
                                 hover:bg-primary-700 active:bg-primary-800 transition-colors shadow-sm
                                 hover:shadow-md flex items-center justify-center gap-2">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                Tiến hành thanh toán
              </button>
            </Link>

            <div className="mt-4 flex items-center justify-center gap-4 text-xs text-gray-400">
              <span>🔒 An toàn</span>
              <span>🚚 Free ship đơn ≥500K</span>
              <span>🔄 Đổi trả dễ dàng</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
