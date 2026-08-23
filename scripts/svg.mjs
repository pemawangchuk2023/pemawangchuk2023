/**
 * Minimal SVG authoring primitives.
 *
 * The assets are rendered by GitHub inside <img>, which means no scripts, no
 * webfonts and no foreignObject. Everything here sticks to plain shapes, text
 * and CSS animation, which is the subset that survives that sandbox.
 */

import { FONT } from './tokens.mjs';

/* ------------------------------------------------------------------ text -- */

const NARROW = new Set("ijlItfr.,;:'!|()[]/\\·-");
const WIDE = new Set('mMWQ@%&');
const CAPS = /[A-Z]/;
const DIGIT = /[0-9]/;

/**
 * Approximate advance width. Exact metrics need the actual font file, which we
 * deliberately do not ship; this is tuned to over-estimate slightly so padded
 * boxes never clip their label.
 */
export function measure(str, size, { mono = false, tracking = 0, bold = false } = {}) {
  if (mono) return str.length * size * 0.601 + tracking * Math.max(0, str.length - 1);
  let w = 0;
  for (const ch of str) {
    if (ch === ' ') w += 0.27;
    else if (NARROW.has(ch)) w += 0.33;
    else if (WIDE.has(ch)) w += 0.88;
    else if (CAPS.test(ch)) w += 0.67;
    else if (DIGIT.test(ch)) w += 0.57;
    else w += 0.535;
  }
  return w * size * (bold ? 1.035 : 1) + tracking * Math.max(0, str.length - 1);
}

