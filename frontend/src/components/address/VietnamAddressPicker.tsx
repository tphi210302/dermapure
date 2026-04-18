'use client';

/**
 * Vietnam address picker — 2-level system (from July 2025 administrative reform):
 *   Tỉnh/Thành phố → Phường/Xã
 * (District/quận/huyện level was abolished)
 *
 * Data source: provinces.open-api.vn. We fetch province with depth=3 and
 * flatten wards from all districts into a single list.
 */
import { useEffect, useMemo, useRef, useState } from 'react';

interface Province { code: number; name: string; }
interface Ward     { code: number; name: string; district_code?: number; district_name?: string; }

interface Props {
  value: {
    state?: string;   // Tỉnh / Thành phố
    ward?: string;    // Phường / Xã
    city?: string;    // LEGACY — district, now derived from ward for backward compat
  };
  onChange: (v: { state: string; ward: string; city?: string }) => void;
  error?: { state?: string; ward?: string };
}

const API = 'https://provinces.open-api.vn/api';

const inputCls = `w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl text-sm text-gray-900
                  placeholder:text-gray-400
                  focus:bg-white focus:border-rose-400 focus:ring-2 focus:ring-rose-500/20
                  focus:outline-none transition-all duration-200 disabled:bg-gray-100 disabled:text-gray-400`;

// Normalize Vietnamese (remove diacritics) for fuzzy match
const normalize = (s: string) =>
  s.toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd');

/* ─────────────────────────────────────────────────────
 * Typeahead — one combobox input with suggestion list
 * ───────────────────────────────────────────────────── */
interface TypeaheadProps {
  label: string;
  placeholder: string;
  value: string;
  items: { code: number; name: string; subtitle?: string }[];
  onSelect: (item: { code: number; name: string; subtitle?: string }) => void;
  onTextChange: (text: string) => void;
  disabled?: boolean;
  loading?: boolean;
  error?: string;
  disabledHint?: string;
  hint?: string;
}

