import Link from 'next/link';
import FloatContact from '@/components/ui/FloatContact';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 60%, #f0fdf4 100%)' }}>

      {/* Blobs */}
      <div className="absolute top-0 left-0 h-72 w-72 rounded-full bg-primary-200/25 blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
      <div className="absolute bottom-0 right-0 h-72 w-72 rounded-full bg-emerald-200/25 blur-3xl translate-x-1/2 translate-y-1/2 pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 h-96 w-96 rounded-full bg-blue-100/20 blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none" />

      {/* Top header — single logo, centered */}
      <div className="relative z-10 flex justify-center pt-10 pb-0">
        <Link href="/" className="group flex flex-col items-center gap-2">
          {/* Icon */}
          <div className="h-14 w-14 rounded-2xl gradient-brand flex items-center justify-center
                          shadow-lg shadow-primary-500/30 group-hover:shadow-primary-500/50
                          group-hover:scale-105 transition-all duration-200">
            <svg className="h-7 w-7 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M19 3H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V5a2 2 0 00-2-2zm-3
                       10h-3v3a1 1 0 01-2 0v-3H8a1 1 0 010-2h3V8a1 1 0 012 0v3h3a1 1 0 010 2z"/>
            </svg>
          </div>
          {/* Text */}
          <div className="text-center leading-none">
            <p className="font-black text-xl text-gray-900 tracking-tight">
              Derma<span className="text-primary-600">Pure</span>
            </p>
            <p className="text-[11px] text-gray-400 font-medium mt-1 tracking-wide">
              Dược mỹ phẩm chính hãng
            </p>
          </div>
        </Link>
      </div>

      {/* Page content */}
      <div className="relative z-10 flex-1 flex items-center justify-center px-4 py-8">
        {children}
      </div>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/60 bg-white/30 backdrop-blur-sm py-4 px-4">
        <div className="max-w-xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-gray-400">
          <p>© {new Date().getFullYear()} DermaPure. Tất cả quyền được bảo lưu.</p>
          <div className="flex items-center gap-4">
            <Link href="/products" className="hover:text-primary-600 transition-colors">Sản phẩm</Link>
            <Link href="/chinh-sach-bao-mat" className="hover:text-primary-600 transition-colors">Chính sách</Link>
            <a href="tel:1800123456" className="hover:text-primary-600 transition-colors">1800-123-456</a>
          </div>
        </div>
      </footer>

      {/* Customer-care contact icons — compact horizontal row at bottom-right so
          they don't overlap the centered login card. */}
      <FloatContact compact />
    </div>
  );
}
