import type { Metadata, Viewport } from 'next';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { CartProvider } from '@/context/CartContext';
import { Toaster } from 'react-hot-toast';


export const metadata: Metadata = {
  title: {
    default: 'Lumié — Mỹ Phẩm Chính Hãng',
    template: '%s | Lumié',
  },
  description: 'Lumié — Mỹ phẩm chính hãng cho phụ nữ Việt. Tỏa sáng vẻ đẹp tự nhiên với serum, kem dưỡng, son môi và combo skincare cao cấp.',
  applicationName: 'Lumié',
  manifest: '/site.webmanifest',
};

export const viewport: Viewport = {
  themeColor: '#e11d48',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi">
      <body>
        <AuthProvider>
          <CartProvider>
            {children}
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 3000,
                style: { fontSize: '14px' },
              }}
            />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
