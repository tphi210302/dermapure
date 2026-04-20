'use client';

interface Props {
  /**
   * Compact variant: horizontal row in the bottom-right corner with smaller icons.
   * Used on auth pages where the form card is centered and the stacked variant
   * would overlap the login card.
   */
  compact?: boolean;
}

export default function FloatContact({ compact = false }: Props) {
  // Compact: bottom-centered horizontal row on mobile (below the form card),
  // bottom-right on desktop (where the card is a small centered island).
  const containerCls = compact
    ? 'fixed z-40 flex flex-row items-center gap-2 left-1/2 -translate-x-1/2 bottom-3 md:left-auto md:right-4 md:translate-x-0 md:bottom-4'
    : 'fixed right-3 bottom-20 md:bottom-28 md:right-4 z-40 flex flex-col items-center gap-2';

  const size = compact ? 'h-9 w-9' : 'h-10 w-10 md:h-12 md:w-12';
  const zaloIcon  = compact ? 'h-5 w-5' : 'h-6 w-6';
  const fbIcon    = compact ? 'h-4 w-4' : 'h-5 w-5';
  const phoneIcon = compact ? 'h-4 w-4' : 'h-5 w-5';

  // Tooltip position: compact shows above (since icons are at bottom); full shows to the left
  const tooltipPos = compact
    ? 'bottom-full mb-2 left-1/2 -translate-x-1/2'
    : 'right-14 top-1/2 -translate-y-1/2';

  // No pulse ring on compact to keep it quiet near the form
  const showPulse = !compact;

  return (
    <div className={containerCls}>
      {/* Zalo */}
      <a
        href="https://zalo.me/pharmashop"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat Zalo"
        title="Chat Zalo"
        className={`group relative flex ${size} items-center justify-center rounded-full bg-[#0068FF] shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-200`}
      >
        <svg className={`${zaloIcon} text-white`} viewBox="0 0 32 32" fill="currentColor">
          <path d="M16 2C8.268 2 2 8.268 2 16s6.268 14 14 14 14-6.268 14-14S23.732 2 16 2zm6.5 19.5H9.2l6.5-8.4H9.5V11H22.8l-6.5 8.4h6.2v2.1z"/>
        </svg>
        {showPulse && <span className="absolute inset-0 rounded-full bg-[#0068FF] animate-ping opacity-30 group-hover:opacity-0" />}
        <span className={`pointer-events-none absolute ${tooltipPos} whitespace-nowrap rounded-lg bg-gray-900 px-3 py-1.5 text-xs font-medium text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200 shadow-lg`}>
          Chat Zalo
        </span>
      </a>

      {/* Facebook Messenger */}
      <a
        href="https://www.facebook.com/pharmashop"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Facebook"
        title="Facebook"
        className={`group relative flex ${size} items-center justify-center rounded-full bg-[#1877F2] shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-200`}
      >
        <svg className={`${fbIcon} text-white`} fill="currentColor" viewBox="0 0 24 24">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
        </svg>
        <span className={`pointer-events-none absolute ${tooltipPos} whitespace-nowrap rounded-lg bg-gray-900 px-3 py-1.5 text-xs font-medium text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200 shadow-lg`}>
          Facebook
        </span>
      </a>

      {/* Hotline */}
      <a
        href="tel:1800123456"
        aria-label="Gọi hotline"
        title="Hotline"
        className={`group relative flex ${size} items-center justify-center rounded-full bg-emerald-500 shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-200`}
      >
        <svg className={`${phoneIcon} text-white`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
        </svg>
        {showPulse && <span className="absolute inset-0 rounded-full bg-emerald-500 animate-ping opacity-30 group-hover:opacity-0" />}
        <span className={`pointer-events-none absolute ${tooltipPos} whitespace-nowrap rounded-lg bg-gray-900 px-3 py-1.5 text-xs font-medium text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200 shadow-lg`}>
          1800-123-456
        </span>
      </a>
    </div>
  );
}
