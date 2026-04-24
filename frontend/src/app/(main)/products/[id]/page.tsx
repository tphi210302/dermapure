'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Product, PaginatedResponse } from '@/types';
import { productService } from '@/services/product.service';
import { formatPrice, DISCOUNT_PERCENT, cn } from '@/lib/utils';
import { useCart } from '@/context/CartContext';
import ProductCard from '@/components/product/ProductCard';
import { cloudinaryHero, cloudinaryThumb } from '@/lib/cloudinary';

const StarRating = ({ value, count }: { value: number; count?: number }) => (
  <div className="flex items-center gap-1.5">
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <svg key={n} className={cn('h-4 w-4', n <= Math.round(value) ? 'text-amber-400' : 'text-gray-200')}
          viewBox="0 0 20 20" fill="currentColor">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
        </svg>
      ))}
    </div>
    {value > 0 && (
      <span className="text-sm font-semibold text-gray-700">{value.toFixed(1)}</span>
    )}
    {count !== undefined && count > 0 && (
      <span className="text-sm text-gray-400">({count} đánh giá)</span>
    )}
  </div>
);

const TRUST_BADGES = [
  { icon: '🚚', label: 'Giao hàng miễn phí', sub: 'Đơn trên 500K' },
  { icon: '✅', label: 'Hàng chính hãng', sub: '100% xác thực' },
  { icon: '🔄', label: 'Đổi trả dễ dàng', sub: 'Trong 7 ngày' },
  { icon: '🔒', label: 'Thanh toán an toàn', sub: 'Mã hóa SSL' },
];

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [qty, setQty]         = useState(1);
  const [activeImg, setActiveImg] = useState(0);
  const [adding, setAdding]   = useState(false);
  const [tab, setTab]         = useState<'desc' | 'info'>('desc');
  const [related, setRelated] = useState<Product[]>([]);
  const [relatedLoading, setRelatedLoading] = useState(false);
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null);
  const [zoomOpen, setZoomOpen] = useState(false);
  const { addToCart }         = useCart();

  useEffect(() => {
    setActiveImg(0);
    setQty(1);
    setSelectedVariantId(null);
    setZoomOpen(false);
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
    productService.getById(id)
      .then(({ data }) => {
        setProduct(data.data);
        // Auto-select first variant if product has variants
        if (data.data?.variants && data.data.variants.length > 0) {
          setSelectedVariantId(data.data.variants[0]._id);
        }
      })
      .catch(() => setProduct(null))
      .finally(() => setLoading(false));
  }, [id]);

  // Keyboard arrow keys navigate the gallery; Escape closes zoom
  useEffect(() => {
    if (!product || product.images.length <= 1) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft')  setActiveImg((i) => (i - 1 + product.images.length) % product.images.length);
      if (e.key === 'ArrowRight') setActiveImg((i) => (i + 1) % product.images.length);
      if (e.key === 'Escape')     setZoomOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [product?.images?.length]);  // eslint-disable-line react-hooks/exhaustive-deps

  // Lock body scroll while zoom lightbox is open
  useEffect(() => {
    if (!zoomOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, [zoomOpen]);

  // Fetch related products from the same category (excluding current)
  useEffect(() => {
    if (!product) { setRelated([]); return; }
    const categoryId = typeof product.category === 'object' ? product.category?._id : product.category;
    if (!categoryId) { setRelated([]); return; }
    setRelatedLoading(true);
    productService.getAll({ category: categoryId, limit: 10, sort: '-createdAt' })
      .then(({ data }: any) => {
        const resp = data as PaginatedResponse<Product>;
        setRelated(resp.data.items.filter((p) => p._id !== product._id).slice(0, 8));
      })
      .catch(() => setRelated([]))
      .finally(() => setRelatedLoading(false));
  }, [product?._id]);  // eslint-disable-line react-hooks/exhaustive-deps

  const handleAddToCart = async () => {
    if (!product || adding) return;
    if (hasVariants && !selectedVariantId) return;
    setAdding(true);
    await addToCart(product._id, qty, selectedVariantId || undefined);
    setTimeout(() => setAdding(false), 1000);
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div>
            <div className="skeleton rounded-2xl" style={{ paddingBottom: '100%' }} />
            <div className="flex gap-2 mt-3">
              {[1,2,3].map(i => <div key={i} className="skeleton h-16 w-16 rounded-lg shrink-0" />)}
            </div>
          </div>
          <div className="space-y-4">
            <div className="skeleton h-4 w-24 rounded" />
            <div className="skeleton h-8 w-full rounded" />
            <div className="skeleton h-8 w-3/4 rounded" />
            <div className="skeleton h-6 w-32 rounded mt-6" />
            <div className="skeleton h-10 w-full rounded-xl mt-4" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center">
        <p className="text-5xl mb-4">😕</p>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Không tìm thấy sản phẩm</h2>
        <Link href="/products" className="mt-4 text-primary-600 font-medium hover:underline">
          ← Quay lại sản phẩm
        </Link>
      </div>
    );
  }

  const hasVariants = !!(product.variants && product.variants.length > 0);
  const selectedVariant = hasVariants
    ? product.variants!.find((v) => v._id === selectedVariantId) || null
    : null;
  const effectivePrice        = selectedVariant?.price ?? product.price;
  const effectiveComparePrice = selectedVariant?.comparePrice ?? product.comparePrice;
  const effectiveStock        = selectedVariant?.stock ?? product.stock;

  const discount  = DISCOUNT_PERCENT(effectivePrice, effectiveComparePrice);
  const category  = typeof product.category === 'object' ? product.category : null;
  const isOutOfStock = effectiveStock === 0;
  const isLowStock   = effectiveStock > 0 && effectiveStock <= 5;
  const thumbnail = cloudinaryHero(product.images?.[activeImg] || 'https://placehold.co/600x600/f0f9ff/0369a1?text=No+Image');

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-gray-400 mb-8">
        <Link href="/" className="hover:text-primary-600 transition-colors">Trang chủ</Link>
        <span>/</span>
        <Link href="/products" className="hover:text-primary-600 transition-colors">Sản phẩm</Link>
        {category && (
          <>
            <span>/</span>
            <Link href={`/products?category=${category._id}`} className="hover:text-primary-600 transition-colors">
              {category.name}
            </Link>
          </>
        )}
        <span>/</span>
        <span className="text-gray-900 font-medium truncate max-w-[180px]">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-14">
        {/* ── Images ─────────────────────────────── */}
        <div>
          <div className="relative aspect-square rounded-2xl overflow-hidden bg-slate-50 border border-gray-100 group cursor-zoom-in"
            onClick={() => setZoomOpen(true)}
            role="button"
            aria-label="Phóng to ảnh">
            <Image
              src={thumbnail}
              alt={product.name}
              fill
              className={cn('object-cover transition-transform duration-500 group-hover:scale-105', isOutOfStock && 'grayscale-[30%]')}
              priority
              sizes="(max-width: 768px) 100vw, 50vw"
            />

            {/* Zoom hint */}
            <span className="absolute top-3 right-3 z-10 bg-black/50 text-white text-[10px] font-bold px-2 py-1 rounded-lg backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
              🔍 Phóng to
            </span>

            {/* Prev/Next arrows — only when multiple images */}
            {product.images.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); setActiveImg((i) => (i - 1 + product.images.length) % product.images.length); }}
                  aria-label="Ảnh trước"
                  className="absolute left-2 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-white/90 hover:bg-white shadow-md flex items-center justify-center text-gray-700 hover:scale-105 transition-all"
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7"/>
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); setActiveImg((i) => (i + 1) % product.images.length); }}
                  aria-label="Ảnh tiếp"
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-white/90 hover:bg-white shadow-md flex items-center justify-center text-gray-700 hover:scale-105 transition-all"
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7"/>
                  </svg>
                </button>

                {/* Counter pill */}
                <span className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-black/60 text-white text-[11px] font-semibold px-2.5 py-1 rounded-full backdrop-blur-sm">
                  {activeImg + 1} / {product.images.length}
                </span>

                {/* Dot indicators */}
                <div className="absolute bottom-3 right-3 flex gap-1">
                  {product.images.map((_, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={(e) => { e.stopPropagation(); setActiveImg(i); }}
                      aria-label={`Ảnh ${i + 1}`}
                      className={cn(
                        'h-2 rounded-full transition-all',
                        i === activeImg ? 'w-5 bg-white' : 'w-2 bg-white/50 hover:bg-white/70'
                      )}
                    />
                  ))}
                </div>
              </>
            )}

            {discount > 0 && (
              <span className="absolute top-4 left-4 bg-red-500 text-white text-sm font-bold px-3 py-1.5 rounded-xl shadow">
                -{discount}%
              </span>
            )}
            {product.requiresPrescription && (
              <span className="absolute top-4 right-4 bg-orange-500 text-white text-xs font-bold px-2.5 py-1 rounded-xl">
                Rx
              </span>
            )}
            {isOutOfStock && (
              <div className="absolute inset-0 bg-gray-900/30 backdrop-blur-[1px] flex items-center justify-center">
                <span className="bg-white/90 text-gray-800 text-sm font-bold px-5 py-2 rounded-full shadow">
                  Hết hàng
                </span>
              </div>
            )}
          </div>

          {/* Thumbnails */}
          {product.images.length > 1 && (
            <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
              {product.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImg(i)}
                  className={cn(
                    'relative h-16 w-16 shrink-0 rounded-xl overflow-hidden border-2 transition-all',
                    i === activeImg
                      ? 'border-primary-500 shadow-md shadow-primary-100'
                      : 'border-transparent hover:border-gray-300'
                  )}
                >
                  <Image src={cloudinaryThumb(img, 160)} alt="" fill className="object-cover" sizes="64px" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ── Info ───────────────────────────────── */}
        <div className="flex flex-col">
          {/* Category + badges */}
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            {category && (
              <Link href={`/products?category=${category._id}`}
                className="text-xs font-bold text-primary-600 uppercase tracking-wider hover:text-primary-700">
                {category.name}
              </Link>
            )}
            {product.requiresPrescription && (
              <span className="text-[11px] bg-orange-100 text-orange-700 font-bold px-2 py-0.5 rounded-md">
                Cần chỉ định bác sĩ da liễu
              </span>
            )}
          </div>

          {/* Name */}
          <h1 className="text-2xl lg:text-3xl font-extrabold text-gray-900 leading-tight mb-2">
            {product.name}
          </h1>

          {/* Brand + rating */}
          <div className="flex items-center gap-3 mb-5 flex-wrap">
            {product.brand && (
              <span className="text-sm text-gray-500">
                by <span className="font-semibold text-gray-700">{product.brand}</span>
              </span>
            )}
            {product.brand && product.rating?.average > 0 && <span className="text-gray-300">|</span>}
            {product.rating?.average > 0 && (
              <StarRating value={product.rating.average} count={product.rating.count} />
            )}
          </div>

          {/* Price block */}
          <div className="bg-gradient-to-r from-primary-50 to-blue-50 rounded-2xl p-4 mb-5">
            <div className="flex items-baseline gap-3">
              <span className={cn('text-3xl font-extrabold', discount > 0 ? 'text-red-600' : 'text-gray-900')}>
                {formatPrice(effectivePrice)}
              </span>
              {effectiveComparePrice && effectiveComparePrice > effectivePrice && (
                <span className="text-lg text-gray-400 line-through">{formatPrice(effectiveComparePrice)}</span>
              )}
              {discount > 0 && (
                <span className="ml-auto bg-red-100 text-red-700 text-xs font-bold px-2.5 py-1 rounded-lg">
                  TIẾT KIỆM {discount}%
                </span>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Mỗi {product.unit}{selectedVariant && ` · Loại: ${selectedVariant.label}`}
            </p>
          </div>

          {/* Variant picker */}
          {hasVariants && (
            <div className="mb-5">
              <p className="text-xs font-bold text-gray-700 mb-2">
                Chọn loại <span className="text-rose-500">*</span>
              </p>
              <div className="flex flex-wrap gap-2">
                {product.variants!.map((v) => {
                  const isActive = v._id === selectedVariantId;
                  const isOOS    = v.stock === 0;
                  return (
                    <button
                      key={v._id}
                      type="button"
                      onClick={() => !isOOS && setSelectedVariantId(v._id)}
                      disabled={isOOS}
                      className={cn(
                        'px-4 py-2 rounded-xl border-2 text-sm font-bold transition-all',
                        isOOS
                          ? 'border-gray-200 bg-gray-50 text-gray-300 line-through cursor-not-allowed'
                          : isActive
                            ? 'border-rose-500 bg-rose-50 text-rose-700 shadow-md'
                            : 'border-gray-200 bg-white text-gray-700 hover:border-gray-400'
                      )}
                    >
                      {v.label}
                      {isOOS && <span className="ml-1 text-[10px] font-normal">(hết)</span>}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Short description */}
          {product.shortDescription && (
            <p className="text-gray-600 text-sm leading-relaxed mb-5 border-l-2 border-primary-200 pl-3">
              {product.shortDescription}
            </p>
          )}

          {/* Stock indicator */}
          <div className="mb-5">
            {isOutOfStock ? (
              <div className="flex items-center gap-2 text-red-600 text-sm font-medium">
                <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                Hết hàng
              </div>
            ) : isLowStock ? (
              <div className="flex items-center gap-2 text-amber-600 text-sm font-medium">
                <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
                Chỉ còn {effectiveStock} — đặt ngay!
              </div>
            ) : (
              <div className="flex items-center gap-2 text-emerald-600 text-sm font-medium">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                Còn hàng ({effectiveStock} sản phẩm)
              </div>
            )}
          </div>

          {/* Qty + Add to Cart */}
          {!isOutOfStock && (
            <div className="flex items-center gap-3 mb-5">
              <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden bg-gray-50">
                <button
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  className="w-10 h-10 flex items-center justify-center hover:bg-gray-100 text-gray-700 font-bold transition-colors"
                >
                  −
                </button>
                <span className="w-10 text-center text-sm font-bold text-gray-900">{qty}</span>
                <button
                  onClick={() => setQty((q) => Math.min(effectiveStock, q + 1))}
                  className="w-10 h-10 flex items-center justify-center hover:bg-gray-100 text-gray-700 font-bold transition-colors"
                >
                  +
                </button>
              </div>
              <button
                onClick={handleAddToCart}
                disabled={adding}
                className={cn(
                  'flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold',
                  'transition-all duration-200 shadow-sm',
                  adding
                    ? 'bg-emerald-500 text-white shadow-emerald-200'
                    : 'bg-primary-600 text-white hover:bg-primary-700 active:bg-primary-800 hover:shadow-md hover:shadow-primary-100'
                )}
              >
                {adding ? (
                  <>
                    <svg className="h-4 w-4 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7"/>
                    </svg>
                    Đã thêm vào giỏ!
                  </>
                ) : (
                  <>
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/>
                    </svg>
                    Thêm vào giỏ — {formatPrice(effectivePrice * qty)}
                  </>
                )}
              </button>
            </div>
          )}

          {/* Tags */}
          {product.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-5">
              {product.tags.map((tag) => (
                <span key={tag}
                  className="px-2.5 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-lg hover:bg-gray-200 cursor-pointer transition-colors">
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Trust badges */}
          <div className="grid grid-cols-2 gap-2 mt-auto pt-4 border-t border-gray-100">
            {TRUST_BADGES.map((b) => (
              <div key={b.label} className="flex items-center gap-2">
                <span className="text-lg">{b.icon}</span>
                <div>
                  <p className="text-xs font-semibold text-gray-700">{b.label}</p>
                  <p className="text-[10px] text-gray-400">{b.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Tabs ────────────────────────────────── */}
      {(product.description || product.ingredients || product.dosage || product.warnings) && (
        <div className="mt-12">
          <div className="flex gap-1 border-b border-gray-200 mb-6">
            {[
              { key: 'desc', label: 'Mô tả' },
              { key: 'info', label: 'Chi tiết & Hướng dẫn' },
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setTab(key as 'desc' | 'info')}
                className={cn(
                  'px-5 py-3 text-sm font-semibold border-b-2 -mb-px transition-colors',
                  tab === key
                    ? 'border-primary-600 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-900'
                )}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            {tab === 'desc' && product.description && (
              <div className="prose prose-sm max-w-none text-gray-700 whitespace-pre-wrap leading-relaxed">
                {product.description}
              </div>
            )}
            {tab === 'info' && (
              <div className="space-y-5">
                {product.ingredients && (
                  <div>
                    <h4 className="font-bold text-gray-900 mb-2 text-sm">Thành phần</h4>
                    <p className="text-gray-600 text-sm">{product.ingredients}</p>
                  </div>
                )}
                {product.dosage && (
                  <div>
                    <h4 className="font-bold text-gray-900 mb-2 text-sm">Liều dùng</h4>
                    <p className="text-gray-600 text-sm">{product.dosage}</p>
                  </div>
                )}
                {product.warnings && (
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                    <h4 className="font-bold text-amber-800 mb-2 text-sm flex items-center gap-2">
                      ⚠️ Cảnh báo
                    </h4>
                    <p className="text-amber-700 text-sm">{product.warnings}</p>
                  </div>
                )}
                {!product.ingredients && !product.dosage && !product.warnings && (
                  <p className="text-gray-500 text-sm">Không có thêm thông tin chi tiết.</p>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Related products ──────────────────────── */}
      {(relatedLoading || related.length > 0) && (
        <section className="mt-14">
          <div className="flex items-end justify-between gap-3 mb-5 flex-wrap">
            <div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900">Sản phẩm liên quan</h2>
              <p className="text-sm text-gray-500 mt-0.5">
                {category ? `Trong danh mục "${category.name}"` : 'Có thể bạn cũng thích'}
              </p>
            </div>
            {category && (
              <Link href={`/products?category=${category._id}`}
                className="text-xs font-bold text-primary-600 hover:text-primary-700 hover:underline">
                Xem tất cả →
              </Link>
            )}
          </div>

          {relatedLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                  <div className="skeleton" style={{ paddingBottom: '100%' }} />
                  <div className="p-4 space-y-2">
                    <div className="skeleton h-3 w-20 rounded" />
                    <div className="skeleton h-4 w-full rounded" />
                    <div className="skeleton h-4 w-2/3 rounded" />
                    <div className="skeleton h-9 w-full rounded-xl mt-3" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {related.map((p) => <ProductCard key={p._id} product={p} />)}
            </div>
          )}
        </section>
      )}

      {/* ── Zoom lightbox ────────────────────────── */}
      {zoomOpen && (
        <div
          className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setZoomOpen(false)}
        >
          {/* Close */}
          <button
            type="button"
            onClick={() => setZoomOpen(false)}
            className="absolute top-4 right-4 h-10 w-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center z-10 backdrop-blur-sm"
            aria-label="Đóng"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>

          {/* Counter */}
          {product.images.length > 1 && (
            <span className="absolute top-4 left-1/2 -translate-x-1/2 bg-white/10 text-white text-sm font-semibold px-3 py-1.5 rounded-full backdrop-blur-sm z-10">
              {activeImg + 1} / {product.images.length}
            </span>
          )}

          {/* Prev/Next */}
          {product.images.length > 1 && (
            <>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); setActiveImg((i) => (i - 1 + product.images.length) % product.images.length); }}
                aria-label="Ảnh trước"
                className="absolute left-4 top-1/2 -translate-y-1/2 h-12 w-12 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center z-10 backdrop-blur-sm"
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7"/>
                </svg>
              </button>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); setActiveImg((i) => (i + 1) % product.images.length); }}
                aria-label="Ảnh tiếp"
                className="absolute right-4 top-1/2 -translate-y-1/2 h-12 w-12 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center z-10 backdrop-blur-sm"
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7"/>
                </svg>
              </button>
            </>
          )}

          {/* Image */}
          <div
            className="relative w-full h-full max-w-5xl max-h-[90vh] flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={cloudinaryHero(product.images?.[activeImg] || 'https://placehold.co/1200x1200/f0f9ff/0369a1?text=No+Image')}
              alt={product.name}
              className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
            />
          </div>
        </div>
      )}
    </div>
  );
}
