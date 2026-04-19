'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import AdminSidebar from '@/components/layout/AdminSidebar';
import Spinner from '@/components/ui/Spinner';
import toast from 'react-hot-toast';

const IDLE_TIMEOUT_MS = 15 * 60 * 1000;
const WARN_BEFORE_MS  = 60 * 1000;

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading, isAuthenticated, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [warnOpen,    setWarnOpen]    = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(Math.floor(WARN_BEFORE_MS / 1000));
  const logoutTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const warnTimerRef   = useRef<ReturnType<typeof setTimeout> | null>(null);
  const tickRef        = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) router.replace('/login?redirect=/admin');
      else if (user?.role !== 'admin') router.replace('/');
    }
  }, [isLoading, isAuthenticated, user, router]);

  // Idle-timeout auto logout (admin only)
  useEffect(() => {
    if (user?.role !== 'admin') return;

    const clearTimers = () => {
      if (logoutTimerRef.current) { clearTimeout(logoutTimerRef.current); logoutTimerRef.current = null; }
      if (warnTimerRef.current)   { clearTimeout(warnTimerRef.current);   warnTimerRef.current   = null; }
      if (tickRef.current)        { clearInterval(tickRef.current);       tickRef.current        = null; }
    };

    const doLogout = async () => {
      clearTimers();
      setWarnOpen(false);
      await logout();
      toast.error('Phiên đăng nhập hết hạn do không hoạt động. Vui lòng đăng nhập lại.', { duration: 6000 });
      router.replace('/login?redirect=/admin');
    };

    const resetTimers = () => {
      clearTimers();
      setWarnOpen(false);
      warnTimerRef.current = setTimeout(() => {
        setSecondsLeft(Math.floor(WARN_BEFORE_MS / 1000));
        setWarnOpen(true);
        tickRef.current = setInterval(() => {
          setSecondsLeft((s) => (s > 0 ? s - 1 : 0));
        }, 1000);
      }, IDLE_TIMEOUT_MS - WARN_BEFORE_MS);
      logoutTimerRef.current = setTimeout(doLogout, IDLE_TIMEOUT_MS);
    };

    const activityEvents = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll'] as const;
    const onActivity = () => {
      if (!warnOpen) resetTimers();
    };
    activityEvents.forEach((e) => window.addEventListener(e, onActivity, { passive: true }));

    resetTimers();

    return () => {
      clearTimers();
      activityEvents.forEach((e) => window.removeEventListener(e, onActivity));
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.role]);

  const stayLoggedIn = () => {
    if (logoutTimerRef.current) clearTimeout(logoutTimerRef.current);
    if (warnTimerRef.current)   clearTimeout(warnTimerRef.current);
    if (tickRef.current)        clearInterval(tickRef.current);
    setWarnOpen(false);
    // Kick a fresh idle cycle
    warnTimerRef.current = setTimeout(() => {
      setSecondsLeft(Math.floor(WARN_BEFORE_MS / 1000));
      setWarnOpen(true);
      tickRef.current = setInterval(() => setSecondsLeft((s) => (s > 0 ? s - 1 : 0)), 1000);
    }, IDLE_TIMEOUT_MS - WARN_BEFORE_MS);
    logoutTimerRef.current = setTimeout(async () => {
      setWarnOpen(false);
      await logout();
      toast.error('Phiên đăng nhập hết hạn do không hoạt động. Vui lòng đăng nhập lại.', { duration: 6000 });
      router.replace('/login?redirect=/admin');
    }, IDLE_TIMEOUT_MS);
  };

  // Auto-close sidebar when route changes (mobile)
  useEffect(() => { setSidebarOpen(false); }, [pathname]);

  if (isLoading || !isAuthenticated || user?.role !== 'admin') {
    return <div className="flex items-center justify-center min-h-screen"><Spinner size="lg" /></div>;
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 min-w-0 flex flex-col">
        {/* Top bar */}
        <header className="bg-white border-b border-gray-100 px-4 sm:px-6 py-3.5 flex items-center justify-between sticky top-0 z-30 shadow-sm">
          <div className="flex items-center gap-3">
            {/* Hamburger — mobile only */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-1.5 -ml-1.5 text-gray-600 hover:bg-gray-100 rounded-md"
              aria-label="Mở menu"
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16"/>
              </svg>
            </button>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs text-gray-400 font-medium hidden sm:inline">Quản trị hệ thống</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-rose-600 to-pink-500 flex items-center justify-center text-white text-xs font-bold shadow-sm">
              {user.name?.[0]?.toUpperCase()}
            </div>
            <div className="hidden sm:block">
              <p className="text-sm font-semibold text-gray-800 leading-none">{user.name}</p>
              <p className="text-[11px] text-gray-400 mt-0.5">{user.email}</p>
            </div>
          </div>
        </header>

        <main className="p-4 sm:p-6">{children}</main>
      </div>

      {/* Idle timeout warning */}
      {warnOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="h-12 w-12 bg-amber-100 rounded-full flex items-center justify-center text-2xl">
                ⏱️
              </div>
              <div>
                <h3 className="font-extrabold text-gray-900 text-lg">Phiên sắp hết hạn</h3>
                <p className="text-xs text-gray-500">Vì lý do bảo mật</p>
              </div>
            </div>
            <p className="text-sm text-gray-700 mb-4">
              Bạn sẽ bị đăng xuất sau{' '}
              <span className="font-extrabold text-rose-600">{secondsLeft}s</span> do không hoạt động.
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={async () => {
                  if (logoutTimerRef.current) clearTimeout(logoutTimerRef.current);
                  if (warnTimerRef.current)   clearTimeout(warnTimerRef.current);
                  if (tickRef.current)        clearInterval(tickRef.current);
                  setWarnOpen(false);
                  await logout();
                  router.replace('/login');
                }}
                className="flex-1 py-2.5 font-bold rounded-xl border-2 border-gray-200 text-gray-700 hover:bg-gray-50 text-sm"
              >
                Đăng xuất
              </button>
              <button
                type="button"
                onClick={stayLoggedIn}
                className="flex-1 py-2.5 font-extrabold text-white rounded-xl shadow-lg text-sm"
                style={{ background: 'linear-gradient(135deg,#e11d48,#f43f5e)' }}
              >
                Tiếp tục
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
