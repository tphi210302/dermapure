'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { Product } from '@/types';
import { formatPrice, DISCOUNT_PERCENT } from '@/lib/utils';
import { useCart } from '@/context/CartContext';
import { cn } from '@/lib/utils';
import { cloudinaryCard } from '@/lib/cloudinary';

interface Props { product: Product; }

export default function ProductCard({ product }: Props) {
  const { addToCart } = useCart();
  const [adding, setAdding] = useState(false);
  const [wished, setWished] = useState(false);

  const discount   = DISCOUNT_PERCENT(product.price, product.comparePrice);
  const thumbnail  = cloudinaryCard(product.images?.[0] || 'https://placehold.co/400x400/f0f9ff/0369a1?text=No+Image');
  const isOutOfStock = product.stock === 0;
  const isLowStock   = product.stock > 0 && product.stock <= 5;
  const categoryName = typeof product.category === 'object' ? product.category.name : '';

  const handleAddToCart = async () => {
    if (isOutOfStock || adding) return;
    setAdding(true);
    await addToCart(product._id, 1);
    setTimeout(() => setAdding(false), 800);
  };

  const href = `/products/${product._id}`;

  return (
    <div className={cn(
      'group relative flex flex-col bg-white rounded-2xl border border-gray-100 overflow-hidden',
      'transition-all duration-300 hover:shadow-card-lg hover:-translate-y-0.5',
      isOutOfStock && 'opacity-80'
    )}>
      {/* ── Full-card overlay link (z-0) ─────────────── */}
      <Link href={href} className="absolute inset-0 z-0" aria-label={product.name} />

      {/* ── Image zone ─────────────────────────────────── */}
      <div className="relative overflow-hidden bg-slate-50" style={{ paddingBottom: '100%' }}>
        <Image
          src={thumbnail}
          alt={product.name}
          fill
          className={cn(
            'object-cover transition-transform duration-500 group-hover:scale-105',
            isOutOfStock && 'grayscale-[30%]'
          )}
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
        />

        {/* Discount badge */}
        {discount > 0 && (
          <div className="absolute top-2.5 left-2.5 z-10 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-lg shadow-sm">
            -{discount}%
          </div>
        )}

        {/* Rx badge */}
        {product.requiresPrescription && (
          <div className="absolute top-2.5 right-10 z-10 bg-orange-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-md">
            Rx
          </div>
        )}

        {/* Wishlist */}
        <button
          onClick={() => setWished((w) => !w)}
          className={cn(
            'absolute top-2.5 right-2.5 z-10 h-7 w-7 rounded-full flex items-center justify-center',
            'bg-white shadow-sm border border-gray-100 transition-all duration-200',
            'opacity-0 group-hover:opacity-100 hover:scale-110',
            wished && 'opacity-100'
          )}
          aria-label="Wishlist"
        >
          <svg className={cn('h-3.5 w-3.5', wished ? 'text-red-500' : 'text-gray-400')}
            fill={wished ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
          </svg>
        </button>

        {/* Out of stock overlay */}
        {isOutOfStock && (
          <div className="absolute inset-0 z-10 bg-gray-900/30 backdrop-blur-[1px] flex items-center justify-center">
            <span className="bg-white/90 text-gray-800 text-xs font-bold px-3 py-1.5 rounded-full shadow-sm">
              Hết hàng
            </span>
          </div>
        )}
      </div>

      {/* ── Info ───────────────────────────────────────── */}
      <div className="relative z-10 flex flex-col flex-1 p-4 pointer-events-none">
        {/* Category */}
        {categoryName && (
          <p className="text-[11px] text-primary-600 font-semibold uppercase tracking-wider mb-1">
            {categoryName}
          </p>
        )}

        {/* Name */}
        <h3 className="text-sm font-semibold text-gray-900 leading-snug line-clamp-2 flex-1
                       group-hover:text-primary-600 transition-colors">
          {product.name}
        </h3>

        {/* Brand */}
        {product.brand && (
          <p className="text-[11px] text-gray-400 mt-1">{product.brand}</p>
        )}

        {/* Stock */}
        <div className="mt-1.5">
          {isLowStock && (
            <p className="text-[11px] text-amber-600 font-medium">
              ⚠️ Chỉ còn {product.stock} sản phẩm
            </p>
          )}
        </div>

        {/* Price + CTA */}
        <div className="mt-3 pt-3 border-t border-gray-50">
          <div className="flex items-center justify-between gap-2 mb-3">
            <div>
              <p className="text-lg font-extrabold text-rose-600">
                {formatPrice(product.price)}
              </p>
              {product.comparePrice && product.comparePrice > product.price && (
                <p className="text-xs text-gray-400 line-through leading-none mt-0.5">
                  {formatPrice(product.comparePrice)}
                </p>
              )}
            </div>
            <span className="text-[10px] text-gray-400 shrink-0">/{product.unit}</span>
          </div>

          <button
            onClick={handleAddToCart}
            disabled={isOutOfStock || adding}
            style={{
              pointerEvents: 'auto',
              background: isOutOfStock || adding ? undefined : 'linear-gradient(135deg,#e11d48,#f43f5e,#fb7185)',
            }}
            className={cn(
              'w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold',
              'transition-all duration-200 active:scale-[0.98]',
              isOutOfStock
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : adding
                ? 'bg-emerald-500 text-white'
                : 'text-white shadow-md hover:shadow-lg'
            )}
          >
            {adding ? (
              <>
                <svg className="h-3.5 w-3.5 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7"/>
                </svg>
                Đã thêm!
              </>
            ) : isOutOfStock ? (
              'Hết hàng'
            ) : (
              <>
                <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/>
                </svg>
                Thêm vào giỏ
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
