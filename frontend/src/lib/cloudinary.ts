/**
 * Cloudinary fetch-URL helper.
 *
 * Given any public image URL (or a Cloudinary URL or placeholder), returns a
 * Cloudinary fetch URL that:
 *   - normalises the image to a square canvas (default 800×800) with white padding
 *   - auto-picks format (WebP/AVIF) + auto quality
 *   - overlays the "Lumie" text watermark in the bottom-right corner
 *
 * When NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME is unset, returns the original URL
 * (graceful fallback so local dev + unconfigured deploys still show images).
 */

type Opts = {
  /** Output width in px. Default 800. */
  w?: number;
  /** Output height in px. Default = w (square). */
  h?: number;
  /** Crop mode. `pad` = letterbox with bg color; `fill` = crop to fit. Default `pad`. */
  crop?: 'pad' | 'fill' | 'fit';
  /** Background color when crop=pad. Hex without #. Default `ffffff`. */
  bg?: string;
  /** Show Lumie text watermark. Default true. */
  watermark?: boolean;
  /** Watermark font size. Default 28 for 800px output. */
  wmSize?: number;
};

const CLOUD = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;

/** URLs we should not run through Cloudinary — placeholders, data URIs, already-transformed. */
const shouldSkip = (url: string) =>
  !url ||
  url.startsWith('data:') ||
  url.startsWith('/') ||
  url.includes('placehold.co') ||
  url.includes('res.cloudinary.com');

export const cloudinaryUrl = (url: string, opts: Opts = {}): string => {
  if (!CLOUD || !url || shouldSkip(url)) return url;

  const w = opts.w ?? 800;
  const h = opts.h ?? w;
  const crop = opts.crop ?? 'pad';
  const bg = opts.bg ?? 'ffffff';

  // dpr_2 (not dpr_auto) — Cloudinary's auto only works with their SDKs that send
  // the client hint header; explicit 2x gives crisp retina on phones + MacBook.
  const transforms = [
    `w_${w}`,
    `h_${h}`,
    `c_${crop}`,
    ...(crop === 'pad' ? [`b_rgb:${bg}`] : []),
    'q_auto:good',
    'f_auto',
    'dpr_2.0',
  ].join(',');

  // Watermark: italic-bold "Lumie" in WHITE with a subtle black outline so it
  // pops on any product photo (light, dark, busy backgrounds). This reads as a
  // proper watermark rather than just pink text overlay.
  const wm =
    opts.watermark === false || w < 200
      ? ''
      : `/l_text:Georgia_${opts.wmSize ?? 32}_bold_italic:Lumie,co_white,bo_2px_solid_rgb:00000080,g_south_east,x_18,y_16,o_92`;

  // Cloudinary is picky about URL encoding for fetched URLs.
  const encoded = encodeURIComponent(url);

  return `https://res.cloudinary.com/${CLOUD}/image/fetch/${transforms}${wm}/${encoded}`;
};

/** Shortcut: small thumbnail (no watermark). */
export const cloudinaryThumb = (url: string, size = 160) =>
  cloudinaryUrl(url, { w: size, h: size, crop: 'fill', watermark: false });

/** Shortcut: medium card (with watermark). */
export const cloudinaryCard = (url: string) =>
  cloudinaryUrl(url, { w: 700, h: 700, wmSize: 30 });

/** Shortcut: full-size hero (with large watermark). */
export const cloudinaryHero = (url: string) =>
  cloudinaryUrl(url, { w: 1200, h: 1200, wmSize: 42 });
