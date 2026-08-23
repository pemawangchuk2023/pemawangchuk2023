/**
 * Design tokens for the profile assets.
 *
 * Every generated SVG is emitted twice, once per theme, and paired in the
 * README with <picture media="(prefers-color-scheme: ...)"> so the artwork
 * follows the reader's GitHub theme instead of fighting it.
 *
 * Surface colours are tuned to sit on GitHub's own canvas (#0d1117 dark,
 * #ffffff light) so the cards read as part of the page, not pasted onto it.
 */

export const FONT = {
  sans: "'Inter','SF Pro Display',-apple-system,BlinkMacSystemFont,'Segoe UI','Noto Sans',Helvetica,Arial,sans-serif",
  mono: "ui-monospace,SFMono-Regular,'SF Mono','Cascadia Mono','Segoe UI Mono',Menlo,Consolas,monospace",
};

const dark = {
  name: 'dark',
  canvas: '#0D1117',
  surface: '#0E141B',
  surfaceAlt: '#141C26',
  surfaceHi: '#18222F',
  border: '#232E3B',
  borderHi: '#334252',
  text: '#E9EFF6',
  muted: '#9FB0C2',
  faint: '#6C7D91',
  accent: '#5B9DFF',
  accent2: '#A78BFA',
  accent3: '#34D399',
  accent4: '#F7931A',
  gridStroke: '#FFFFFF',
  gridOpacity: 0.05,
  auroraOpacity: 0.5,
  shadowOpacity: 0.5,
};

const light = {
  name: 'light',
  canvas: '#FFFFFF',
  surface: '#FCFDFE',
  surfaceAlt: '#F3F7FA',
  surfaceHi: '#E9F0F7',
  border: '#DCE3EB',
  borderHi: '#BFCAD7',
  text: '#0C1522',
  muted: '#4C5A6B',
  faint: '#78879A',
  accent: '#2563EB',
  accent2: '#7C3AED',
  accent3: '#059669',
  accent4: '#C2740A',
  gridStroke: '#0C1522',
  gridOpacity: 0.045,
  auroraOpacity: 0.22,
  shadowOpacity: 0.08,
};

export const THEMES = { dark, light };

/** Canvas width shared by every asset so the README column stays aligned. */
export const W = 1200;
