import Link from 'next/link';

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

export default function Footer() {
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
                Derma<span className="text-primary-400">Pure</span>
              </span>
            </Link>
            <p className="text-xs sm:text-sm text-gray-400 leading-relaxed mb-4">
              Nền tảng dược mỹ phẩm chuyên khoa da liễu: trị mụn, mờ thâm, chống nắng. Sản phẩm chính hãng, tư vấn bởi dược sĩ da liễu.
            </p>
            <div className="space-y-2 text-xs sm:text-sm">
              <div className="flex items-center gap-2 text-gray-400">
                <svg className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                </svg>
                support@pharma.com
              </div>
              <div className="flex items-center gap-2 text-gray-400">
                <svg className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
                </svg>
                1800-123-456
              </div>
              <div className="flex items-center gap-2 text-gray-500">
                <svg className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                T2–T7, 8:00–20:00
              </div>
            </div>

            {/* Social links */}
            <div className="mt-4">
              <p className="text-[10px] sm:text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2.5">Kết nối với chúng tôi</p>
              <div className="flex items-center gap-2">
                <a href="https://www.facebook.com/pharmashop" target="_blank" rel="noopener noreferrer" aria-label="Facebook"
                  className="h-8 w-8 rounded-xl bg-[#1877F2] flex items-center justify-center hover:bg-[#166FE5] hover:scale-105 transition-all duration-200 shadow-sm">
                  <svg className="h-3.5 w-3.5 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </a>
                <a href="https://zalo.me/pharmashop" target="_blank" rel="noopener noreferrer" aria-label="Zalo"
                  className="h-8 w-8 rounded-xl bg-[#0068FF] flex items-center justify-center hover:bg-[#0057D9] hover:scale-105 transition-all duration-200 shadow-sm">
                  <svg className="h-4 w-4 text-white" viewBox="0 0 32 32" fill="currentColor">
                    <path d="M16 2C8.268 2 2 8.268 2 16s6.268 14 14 14 14-6.268 14-14S23.732 2 16 2zm6.5 19.5H9.2l6.5-8.4H9.5V11H22.8l-6.5 8.4h6.2v2.1z"/>
                  </svg>
                </a>
              </div>
            </div>
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
        <div className="border-t border-gray-800 mt-6 sm:mt-10 pt-4 sm:pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-[10px] sm:text-xs text-gray-500">
            © {new Date().getFullYear()} DermaPure. Tất cả quyền được bảo lưu.
          </p>
          <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap justify-center">
            {['Visa', 'Mastercard', 'MoMo', 'ZaloPay', 'COD'].map((p) => (
              <span key={p} className="px-1.5 sm:px-2 py-0.5 sm:py-1 bg-gray-800 rounded-md text-[9px] sm:text-[10px] text-gray-400 font-medium border border-gray-700">
                {p}
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
