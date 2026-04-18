'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Product, Category, PaginatedResponse } from '@/types';
import { productService } from '@/services/product.service';
import { categoryService } from '@/services/category.service';
import { cmsService, type Banner, type SiteSetting } from '@/services/cms.service';
import { formatPrice } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import ProductCard from '@/components/product/ProductCard';

/* ─────────────────── static data ─────────────────── */

const SKIN_SOLUTIONS = [
  { slug: 'acne',       emoji: '🌿', title: 'Da mụn',    sub: 'Mụn viêm, mụn ẩn, đầu đen',   gradient: 'linear-gradient(135deg,#be123c 0%,#e11d48 50%,#fb7185 100%)' },
  { slug: 'oily-skin',  emoji: '💧', title: 'Da dầu',    sub: 'Bóng nhờn, lỗ chân lông to',   gradient: 'linear-gradient(135deg,#92400e 0%,#d97706 50%,#fbbf24 100%)' },
  { slug: 'dark-spot',  emoji: '✨', title: 'Thâm nám',  sub: 'Thâm mụn, nám, đốm nâu',       gradient: 'linear-gradient(135deg,#4338ca 0%,#7c3aed 50%,#c084fc 100%)' },
];

const BEFORE_AFTER = [
  { name: 'Ngọc Anh, 22', result: 'Hết mụn viêm sau 3 tuần',     avatar: '👩', score: '+85%' },
  { name: 'Minh Tuấn, 26', result: 'Da mịn, hết dầu suốt 12 giờ', avatar: '👨', score: '+90%' },
  { name: 'Linh Chi, 30',  result: 'Thâm nám mờ sau 6 tuần',      avatar: '👩', score: '+75%' },
];

const CAT_ICON: Record<string, string> = {
  'làm sạch da':          '🧼',
  'toner & cân bằng':     '💦',
  'serum đặc trị':        '💎',
  'trị mụn':              '🌿',
  'mờ thâm & sáng da':    '✨',
  'dưỡng ẩm':             '🧴',
  'chống nắng':           '☀️',
  'chống lão hóa':        '🌙',
  'phụ kiện chăm sóc da': '🪞',
};

const CATEGORY_THEME = [
  { ring: 'ring-rose-200',    bg: 'bg-rose-50',    icon: 'bg-rose-100',    text: 'text-rose-800'    },
  { ring: 'ring-pink-200',    bg: 'bg-pink-50',    icon: 'bg-pink-100',    text: 'text-pink-800'    },
  { ring: 'ring-amber-200',   bg: 'bg-amber-50',   icon: 'bg-amber-100',   text: 'text-amber-800'   },
  { ring: 'ring-violet-200',  bg: 'bg-violet-50',  icon: 'bg-violet-100',  text: 'text-violet-800'  },
  { ring: 'ring-emerald-200', bg: 'bg-emerald-50', icon: 'bg-emerald-100', text: 'text-emerald-800' },
  { ring: 'ring-cyan-200',    bg: 'bg-cyan-50',    icon: 'bg-cyan-100',    text: 'text-cyan-800'    },
  { ring: 'ring-blue-200',    bg: 'bg-blue-50',    icon: 'bg-blue-100',    text: 'text-blue-800'    },
  { ring: 'ring-indigo-200',  bg: 'bg-indigo-50',  icon: 'bg-indigo-100',  text: 'text-indigo-800'  },
  { ring: 'ring-fuchsia-200', bg: 'bg-fuchsia-50', icon: 'bg-fuchsia-100', text: 'text-fuchsia-800' },
];

const TRUST_BAR = [
  { icon: '✅', label: 'Chính hãng 100%',   sub: 'Kiểm định chất lượng' },
  { icon: '⚡', label: 'Giao siêu tốc',      sub: 'Trong ngày tại Hà Nội' },
  { icon: '🔒', label: 'Thanh toán COD',     sub: 'Nhận hàng mới trả tiền' },
  { icon: '🔄', label: 'Đổi trả 7 ngày',     sub: 'Miễn phí nếu lỗi' },
  { icon: '👩‍⚕️', label: 'Dược sĩ da liễu', sub: 'Tư vấn 24/7 miễn phí' },
];

/* ─────────────────── component ─────────────────── */

