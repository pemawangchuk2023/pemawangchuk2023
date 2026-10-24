/**
 * Minimal SVG authoring primitives.
 *
 * The assets are rendered by GitHub inside <img>, which means no scripts, no
 * webfonts and no foreignObject. Everything here sticks to plain shapes,
 * internal <use> references and CSS animation, which is the subset that
 * survives that sandbox. Text is handled separately, in type.mjs.
 */

export const round = (n) => Math.round(n * 100) / 100;

export function esc(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/* ----------------------------------------------------------------- shapes -- */

export function rect({ x, y, w, h, fill = 'none', stroke, strokeWidth = 1, opacity, cls }) {
  const attrs = [`x="${round(x)}"`, `y="${round(y)}"`, `width="${round(w)}"`, `height="${round(h)}"`, `fill="${fill}"`];
  if (stroke) attrs.push(`stroke="${stroke}"`, `stroke-width="${strokeWidth}"`);
  if (opacity != null) attrs.push(`opacity="${opacity}"`);
  if (cls) attrs.push(`class="${cls}"`);
  return `<rect ${attrs.join(' ')}/>`;
}

export function circle({ cx, cy, r, fill = 'none', stroke, strokeWidth = 1, opacity, cls }) {
  const attrs = [`cx="${round(cx)}"`, `cy="${round(cy)}"`, `r="${round(r)}"`, `fill="${fill}"`];
  if (stroke) attrs.push(`stroke="${stroke}"`, `stroke-width="${strokeWidth}"`);
  if (opacity != null) attrs.push(`opacity="${opacity}"`);
  if (cls) attrs.push(`class="${cls}"`);
  return `<circle ${attrs.join(' ')}/>`;
}

export function path(d, { fill = 'none', stroke, strokeWidth = 1, opacity, cls, cap = 'round', join = 'round' } = {}) {
  const attrs = [`d="${d}"`, `fill="${fill}"`];
  if (stroke) attrs.push(`stroke="${stroke}"`, `stroke-width="${strokeWidth}"`, `stroke-linecap="${cap}"`, `stroke-linejoin="${join}"`);
  if (opacity != null) attrs.push(`opacity="${opacity}"`);
  if (cls) attrs.push(`class="${cls}"`);
  return `<path ${attrs.join(' ')}/>`;
}

/** Horizontal and vertical hairlines, the ledger's only structure. */
export const hr = (x1, x2, y, stroke, sw = 1) => path(`M${x1} ${y}H${x2}`, { stroke, strokeWidth: sw, cap: 'butt' });
export const vr = (x, y1, y2, stroke, sw = 1) => path(`M${x} ${y1}V${y2}`, { stroke, strokeWidth: sw, cap: 'butt' });

/** North-east arrow with its foot at (x, y). */
export const arrow = (x, y, color, size = 11, sw = 1.6) =>
  path(`M${x} ${y} L${x + size} ${y - size} M${x + 3} ${y - size} H${x + size} V${y - size + 8}`, {
    stroke: color, strokeWidth: sw, cap: 'butt', join: 'miter',
  });

/* --------------------------------------------------------------- document -- */

/**
 * Motion is opt-out aware: every animated class is switched off when the
 * reader has asked their OS to reduce motion, and the static frame is designed
 * to be the correct composition on its own.
 */
export const MOTION_GUARD = `@media (prefers-reduced-motion: reduce){*{animation:none!important}}`;

/** `glyphs` is the <defs> output of the document's Type instance. */
export function svg({ w, h, title, desc, glyphs = '', defs = '', css = '', body }) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" role="img" aria-labelledby="t d" fill="none">
<title id="t">${esc(title)}</title>
<desc id="d">${esc(desc)}</desc>
<defs>${glyphs}${defs}</defs>
<style>${css}${MOTION_GUARD}</style>
${body}
</svg>
`;
}