function Typeahead({
  label, placeholder, value, items, onSelect, onTextChange,
  disabled, loading, error, disabledHint, hint,
}: TypeaheadProps) {
  const [focused, setFocused] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setFocused(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const q = normalize(value.trim());
  const filtered = useMemo(() => {
    if (!q) return items.slice(0, 50);
    return items.filter((it) => normalize(it.name).includes(q)).slice(0, 50);
  }, [q, items]);

  const pick = (it: { code: number; name: string; subtitle?: string }) => {
    onSelect(it);
    setFocused(false);
  };

  return (
    <div ref={wrapRef} className="relative">
      <label className="text-xs font-bold text-gray-700 block mb-1.5">{label} *</label>
      <div className="relative">
        <input
          type="text"
          className={inputCls}
          placeholder={disabled ? (disabledHint || placeholder) : placeholder}
          value={value}
          onChange={(e) => onTextChange(e.target.value)}
          onFocus={() => setFocused(true)}
          disabled={disabled || loading}
          autoComplete="off"
        />
        {loading && (
          <svg className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-rose-500 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
          </svg>
        )}
        {!loading && value && (
          <button type="button" onClick={() => { onTextChange(''); onSelect({ code: 0, name: '' }); }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            aria-label="Xoá">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        )}
      </div>

      {hint && !focused && <p className="text-[10px] text-gray-400 mt-1">{hint}</p>}
      {error && <p className="text-xs text-rose-600 mt-1">{error}</p>}

      {focused && !disabled && !loading && filtered.length > 0 && (
        <div className="absolute z-30 top-full left-0 right-0 mt-1 bg-white rounded-xl border-2 border-rose-200 shadow-lg overflow-hidden max-h-60 overflow-y-auto">
          {filtered.map((it) => (
            <button
              key={it.code}
              type="button"
              onClick={() => pick(it)}
              className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-rose-50 hover:text-rose-700 border-b border-gray-100 last:border-b-0 transition-colors"
            >
              <div className="font-medium">{it.name}</div>
              {it.subtitle && <div className="text-[11px] text-gray-400">{it.subtitle}</div>}
            </button>
          ))}
        </div>
      )}
      {focused && !disabled && !loading && q && filtered.length === 0 && (
        <p className="text-[11px] text-gray-400 mt-1">Không tìm thấy "{value}"</p>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────
 * Main picker — 2-level (Province → Ward)
 * ───────────────────────────────────────────────────── */
export default function VietnamAddressPicker({ value, onChange, error }: Props) {
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [wards,     setWards]     = useState<Ward[]>([]);
  const [loading,   setLoading]   = useState({ provinces: true, wards: false });

  const [stateText, setStateText] = useState(value.state || '');
  const [wardText,  setWardText]  = useState(value.ward || '');

  useEffect(() => { setStateText(value.state || ''); }, [value.state]);
  useEffect(() => { setWardText(value.ward || ''); }, [value.ward]);

  // Load provinces once
  useEffect(() => {
    fetch(`${API}/p/`)
      .then((r) => r.json())
      .then((data: Province[]) => setProvinces(data || []))
      .catch(() => setProvinces([]))
      .finally(() => setLoading((p) => ({ ...p, provinces: false })));
  }, []);

  // When province picked: fetch province with depth=3, flatten all wards
  useEffect(() => {
    if (!value.state) { setWards([]); return; }
    const prov = provinces.find((p) => p.name === value.state);
    if (!prov) return;
    setLoading((p) => ({ ...p, wards: true }));
    fetch(`${API}/p/${prov.code}?depth=3`)
      .then((r) => r.json())
      .then((data: { districts: { name: string; wards: Ward[] }[] }) => {
        // Flatten wards from all districts, keep district_name as optional subtitle
        const allWards: Ward[] = [];
        (data.districts || []).forEach((d) => {
          (d.wards || []).forEach((w) => allWards.push({ ...w, district_name: d.name }));
        });
        // Sort by name (normalized)
        allWards.sort((a, b) => normalize(a.name).localeCompare(normalize(b.name)));
        setWards(allWards);
      })
      .catch(() => setWards([]))
      .finally(() => setLoading((p) => ({ ...p, wards: false })));
  }, [value.state, provinces]);

  const handleProvince = (it: { name: string }) => {
    setStateText(it.name);
    setWardText('');
    onChange({ state: it.name, ward: '', city: '' });
  };

  const handleWard = (it: { name: string; subtitle?: string }) => {
    setWardText(it.name);
    // Keep district_name as `city` for backward compatibility (old data)
    onChange({
      state: value.state ?? '',
      ward: it.name,
      city: it.subtitle || '',
    });
  };

  // Map wards to typeahead items with district as subtitle (to help disambiguate same-name wards)
  const wardItems = wards.map((w) => ({
    code: w.code,
    name: w.name,
    subtitle: w.district_name, // "Thuộc Quận Cầu Giấy" (tham khảo, do hệ thống cũ còn dữ liệu district)
  }));

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      <Typeahead
        label="Tỉnh / Thành phố"
        placeholder="Gõ để tìm (vd: Hà Nội)"
        value={stateText}
        items={provinces}
        onTextChange={setStateText}
        onSelect={handleProvince}
        loading={loading.provinces}
        error={error?.state}
      />

      <Typeahead
        label="Phường / Xã"
        placeholder="Gõ để tìm phường/xã"
        value={wardText}
        items={wardItems}
        onTextChange={setWardText}
        onSelect={handleWard}
        disabled={!value.state}
        disabledHint="— Chọn Tỉnh/TP trước —"
        loading={loading.wards}
        error={error?.ward}
        hint={value.state && wards.length > 0 ? `${wards.length} phường/xã thuộc ${value.state}` : undefined}
      />
    </div>
  );
}