export default function HomePage() {
  const { isAuthenticated } = useAuth();
  const [products,   setProducts]   = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [promoBanners,   setPromoBanners]   = useState<Banner[]>([]);
  const [featureBanners, setFeatureBanners] = useState<Banner[]>([]);
  const [setting,    setSetting]    = useState<SiteSetting | null>(null);
  const [loading,    setLoading]    = useState(true);

  useEffect(() => {
    Promise.all([
      productService.getAll({ limit: 8, sort: '-createdAt' }),
      categoryService.getAll(),
      cmsService.listBanners(),
      cmsService.getSetting(),
    ]).then(([pRes, cRes, bRes, sRes]) => {
      setProducts((pRes.data as PaginatedResponse<Product>).data.items);
      setCategories((cRes.data as { data: Category[] }).data);
      const allBanners = (bRes.data as { data: Banner[] }).data;
      setPromoBanners(allBanners.filter((b) => b.type === 'promo').sort((a, b) => a.order - b.order));
      setFeatureBanners(allBanners.filter((b) => b.type === 'feature').sort((a, b) => a.order - b.order));
      setSetting((sRes.data as { data: SiteSetting }).data);
    }).finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ═══════════════════ 1. SKIN PROBLEM CHOOSER ═══════════════════ */}
      <section className="relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #fff1f2 0%, #ffe4e6 45%, #fecdd3 100%)' }}>
        <div className="absolute -top-32 -left-32 h-[500px] w-[500px] rounded-full bg-white/40 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -right-32 h-[400px] w-[400px] rounded-full bg-rose-300/50 blur-3xl pointer-events-none" />

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 text-center">
          {setting && (
            <p className="inline-flex items-center gap-2 text-[11px] sm:text-xs font-extrabold uppercase tracking-widest bg-white/80 border border-rose-200 text-rose-600 px-4 py-1.5 rounded-full mb-4 shadow-sm backdrop-blur-sm">
              {setting.heroBadge}
            </p>
          )}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 mb-3 leading-[1.1]">
            {setting ? setting.heroHeading.split('?')[0] : 'Bạn đang gặp vấn đề da nào'}
            <span className="bg-clip-text text-transparent ml-2"
              style={{ backgroundImage: 'linear-gradient(135deg, #be123c 0%, #e11d48 50%, #7c3aed 100%)' }}>
              ?
            </span>
          </h1>
          <p className="text-gray-600 text-sm sm:text-lg max-w-2xl mx-auto mb-6 sm:mb-8">
            {setting?.heroSubtext || 'Chọn vấn đề của bạn — nhận ngay combo liệu trình được dược sĩ da liễu khuyên dùng.'}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-4xl mx-auto mb-5">
            {SKIN_SOLUTIONS.map((s) => (
              <Link key={s.slug} href={`/solutions/${s.slug}`}
                className="group relative rounded-3xl p-5 sm:p-6 text-white overflow-hidden shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all duration-300"
                style={{ background: s.gradient }}>
                <div className="absolute -top-6 -right-6 h-32 w-32 rounded-full bg-white/15 blur-2xl" />
                <div className="relative">
                  <div className="text-4xl sm:text-5xl mb-2 group-hover:scale-110 transition-transform duration-300">{s.emoji}</div>
                  <h3 className="font-extrabold text-lg sm:text-xl mb-0.5">{s.title}</h3>
                  <p className="text-white/80 text-xs sm:text-sm mb-3">{s.sub}</p>
                  <span className="inline-flex items-center gap-1 bg-white/25 border border-white/40 rounded-full px-3 py-1 text-[11px] font-bold backdrop-blur-sm">
                    Xem liệu trình →
                  </span>
                </div>
              </Link>
            ))}
          </div>

          {/* Social proof strip — compact 3-col with small icons on mobile */}
          <div className="grid grid-cols-3 gap-2 sm:gap-3 max-w-3xl mx-auto">
            {BEFORE_AFTER.map((p) => (
              <div key={p.name} className="bg-white/90 backdrop-blur-sm rounded-xl sm:rounded-2xl p-2 sm:p-4 border border-white shadow-sm text-left">
                {/* Header: small avatar + score badge */}
                <div className="flex items-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2">
                  <div className="h-6 w-6 sm:h-9 sm:w-9 rounded-full bg-gradient-to-br from-rose-100 to-violet-100 flex items-center justify-center text-xs sm:text-lg shrink-0">
                    {p.avatar}
                  </div>
                  <span className="inline-flex items-center bg-emerald-100 text-emerald-700 text-[9px] sm:text-[10px] font-bold px-1 sm:px-1.5 py-0.5 rounded-full">
                    {p.score}
                  </span>
                </div>
                {/* Name + result */}
                <p className="font-bold text-[11px] sm:text-sm text-gray-900 truncate sm:whitespace-normal">{p.name}</p>
                <p className="text-[10px] sm:text-sm text-gray-600 sm:italic leading-tight line-clamp-2 sm:line-clamp-none">
                  <span className="hidden sm:inline">&ldquo;</span>{p.result}<span className="hidden sm:inline">&rdquo;</span>
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════ 2. VOUCHER STRIP — link /register only when NOT authed ═══════════════════ */}
      <section className="bg-gradient-to-r from-rose-50 via-pink-50 to-rose-50 border-y border-rose-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 grid grid-cols-1 sm:grid-cols-2 gap-3">

          {/* Card 1: first-order discount */}
          {(() => {
            const content = (
              <>
                <div className="h-10 w-10 rounded-xl flex items-center justify-center text-xl shrink-0 text-white shadow-md"
                  style={{ background: 'linear-gradient(135deg,#e11d48,#f43f5e)' }}>🎁</div>
                <div className="flex-1 min-w-0">
                  <p className={`text-xs font-bold text-rose-700 ${!isAuthenticated ? 'group-hover:text-rose-800' : ''}`}>Đơn đầu tiên giảm 10%</p>
                  <p className="text-[11px] text-gray-500">
                    {isAuthenticated
                      ? 'Tự động áp dụng · tối đa 50.000₫'
                      : 'Đăng ký ngay · tối đa 50.000₫'}
                  </p>
                </div>
                {!isAuthenticated && (
                  <svg className="h-4 w-4 text-rose-500 shrink-0 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7"/>
                  </svg>
                )}
              </>
            );
            return isAuthenticated ? (
              <div className="flex items-center gap-3 bg-white/90 rounded-xl p-3 border border-rose-200 shadow-sm">
                {content}
              </div>
            ) : (
              <Link href="/register"
                className="group flex items-center gap-3 bg-white/90 rounded-xl p-3 border border-rose-200 shadow-sm hover:shadow-md hover:border-rose-400 active:scale-[0.99] transition-all">
                {content}
              </Link>
            );
          })()}

          {/* Card 2: free shipping */}
          {(() => {
            const content = (
              <>
                <div className="h-10 w-10 rounded-xl flex items-center justify-center text-xl shrink-0 text-white shadow-md"
                  style={{ background: 'linear-gradient(135deg,#0891b2,#06b6d4)' }}>🚚</div>
                <div className="flex-1 min-w-0">
                  <p className={`text-xs font-bold text-cyan-700 ${!isAuthenticated ? 'group-hover:text-cyan-800' : ''}`}>Miễn phí vận chuyển</p>
                  <p className="text-[11px] text-gray-500">Mã <span className="font-mono font-bold text-cyan-600">FREESHIP</span> · đơn từ 500K</p>
                </div>
                {!isAuthenticated && (
                  <svg className="h-4 w-4 text-cyan-500 shrink-0 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7"/>
                  </svg>
                )}
              </>
            );
            return isAuthenticated ? (
              <div className="flex items-center gap-3 bg-white/90 rounded-xl p-3 border border-cyan-200 shadow-sm">
                {content}
              </div>
            ) : (
              <Link href="/register"
                className="group flex items-center gap-3 bg-white/90 rounded-xl p-3 border border-cyan-200 shadow-sm hover:shadow-md hover:border-cyan-400 active:scale-[0.99] transition-all">
                {content}
              </Link>
            );
          })()}

        </div>
      </section>

      {/* ═══════════════════ 3. TRUST BAR ═══════════════════ */}
      <section className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 divide-x divide-y sm:divide-y-0 divide-gray-100">
            {TRUST_BAR.map((t) => (
              <div key={t.label} className="flex items-center gap-2 px-3 sm:px-5 py-3 sm:py-4">
                <span className="text-base sm:text-xl shrink-0">{t.icon}</span>
                <div className="min-w-0">
                  <p className="text-[11px] sm:text-xs font-bold text-gray-800 leading-tight">{t.label}</p>
                  <p className="text-[10px] sm:text-[11px] text-gray-400 mt-0.5 leading-tight">{t.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════ MAIN CONTENT ═══════════════════ */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">

        {/* 5. PRODUCT COLLAGE */}
        {products.length >= 5 && (
          <section>
            <div className="flex items-end justify-between mb-5">
              <div>
                <p className="text-xs font-bold text-rose-600 uppercase tracking-widest mb-1">✨ Bộ sưu tập dược mỹ phẩm</p>
                <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900">Hàng nghìn sản phẩm chính hãng</h2>
              </div>
              <Link href="/products" className="hidden sm:inline-flex text-xs font-semibold text-rose-600 hover:text-rose-700 items-center gap-1">
                Khám phá ngay
                <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7"/>
                </svg>
              </Link>
            </div>

            {/* Mobile: 2-col simple grid · Desktop: asymmetric collage (1 big + 4 small) */}
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-12 sm:gap-3">
              <Link href={`/products/${products[0]._id}`}
                className="col-span-2 sm:col-span-6 sm:row-span-2 relative rounded-2xl overflow-hidden group shadow-md hover:shadow-xl transition-all"
                style={{ aspectRatio: '1 / 1' }}>
                {products[0]?.images?.[0] && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={products[0].images[0]} alt={products[0].name}
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                )}
                <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(136,19,55,0.9), rgba(136,19,55,0) 60%)' }} />
                <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4 text-white">
                  <span className="inline-block bg-yellow-400 text-yellow-900 text-[10px] font-extrabold px-2 py-0.5 rounded-full mb-1.5">HOT</span>
                  <h3 className="font-extrabold text-sm sm:text-lg leading-tight mb-1 line-clamp-2">{products[0]?.name}</h3>
                  <p className="font-extrabold text-rose-200 text-sm">{formatPrice(products[0]?.price || 0)}</p>
                </div>
              </Link>

              {products.slice(1, 5).map((p) => (
                <Link key={p._id} href={`/products/${p._id}`}
                  className="col-span-1 sm:col-span-3 relative rounded-xl overflow-hidden group shadow-sm hover:shadow-md transition-all"
                  style={{ aspectRatio: '1 / 1' }}>
                  {p.images?.[0] && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={p.images[0]} alt={p.name} className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
                  )}
                  <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.75), transparent 55%)' }} />
                  <div className="absolute bottom-0 left-0 right-0 p-2 text-white">
                    <p className="text-[11px] font-bold line-clamp-2 leading-tight mb-0.5">{p.name}</p>
                    <p className="text-xs font-extrabold text-rose-200">{formatPrice(p.price)}</p>
                  </div>
                </Link>
              ))}
            </div>

            <Link href="/products" className="sm:hidden mt-3 flex items-center justify-center gap-1 py-3 bg-white border-2 border-rose-200 text-rose-600 rounded-xl font-bold text-sm">
              Khám phá tất cả →
            </Link>
          </section>
        )}

        {/* 6. CATEGORIES */}
        {categories.length > 0 && (
          <section>
            <div className="flex items-end justify-between mb-5">
              <div>
                <p className="text-xs font-bold text-rose-600 uppercase tracking-widest mb-1">Danh mục</p>
                <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900">Mua theo danh mục</h2>
              </div>
              <Link href="/products" className="text-xs font-semibold text-rose-600 hover:text-rose-700 flex items-center gap-1">
                Xem tất cả
                <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7"/>
                </svg>
              </Link>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-9 gap-3">
              {categories.map((cat, i) => {
                const th = CATEGORY_THEME[i % CATEGORY_THEME.length];
                const icon = CAT_ICON[cat.name.toLowerCase()] ?? '💊';
                return (
                  <Link key={cat._id} href={`/products?category=${cat._id}`}
                    className={`group flex flex-col items-center gap-2 py-4 sm:py-5 px-2 rounded-2xl border border-transparent ring-1 ${th.ring} ${th.bg} hover:shadow-md hover:-translate-y-0.5 transition-all`}>
                    <div className={`h-12 w-12 flex items-center justify-center rounded-2xl ${th.icon} text-2xl shadow-sm group-hover:scale-110 transition-transform`}>
                      {icon}
                    </div>
                    <span className={`text-[10px] sm:text-[11px] font-bold text-center leading-tight ${th.text}`}>
                      {cat.name}
                    </span>
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        {/* 7. CMS PROMO BANNERS */}
        {promoBanners.length > 0 && (
          <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {promoBanners.slice(0, 2).map((p, i) => (
              <div key={p._id} className={`relative overflow-hidden rounded-3xl p-6 sm:p-8 text-white ${i === 0 ? 'md:col-span-1' : ''}`}
                style={{ background: `linear-gradient(135deg, ${p.gradientFrom} 0%, ${p.gradientTo} 100%)` }}>
                <div className="absolute -right-12 -bottom-12 h-48 w-48 rounded-full bg-white/10 blur-2xl" />
                <div className="relative">
                  {p.badge && (
                    <span className="inline-flex items-center gap-1 bg-white/20 border border-white/25 text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full mb-3">
                      {p.badge}
                    </span>
                  )}
                  <h3 className="text-xl sm:text-2xl font-extrabold mb-2">{p.title}</h3>
                  {p.subtitle && <p className="text-white/80 text-sm mb-4 max-w-sm">{p.subtitle}</p>}
                  {p.ctaText && p.ctaHref && (
                    <Link href={p.ctaHref}
                      className="inline-flex items-center gap-1.5 bg-white font-bold text-sm px-4 py-2.5 rounded-xl shadow hover:shadow-lg transition-all"
                      style={{ color: p.gradientFrom }}>
                      {p.ctaText} →
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </section>
        )}

        {/* 8. NEW ARRIVALS */}
        <section>
          <div className="flex items-end justify-between mb-5">
            <div>
              <p className="text-xs font-bold text-rose-600 uppercase tracking-widest mb-1">Mới nhất</p>
              <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900">Hàng mới về</h2>
            </div>
            <Link href="/products?sort=-createdAt" className="text-xs font-semibold text-rose-600 hover:text-rose-700 flex items-center gap-1">
              Xem thêm
              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7"/>
              </svg>
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                  <div className="skeleton aspect-square" />
                  <div className="p-4 space-y-2.5">
                    <div className="skeleton h-3 rounded w-1/2" />
                    <div className="skeleton h-4 rounded w-3/4" />
                    <div className="skeleton h-3 rounded w-1/3" />
                    <div className="skeleton h-9 rounded-xl mt-2" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {products.map((p) => <ProductCard key={p._id} product={p} />)}
            </div>
          )}
        </section>

        {/* 9. CMS FEATURE CARDS — Why us */}
        {featureBanners.length > 0 && (
          <section className="bg-white rounded-3xl border border-gray-100 shadow-sm p-5 sm:p-8 md:p-10">
            <div className="text-center mb-6 sm:mb-8">
              <p className="text-xs font-bold text-rose-600 uppercase tracking-widest mb-2">Cam kết của chúng tôi</p>
              <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900 mb-2">
                Tại sao chọn {setting?.siteName || 'DermaPure'}?
              </h2>
              <p className="text-xs sm:text-sm text-gray-500 max-w-md mx-auto leading-relaxed">
                {setting?.tagline || 'Phân phối chính hãng từ các thương hiệu dược mỹ phẩm hàng đầu.'}
              </p>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              {featureBanners.map((f) => (
                <div key={f._id} className="group p-3.5 sm:p-5 rounded-2xl border border-gray-100 hover:border-gray-200 hover:shadow-md transition-all bg-gray-50/50">
                  <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl sm:rounded-2xl flex items-center justify-center text-xl sm:text-2xl mb-3 shadow-sm group-hover:scale-110 transition-transform text-white"
                    style={{ background: `linear-gradient(135deg, ${f.gradientFrom}, ${f.gradientTo})` }}>
                    {f.badge}
                  </div>
                  <h4 className="font-bold text-gray-900 text-xs sm:text-sm mb-1">{f.title}</h4>
                  {f.subtitle && <p className="text-[11px] sm:text-xs text-gray-500 leading-relaxed hidden sm:block">{f.subtitle}</p>}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 10. FINAL CTA */}
        {setting && (
          <section className="relative overflow-hidden rounded-3xl text-white text-center py-12 sm:py-14 px-6 sm:px-8"
            style={{ background: 'linear-gradient(135deg, #4c0519 0%, #9f1239 50%, #e11d48 100%)' }}>
            <div className="absolute inset-0 pointer-events-none opacity-10"
              style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '28px 28px' }} />
            <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-white/5 blur-3xl" />
            <div className="relative">
              <div className="inline-flex items-center gap-2 bg-white/15 border border-white/25 text-xs font-bold uppercase tracking-wider px-4 py-1.5 rounded-full mb-5">
                🎉 Tham gia ngay
              </div>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold mb-3">
                {setting.finalCtaHeading}
              </h2>
              <p className="text-white/75 text-sm max-w-lg mx-auto mb-6 sm:mb-8 leading-relaxed">
                {setting.finalCtaSubtext}
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link href="/register"
                  className="inline-flex items-center justify-center gap-2 bg-white text-rose-700 font-bold text-sm px-6 sm:px-8 py-3.5 rounded-xl shadow-lg hover:shadow-xl hover:bg-rose-50 transition-all">
                  Tạo tài khoản miễn phí
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6"/>
                  </svg>
                </Link>
                <Link href="/products"
                  className="inline-flex items-center justify-center gap-2 border-2 border-white/30 text-white font-semibold text-sm px-6 sm:px-8 py-3.5 rounded-xl hover:bg-white/10 transition-all">
                  Xem sản phẩm
                </Link>
              </div>
            </div>
          </section>
        )}

      </div>
    </div>
  );
}
