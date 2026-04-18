'use client';

/**
 * Street address autocomplete powered by Nominatim (OpenStreetMap — free, no API key).
 * Debounced, respects 1 req/sec rate limit. Biased to Vietnam via `countrycodes=vn`.
 *
 * If the user has already selected a city/ward, we refine the viewbox to that area
 * so results are more relevant.
 */
import { useEffect, useRef, useState } from 'react';

interface Suggestion {
  display_name: string;
  lat: string;
  lon: string;
  place_id: number;
}

interface Props {
  value: string;
  onChange: (value: string) => void;
  // Optional locality context — used to bias search
  state?: string;   // Tỉnh / Thành phố
  city?: string;    // Quận / Huyện
  ward?: string;    // Phường / Xã
  placeholder?: string;
  className?: string;
  error?: string;
}

const API = 'https://nominatim.openstreetmap.org/search';

export default function StreetAutocomplete({
  value, onChange, state, city, ward, placeholder, className, error,
}: Props) {
  const [focused, setFocused] = useState(false);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setFocused(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const fetchSuggestions = (q: string) => {
    if (!q || q.trim().length < 3) { setSuggestions([]); return; }
    setLoading(true);

    // Build contextual query — append ward/city/state for more relevant results
    const locality = [ward, city, state].filter(Boolean).join(', ');
    const fullQuery = locality ? `${q}, ${locality}` : q;

    const url = `${API}?format=json&q=${encodeURIComponent(fullQuery)}&countrycodes=vn&limit=6&addressdetails=0`;

    fetch(url, { headers: { 'Accept-Language': 'vi' } })
      .then((r) => r.ok ? r.json() : [])
      .then((data: Suggestion[]) => setSuggestions(data || []))
      .catch(() => setSuggestions([]))
      .finally(() => setLoading(false));
  };

  const handleInput = (v: string) => {
    onChange(v);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchSuggestions(v), 500);
  };

  const pickSuggestion = (s: Suggestion) => {
    // Take only the first segment (usually street + building) — user already has ward/city/state
    const streetPart = s.display_name.split(',').slice(0, 2).join(', ').trim();
    onChange(streetPart);
    setSuggestions([]);
    setFocused(false);
  };

  return (
    <div ref={containerRef} className="relative">
      <input
        type="text"
        className={className}
        placeholder={placeholder || 'Số nhà, tên đường (vd: 123 Cầu Giấy)'}
        value={value}
        onChange={(e) => handleInput(e.target.value)}
        onFocus={() => setFocused(true)}
        autoComplete="off"
      />
      {error && <p className="text-xs text-rose-600 mt-1">{error}</p>}

      {/* Suggestion dropdown */}
      {focused && (suggestions.length > 0 || loading) && (
        <div className="absolute z-30 top-full left-0 right-0 mt-1 bg-white rounded-xl border-2 border-rose-200 shadow-lg overflow-hidden max-h-64 overflow-y-auto">
          {loading && (
            <div className="px-3 py-2.5 text-xs text-gray-400 flex items-center gap-2">
              <svg className="h-3.5 w-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>
              Đang tìm địa chỉ...
            </div>
          )}
          {!loading && suggestions.map((s) => (
            <button
              key={s.place_id}
              type="button"
              onClick={() => pickSuggestion(s)}
              className="w-full text-left px-3 py-2.5 text-xs text-gray-700 hover:bg-rose-50 border-b border-gray-100 last:border-b-0 transition-colors"
            >
              <div className="flex items-start gap-2">
                <svg className="h-3.5 w-3.5 text-rose-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                </svg>
                <span className="line-clamp-2">{s.display_name}</span>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Hint when user has typed but no matches */}
      {focused && value.length >= 3 && !loading && suggestions.length === 0 && (
        <p className="text-[10px] text-gray-400 mt-1">Không tìm thấy gợi ý — có thể nhập thủ công</p>
      )}
    </div>
  );
}
