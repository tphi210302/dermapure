import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import BottomNav from '@/components/layout/BottomNav';
import MiniCart from '@/components/ui/MiniCart';
import FloatContact from '@/components/ui/FloatContact';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 pb-16 md:pb-0">{children}</main>
      <Footer />
      {/* Spacer so mobile BottomNav doesn't cover the footer bottom */}
      <div className="h-16 md:hidden shrink-0" />
      <BottomNav />
      <MiniCart />
      <FloatContact />
    </div>
  );
}
