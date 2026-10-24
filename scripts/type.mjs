/**
 * Typesetting into SVG outlines.
 *
 * GitHub shows these assets inside <img>, which blocks webfonts: any
 * font-family in the SVG falls back to whatever the reader has installed. So
 * every word is converted to glyph outlines from the font files in /fonts.
 *
 * Each glyph is stored once per document as a <path> in <defs> and placed with
 * <use>, so a paragraph costs a few KB instead of a few hundred. Metrics come
 * from the font itself, so measuring and wrapping are exact.
 */

import { fileURLToPath } from 'node:url';
import opentype from 'opentype.js';

import { FONT_FILES } from './tokens.mjs';
import { round } from './svg.mjs';

const FONTS_DIR = new URL('../fonts/', import.meta.url);

/** Loaded faces, keyed d4 / d5 / d7 / d8 (display weights) and m4 / m5 (mono). */
export const F = Object.fromEntries(
  Object.entries(FONT_FILES).map(([key, file]) => {
    const font = opentype.loadSync(fileURLToPath(new URL(file, FONTS_DIR)));
    font.key = key;
    return [key, font];
  }),
);

/** Collects the glyph outlines used by one document and emits them once. */
export class Type {
  constructor() {
    this.used = new Map();
  }

  glyphs(str, font) {
    return font.stringToGlyphs(str).map((g) => {
      if (g.index === 0) throw new Error(`${font.key} has no glyph for a character in "${str}"`);
      return g;
    });
  }

  measure(str, { font, size, tracking = 0 }) {
    const s = size / font.unitsPerEm;
    const gs = this.glyphs(str, font);
    let w = 0;
    gs.forEach((g, i) => {
      w += g.advanceWidth * s;
      if (i < gs.length - 1) w += font.getKerningValue(g, gs[i + 1]) * s + tracking;
    });
    return w;
  }

  /** Greedy word wrap against a pixel width. */
  wrap(str, max, opts) {
    const out = [];
    let line = '';
    for (const word of str.split(/\s+/)) {
      const next = line ? `${line} ${word}` : word;
      if (line && this.measure(next, opts) > max) {
        out.push(line);
        line = word;
      } else {
        line = next;
      }
    }
    if (line) out.push(line);
    return out;
  }

  run(str, { font, size, x, y, fill, tracking = 0, anchor = 'start', cls, opacity }) {
    const s = size / font.unitsPerEm;
    const width = this.measure(str, { font, size, tracking });
    let cx = anchor === 'end' ? x - width : anchor === 'middle' ? x - width / 2 : x;
    const gs = this.glyphs(str, font);
    const uses = [];
    gs.forEach((g, i) => {
      const id = `${font.key}-${g.index}`;
      if (!this.used.has(id)) this.used.set(id, g.getPath(0, 0, font.unitsPerEm).toPathData(0));
      if (g.unicode !== 32) {
        uses.push(`<use href="#${id}" transform="translate(${round(cx)} ${round(y)}) scale(${round(s * 1e4) / 1e4})"/>`);
      }
      cx += g.advanceWidth * s;
      if (i < gs.length - 1) cx += font.getKerningValue(g, gs[i + 1]) * s + tracking;
    });
    const attrs = [`fill="${fill}"`];
    if (cls) attrs.push(`class="${cls}"`);
    if (opacity != null) attrs.push(`opacity="${opacity}"`);
    return `<g ${attrs.join(' ')}>${uses.join('')}</g>`;
  }

  /** Stack of runs with a fixed leading. */
  lines(arr, { y, leading, ...rest }) {
    return arr.map((l, i) => this.run(l, { ...rest, y: y + i * leading })).join('');
  }

  defs() {
    return [...this.used].map(([id, d]) => `<path id="${id}" d="${d}"/>`).join('');
  }
}
