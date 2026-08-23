/**
 * Generates every profile asset, once per theme, into ./assets.
 *
 *   node scripts/build-assets.mjs
 *
 * Layout is computed rather than hand-placed: text is measured, chips flow and
 * wrap, and card heights follow their content. Change the copy in profile.mjs
 * or a colour in tokens.mjs and the composition re-solves itself.
 *
 * House style: square corners everywhere, and the canvas is sized to GitHub's
 * README column (see W in tokens.mjs) so the font sizes below are real
 * on-screen pixels rather than values the browser then scales down.
 */

import { writeFile, mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

import { THEMES, W } from './tokens.mjs';
import { IDENTITY, DOMAINS, STACK, LOOP, LINKS, FOOTER } from './profile.mjs';
import {
  svg, text, lines, rect, circle, path, chip, measure, wrap,
  gridDef, auroraDef, linearDef, cornerTicks, round,
} from './svg.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(ROOT, 'assets');

const PAD = 48; // outer gutter shared by every card

/* ------------------------------------------------------------------ icons -- */

function icon(kind, x, y, color, scale = 1) {
  const g = (inner) => `<g transform="translate(${x} ${y}) scale(${scale})">${inner}</g>`;
  if (kind === 'ledger') {
    return g(
      rect({ x: 0, y: 12, w: 4.5, h: 10, fill: color, opacity: 0.45 }) +
      rect({ x: 8, y: 5, w: 4.5, h: 17, fill: color, opacity: 0.75 }) +
      rect({ x: 16, y: 9, w: 4.5, h: 13, fill: color }) +
      path('M0 2 L7 8 L13 3 L21 0', { stroke: color, strokeWidth: 1.8, opacity: 0.55 }),
    );
  }
  if (kind === 'code') {
    return g(
      path('M7.5 3 L1 11 L7.5 19', { stroke: color, strokeWidth: 2, cap: 'square' }) +
      path('M14.5 3 L21 11 L14.5 19', { stroke: color, strokeWidth: 2, cap: 'square' }) +
      path('M12.5 1.5 L9.5 20.5', { stroke: color, strokeWidth: 2, opacity: 0.45, cap: 'square' }),
    );
  }
  return g(
    rect({ x: 0, y: 1, w: 8.5, h: 8.5, stroke: color, strokeWidth: 1.8 }) +
    rect({ x: 12.5, y: 1, w: 8.5, h: 8.5, stroke: color, strokeWidth: 1.8 }) +
    rect({ x: 6.25, y: 13, w: 8.5, h: 8.5, fill: color, opacity: 0.85 }) +
    path('M8.5 5.25 H12.5', { stroke: color, strokeWidth: 1.8 }) +
    path('M6 9.5 L9 13 M15 9.5 L12 13', { stroke: color, strokeWidth: 1.8, opacity: 0.6 }),
  );
}

/* ------------------------------------------------------------------- hero -- */

function hero(t) {
  const H = 400;
  const cardW = W - 2, cardH = H - 2;
  const orbX = 800, orbY = 190;

  const defs = [
    linearDef('bg', t.surface, t.surfaceAlt, { x2: '70%', y2: '100%' }),
    linearDef('rule', t.accent, t.accent2),
    linearDef('core', t.accent, t.accent2, { x2: '100%', y2: '100%' }),
    auroraDef('auroraA', t.accent, 0.8),
    auroraDef('auroraB', t.accent2, 0.7),
    auroraDef('auroraC', t.accent3, 0.5),
    auroraDef('orbGlow', t.accent, 0.28),
    gridDef('grid', t, 36),
    `<clipPath id="card"><rect x="1" y="1" width="${cardW}" height="${cardH}"/></clipPath>`,
  ].join('');

  const css = `
    .drift1{animation:d1 26s ease-in-out infinite}
    .drift2{animation:d2 34s ease-in-out infinite}
    .drift3{animation:d3 42s ease-in-out infinite}
    @keyframes d1{0%,100%{transform:translate(0,0)}50%{transform:translate(42px,24px)}}
    @keyframes d2{0%,100%{transform:translate(0,0)}50%{transform:translate(-38px,-20px)}}
    @keyframes d3{0%,100%{transform:translate(0,0)}50%{transform:translate(24px,-26px)}}
    .orb{transform-box:view-box;transform-origin:${orbX}px ${orbY}px}
    .o1{animation:spin 19s linear infinite}
    .o2{animation:spin 31s linear infinite reverse}
    .o3{animation:spin 46s linear infinite}
    @keyframes spin{to{transform:rotate(360deg)}}
    .pulse{animation:pulse 2.6s ease-in-out infinite}
    @keyframes pulse{0%,100%{opacity:1}50%{opacity:.28}}
  `;

  /* Status tag trails the eyebrow so the right half belongs to the glyph alone. */
  const statusSize = 11.5, statusTrack = 2;
  const statusW = Math.ceil(measure(IDENTITY.status, statusSize, { mono: true, tracking: statusTrack }) + 46);
  const statusX = PAD + Math.ceil(measure(IDENTITY.eyebrow, 12.5, { mono: true, tracking: 3 })) + 22;
  const statusY = 48, statusH = 30;
  const statusCy = statusY + statusH / 2;

  let cx = PAD;
  const chipsSvg = IDENTITY.chips
    .map((label, i) => {
      const c = chip(label, {
        x: cx, y: 324, t, size: 14.5, h: 36,
        dot: [t.accent, t.accent3][i % 2],
        fill: t.surfaceHi, stroke: t.border,
      });
      cx += c.w + 12;
      return c.svg;
    })
    .join('');

  /* Orbit glyph: rings, a scanning arc per ring, and one satellite each. It is
     allowed to bleed off the right edge, where the card clip crops it. */
  const polar = (r, deg) => [orbX + Math.cos((deg * Math.PI) / 180) * r, orbY + Math.sin((deg * Math.PI) / 180) * r];
  const arcPath = (r, from, sweep) => {
    const [x1, y1] = polar(r, from);
    const [x2, y2] = polar(r, from + sweep);
    return `M${round(x1)} ${round(y1)}A${r} ${r} 0 ${sweep > 180 ? 1 : 0} 1 ${round(x2)} ${round(y2)}`;
  };
  const ring = (r, stroke, opacity, dash, sw = 1.5) =>
    circle({ cx: orbX, cy: orbY, r, stroke, strokeWidth: sw, opacity, dash });

  const nodes = Array.from({ length: 6 }, (_, i) => {
    const [x, y] = polar(74, i * 60 - 90);
    return circle({ cx: x, cy: y, r: 2.8, fill: t.faint });
  }).join('');

  const ticks = Array.from({ length: 24 }, (_, i) => {
    const deg = i * 15;
    const long = i % 6 === 0;
    const [x1, y1] = polar(104, deg);
    const [x2, y2] = polar(long ? 116 : 111, deg);
    return path(`M${round(x1)} ${round(y1)}L${round(x2)} ${round(y2)}`, {
      stroke: t.borderHi, strokeWidth: long ? 1.5 : 1, opacity: long ? 1 : 0.55, cap: 'butt',
    });
  }).join('');

  const hexPts = Array.from({ length: 6 }, (_, i) => {
    const [x, y] = polar(25, i * 60 - 90);
    return `${round(x)} ${round(y)}`;
  });

  const orbit = [
    circle({ cx: orbX, cy: orbY, r: 122, fill: 'url(#orbGlow)' }),
    ticks,
    ring(100, t.border, 0.9),
    ring(74, t.borderHi, 0.9, '2 8', 1.25),
    ring(46, t.borderHi, 0.95),
    nodes,
    path(arcPath(100, -110, 84), { stroke: t.accent, strokeWidth: 2.5, opacity: 0.85, cls: 'orb o3', cap: 'butt' }),
    path(arcPath(74, 40, 60), { stroke: t.accent3, strokeWidth: 2, opacity: 0.8, cls: 'orb o2', cap: 'butt' }),
    path(arcPath(46, 150, 70), { stroke: t.accent2, strokeWidth: 2.5, opacity: 0.85, cls: 'orb o1', cap: 'butt' }),
    path(`M${hexPts.join('L')}Z`, { fill: 'url(#core)' }),
    circle({ cx: orbX, cy: orbY, r: 8, fill: t.surface, opacity: 0.92 }),
    `<g class="orb o1">${circle({ cx: orbX, cy: orbY - 46, r: 5, fill: t.accent })}</g>`,
    `<g class="orb o2">${circle({ cx: orbX + 74, cy: orbY, r: 4.5, fill: t.accent2 })}</g>`,
    `<g class="orb o3">${circle({ cx: orbX, cy: orbY + 100, r: 4.5, fill: t.accent3 })}</g>`,
  ].join('');

  const body = `
${rect({ x: 1, y: 1, w: cardW, h: cardH, fill: 'url(#bg)' })}
<g clip-path="url(#card)">
  ${rect({ x: 1, y: 1, w: cardW, h: cardH, fill: 'url(#grid)' })}
  <g opacity="${t.auroraOpacity}">
    <g class="drift1"><ellipse cx="110" cy="20" rx="360" ry="260" fill="url(#auroraA)"/></g>
    <g class="drift2"><ellipse cx="820" cy="390" rx="400" ry="280" fill="url(#auroraB)"/></g>
    <g class="drift3"><ellipse cx="500" cy="-60" rx="300" ry="210" fill="url(#auroraC)"/></g>
  </g>
  ${orbit}
  ${cornerTicks(1, 1, cardW, cardH, t, 12, 15)}
</g>
${rect({ x: 1, y: 1, w: cardW, h: cardH, stroke: t.border, strokeWidth: 1.25 })}

${rect({ x: statusX, y: statusY, w: statusW, h: statusH, fill: t.surfaceHi, stroke: t.border })}
${circle({ cx: statusX + 19, cy: statusCy, r: 4.5, fill: t.accent3, cls: 'pulse' })}
${text(IDENTITY.status, { x: statusX + 32, y: statusCy + 4.2, size: statusSize, weight: 700, fill: t.accent3, mono: true, tracking: statusTrack })}

${text(IDENTITY.eyebrow, { x: PAD, y: 68, size: 12.5, weight: 600, fill: t.faint, mono: true, tracking: 3 })}
${text(IDENTITY.name, { x: PAD, y: 152, size: 68, weight: 700, fill: t.text, tracking: -2 })}
${rect({ x: PAD, y: 174, w: 96, h: 5, fill: 'url(#rule)' })}
${text(IDENTITY.role, { x: PAD, y: 222, size: 21, weight: 550, fill: t.text })}
${lines(IDENTITY.lede, { x: PAD, y: 264, leading: 27, size: 17, fill: t.muted })}
${chipsSvg}
`;

  return svg({
    w: W, h: H, defs, css, body,
    title: `${IDENTITY.name} — ${IDENTITY.role}`,
    desc: `${IDENTITY.eyebrow}. ${IDENTITY.lede.join(' ')} Based in Thimphu, Bhutan. Open to collaborate.`,
  });
}

/* ---------------------------------------------------------------- domains -- */

function domains(t) {
  const H = 280;
  const gap = 16;
  const cw = (W - gap * 2) / 3;
  const ch = H - 2;
  const inner = cw - 48;

  const defs = DOMAINS.map((d, i) => auroraDef(`glow${i}`, t[d.accent], 0.34)).join('') +
    DOMAINS.map((_, i) => {
      const x = i * (cw + gap);
      return `<clipPath id="c${i}"><rect x="${round(x + 0.75)}" y="1" width="${round(cw - 1.5)}" height="${ch}"/></clipPath>`;
    }).join('');

  const cards = DOMAINS.map((d, i) => {
    const x = i * (cw + gap);
    const color = t[d.accent];
    const body = wrap(d.body, inner, 16).slice(0, 4);
    return `
<g>
  ${rect({ x: x + 0.75, y: 1, w: cw - 1.5, h: ch, fill: t.surface })}
  <g clip-path="url(#c${i})">
    <ellipse cx="${round(x + 34)}" cy="8" rx="170" ry="115" fill="url(#glow${i})" opacity="${round(t.auroraOpacity * 0.5)}"/>
  </g>
  ${rect({ x: x + 0.75, y: 1, w: cw - 1.5, h: ch, stroke: t.border, strokeWidth: 1.25 })}
  ${rect({ x: x + 24, y: 26, w: 26, h: 4, fill: color })}
  ${text(d.n, { x: x + 24, y: 58, size: 12, weight: 700, fill: color, mono: true, tracking: 2.4 })}
  ${icon(d.icon, x + cw - 46, 26, color, 1)}
  ${text(d.title, { x: x + 24, y: 104, size: 20.5, weight: 650, fill: t.text, tracking: -0.4 })}
  ${lines(body, { x: x + 24, y: 140, leading: 24, size: 16, fill: t.muted })}
  ${path(`M${round(x + 24)} 234 H${round(x + cw - 24)}`, { stroke: t.border, strokeWidth: 1 })}
  ${text(d.meta, { x: x + 24, y: 258, size: 11, weight: 600, fill: t.faint, mono: true, tracking: 2 })}
</g>`;
  }).join('');

  return svg({
    w: W, h: H, defs, body: cards,
    title: 'Three domains: public finance, software engineering, open protocols',
    desc: DOMAINS.map((d) => `${d.title}: ${d.body}`).join(' '),
  });
}

/* ------------------------------------------------------------------ stack -- */

function stack(t) {
  const railX = 36, chipsX = 56, maxX = W - 36;
  const gap = 9, chipH = 36, chipGapY = 10, rowGap = 30, labelH = 28;
  const rails = [t.accent, t.accent2, t.accent3];
  const avail = maxX - chipsX;

  const make = (label, brand, x, y) => chip(label, {
    x, y, t, size: 15, h: chipH,
    dot: brand ?? t.text, fill: t.surfaceAlt, stroke: t.border, color: t.text,
  });

  /**
   * Split a row into the fewest EQUAL-length lines that fit. An even 4 + 4 reads
   * as a deliberate grid; a greedy fill would leave one orphan tag on line two.
   */
  const split = (items) => {
    const widths = items.map(([l, b]) => make(l, b, 0, 0).w);
    const fits = (chunkSize) => {
      for (let i = 0; i < items.length; i += chunkSize) {
        const slice = widths.slice(i, i + chunkSize);
        const total = slice.reduce((a, b) => a + b, 0) + gap * (slice.length - 1);
        if (total > avail) return false;
      }
      return true;
    };
    for (let n = 1; n <= items.length; n++) {
      const chunkSize = Math.ceil(items.length / n);
      if (fits(chunkSize)) {
        const rows = [];
        for (let i = 0; i < items.length; i += chunkSize) rows.push(items.slice(i, i + chunkSize));
        return rows;
      }
    }
    return [items];
  };

  const parts = [];
  let y = 40;
  STACK.forEach((row, i) => {
    const grid = split(row.items);
    grid.forEach((line, li) => {
      let x = chipsX;
      const lineY = y + labelH + li * (chipH + chipGapY);
      for (const [label, brand] of line) {
        const c = make(label, brand, x, lineY);
        parts.push(c.svg);
        x += c.w + gap;
      }
    });
    const blockH = labelH + grid.length * chipH + (grid.length - 1) * chipGapY;
    parts.push(
      rect({ x: railX, y, w: 3, h: blockH, fill: rails[i] }),
      text(row.label, { x: chipsX, y: y + 13, size: 12.5, weight: 700, fill: t.faint, mono: true, tracking: 2.4 }),
    );
    y += blockH + rowGap;
    if (i < STACK.length - 1) {
      parts.push(path(`M${railX} ${round(y - rowGap / 2)} H${maxX}`, { stroke: t.border, strokeWidth: 1, opacity: 0.7 }));
    }
  });

  const H = y - rowGap + 36;
  const body = `
${rect({ x: 0.75, y: 1, w: W - 1.5, h: H - 2, fill: t.surface })}
${rect({ x: 0.75, y: 1, w: W - 1.5, h: H - 2, stroke: t.border, strokeWidth: 1.25 })}
${parts.join('')}`;

  return svg({
    w: W, h: H, body,
    title: 'Engineering stack',
    desc: STACK.map((r) => `${r.label}: ${r.items.map(([l]) => l).join(', ')}`).join('. '),
  });
}

/* ------------------------------------------------------------------- loop -- */

function loop(t) {
  const H = 280;
  const y0 = 90, half = 32;
  const xs = [157.5, 352.5, 547.5, 742.5];
  const COL = 178; // stage text column: narrow enough to clear the return bus
  const accents = [t.accent, t.accent2, t.accent3, t.accent4];

  const css = `
    .flow{stroke-dasharray:7 9;animation:flow 1.5s linear infinite}
    @keyframes flow{to{stroke-dashoffset:-16}}
    .flowback{stroke-dasharray:6 10;animation:flowback 2.6s linear infinite}
    @keyframes flowback{to{stroke-dashoffset:-16}}
  `;

  const stages = LOOP.map((s, i) => {
    const x = xs[i];
    const sub = wrap(s.body, COL, 14.5);
    return `
${rect({ x: x - half, y: y0 - half, w: half * 2, h: half * 2, fill: t.surfaceAlt, stroke: t.borderHi, strokeWidth: 1.25 })}
${rect({ x: x - half - 9, y: y0 - half - 9, w: half * 2 + 18, h: half * 2 + 18, stroke: accents[i], strokeWidth: 1.25, opacity: 0.32 })}
${text(s.n, { x, y: y0 + 6, size: 17, weight: 700, fill: accents[i], mono: true, anchor: 'middle', tracking: 1 })}
${text(s.title, { x, y: 172, size: 19, weight: 650, fill: t.text, anchor: 'middle', tracking: -0.3 })}
${lines(sub, { x, y: 198, leading: 20, size: 14.5, fill: t.faint, anchor: 'middle' })}`;
  }).join('');

  const connectors = xs.slice(0, -1).map((x, i) => {
    const from = x + half + 14, to = xs[i + 1] - half - 20;
    return path(`M${from} ${y0} H${to}`, { stroke: t.borderHi, strokeWidth: 1.5, cls: 'flow', cap: 'butt' }) +
      path(`M${to} ${y0 - 5} L${to + 7} ${y0} L${to} ${y0 + 5}`, { stroke: t.borderHi, strokeWidth: 1.5, cap: 'butt' });
  }).join('');

  /* Return path is routed around the outside of the stage columns, so it can
     never cross a description no matter how the copy wraps. */
  const [BUS_L, BUS_R, BUS_Y] = [36, W - 36, 246];
  const busD = `M${xs[3] + half} ${y0} H${BUS_R} V${BUS_Y} H${BUS_L} V${y0} H${xs[0] - half - 9}`;
  const labelW = Math.ceil(measure('REFINE', 11, { mono: true, tracking: 2.4 }) + 28);
  const returnArc = `
${path(busD, { stroke: t.borderHi, strokeWidth: 1.5, cls: 'flowback', join: 'miter', cap: 'butt' })}
${path(`M${xs[0] - half - 16} ${y0 - 5} L${xs[0] - half - 9} ${y0} L${xs[0] - half - 16} ${y0 + 5}`, { stroke: t.borderHi, strokeWidth: 1.5, cap: 'butt' })}
${rect({ x: W / 2 - labelW / 2, y: BUS_Y - 14, w: labelW, h: 28, fill: t.surface, stroke: t.borderHi })}
${text('REFINE', { x: W / 2, y: BUS_Y + 4, size: 11, weight: 700, fill: t.muted, mono: true, tracking: 2.4, anchor: 'middle' })}`;

  const body = `
${rect({ x: 0.75, y: 1, w: W - 1.5, h: H - 2, fill: t.surface })}
${rect({ x: 0.75, y: 1, w: W - 1.5, h: H - 2, stroke: t.border, strokeWidth: 1.25 })}
${connectors}
${returnArc}
${stages}`;

  return svg({
    w: W, h: H, css, body,
    title: 'How I work: understand, model, build, explain, refine',
    desc: LOOP.map((s) => `${s.n} ${s.title}: ${s.body}`).join(' ') + ' Then refine and repeat.',
  });
}

/* ----------------------------------------------------------------- footer -- */

function footer(t) {
  const H = 196;
  const defs = auroraDef('fglow', t.accent2, 0.55) +
    linearDef('fbg', t.surface, t.surfaceAlt, { x2: '100%', y2: '100%' }) +
    `<clipPath id="fcard"><rect x="0.75" y="1" width="${W - 1.5}" height="${H - 2}"/></clipPath>` +
    gridDef('fgrid', t, 28);

  const dots = [t.accent, t.accent2, t.accent3, t.accent4]
    .map((c, i) => rect({ x: W / 2 - 31 + i * 20, y: 160, w: 8, h: 8, fill: c, opacity: 0.85 }))
    .join('');

  const body = `
${rect({ x: 0.75, y: 1, w: W - 1.5, h: H - 2, fill: 'url(#fbg)' })}
<g clip-path="url(#fcard)">
  ${rect({ x: 0.75, y: 1, w: W - 1.5, h: H - 2, fill: 'url(#fgrid)' })}
  <ellipse cx="${W / 2}" cy="220" rx="420" ry="180" fill="url(#fglow)" opacity="${t.auroraOpacity}"/>
</g>
${rect({ x: 0.75, y: 1, w: W - 1.5, h: H - 2, stroke: t.border, strokeWidth: 1.25 })}
${text(FOOTER.eyebrow, { x: W / 2, y: 56, size: 12, weight: 700, fill: t.faint, mono: true, tracking: 3.2, anchor: 'middle' })}
${text(FOOTER.headline, { x: W / 2, y: 108, size: 36, weight: 700, fill: t.text, tracking: -1, anchor: 'middle' })}
${text(FOOTER.sub, { x: W / 2, y: 140, size: 16, weight: 450, fill: t.muted, anchor: 'middle' })}
${dots}`;

  return svg({ w: W, h: H, defs, body, title: FOOTER.headline, desc: `${FOOTER.headline} ${FOOTER.sub}` });
}

/* ---------------------------------------------------------------- buttons -- */

function linkIcon(kind, x, y, color) {
  const g = (inner) => `<g transform="translate(${x} ${y})">${inner}</g>`;
  if (kind === 'grid') {
    const cell = (cx, cy, o) => rect({ x: cx, y: cy, w: 7.5, h: 7.5, fill: color, opacity: o });
    return g(cell(0, 0, 1) + cell(10.5, 0, 0.6) + cell(0, 10.5, 0.6) + cell(10.5, 10.5, 1));
  }
  if (kind === 'arrow') {
    return g(path('M3 15 L15 3 M6 3 H15 V12', { stroke: color, strokeWidth: 2.2, cap: 'butt', join: 'miter' }));
  }
  const pts = Array.from({ length: 10 }, (_, i) => {
    const r = i % 2 === 0 ? 9 : 3.9;
    const a = (Math.PI / 5) * i - Math.PI / 2;
    return `${round(9 + Math.cos(a) * r)} ${round(9 + Math.sin(a) * r)}`;
  });
  return g(path(`M${pts.join('L')}Z`, { fill: color }));
}

function button(t, link) {
  const H = 46, size = 16;
  // 22 gutter + 18 icon + 12 gap + label + 14 gap + 7 chevron + 20 tail
  const labelW = measure(link.label, size, { bold: true });
  const w = Math.ceil(labelW + 93);
  const color = t[link.accent];
  const body = `
${rect({ x: 0.75, y: 0.75, w: w - 1.5, h: H - 1.5, fill: t.surfaceAlt })}
${rect({ x: 0.75, y: 0.75, w: w - 1.5, h: H - 1.5, stroke: t.border, strokeWidth: 1.25 })}
${linkIcon(link.icon, 22, 14, color)}
${text(link.label, { x: 52, y: 29, size, weight: 600, fill: t.text })}
${path(`M${w - 27} 18 L${w - 20} 23 L${w - 27} 28`, { stroke: t.faint, strokeWidth: 1.8, cap: 'butt', join: 'miter' })}`;
  return svg({ w, h: H, body, title: link.label, desc: `Link to ${link.label}` });
}

/* ------------------------------------------------------------------- main -- */

const BUILDERS = { hero, domains, stack, loop, footer };

await mkdir(OUT, { recursive: true });
const written = [];
const emit = async (name, contents) => {
  await writeFile(join(OUT, `${name}.svg`), contents, 'utf8');
  written.push(`assets/${name}.svg`.padEnd(30) + `${String(Buffer.byteLength(contents)).padStart(6)} B`);
};

for (const theme of Object.values(THEMES)) {
  for (const [name, build] of Object.entries(BUILDERS)) await emit(`${name}-${theme.name}`, build(theme));
  for (const link of LINKS) await emit(`btn-${link.id}-${theme.name}`, button(theme, link));
}

console.log(written.join('\n'));
console.log(`\n${written.length} files written to assets/`);