export function esc(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** Greedy word wrap against a pixel width. */
export function wrap(str, maxWidth, size, opts = {}) {
  const words = str.split(/\s+/).filter(Boolean);
  const lines = [];
  let line = '';
  for (const word of words) {
    const next = line ? `${line} ${word}` : word;
    if (line && measure(next, size, opts) > maxWidth) {
      lines.push(line);
      line = word;
    } else {
      line = next;
    }
  }
  if (line) lines.push(line);
  return lines;
}

export function text(str, { x, y, size = 16, weight = 400, fill, mono = false, tracking = 0, anchor = 'start', opacity, cls, style } = {}) {
  const attrs = [
    `x="${round(x)}"`,
    `y="${round(y)}"`,
    `font-family="${mono ? FONT.mono : FONT.sans}"`,
    `font-size="${size}"`,
    `font-weight="${weight}"`,
    `fill="${fill}"`,
  ];
  if (tracking) attrs.push(`letter-spacing="${tracking}"`);
  if (anchor !== 'start') attrs.push(`text-anchor="${anchor}"`);
  if (opacity != null) attrs.push(`opacity="${opacity}"`);
  if (cls) attrs.push(`class="${cls}"`);
  if (style) attrs.push(`style="${style}"`);
  return `<text ${attrs.join(' ')}>${esc(str)}</text>`;
}

/** Stack of <text> lines with a fixed leading. */
export function lines(arr, { x, y, leading, ...rest }) {
  return arr.map((l, i) => text(l, { ...rest, x, y: y + i * leading })).join('');
}

/* ----------------------------------------------------------------- shapes -- */

export const round = (n) => Math.round(n * 100) / 100;

export function rect({ x, y, w, h, r = 0, fill = 'none', stroke, strokeWidth = 1, opacity, cls, style }) {
  const attrs = [`x="${round(x)}"`, `y="${round(y)}"`, `width="${round(w)}"`, `height="${round(h)}"`];
  if (r) attrs.push(`rx="${r}"`);
  attrs.push(`fill="${fill}"`);
  if (stroke) attrs.push(`stroke="${stroke}"`, `stroke-width="${strokeWidth}"`);
  if (opacity != null) attrs.push(`opacity="${opacity}"`);
  if (cls) attrs.push(`class="${cls}"`);
  if (style) attrs.push(`style="${style}"`);
  return `<rect ${attrs.join(' ')}/>`;
}

export function circle({ cx, cy, r, fill = 'none', stroke, strokeWidth = 1, opacity, cls, dash, style }) {
  const attrs = [`cx="${round(cx)}"`, `cy="${round(cy)}"`, `r="${round(r)}"`, `fill="${fill}"`];
  if (stroke) attrs.push(`stroke="${stroke}"`, `stroke-width="${strokeWidth}"`);
  if (dash) attrs.push(`stroke-dasharray="${dash}"`);
  if (opacity != null) attrs.push(`opacity="${opacity}"`);
  if (cls) attrs.push(`class="${cls}"`);
  if (style) attrs.push(`style="${style}"`);
  return `<circle ${attrs.join(' ')}/>`;
}

export function path(d, { fill = 'none', stroke, strokeWidth = 1, opacity, cls, dash, cap = 'round', join = 'round', style } = {}) {
  const attrs = [`d="${d}"`, `fill="${fill}"`];
  if (stroke) attrs.push(`stroke="${stroke}"`, `stroke-width="${strokeWidth}"`, `stroke-linecap="${cap}"`, `stroke-linejoin="${join}"`);
  if (dash) attrs.push(`stroke-dasharray="${dash}"`);
  if (opacity != null) attrs.push(`opacity="${opacity}"`);
  if (cls) attrs.push(`class="${cls}"`);
  if (style) attrs.push(`style="${style}"`);
  return `<path ${attrs.join(' ')}/>`;
}

/* --------------------------------------------------------------- surfaces -- */

/** Blueprint-style corner ticks. Cheap detail that reads as "drawn on purpose". */
export function cornerTicks(x, y, w, h, t, len = 12, inset = 14) {
  const c = t.borderHi;
  const o = 0.9;
  const seg = (d) => path(d, { stroke: c, strokeWidth: 1.25, opacity: o });
  const [l, r, tp, b] = [x + inset, x + w - inset, y + inset, y + h - inset];
  return [
    seg(`M${l} ${tp + len}V${tp}H${l + len}`),
    seg(`M${r - len} ${tp}H${r}V${tp + len}`),
    seg(`M${l} ${b - len}V${b}H${l + len}`),
    seg(`M${r - len} ${b}H${r}V${b - len}`),
  ].join('');
}

/** 40px technical grid, clipped to whatever it is drawn into. */
export function gridDef(id, t, cell = 40) {
  return `<pattern id="${id}" width="${cell}" height="${cell}" patternUnits="userSpaceOnUse">
      <path d="M${cell} 0H0V${cell}" fill="none" stroke="${t.gridStroke}" stroke-width="1" opacity="${t.gridOpacity}"/>
    </pattern>`;
}

/** Soft off-centre colour wash used behind the hero and footer. */
export function auroraDef(id, color, stop = 0.75) {
  return `<radialGradient id="${id}" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="${color}" stop-opacity="${stop}"/>
      <stop offset="55%" stop-color="${color}" stop-opacity="${(stop * 0.28).toFixed(3)}"/>
      <stop offset="100%" stop-color="${color}" stop-opacity="0"/>
    </radialGradient>`;
}

export function linearDef(id, from, to, { x1 = '0%', y1 = '0%', x2 = '100%', y2 = '100%' } = {}) {
  return `<linearGradient id="${id}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}">
      <stop offset="0%" stop-color="${from}"/>
      <stop offset="100%" stop-color="${to}"/>
    </linearGradient>`;
}

/** Square-cornered tag with an optional leading dot. Returns markup and width. */
export function chip(label, { x, y, t, dot, size = 16, padX = 16, h = 38, fill, stroke, color, mono = false, tracking = 0 }) {
  const textW = measure(label, size, { mono, tracking });
  const dotW = dot ? 18 : 0;
  const w = Math.ceil(textW + dotW + padX * 2);
  const cy = y + h / 2;
  const body = rect({ x, y, w, h, fill: fill ?? t.surfaceAlt, stroke: stroke ?? t.border, strokeWidth: 1 });
  const marker = dot ? circle({ cx: x + padX + 4.5, cy, r: 4.5, fill: dot }) : '';
  const label_ = text(label, {
    x: x + padX + dotW,
    y: cy + size * 0.35,
    size,
    weight: 500,
    fill: color ?? t.muted,
    mono,
    tracking,
  });
  return { svg: body + marker + label_, w };
}

/* --------------------------------------------------------------- document -- */

/**
 * Motion is opt-out aware: every animated class is switched off when the
 * reader has asked their OS to reduce motion, and the static frame is designed
 * to be the correct composition on its own.
 */
export const MOTION_GUARD = `@media (prefers-reduced-motion: reduce){*{animation:none!important}}`;

export function svg({ w, h, title, desc, defs = '', css = '', body }) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" role="img" aria-labelledby="t d" fill="none">
<title id="t">${esc(title)}</title>
<desc id="d">${esc(desc)}</desc>
<defs>${defs}</defs>
<style>${css}${MOTION_GUARD}</style>
${body}
</svg>
`;
}
