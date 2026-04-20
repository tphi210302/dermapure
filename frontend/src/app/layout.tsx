import type { Metadata, Viewport } from 'next';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { CartProvider } from '@/context/CartContext';
import { Toaster } from 'react-hot-toast';


export const metadata: Metadata = {
  title: {
    default: 'DermaPure — Dược Mỹ Phẩm Chính Hãng',
    template: '%s | DermaPure',
  },
  description: 'Nền tảng dược mỹ phẩm chuyên khoa da liễu: trị mụn, mờ thâm, chống nắng. Sản phẩm chính hãng, tư vấn bởi dược sĩ da liễu.',
  applicationName: 'DermaPure',
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
