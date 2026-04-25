import Link from 'next/link';
import FloatContact from '@/components/ui/FloatContact';
import Logo from '@/components/branding/Logo';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #fff1f2 0%, #fce7f3 50%, #fef3c7 100%)' }}>

      {/* Blobs */}
      <div className="absolute top-0 left-0 h-72 w-72 rounded-full bg-rose-200/30 blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
      <div className="absolute bottom-0 right-0 h-72 w-72 rounded-full bg-amber-200/30 blur-3xl translate-x-1/2 translate-y-1/2 pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 h-96 w-96 rounded-full bg-pink-100/30 blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none" />

      {/* Top header — single logo, centered */}
      <div className="relative z-10 flex justify-center pt-10 pb-0">
        <Link href="/" className="group flex flex-col items-center gap-3">
          <Logo size="lg" />
          <p className="text-[11px] text-gray-500 font-medium tracking-wide italic">
            Mỹ phẩm chính hãng — Tỏa sáng tự nhiên
          </p>
        </Link>
      </div>

      {/* Page content */}
      <div className="relative z-10 flex-1 flex items-center justify-center px-4 py-8">
        {children}
      </div>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/60 bg-white/30 backdrop-blur-sm py-4 px-4">
        <div className="max-w-xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-gray-400">
          <p>© {new Date().getFullYear()} Lumie. Tất cả quyền được bảo lưu.</p>
          <div className="flex items-center gap-4">
            <Link href="/products" className="hover:text-primary-600 transition-colors">Sản phẩm</Link>
            <Link href="/chinh-sach-bao-mat" className="hover:text-primary-600 transition-colors">Chính sách</Link>
            <a href="tel:1800123456" className="hover:text-primary-600 transition-colors">1800-123-456</a>
          </div>
        </div>
      </footer>

      {/* Customer-care icons — hotline already in footer, so hide it here to save space */}
      <FloatContact hideHotline />
    </div>
  );
}
