'use client';

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useRef, useState, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';
import api from '@/lib/axios';
import { Product } from '@/types';
import { formatPrice } from '@/lib/utils';

const NAV_LINKS = [
  { href: '/products',            label: 'Tất cả sản phẩm' },
  { href: '/products?sort=price', label: 'Giá tốt nhất'    },
];

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const { cartCount } = useCart();
  const router   = useRouter();
  const pathname = usePathname();

  const [mobileOpen,   setMobileOpen]   = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [scrolled,     setScrolled]     = useState(false);
  const [searchQuery,  setSearchQuery]  = useState('');
  const [suggestions,  setSuggestions]  = useState<Product[]>([]);
  const [showSuggest,  setShowSuggest]  = useState(false);
  const [searching,    setSearching]    = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const searchRef   = useRef<HTMLDivElement>(null);
  const searchRefMobile = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node))
        setUserMenuOpen(false);
      // Close suggestions only when click is outside BOTH search containers
      const inDesktop = searchRef.current && searchRef.current.contains(e.target as Node);
      const inMobile  = searchRefMobile.current && searchRefMobile.current.contains(e.target as Node);
      if (!inDesktop && !inMobile) setShowSuggest(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => { setMobileOpen(false); setShowSuggest(false); }, [pathname]);

  const fetchSuggestions = useCallback(async (q: string) => {
    if (q.trim().length < 2) { setSuggestions([]); setShowSuggest(false); return; }
    setSearching(true);
    try {
      const { data } = await api.get('/products', { params: { search: q, limit: 6 } });
      setSuggestions(data.data.items || []);
      setShowSuggest(true);
    } catch {
      setSuggestions([]);
    } finally {
      setSearching(false);
    }
  }, []);

  const handleInputChange = (val: string) => {
    setSearchQuery(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchSuggestions(val), 300);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchQuery.trim();
    if (q) { setShowSuggest(false); router.push(`/products?search=${encodeURIComponent(q)}`); }
  };

  const handleSuggestionClick = (product: Product) => {
    setShowSuggest(false);
    setSearchQuery('');
    router.push(`/products/${product._id}`);
  };

  const handleLogout = async () => {
    await logout();
    toast.success('Hẹn gặp lại!');
    router.push('/');
    setUserMenuOpen(false);
  };

  return (
    <header className={cn(
      'sticky top-0 z-50 transition-all duration-300',
      scrolled
        ? 'bg-white/95 backdrop-blur-md shadow-[0_2px_20px_rgba(0,0,0,0.08)]'
        : 'bg-white border-b border-gray-100'
    )}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-[68px] items-center gap-3 lg:gap-5">

          {/* ── Logo ────────────────────────────────────────── */}
          <Link href="/" className="flex items-center gap-2.5 shrink-0 group">
            {/* Icon */}
            <div className="relative h-9 w-9 shrink-0">
              <div className="absolute inset-0 rounded-[10px] gradient-brand shadow-md
                              group-hover:shadow-primary-500/40 group-hover:scale-105
                              transition-all duration-200" />
              <div className="relative h-full w-full flex items-center justify-center">
                <svg className="h-[18px] w-[18px] text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 3H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V5a2 2 0 00-2-2zm-3
                           10h-3v3a1 1 0 01-2 0v-3H8a1 1 0 010-2h3V8a1 1 0 012 0v3h3a1 1 0 010 2z"/>
                </svg>
              </div>
            </div>
            {/* Text */}
            <div className="leading-none">
              <p className="font-black text-[17px] text-gray-900 tracking-tight">
                Derma<span className="text-primary-600">Pure</span>
              </p>
              <p className="hidden sm:block text-[10px] text-gray-400 font-medium tracking-wide mt-0.5">
                Dược mỹ phẩm da liễu
              </p>
            </div>
          </Link>

          {/* ── Desktop nav links ────────────────────────────── */}
          <nav className="hidden lg:flex items-center gap-0.5 shrink-0">
            {NAV_LINKS.map((link) => (
              <Link key={link.href} href={link.href}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap',
                  pathname === link.href
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                )}>
                {link.label}
              </Link>
            ))}
          </nav>

          {/* ── Search bar (always visible, pill design) ─────── */}
          <form onSubmit={handleSearch} className="hidden sm:flex flex-1 min-w-0 max-w-[480px] mx-auto">
            <div className="relative w-full" ref={searchRef}>
              <div className={cn(
                'flex items-center gap-2 bg-gray-50 border rounded-full px-4 py-2',
                'transition-all duration-200',
                showSuggest
                  ? 'bg-white border-primary-400 ring-2 ring-primary-500/20 shadow-md'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-white'
              )}>
                {/* Search / spinner icon */}
                {searching ? (
                  <svg className="h-4 w-4 text-primary-500 animate-spin shrink-0" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                ) : (
                  <svg className="h-4 w-4 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                  </svg>
                )}

                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => handleInputChange(e.target.value)}
                  onFocus={() => suggestions.length > 0 && setShowSuggest(true)}
                  placeholder="Tìm serum, kem chống nắng, trị mụn…"
                  className="flex-1 bg-transparent text-sm text-gray-900 placeholder:text-gray-400
                             focus:outline-none min-w-0"
                  autoComplete="off"
                />

                {/* Clear button */}
                {searchQuery && (
                  <button type="button" onClick={() => { setSearchQuery(''); setSuggestions([]); setShowSuggest(false); }}
                    className="text-gray-300 hover:text-gray-500 shrink-0 transition-colors">
                    <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12"/>
                    </svg>
                  </button>
                )}

                {/* Submit button */}
                <button type="submit"
                  className="shrink-0 bg-primary-600 hover:bg-primary-700 text-white
                             text-xs font-bold px-3.5 py-1.5 rounded-full transition-colors
                             shadow-sm hover:shadow-md whitespace-nowrap">
                  Tìm kiếm
                </button>
              </div>

              {/* Suggestions dropdown */}
              {showSuggest && suggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl
                                shadow-[0_8px_32px_rgba(0,0,0,0.12)] border border-gray-100
                                overflow-hidden z-50">
                  <div className="px-4 py-2.5 border-b border-gray-50 bg-gray-50/50">
                    <p className="text-[11px] text-gray-400 font-semibold uppercase tracking-wider">
                      Gợi ý tìm kiếm
                    </p>
                  </div>
                  <ul>
                    {suggestions.map((p) => (
                      <li key={p._id}>
                        <button type="button" onClick={() => handleSuggestionClick(p)}
                          className="w-full flex items-center gap-3 px-4 py-2.5
                                     hover:bg-primary-50 transition-colors text-left group/item">
                          <div className="h-10 w-10 rounded-xl bg-gray-100 overflow-hidden shrink-0
                                          group-hover/item:ring-2 group-hover/item:ring-primary-200 transition-all">
                            {p.images?.[0]
                              // eslint-disable-next-line @next/next/no-img-element
                              ? <img src={p.images[0]} alt={p.name} className="h-full w-full object-cover" />
                              : <div className="h-full w-full flex items-center justify-center text-lg">💊</div>}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate
                                          group-hover/item:text-primary-700">{p.name}</p>
                            <p className="text-xs text-gray-400 truncate">
                              {typeof p.category === 'object' ? p.category.name : ''}
                            </p>
                          </div>
                          <span className="text-sm font-bold text-primary-600 shrink-0">
                            {formatPrice(p.price)}
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                  <div className="border-t border-gray-100 bg-gray-50/30">
                    <button type="submit"
                      className="w-full px-4 py-2.5 text-sm font-semibold text-primary-600
                                 hover:bg-primary-50 transition-colors text-center flex items-center
                                 justify-center gap-1.5">
                      <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                      </svg>
                      Xem tất cả kết quả cho &ldquo;{searchQuery}&rdquo;
                    </button>
                  </div>
                </div>
              )}
            </div>
          </form>

          {/* ── Actions ─────────────────────────────────────── */}
          <div className="flex items-center gap-1 shrink-0 ml-auto sm:ml-0">

            {/* Cart */}
            <Link href="/cart"
              className="relative flex items-center gap-1.5 px-3 py-2 rounded-xl
                         text-gray-600 hover:text-primary-600 hover:bg-primary-50
                         transition-colors group/cart"
              aria-label={`Giỏ hàng (${cartCount} sản phẩm)`}>
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184
                     1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/>
              </svg>
              {cartCount > 0 && (
                <>
                  <span className="absolute -top-0.5 -right-0.5 flex h-[18px] w-[18px] items-center
                                   justify-center rounded-full bg-red-500 text-white text-[10px]
                                   font-extrabold ring-2 ring-white">
                    {cartCount > 9 ? '9+' : cartCount}
                  </span>
                  <span className="hidden lg:block text-xs font-semibold text-primary-600 transition-colors">
                    {cartCount}
                  </span>
                </>
              )}
            </Link>

            {/* User menu */}
            {isAuthenticated ? (
              <div className="relative" ref={userMenuRef}>
                {/* Mobile: direct link to /profile */}
                <Link
                  href="/profile"
                  className="md:hidden flex items-center gap-2 px-2 py-1.5 rounded-xl hover:bg-gray-100 transition-colors"
                  aria-label="Tài khoản của tôi"
                >
                  <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-rose-600 to-pink-500 flex items-center justify-center text-white text-xs font-black shrink-0 shadow-sm">
                    {user?.name?.[0]?.toUpperCase()}
                  </div>
                </Link>

                {/* Desktop: dropdown trigger */}
                <button
                  onClick={() => setUserMenuOpen((p) => !p)}
                  className={cn(
                    'hidden md:flex items-center gap-2 pl-1.5 pr-2.5 py-1.5 rounded-xl',
                    'text-sm font-medium transition-colors',
                    userMenuOpen ? 'bg-primary-50 text-primary-700' : 'hover:bg-gray-100'
                  )}>
                  <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-rose-600 to-pink-500 flex items-center justify-center text-white text-xs font-black shrink-0 shadow-sm">
                    {user?.name?.[0]?.toUpperCase()}
                  </div>
                  <span className="text-gray-700 max-w-[80px] truncate text-[13px] font-semibold">
                    {user?.name.split(' ').pop()}
                  </span>
                  <svg className={cn('h-3.5 w-3.5 text-gray-400 transition-transform duration-200',
                    userMenuOpen && 'rotate-180')}
                    fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7"/>
                  </svg>
                </button>

                {userMenuOpen && (
                  <div className="hidden md:block absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl
                                  shadow-[0_8px_32px_rgba(0,0,0,0.12)] border border-gray-100
                                  py-1.5 z-10"
                    style={{ animation: 'scaleIn 0.15s ease-out' }}>
                    <div className="px-4 py-3 border-b border-gray-50">
                      <div className="flex items-center gap-2.5">
                        <div className="h-9 w-9 rounded-xl gradient-brand flex items-center justify-center
                                        text-white text-sm font-black shadow-sm shrink-0">
                          {user?.name?.[0]?.toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-gray-900 truncate">{user?.name}</p>
                          <p className="text-xs text-gray-400 truncate">{user?.email}</p>
                        </div>
                      </div>
                    </div>
                    <div className="py-1">
                      {(user?.role === 'admin' || user?.role === 'staff' || user?.role === 'sales') && (
                        <Link href="/admin" onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700
                                     hover:bg-primary-50 hover:text-primary-700 transition-colors">
                          <span className="text-base">📊</span>
                          <span>Quản trị</span>
                        </Link>
                      )}
                      <Link href="/profile" onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700
                                   hover:bg-gray-50 transition-colors">
                        <span className="text-base">👤</span>
                        <span>Tài khoản của tôi</span>
                      </Link>
                      <Link href="/orders" onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700
                                   hover:bg-gray-50 transition-colors">
                        <span className="text-base">📦</span>
                        <span>Đơn hàng của tôi</span>
                      </Link>
                    </div>
                    <div className="border-t border-gray-100 py-1">
                      <button onClick={handleLogout}
                        className="flex items-center gap-3 w-full px-4 py-2.5 text-sm
                                   text-red-500 hover:bg-red-50 transition-colors">
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
                        </svg>
                        <span>Đăng xuất</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/login"
                  className="hidden sm:inline-flex items-center px-4 py-2 rounded-xl
                             text-sm font-semibold text-gray-700 hover:bg-gray-100 transition-colors">
                  Đăng nhập
                </Link>
                <Link href="/register"
                  className="inline-flex items-center px-4 py-2 rounded-xl text-sm font-bold
                             bg-primary-600 hover:bg-primary-700 text-white shadow-sm
                             hover:shadow-md transition-all">
                  Đăng ký
                </Link>
              </div>
            )}

            {/* Mobile hamburger */}
            <button onClick={() => setMobileOpen((p) => !p)}
              className="md:hidden p-2.5 rounded-xl text-gray-600 hover:bg-gray-100 transition-colors ml-0.5">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileOpen
                  ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
                  : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16"/>}
              </svg>
            </button>
          </div>
        </div>

        {/* ── Mobile search ────────────────────────────────── */}
        <div className="sm:hidden pb-3" ref={searchRefMobile}>
          <form onSubmit={handleSearch} className="relative">
            <div className="flex items-center gap-2 bg-gray-50 border border-gray-200
                            rounded-full px-4 py-2.5 focus-within:bg-white
                            focus-within:border-primary-400 focus-within:ring-2
                            focus-within:ring-primary-500/20 transition-all duration-200">
              <svg className="h-4 w-4 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
              </svg>
              <input type="search" value={searchQuery}
                onChange={(e) => handleInputChange(e.target.value)}
                onFocus={() => suggestions.length > 0 && setShowSuggest(true)}
                placeholder="Tìm serum, kem chống nắng…"
                className="flex-1 bg-transparent text-sm text-gray-900 placeholder:text-gray-400
                           focus:outline-none" />
              {searching && (
                <svg className="h-4 w-4 text-gray-400 animate-spin shrink-0" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
              )}
              <button type="submit"
                className="shrink-0 bg-primary-600 hover:bg-primary-700 text-white
                           text-xs font-bold px-3 py-1.5 rounded-full transition-colors">
                Tìm
              </button>
            </div>

            {/* Mobile suggestions dropdown */}
            {showSuggest && suggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl
                              shadow-[0_8px_32px_rgba(0,0,0,0.12)] border border-gray-100
                              overflow-hidden z-50 max-h-[60dvh] overflow-y-auto">
                <div className="px-4 py-2 border-b border-gray-50 bg-gray-50/50 sticky top-0">
                  <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">
                    Gợi ý tìm kiếm
                  </p>
                </div>
                <ul>
                  {suggestions.map((p) => (
                    <li key={p._id}>
                      <button type="button" onClick={() => handleSuggestionClick(p)}
                        className="w-full flex items-center gap-3 px-3 py-2 active:bg-primary-50 text-left">
                        <div className="h-10 w-10 rounded-lg bg-gray-100 overflow-hidden shrink-0">
                          {p.images?.[0]
                            // eslint-disable-next-line @next/next/no-img-element
                            ? <img src={p.images[0]} alt={p.name} className="h-full w-full object-cover" />
                            : <div className="h-full w-full flex items-center justify-center text-lg">💊</div>}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-gray-900 truncate">{p.name}</p>
                          <p className="text-[10px] text-gray-400 truncate">
                            {typeof p.category === 'object' ? p.category.name : ''}
                          </p>
                        </div>
                        <span className="text-xs font-bold text-primary-600 shrink-0">
                          {formatPrice(p.price)}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
                <div className="border-t border-gray-100 bg-gray-50/30">
                  <button type="submit"
                    className="w-full px-4 py-2.5 text-xs font-semibold text-primary-600 active:bg-primary-50 text-center flex items-center justify-center gap-1.5">
                    <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                    </svg>
                    Xem tất cả kết quả cho &ldquo;{searchQuery}&rdquo;
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>
      </div>

      {/* ── Mobile menu drawer ───────────────────────────── */}
      {mobileOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white px-4 py-3 space-y-1
                        shadow-[0_8px_24px_rgba(0,0,0,0.06)] max-h-[calc(100dvh-120px)] overflow-y-auto">

          {/* User card — when authenticated, links to /profile */}
          {isAuthenticated && user && (
            <Link href="/profile" onClick={() => setMobileOpen(false)}
              className="flex items-center gap-3 p-3 rounded-2xl mb-2 hover:shadow-md transition-all"
              style={{ background: 'linear-gradient(135deg,#fff1f2,#fecdd3)' }}>
              <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-rose-600 to-pink-500 flex items-center justify-center text-white text-base font-black shadow-md shrink-0">
                {user.name?.[0]?.toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-gray-900 truncate">{user.name}</p>
                <p className="text-xs text-gray-500 truncate">{user.phone || user.email}</p>
              </div>
              <svg className="h-5 w-5 text-rose-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7"/>
              </svg>
            </Link>
          )}

          {/* Navigation */}
          <Link href="/" onClick={() => setMobileOpen(false)}
            className={cn('flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors',
              pathname === '/' ? 'bg-primary-50 text-primary-700' : 'text-gray-700 hover:bg-gray-100')}>
            <span className="text-lg">🏠</span> Trang chủ
          </Link>
          {NAV_LINKS.map((link) => (
            <Link key={link.href} href={link.href} onClick={() => setMobileOpen(false)}
              className={cn('flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors',
                pathname === link.href ? 'bg-primary-50 text-primary-700' : 'text-gray-700 hover:bg-gray-100')}>
              <span className="text-lg">{link.href.includes('sort') ? '🏷️' : '✨'}</span> {link.label}
            </Link>
          ))}
          <Link href="/solutions/acne" onClick={() => setMobileOpen(false)}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors">
            <span className="text-lg">🌿</span> Liệu trình da liễu
          </Link>

          {/* Authenticated account section */}
          {isAuthenticated ? (
            <>
              <div className="pt-2 mt-2 border-t border-gray-100">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-3 mb-1">Khu vực cá nhân</p>
                <Link href="/profile" onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors">
                  <span className="text-lg">👤</span> Tài khoản của tôi
                </Link>
                <Link href="/orders" onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors">
                  <span className="text-lg">📦</span> Đơn hàng của tôi
                </Link>
                {(user?.role === 'admin' || user?.role === 'staff' || user?.role === 'sales') && (
                  <Link href="/admin" onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-rose-600 bg-rose-50 hover:bg-rose-100 transition-colors">
                    <span className="text-lg">📊</span> Trang quản trị
                  </Link>
                )}
                <button
                  onClick={() => { setMobileOpen(false); handleLogout(); }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition-colors">
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
                  </svg>
                  Đăng xuất
                </button>
              </div>
            </>
          ) : (
            <div className="pt-3 flex gap-2 border-t border-gray-100 mt-2">
              <Link href="/login" onClick={() => setMobileOpen(false)}
                className="flex-1 flex items-center justify-center py-2.5 rounded-xl
                           text-sm font-semibold border-2 border-rose-200 text-rose-600
                           hover:bg-rose-50 transition-colors">
                Đăng nhập
              </Link>
              <Link href="/register" onClick={() => setMobileOpen(false)}
                className="flex-1 flex items-center justify-center py-2.5 rounded-xl
                           text-sm font-bold text-white shadow-md transition-all"
                style={{ background: 'linear-gradient(135deg,#e11d48,#f43f5e)' }}>
                Đăng ký
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
