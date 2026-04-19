'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

const KEY    = 'affiliateRef';
const TTL_MS = 30 * 24 * 60 * 60 * 1000;

export default function AffiliateCapture() {
  const params = useSearchParams();

  useEffect(() => {
    const code = params.get('ref');
    if (!code) return;
    const norm = code.trim().toUpperCase().slice(0, 30);
    if (!norm) return;
    try {
      localStorage.setItem(KEY, JSON.stringify({ code: norm, at: Date.now() }));
    } catch {}
  }, [params]);

  return null;
}

export const readAffiliateRef = (): string | null => {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const { code, at } = JSON.parse(raw);
    if (!code || !at || Date.now() - at > TTL_MS) {
      localStorage.removeItem(KEY);
      return null;
    }
    return code as string;
  } catch {
    return null;
  }
};

export const clearAffiliateRef = () => {
  if (typeof window === 'undefined') return;
  try { localStorage.removeItem(KEY); } catch {}
};

export const writeAffiliateRef = (code: string) => {
  if (typeof window === 'undefined') return;
  const norm = code.trim().toUpperCase().slice(0, 30);
  if (!norm) { clearAffiliateRef(); return; }
  try {
    localStorage.setItem(KEY, JSON.stringify({ code: norm, at: Date.now() }));
  } catch {}
};
