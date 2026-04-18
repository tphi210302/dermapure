'use client';

import { useEffect, useState } from 'react';
import { Category } from '@/types';
import api from '@/lib/axios';
import { cn } from '@/lib/utils';

interface Filters {
  search: string;
  category: string;
  minPrice: string;
  maxPrice: string;
  sort: string;
}

interface Props {
  filters: Filters;
  onChange: (filters: Filters) => void;
  /** When true, the internal sticky Apply button is hidden (caller provides its own). */
  hideApplyFooter?: boolean;
  /** Fires on any local state change — parent can mirror & apply externally. */
  onLocalChange?: (local: Filters) => void;
}

const sortOptions = [
  { value: '-createdAt', label: 'Mới nhất',        icon: '🕐' },
  { value: 'price',      label: 'Giá: Thấp → Cao', icon: '⬆️' },
  { value: '-price',     label: 'Giá: Cao → Thấp', icon: '⬇️' },
  { value: 'name',       label: 'Tên A → Z',       icon: '🔤' },
];

const PRICE_PRESETS = [
  { label: 'Dưới 100K',    min: '',       max: '100000' },
  { label: '100K – 300K',  min: '100000', max: '300000' },
  { label: '300K – 600K',  min: '300000', max: '600000' },
  { label: 'Trên 600K',    min: '600000', max: ''       },
];

const CAT_EMOJI: Record<string, string> = {
  'làm sạch da': '🧼',
  'toner & cân bằng': '💦',
  'serum đặc trị': '💎',
  'trị mụn': '🌿',
  'mờ thâm & sáng da': '✨',
  'dưỡng ẩm': '🧴',
  'chống nắng': '☀️',
  'chống lão hóa': '🌙',
  'phụ kiện chăm sóc da': '🪞',
};

