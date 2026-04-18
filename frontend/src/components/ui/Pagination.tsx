'use client';

import { cn } from '@/lib/utils';
import { Pagination as PaginationData } from '@/types';

interface Props {
  pagination: PaginationData;
  onPageChange: (page: number) => void;
}

export default function Pagination({ pagination, onPageChange }: Props) {
  const { page, totalPages } = pagination;
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <nav className="flex items-center justify-center gap-1 mt-8" aria-label="Pagination">
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={!pagination.hasPrevPage}
        className="btn-secondary btn-sm disabled:opacity-40"
      >
        ← Prev
      </button>

      {pages.map((p) => (
        <button
          key={p}
          onClick={() => onPageChange(p)}
          className={cn(
            'h-9 w-9 rounded-lg text-sm font-medium transition-colors',
            p === page
              ? 'bg-blue-600 text-white'
              : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
          )}
        >
          {p}
        </button>
      ))}

      <button
        onClick={() => onPageChange(page + 1)}
        disabled={!pagination.hasNextPage}
        className="btn-secondary btn-sm disabled:opacity-40"
      >
        Next →
      </button>
    </nav>
  );
}
