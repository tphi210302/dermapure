'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { cmsService, type SiteSetting } from '@/services/cms.service';

const LINKS = {
  'Mua sắm': [
    { href: '/products',            label: 'Tất cả sản phẩm' },
    { href: '/products?sort=price', label: 'Giá tốt nhất' },
    { href: '/cart',                label: 'Giỏ hàng' },
    { href: '/orders',              label: 'Đơn hàng của tôi' },
  ],
  'Công ty': [
    { href: '/ve-chung-toi',      label: 'Về chúng tôi' },
    { href: '/ve-chung-toi#team', label: 'Tuyển dụng' },
    { href: '/ve-chung-toi',      label: 'Báo chí' },
    { href: '/products',          label: 'Sản phẩm nổi bật' },
  ],
  'Pháp lý': [
    { href: '/chinh-sach-bao-mat',        label: 'Chính sách bảo mật' },
    { href: '/dieu-khoan-dich-vu',        label: 'Điều khoản dịch vụ' },
    { href: '/chinh-sach-bao-mat#cookie', label: 'Chính sách cookie' },
  ],
};

// Sensible defaults in case the settings fetch fails (offline, cold start, etc.)
const FALLBACK: Partial<SiteSetting> = {
  siteName:  'DermaPure',
  tagline:   'Nền tảng dược mỹ phẩm chuyên khoa da liễu: trị mụn, mờ thâm, chống nắng. Sản phẩm chính hãng, tư vấn bởi dược sĩ da liễu.',
  hotline:   '1800-123-456',
  email:     'support@dermapure.vn',
  address:   'Số 1 Đại Cồ Việt, Hai Bà Trưng, Hà Nội',
  facebook:  'https://www.facebook.com/pharmashop',
  zalo:      'https://zalo.me/pharmashop',
};

export default function Footer() {
  const [s, setS] = useState<Partial<SiteSetting>>(FALLBACK);

  useEffect(() => {
    cmsService.getSetting()
      .then(({ data }: any) => { if (data?.data) setS(data.data); })
      .catch(() => {});
  }, []);

  const telHref = `tel:${(s.hotline || '').replace(/\s|-/g, '')}`;
  const mailHref = `mailto:${s.email || ''}`;

  return (
    <footer className="bg-gray-900 text-gray-300 mt-16">
      {/* Trust banner */}
      <div className="bg-primary-600 py-3 sm:py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center justify-center gap-3 sm:gap-10">
            {[
              { icon: '🚚', text: 'Miễn phí giao hàng trên 500K' },
              { icon: '✅', text: '100% hàng chính hãng' },
              { icon: '🔒', text: 'Thanh toán an toàn' },
              { icon: '🔄', text: 'Đổi trả trong 7 ngày' },
            ].map((b) => (
              <div key={b.text} className="flex items-center gap-1.5 text-white">
                <span className="text-sm">{b.icon}</span>
                <span className="text-white/90 text-xs sm:text-sm font-medium">{b.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5 sm:gap-8">
          {/* Brand column */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="inline-flex items-center gap-2 mb-3 group">
              <div className="h-8 w-8 sm:h-9 sm:w-9 rounded-xl gradient-brand flex items-center justify-center text-white font-bold text-sm sm:text-base shadow-md">
                ✚
              </div>
              <span className="font-extrabold text-base sm:text-lg text-white">
                {(s.siteName || 'DermaPure').split('').slice(0, 5).join('') === 'Derma' && (s.siteName || 'DermaPure').slice(5) ? (
                  <>Derma<span className="text-primary-400">{(s.siteName || 'DermaPure').slice(5)}</span></>
                ) : (s.siteName || 'DermaPure')}
              </span>
            </Link>
            <p className="text-xs sm:text-sm text-gray-400 leading-relaxed mb-4">
              {s.tagline}
            </p>
            <div className="space-y-2 text-xs sm:text-sm">
              {s.email && (
                <a href={mailHref} className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
                  <svg className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                  </svg>
                  {s.email}
                </a>
              )}
              {s.hotline && (
                <a href={telHref} className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
                  <svg className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
                  </svg>
                  {s.hotline}
                </a>
              )}
              {s.address && (
                <div className="flex items-start gap-2 text-gray-400">
                  <svg className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M17.657 16.657L13.414 20.9a2 2 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                  </svg>
                  <span className="leading-relaxed">{s.address}</span>
                </div>
              )}
              <div className="flex items-center gap-2 text-gray-500">
                <svg className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                T2–T7, 8:00–20:00
              </div>
            </div>

            {/* Social links — show only what's configured */}
            {(s.facebook || s.zalo || s.instagram || s.tiktok) && (
              <div className="mt-4">
                <p className="text-[10px] sm:text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2.5">Kết nối với chúng tôi</p>
                <div className="flex items-center gap-2">
                  {s.facebook && (
                    <a href={s.facebook} target="_blank" rel="noopener noreferrer" aria-label="Facebook"
                      className="h-8 w-8 rounded-xl bg-[#1877F2] flex items-center justify-center hover:bg-[#166FE5] hover:scale-105 transition-all duration-200 shadow-sm">
                      <svg className="h-3.5 w-3.5 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                      </svg>
                    </a>
                  )}
                  {s.zalo && (
                    <a href={s.zalo} target="_blank" rel="noopener noreferrer" aria-label="Zalo"
                      className="h-8 w-8 rounded-xl bg-[#0068FF] flex items-center justify-center hover:bg-[#0057D9] hover:scale-105 transition-all duration-200 shadow-sm">
                      <svg className="h-4 w-4 text-white" viewBox="0 0 32 32" fill="currentColor">
                        <path d="M16 2C8.268 2 2 8.268 2 16s6.268 14 14 14 14-6.268 14-14S23.732 2 16 2zm6.5 19.5H9.2l6.5-8.4H9.5V11H22.8l-6.5 8.4h6.2v2.1z"/>
                      </svg>
                    </a>
                  )}
                  {s.instagram && (
                    <a href={s.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram"
                      className="h-8 w-8 rounded-xl bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 flex items-center justify-center hover:scale-105 transition-all duration-200 shadow-sm">
                      <svg className="h-4 w-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
                      </svg>
                    </a>
                  )}
                  {s.tiktok && (
                    <a href={s.tiktok} target="_blank" rel="noopener noreferrer" aria-label="TikTok"
                      className="h-8 w-8 rounded-xl bg-black flex items-center justify-center hover:scale-105 transition-all duration-200 shadow-sm">
                      <svg className="h-4 w-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005.8 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1.84-.1z"/>
                      </svg>
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Link columns */}
          {Object.entries(LINKS).map(([title, links]) => (
            <div key={title}>
              <h4 className="font-bold text-white text-xs sm:text-sm mb-3">{title}</h4>
              <ul className="space-y-2">
                {links.map(({ href, label }) => (
                  <li key={label}>
                    <Link href={href} className="text-xs sm:text-sm text-gray-400 hover:text-white transition-colors">
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="border-t border-gray-800 mt-6 sm:mt-10 pt-4 sm:pt-6 text-center">
          <p className="text-[10px] sm:text-xs text-gray-500">
            © {new Date().getFullYear()} {s.siteName || 'DermaPure'}. Tất cả quyền được bảo lưu.
          </p>
        </div>
      </div>
    </footer>
  );
}