export default function ProductFilter({ filters, onChange, hideApplyFooter, onLocalChange }: Props) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [local, setLocal] = useState(filters);

  useEffect(() => {
    api.get('/categories').then(({ data }) => setCategories(data.data)).catch(() => {});
  }, []);

  useEffect(() => { setLocal(filters); }, [filters]);

  // Emit local state to parent on every change
  useEffect(() => { onLocalChange?.(local); }, [local, onLocalChange]);

  // Category click behavior:
  // - Desktop sidebar (hideApplyFooter=false) → apply immediately, navigate
  // - Mobile bottom sheet (hideApplyFooter=true) → local only, user presses Apply to commit all
  const applyCategory = (categoryId: string) => {
    const updated = { ...local, category: categoryId };
    setLocal(updated);
    if (!hideApplyFooter) onChange(updated);
  };

  // Other changes = local state, need explicit Apply
  const setLocalOnly = (patch: Partial<Filters>) =>
    setLocal((p) => ({ ...p, ...patch }));

  const applyPending = () => onChange(local);

  const reset = () => {
    const empty = { search: '', category: '', minPrice: '', maxPrice: '', sort: '-createdAt' };
    setLocal(empty);
    onChange(empty);
  };

  const hasActive = local.category || local.minPrice || local.maxPrice;
  const hasPending =
    local.sort     !== filters.sort ||
    local.minPrice !== filters.minPrice ||
    local.maxPrice !== filters.maxPrice;

  return (
    <div className="rounded-2xl overflow-hidden shadow-lg border-2 border-rose-100 bg-white flex flex-col">

      {/* ── Header ───────────────────────────────── */}
      <div className="px-5 py-4 flex items-center justify-between shrink-0"
        style={{ background: 'linear-gradient(135deg,#881337 0%,#be123c 50%,#f43f5e 100%)' }}>
        <div className="flex items-center gap-2.5">
          <div className="h-7 w-7 rounded-lg bg-white/25 flex items-center justify-center">
            <svg className="h-3.5 w-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5}
                d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z"/>
            </svg>
          </div>
          <span className="font-extrabold text-white text-sm tracking-wide">Bộ lọc</span>
          {hasActive && (
            <span className="px-2 py-0.5 rounded-full bg-yellow-300 text-yellow-900 text-[10px] font-extrabold">
              ĐANG LỌC
            </span>
          )}
        </div>
        {hasActive && (
          <button onClick={reset}
            className="text-[11px] text-white font-bold flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/20 hover:bg-white/30 transition-colors">
            <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12"/>
            </svg>
            Xóa lọc
          </button>
        )}
      </div>

      <div className="divide-y divide-gray-100">

        {/* ── Category (click = immediate) ── */}
        <div className="px-4 py-4">
          <p className="flex items-center gap-2 text-[11px] font-extrabold text-gray-700 uppercase tracking-wider mb-3">
            <span className="text-base">🗂️</span> Danh mục
            {!hideApplyFooter && (
              <span className="text-[10px] font-medium text-rose-500 normal-case tracking-normal ml-auto">· chọn = áp dụng</span>
            )}
          </p>
          <div className="space-y-1.5">
            <button
              onClick={() => applyCategory('')}
              className={cn(
                'w-full text-left px-3 py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center gap-2.5',
                !local.category
                  ? 'text-white shadow-md'
                  : 'text-gray-700 hover:bg-rose-50 border border-transparent hover:border-rose-200'
              )}
              style={!local.category ? { background: 'linear-gradient(135deg,#e11d48,#f43f5e)' } : {}}
            >
              <span className="text-base leading-none">🏪</span>
              <span className="flex-1">Tất cả danh mục</span>
              {!local.category && <span className="text-xs">✓</span>}
            </button>

            {categories.map((c) => {
              const active = local.category === c._id;
              const emoji = CAT_EMOJI[c.name.toLowerCase()] || '💊';
              return (
                <button
                  key={c._id}
                  onClick={() => applyCategory(c._id)}
                  className={cn(
                    'w-full text-left px-3 py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center gap-2.5',
                    active
                      ? 'text-white shadow-md'
                      : 'text-gray-700 hover:bg-rose-50 border border-transparent hover:border-rose-200'
                  )}
                  style={active ? { background: 'linear-gradient(135deg,#e11d48,#f43f5e)' } : {}}
                >
                  <span className="text-base leading-none">{emoji}</span>
                  <span className="flex-1">{c.name}</span>
                  {active && <span className="text-xs">✓</span>}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Price (local only, Apply needed) ── */}
        <div className="px-4 py-4">
          <p className="flex items-center gap-2 text-[11px] font-extrabold text-gray-700 uppercase tracking-wider mb-3">
            <span className="text-base">💰</span> Khoảng giá
            {!hideApplyFooter && (
              <span className="text-[10px] font-medium text-rose-500 normal-case tracking-normal ml-auto">· nhấn Áp dụng</span>
            )}
          </p>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              {PRICE_PRESETS.map((preset) => {
                const active = local.minPrice === preset.min && local.maxPrice === preset.max;
                return (
                  <button
                    key={preset.label}
                    onClick={() => setLocalOnly({ minPrice: preset.min, maxPrice: preset.max })}
                    className={cn(
                      'px-2 py-2.5 rounded-xl text-xs font-bold border-2 transition-all text-center',
                      active
                        ? 'text-white border-transparent shadow-md scale-[1.02]'
                        : 'border-gray-200 text-gray-700 hover:border-rose-400 hover:text-rose-600 hover:bg-rose-50'
                    )}
                    style={active ? { background: 'linear-gradient(135deg,#e11d48,#f43f5e)' } : {}}
                  >
                    {preset.label}
                  </button>
                );
              })}
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[11px] text-gray-500 font-semibold block mb-1">Tối thiểu (₫)</label>
                <input type="number"
                  className="w-full px-3 py-2 bg-gray-50 border-2 border-gray-200 rounded-xl text-xs
                             focus:bg-white focus:border-rose-400 focus:ring-2 focus:ring-rose-500/20 focus:outline-none"
                  placeholder="0"
                  value={local.minPrice}
                  onChange={(e) => setLocalOnly({ minPrice: e.target.value })}
                />
              </div>
              <div>
                <label className="text-[11px] text-gray-500 font-semibold block mb-1">Tối đa (₫)</label>
                <input type="number"
                  className="w-full px-3 py-2 bg-gray-50 border-2 border-gray-200 rounded-xl text-xs
                             focus:bg-white focus:border-rose-400 focus:ring-2 focus:ring-rose-500/20 focus:outline-none"
                  placeholder="∞"
                  value={local.maxPrice}
                  onChange={(e) => setLocalOnly({ maxPrice: e.target.value })}
                />
              </div>
            </div>
          </div>
        </div>

        {/* ── Sort (local only, Apply needed) ── */}
        <div className="px-4 py-4">
          <p className="flex items-center gap-2 text-[11px] font-extrabold text-gray-700 uppercase tracking-wider mb-3">
            <span className="text-base">↕️</span> Sắp xếp
            {!hideApplyFooter && (
              <span className="text-[10px] font-medium text-rose-500 normal-case tracking-normal ml-auto">· nhấn Áp dụng</span>
            )}
          </p>
          <div className="space-y-1.5">
            {sortOptions.map((o) => (
              <button
                key={o.value}
                onClick={() => setLocalOnly({ sort: o.value })}
                className={cn(
                  'w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all',
                  local.sort === o.value
                    ? 'text-white shadow-md'
                    : 'text-gray-700 hover:bg-rose-50 border border-transparent hover:border-rose-200'
                )}
                style={local.sort === o.value ? { background: 'linear-gradient(135deg,#e11d48,#f43f5e)' } : {}}
              >
                <span className="text-sm leading-none">{o.icon}</span>
                <span className="flex-1">{o.label}</span>
                {local.sort === o.value && <span className="text-xs">✓</span>}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Sticky Apply footer — only shown when not hidden by caller ── */}
      {!hideApplyFooter && hasPending && (
        <div className="sticky bottom-0 px-4 py-3 border-t-2 border-rose-200 bg-white/95 backdrop-blur-sm shrink-0 shadow-[0_-4px_12px_rgba(0,0,0,0.05)]">
          <button onClick={applyPending}
            className="w-full py-3 text-sm font-extrabold text-white rounded-xl shadow-lg hover:shadow-xl active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            style={{ background: 'linear-gradient(135deg,#e11d48,#f43f5e)' }}>
            ✓ Áp dụng bộ lọc
          </button>
        </div>
      )}
    </div>
  );
}
