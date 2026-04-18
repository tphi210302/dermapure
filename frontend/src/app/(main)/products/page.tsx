'use client';

import { Suspense, useCallback, useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Product, PaginatedResponse, Pagination } from '@/types';
import { productService } from '@/services/product.service';
import ProductCard from '@/components/product/ProductCard';
import ProductFilter from '@/components/product/ProductFilter';
import PaginationComp from '@/components/ui/Pagination';
import { cn } from '@/lib/utils';

const DEFAULT_FILTERS = {
  search: '', category: '', minPrice: '', maxPrice: '', sort: '-createdAt',
};

const SkeletonCard = () => (
  <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
    <div className="skeleton" style={{ paddingBottom: '100%' }} />
    <div className="p-4 space-y-2">
      <div className="skeleton h-3 w-20 rounded" />
      <div className="skeleton h-4 w-full rounded" />
      <div className="skeleton h-4 w-2/3 rounded" />
      <div className="skeleton h-3 w-16 rounded mt-2" />
      <div className="skeleton h-9 w-full rounded-xl mt-3" />
    </div>
  </div>
);

function ProductsContent() {
  const searchParams = useSearchParams();
  const [products, setProducts]     = useState<Product[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading]       = useState(true);
  const [page, setPage]             = useState(1);
  const [view, setView]             = useState<'grid' | 'list'>('grid');
  const [filterOpen, setFilterOpen] = useState(false);
  const [filters, setFilters]       = useState({
    ...DEFAULT_FILTERS,
    search:   searchParams.get('search')   || '',
    category: searchParams.get('category') || '',
    sort:     searchParams.get('sort')     || '-createdAt',
  });
  // Tracks local (pending) state of ProductFilter — used by mobile sheet's external Apply button
  const [mobileLocal, setMobileLocal] = useState(filters);

  const gridRef = useRef<HTMLDivElement>(null);

  const fetchProducts = useCallback(async (f = filters, p = page) => {
    setLoading(true);
    try {
      const params = {
        page: p, limit: 12,
        ...(f.search   && { search:   f.search }),
        ...(f.category && { category: f.category }),
        ...(f.minPrice && { minPrice: Number(f.minPrice) }),
        ...(f.maxPrice && { maxPrice: Number(f.maxPrice) }),
        sort: f.sort,
      };
      const { data } = await productService.getAll(params);
      const resp = data as PaginatedResponse<Product>;
      setProducts(resp.data.items);
      setPagination(resp.data.pagination);
    } finally {
      setLoading(false);
    }
  }, [filters, page]);

  // Re-apply URL params whenever searchParams change (e.g. navigating from banner)
  useEffect(() => {
    const newFilters = {
      ...DEFAULT_FILTERS,
      search:   searchParams.get('search')   || '',
      category: searchParams.get('category') || '',
      sort:     searchParams.get('sort')     || '-createdAt',
    };
    setFilters(newFilters);
    setPage(1);
    fetchProducts(newFilters, 1);
  }, [searchParams]); // eslint-disable-line

  const handleFilterChange = (newFilters: typeof DEFAULT_FILTERS) => {
    setFilters(newFilters);
    setPage(1);
    fetchProducts(newFilters, 1);
    setFilterOpen(false);
    gridRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">Tất cả sản phẩm</h1>
          {pagination && !loading && (
            <p className="text-sm text-gray-500 mt-0.5">
              Tìm thấy {pagination.total.toLocaleString()} sản phẩm
            </p>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Mobile filter toggle */}
          <button
            onClick={() => setFilterOpen((p) => !p)}
            className="lg:hidden flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:border-primary-300 hover:text-primary-600 transition-colors"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z"/>
            </svg>
            Bộ lọc
            {(filters.category || filters.minPrice || filters.maxPrice) && (
              <span className="h-4 w-4 rounded-full bg-primary-600 text-white text-[9px] font-bold flex items-center justify-center">!</span>
            )}
          </button>

          {/* View toggle */}
          <div className="hidden sm:flex items-center border border-gray-200 rounded-xl overflow-hidden">
            <button
              onClick={() => setView('grid')}
              className={cn('p-2 transition-colors', view === 'grid' ? 'bg-primary-600 text-white' : 'text-gray-400 hover:text-gray-700')}
              aria-label="Grid view"
            >
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zm0 8a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zm6-6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zm0 8a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"/>
              </svg>
            </button>
            <button
              onClick={() => setView('list')}
              className={cn('p-2 transition-colors', view === 'list' ? 'bg-primary-600 text-white' : 'text-gray-400 hover:text-gray-700')}
              aria-label="List view"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16"/>
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile filter — bottom sheet with fixed Apply footer */}
      {filterOpen && (() => {
        // Count active selections in pending (local) state
        const pendingCount =
          (mobileLocal.category ? 1 : 0) +
          (mobileLocal.minPrice || mobileLocal.maxPrice ? 1 : 0) +
          (mobileLocal.sort && mobileLocal.sort !== '-createdAt' ? 1 : 0);
        const hasChanges =
          mobileLocal.category !== filters.category ||
          mobileLocal.minPrice !== filters.minPrice ||
          mobileLocal.maxPrice !== filters.maxPrice ||
          mobileLocal.sort     !== filters.sort;

        return (
        <div className="lg:hidden fixed inset-0 z-[60] flex flex-col justify-end">
          <div className="absolute inset-0 bg-black/50" onClick={() => setFilterOpen(false)} />
          <div className="relative bg-white rounded-t-3xl shadow-2xl flex flex-col"
            style={{ maxHeight: '88dvh' }}>
            {/* Top bar */}
            <div className="shrink-0 flex items-center justify-between px-4 py-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-gray-900 text-sm">Bộ lọc sản phẩm</span>
                {pendingCount > 0 && (
                  <span className="inline-flex items-center justify-center h-5 min-w-[20px] px-1.5 bg-rose-600 text-white text-[10px] font-black rounded-full">
                    {pendingCount}
                  </span>
                )}
              </div>
              <button onClick={() => setFilterOpen(false)}
                className="p-1.5 -mr-1 rounded-lg hover:bg-gray-100">
                <svg className="h-5 w-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            </div>

            {/* Scrollable filter content */}
            <div className="overflow-y-auto overscroll-contain flex-1 min-h-0 px-4 pt-4 pb-4">
              <ProductFilter
                filters={filters}
                onChange={handleFilterChange}
                hideApplyFooter
                onLocalChange={setMobileLocal}
              />
            </div>

            {/* Fixed Apply footer — ALWAYS VISIBLE */}
            <div className="shrink-0 px-4 py-3 border-t-2 border-rose-200 bg-white shadow-[0_-4px_12px_rgba(0,0,0,0.08)]"
              style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 0.75rem)' }}>
              <button
                onClick={() => handleFilterChange(mobileLocal)}
                disabled={!hasChanges}
                className="w-full py-3.5 text-sm font-extrabold text-white rounded-xl shadow-lg active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                style={{ background: 'linear-gradient(135deg,#e11d48,#f43f5e,#fb7185)' }}
              >
                {hasChanges
                  ? <>✓ Áp dụng bộ lọc {pendingCount > 0 && `(${pendingCount})`}</>
                  : <>Chưa có thay đổi</>}
              </button>
            </div>
          </div>
        </div>
        );
      })()}

      <div className="flex flex-col lg:flex-row gap-6" ref={gridRef}>
        {/* Sidebar */}
        <aside className="hidden lg:block w-64 shrink-0">
          <div className="sticky top-24">
            <ProductFilter filters={filters} onChange={handleFilterChange} />
          </div>
        </aside>

        {/* Product grid */}
        <div className="flex-1 min-w-0">
          {loading ? (
            <div className={cn(
              'grid gap-4',
              view === 'grid'
                ? 'grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5'
                : 'grid-cols-1'
            )}>
              {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
            </div>
          ) : products.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="h-24 w-24 bg-gray-100 rounded-full flex items-center justify-center text-4xl mb-6">
                🔍
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Không tìm thấy sản phẩm</h3>
              <p className="text-gray-500 text-sm max-w-xs">
                Hãy thử điều chỉnh bộ lọc hoặc từ khóa tìm kiếm.
              </p>
              <button
                onClick={() => handleFilterChange(DEFAULT_FILTERS)}
                className="mt-6 px-5 py-2.5 bg-primary-600 text-white text-sm font-semibold rounded-xl hover:bg-primary-700 transition-colors"
              >
                Xóa bộ lọc
              </button>
            </div>
          ) : (
            <>
              <div className={cn(
                'grid gap-4',
                view === 'grid'
                  ? 'grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5'
                  : 'grid-cols-1'
              )}>
                {products.map((p) => <ProductCard key={p._id} product={p} />)}
              </div>
              {pagination && pagination.totalPages > 1 && (
                <div className="mt-8">
                  <PaginationComp pagination={pagination} onPageChange={setPage} />
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense>
      <ProductsContent />
    </Suspense>
  );
}
