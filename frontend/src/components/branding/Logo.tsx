/**
 * Lumie — brand mark
 * Monogram "L" inside a deep-rose rounded square + elegant italic wordmark.
 *
 * Usage:
 *   <Logo />              — header sizing
 *   <Logo size="lg" />    — auth pages
 *   <Logo iconOnly />     — just the L tile
 *   <Logo theme="dark" /> — for dark backgrounds (footer / admin sidebar)
 */
type Size = 'xs' | 'sm' | 'md' | 'lg';
type Theme = 'light' | 'dark';

interface Props {
  size?: Size;
  theme?: Theme;
  iconOnly?: boolean;
  /** Optional tagline shown stacked under the wordmark. */
  tagline?: string;
  className?: string;
}

const ICON_PX:  Record<Size, number> = { xs: 24, sm: 30, md: 38, lg: 56 };
const TEXT_PX:  Record<Size, string> = {
  xs: 'text-[15px]',
  sm: 'text-[19px]',
  md: 'text-[24px]',
  lg: 'text-4xl',
};
const DOT_PX:   Record<Size, number> = { xs: 1.5, sm: 2, md: 2.5, lg: 4 };

const MonogramTile = ({ px, dotR }: { px: number; dotR: number }) => (
  <svg width={px} height={px} viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <defs>
      <linearGradient id={`bg-${px}`} x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%"   stopColor="#e11d48"/>
        <stop offset="100%" stopColor="#9d174d"/>
      </linearGradient>
    </defs>
    <rect x="0" y="0" width="64" height="64" rx="14" ry="14" fill={`url(#bg-${px})`}/>
    <text x="32" y="46"
          textAnchor="middle"
          fontFamily="'Playfair Display', 'Cormorant Garamond', Georgia, 'Times New Roman', serif"
          fontSize="44"
          fontWeight="700"
          fontStyle="italic"
          fill="#fef3c7"
          letterSpacing="-1">L</text>
    <circle cx="44" cy="44" r={dotR * 64 / ICON_PX.md} fill="#fef3c7" opacity="0.85"/>
  </svg>
);

const TAGLINE_PX: Record<Size, string> = {
  xs: 'text-[9px]',
  sm: 'text-[10px]',
  md: 'text-[11px]',
  lg: 'text-xs',
};

export default function Logo({ size = 'md', theme = 'light', iconOnly, tagline, className = '' }: Props) {
  const px = ICON_PX[size];
  const dotR = DOT_PX[size];

  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <span className="shrink-0 drop-shadow-md rounded-[14px] overflow-hidden">
        <MonogramTile px={px} dotR={dotR} />
      </span>
      {!iconOnly && (
        <span className="inline-flex flex-col leading-none">
          <span
            className={`${TEXT_PX[size]} font-bold italic tracking-[-0.02em] ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}
            style={{ fontFamily: "'Playfair Display', 'Cormorant Garamond', Georgia, 'Times New Roman', serif" }}
          >
            Lumie
          </span>
          {tagline && (
            <span className={`mt-1 ${TAGLINE_PX[size]} font-medium tracking-wide ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-400'
            }`}>
              {tagline}
            </span>
          )}
        </span>
      )}
    </span>
  );
}
