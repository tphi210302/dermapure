/**
 * Lumié — brand mark
 * Petal SVG icon + elegant wordmark. Self-contained, no external font deps.
 *
 * Usage:
 *   <Logo />                         — default size (icon 36px + wordmark)
 *   <Logo size="sm" />               — header sizing
 *   <Logo size="lg" />               — auth/login centered
 *   <Logo iconOnly />                — just the petal mark
 *   <Logo theme="dark" />            — for dark backgrounds (footer / admin sidebar)
 */
type Size = 'xs' | 'sm' | 'md' | 'lg';
type Theme = 'light' | 'dark' | 'gradient';

interface Props {
  size?: Size;
  theme?: Theme;
  iconOnly?: boolean;
  className?: string;
}

const ICON_PX: Record<Size, number> = { xs: 24, sm: 32, md: 40, lg: 56 };
const TEXT_CLS: Record<Size, string> = {
  xs: 'text-base',
  sm: 'text-lg',
  md: 'text-xl',
  lg: 'text-3xl',
};

const PetalIcon = ({ px }: { px: number }) => (
  <svg width={px} height={px} viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <defs>
      <linearGradient id={`bg-${px}`} x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%"  stopColor="#fff1f2"/>
        <stop offset="100%" stopColor="#fde8ee"/>
      </linearGradient>
      <linearGradient id={`petalA-${px}`} x1="50%" y1="0%" x2="50%" y2="100%">
        <stop offset="0%"   stopColor="#fda4af"/>
        <stop offset="60%"  stopColor="#f472b6"/>
        <stop offset="100%" stopColor="#e11d48"/>
      </linearGradient>
      <linearGradient id={`petalB-${px}`} x1="50%" y1="0%" x2="50%" y2="100%">
        <stop offset="0%"   stopColor="#fef3c7"/>
        <stop offset="100%" stopColor="#fb923c"/>
      </linearGradient>
    </defs>
    <rect x="0" y="0" width="64" height="64" rx="14" ry="14" fill={`url(#bg-${px})`}/>
    <g transform="translate(32 33)">
      <path d="M 0 -22 C -16 -18, -22 -2, -10 12 C -4 16, 0 12, 0 6 Z"
            fill={`url(#petalA-${px})`} opacity="0.92"/>
      <path d="M 0 -22 C 16 -18, 22 -2, 10 12 C 4 16, 0 12, 0 6 Z"
            fill={`url(#petalA-${px})`} opacity="0.92"/>
      <path d="M 0 -18 C -7 -8, -5 6, 0 12 C 5 6, 7 -8, 0 -18 Z"
            fill={`url(#petalB-${px})`} opacity="0.95"/>
      <ellipse cx="-2" cy="-10" rx="1.6" ry="2.4" fill="#ffffff" opacity="0.75"/>
    </g>
  </svg>
);

const wordmarkColor = (theme: Theme) => {
  switch (theme) {
    case 'dark':     return 'text-white';
    case 'gradient': return 'bg-clip-text text-transparent bg-gradient-to-r from-rose-500 via-pink-500 to-orange-400';
    default:         return 'text-gray-900';
  }
};

const accentColor = (theme: Theme) => {
  switch (theme) {
    case 'dark':     return 'text-rose-300';
    case 'gradient': return 'text-orange-400';
    default:         return 'text-rose-500';
  }
};

export default function Logo({ size = 'md', theme = 'light', iconOnly, className = '' }: Props) {
  const px = ICON_PX[size];
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <span className="shrink-0 drop-shadow-sm">
        <PetalIcon px={px} />
      </span>
      {!iconOnly && (
        <span className={`font-serif italic ${TEXT_CLS[size]} font-bold tracking-tight leading-none ${wordmarkColor(theme)}`}>
          Lumi<span className={accentColor(theme)}>é</span>
        </span>
      )}
    </span>
  );
}
