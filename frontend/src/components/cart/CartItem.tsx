'use client';

import Image from 'next/image';
import Link from 'next/link';
import { CartItem as CartItemType } from '@/types';
import { formatPrice } from '@/lib/utils';
import { useCart } from '@/context/CartContext';
import { cloudinaryThumb } from '@/lib/cloudinary';

interface Props { item: CartItemType; }

export default function CartItem({ item }: Props) {
  const { updateQuantity, removeFromCart } = useCart();
  const product = item.product;
  const variant = item.variantId ? product.variants?.find((v) => v._id === item.variantId) : null;
  const unitPrice = variant?.price ?? product.price;
  const unitStock = variant?.stock ?? product.stock;
  const thumbnail = cloudinaryThumb(variant?.image || product.images?.[0] || 'https://placehold.co/80x80/f0f9ff/0369a1?text=No+Image', 160);

  return (
    <div className="py-4 sm:py-5 border-b border-gray-50 last:border-0 group">
      {/* Top row: image + info (always horizontal). Bottom row on mobile only. */}
      <div className="flex items-start gap-3 sm:gap-4">
        {/* Image */}
        <Link href={`/products/${product._id}`}
          className="relative h-16 w-16 sm:h-20 sm:w-20 rounded-xl overflow-hidden bg-slate-50 shrink-0 border border-gray-100 hover:border-primary-200 transition-colors">
          <Image src={thumbnail} alt={product.name} fill className="object-cover transition-transform duration-300 group-hover:scale-105" sizes="80px" />
        </Link>

        {/* Info — name always visible (line-clamp-2) */}
        <div className="flex-1 min-w-0">
          <Link href={`/products/${product._id}`}
            className="block font-semibold text-gray-900 text-sm leading-snug hover:text-primary-600 transition-colors line-clamp-2">
            {product.name}
          </Link>
          {variant && (
            <p className="inline-flex items-center gap-1 bg-rose-50 text-rose-700 text-[10px] font-bold px-1.5 py-0.5 rounded mt-1">
              {variant.colorHex && (
                <span
                  className="inline-block h-3 w-3 rounded-full border border-white ring-1 ring-rose-200 shrink-0"
                  style={{ backgroundColor: variant.colorHex }}
                />
              )}
              {variant.color ? `${variant.color} · ` : ''}{variant.label}
            </p>
          )}
          {product.brand && <p className="text-[11px] text-gray-400 mt-0.5">{product.brand}</p>}
          <p className="text-primary-600 font-bold mt-1 text-sm">
            {formatPrice(unitPrice)}
            <span className="text-gray-400 font-normal text-xs"> / {product.unit}</span>
          </p>
        </div>

        {/* Desktop-only inline qty + subtotal — hidden on mobile (shown in bottom row) */}
        <div className="hidden sm:flex items-center gap-3 shrink-0">
          <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden">
            <button
              onClick={() => updateQuantity(product._id, Math.max(1, item.quantity - 1), item.variantId)}
              className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-100 font-bold text-sm"
            >−</button>
            <span className="w-8 text-center text-sm font-bold text-gray-900">{item.quantity}</span>
            <button
              onClick={() => updateQuantity(product._id, item.quantity + 1, item.variantId)}
              disabled={item.quantity >= unitStock}
              className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-100 font-bold text-sm disabled:opacity-30 disabled:cursor-not-allowed"
            >+</button>
          </div>
          <div className="text-right min-w-[80px]">
            <p className="font-extrabold text-gray-900 text-sm">{formatPrice(unitPrice * item.quantity)}</p>
            <button
              onClick={() => removeFromCart(product._id, item.variantId)}
              className="text-[11px] text-gray-400 hover:text-red-500 mt-1 transition-colors flex items-center gap-0.5 ml-auto"
            >
              <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
              </svg>
              Xóa
            </button>
          </div>
        </div>
      </div>

      {/* Mobile-only bottom row: qty + subtotal + remove */}
      <div className="sm:hidden flex items-center justify-between gap-3 mt-3 pl-[76px]">
        <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden">
          <button
            onClick={() => updateQuantity(product._id, Math.max(1, item.quantity - 1), item.variantId)}
            className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-100 font-bold text-sm"
          >−</button>
          <span className="w-8 text-center text-sm font-bold text-gray-900">{item.quantity}</span>
          <button
            onClick={() => updateQuantity(product._id, item.quantity + 1, item.variantId)}
            disabled={item.quantity >= unitStock}
            className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-100 font-bold text-sm disabled:opacity-30 disabled:cursor-not-allowed"
          >+</button>
        </div>
        <div className="flex items-center gap-3">
          <p className="font-extrabold text-rose-600 text-sm">{formatPrice(unitPrice * item.quantity)}</p>
          <button
            onClick={() => removeFromCart(product._id, item.variantId)}
            aria-label="Xoá"
            className="text-gray-400 hover:text-red-500 p-1.5 hover:bg-red-50 rounded-lg transition-colors"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
