/**
 * Generates every profile asset, once per theme, into ./assets.
 *
 *   node scripts/build-assets.mjs
 *
 * Layout is computed rather than hand-placed: text is measured, chips flow and
 * wrap, and card heights follow their content. Change the copy in profile.mjs
 * or a colour in tokens.mjs and the composition re-solves itself.
 *
 * House style: square corners everywhere, and type sized to stay readable once
 * GitHub scales a 1200px-wide asset down into its ~880px README column.
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

const PAD = 64; // outer gutter shared by every card

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
  const H = 452;
  const cardW = W - 2, cardH = H - 2;
  const orbX = 1000, orbY = 216;

  const defs = [
    linearDef('bg', t.surface, t.surfaceAlt, { x2: '70%', y2: '100%' }),
    linearDef('rule', t.accent, t.accent2),
    linearDef('core', t.accent, t.accent2, { x2: '100%', y2: '100%' }),
    auroraDef('auroraA', t.accent, 0.8),
    auroraDef('auroraB', t.accent2, 0.7),
    auroraDef('auroraC', t.accent3, 0.5),
    auroraDef('orbGlow', t.accent, 0.28),
    gridDef('grid', t),
    `<clipPath id="card"><rect x="1" y="1" width="${cardW}" height="${cardH}"/></clipPath>`,
  ].join('');

  const css = `
    .drift1{animation:d1 26s ease-in-out infinite}
    .drift2{animation:d2 34s ease-in-out infinite}
    .drift3{animation:d3 42s ease-in-out infinite}
    @keyframes d1{0%,100%{transform:translate(0,0)}50%{transform:translate(48px,26px)}}
    @keyframes d2{0%,100%{transform:translate(0,0)}50%{transform:translate(-44px,-22px)}}
    @keyframes d3{0%,100%{transform:translate(0,0)}50%{transform:translate(26px,-30px)}}
    .orb{transform-box:view-box;transform-origin:${orbX}px ${orbY}px}
    .o1{animation:spin 19s linear infinite}
    .o2{animation:spin 31s linear infinite reverse}
    .o3{animation:spin 46s linear infinite}
    @keyframes spin{to{transform:rotate(360deg)}}
    .pulse{animation:pulse 2.6s ease-in-out infinite}
    @keyframes pulse{0%,100%{opacity:1}50%{opacity:.28}}
  `;

  /* Status tag trails the eyebrow so the right half belongs to the glyph alone. */
  const statusSize = 12, statusTrack = 2;
  const statusW = Math.ceil(measure(IDENTITY.status, statusSize, { mono: true, tracking: statusTrack }) + 50);
  const statusX = PAD + Math.ceil(measure(IDENTITY.eyebrow, 13.5, { mono: true, tracking: 3.2 })) + 26;
  const statusY = 74, statusH = 32;
  const statusCy = statusY + statusH / 2;

  let cx = PAD;
  const chipsSvg = IDENTITY.chips
    .map((label, i) => {
      const c = chip(label, {
        x: cx, y: 370, t, size: 15, h: 38,
        dot: [t.accent, t.accent2, t.accent3][i],
        fill: t.surfaceHi, stroke: t.border,
      });
      cx += c.w + 12;
      return c.svg;
    })
    .join('');

  /* Orbit glyph: rings, a scanning arc per ring, and one satellite each. */
  const polar = (r, deg) => [orbX + Math.cos((deg * Math.PI) / 180) * r, orbY + Math.sin((deg * Math.PI) / 180) * r];
  const arcPath = (r, from, sweep) => {
    const [x1, y1] = polar(r, from);
    const [x2, y2] = polar(r, from + sweep);
    return `M${round(x1)} ${round(y1)}A${r} ${r} 0 ${sweep > 180 ? 1 : 0} 1 ${round(x2)} ${round(y2)}`;
  };
  const ring = (r, stroke, opacity, dash, sw = 1.5) =>
    circle({ cx: orbX, cy: orbY, r, stroke, strokeWidth: sw, opacity, dash });

  const nodes = Array.from({ length: 6 }, (_, i) => {
    const [x, y] = polar(84, i * 60 - 90);
    return circle({ cx: x, cy: y, r: 3, fill: t.faint });
  }).join('');

  const ticks = Array.from({ length: 24 }, (_, i) => {
    const deg = i * 15;
    const long = i % 6 === 0;
    const [x1, y1] = polar(118, deg);
    const [x2, y2] = polar(long ? 130 : 125, deg);
    return path(`M${round(x1)} ${round(y1)}L${round(x2)} ${round(y2)}`, {
      stroke: t.borderHi, strokeWidth: long ? 1.5 : 1, opacity: long ? 1 : 0.55, cap: 'butt',
    });
  }).join('');

  const hexPts = Array.from({ length: 6 }, (_, i) => {
    const [x, y] = polar(27, i * 60 - 90);
    return `${round(x)} ${round(y)}`;
  });

  const orbit = [
    circle({ cx: orbX, cy: orbY, r: 136, fill: 'url(#orbGlow)' }),
    ticks,
    ring(114, t.border, 0.9),
    ring(84, t.borderHi, 0.9, '2 8', 1.25),
    ring(52, t.borderHi, 0.95),
    nodes,
    path(arcPath(114, -110, 84), { stroke: t.accent, strokeWidth: 2.5, opacity: 0.85, cls: 'orb o3', cap: 'butt' }),
    path(arcPath(84, 40, 60), { stroke: t.accent3, strokeWidth: 2, opacity: 0.8, cls: 'orb o2', cap: 'butt' }),
    path(arcPath(52, 150, 70), { stroke: t.accent2, strokeWidth: 2.5, opacity: 0.85, cls: 'orb o1', cap: 'butt' }),
    path(`M${hexPts.join('L')}Z`, { fill: 'url(#core)' }),
    circle({ cx: orbX, cy: orbY, r: 9, fill: t.surface, opacity: 0.92 }),
    `<g class="orb o1">${circle({ cx: orbX, cy: orbY - 52, r: 5.5, fill: t.accent })}</g>`,
    `<g class="orb o2">${circle({ cx: orbX + 84, cy: orbY, r: 5, fill: t.accent2 })}</g>`,
    `<g class="orb o3">${circle({ cx: orbX, cy: orbY + 114, r: 5, fill: t.accent3 })}</g>`,
  ].join('');

  const body = `
${rect({ x: 1, y: 1, w: cardW, h: cardH, fill: 'url(#bg)' })}
<g clip-path="url(#card)">
  ${rect({ x: 1, y: 1, w: cardW, h: cardH, fill: 'url(#grid)' })}
  <g opacity="${t.auroraOpacity}">
    <g class="drift1"><ellipse cx="150" cy="30" rx="430" ry="290" fill="url(#auroraA)"/></g>
    <g class="drift2"><ellipse cx="1080" cy="430" rx="470" ry="320" fill="url(#auroraB)"/></g>
    <g class="drift3"><ellipse cx="660" cy="-60" rx="360" ry="240" fill="url(#auroraC)"/></g>
  </g>
  ${orbit}
  ${cornerTicks(1, 1, cardW, cardH, t, 14, 18)}
</g>
${rect({ x: 1, y: 1, w: cardW, h: cardH, stroke: t.border, strokeWidth: 1.25 })}

${rect({ x: statusX, y: statusY, w: statusW, h: statusH, fill: t.surfaceHi, stroke: t.border })}
${circle({ cx: statusX + 20, cy: statusCy, r: 4.5, fill: t.accent3, cls: 'pulse' })}
${text(IDENTITY.status, { x: statusX + 34, y: statusCy + 4.4, size: statusSize, weight: 700, fill: t.accent3, mono: true, tracking: statusTrack })}

${text(IDENTITY.eyebrow, { x: PAD, y: 98, size: 13.5, weight: 600, fill: t.faint, mono: true, tracking: 3.2 })}
${text(IDENTITY.name, { x: PAD, y: 192, size: 72, weight: 700, fill: t.text, tracking: -2 })}
${rect({ x: PAD, y: 218, w: 110, h: 5, fill: 'url(#rule)' })}
${text(IDENTITY.role, { x: PAD, y: 274, size: 22, weight: 550, fill: t.text })}
${lines(IDENTITY.lede, { x: PAD, y: 318, leading: 28, size: 18, fill: t.muted })}
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
  const H = 312;
  const gap = 20;
  const cw = (W - gap * 2) / 3;
  const ch = H - 2;
  const inner = cw - 56;

  const defs = DOMAINS.map((d, i) => auroraDef(`glow${i}`, t[d.accent], 0.34)).join('') +
    DOMAINS.map((_, i) => {
      const x = i * (cw + gap);
      return `<clipPath id="c${i}"><rect x="${round(x + 0.75)}" y="1" width="${round(cw - 1.5)}" height="${ch}"/></clipPath>`;
    }).join('');

  const cards = DOMAINS.map((d, i) => {
    const x = i * (cw + gap);
    const color = t[d.accent];
    const body = wrap(d.body, inner, 17).slice(0, 4);
    return `
<g>
  ${rect({ x: x + 0.75, y: 1, w: cw - 1.5, h: ch, fill: t.surface })}
  <g clip-path="url(#c${i})">
    <ellipse cx="${round(x + 40)}" cy="10" rx="200" ry="130" fill="url(#glow${i})" opacity="${round(t.auroraOpacity * 0.5)}"/>
  </g>
  ${rect({ x: x + 0.75, y: 1, w: cw - 1.5, h: ch, stroke: t.border, strokeWidth: 1.25 })}
  ${rect({ x: x + 28, y: 30, w: 30, h: 4, fill: color })}
  ${text(d.n, { x: x + 28, y: 66, size: 13, weight: 700, fill: color, mono: true, tracking: 2.6 })}
  ${icon(d.icon, x + cw - 60, 32, color, 1.25)}
  ${text(d.title, { x: x + 28, y: 122, size: 25, weight: 650, fill: t.text, tracking: -0.5 })}
  ${lines(body, { x: x + 28, y: 162, leading: 26, size: 17, fill: t.muted })}
  ${path(`M${round(x + 28)} 258 H${round(x + cw - 28)}`, { stroke: t.border, strokeWidth: 1 })}
  ${text(d.meta, { x: x + 28, y: 288, size: 12, weight: 600, fill: t.faint, mono: true, tracking: 2.2 })}
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
  // The label sits above its chips rather than beside them, so a row gets the
  // full card width and eight tags fit on one line.
  const railX = 40, chipsX = 60, maxX = W - 40;
  const gap = 10, chipH = 38, chipGapY = 12, rowGap = 34, labelH = 30;
  const rails = [t.accent, t.accent2, t.accent3];

  /** Flow chips left to right, wrapping at maxX. Returns markup + used height. */
  const flow = (items, top) => {
    const out = [];
    let x = chipsX, y = top;
    for (const [label, brand] of items) {
      const make = (px, py) => chip(label, {
        x: px, y: py, t, size: 16, h: chipH,
        dot: brand ?? t.text, fill: t.surfaceAlt, stroke: t.border, color: t.text,
      });
      let c = make(x, y);
      if (x > chipsX && x + c.w > maxX) {
        x = chipsX;
        y += chipH + chipGapY;
        c = make(x, y);
      }
      out.push(c.svg);
      x += c.w + gap;
    }
    return { svg: out.join(''), height: y - top + chipH };
  };

  const parts = [];
  let y = 46;
  STACK.forEach((row, i) => {
    const { svg: chips, height } = flow(row.items, y + labelH);
    const blockH = labelH + height;
    parts.push(
      rect({ x: railX, y, w: 3, h: blockH, fill: rails[i] }),
      text(row.label, { x: chipsX, y: y + 14, size: 13, weight: 700, fill: t.faint, mono: true, tracking: 2.4 }),
      chips,
    );
    y += blockH + rowGap;
    if (i < STACK.length - 1) {
      parts.push(path(`M${railX} ${round(y - rowGap / 2)} H${maxX}`, { stroke: t.border, strokeWidth: 1, opacity: 0.7 }));
    }
  });

  const H = y - rowGap + 40;
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
  const H = 324;
  const y0 = 104, half = 38;
  const xs = [186, 462, 738, 1014];
  const COL = 220; // stage text column: narrow enough to clear the return bus
  const accents = [t.accent, t.accent2, t.accent3, t.accent4];

  const css = `
    .flow{stroke-dasharray:7 9;animation:flow 1.5s linear infinite}
    @keyframes flow{to{stroke-dashoffset:-16}}
    .flowback{stroke-dasharray:6 10;animation:flowback 2.6s linear infinite}
    @keyframes flowback{to{stroke-dashoffset:-16}}
  `;

  const stages = LOOP.map((s, i) => {
    const x = xs[i];
    const sub = wrap(s.body, COL, 15.5);
    return `
${rect({ x: x - half, y: y0 - half, w: half * 2, h: half * 2, fill: t.surfaceAlt, stroke: t.borderHi, strokeWidth: 1.25 })}
${rect({ x: x - half - 10, y: y0 - half - 10, w: half * 2 + 20, h: half * 2 + 20, stroke: accents[i], strokeWidth: 1.25, opacity: 0.32 })}
${text(s.n, { x, y: y0 + 7, size: 19, weight: 700, fill: accents[i], mono: true, anchor: 'middle', tracking: 1 })}
${text(s.title, { x, y: 204, size: 21, weight: 650, fill: t.text, anchor: 'middle', tracking: -0.3 })}
${lines(sub, { x, y: 234, leading: 22, size: 15.5, fill: t.faint, anchor: 'middle' })}`;
  }).join('');

  const connectors = xs.slice(0, -1).map((x, i) => {
    const from = x + half + 18, to = xs[i + 1] - half - 26;
    return path(`M${from} ${y0} H${to}`, { stroke: t.borderHi, strokeWidth: 1.5, cls: 'flow', cap: 'butt' }) +
      path(`M${to} ${y0 - 5.5} L${to + 8} ${y0} L${to} ${y0 + 5.5}`, { stroke: t.borderHi, strokeWidth: 1.5, cap: 'butt' });
  }).join('');

  /* Return path is routed around the outside of the stage columns, so it can
     never cross a description no matter how the copy wraps. */
  const [BUS_L, BUS_R, BUS_Y] = [52, 1148, 292];
  const busD = `M${xs[3] + half} ${y0} H${BUS_R} V${BUS_Y} H${BUS_L} V${y0} H${xs[0] - half - 10}`;
  const labelW = Math.ceil(measure('REFINE', 12, { mono: true, tracking: 2.6 }) + 32);
  const returnArc = `
${path(busD, { stroke: t.borderHi, strokeWidth: 1.5, cls: 'flowback', join: 'miter', cap: 'butt' })}
${path(`M${xs[0] - half - 18} ${y0 - 5.5} L${xs[0] - half - 10} ${y0} L${xs[0] - half - 18} ${y0 + 5.5}`, { stroke: t.borderHi, strokeWidth: 1.5, cap: 'butt' })}
${rect({ x: 600 - labelW / 2, y: BUS_Y - 15, w: labelW, h: 30, fill: t.surface, stroke: t.borderHi })}
${text('REFINE', { x: 600, y: BUS_Y + 5, size: 12, weight: 700, fill: t.muted, mono: true, tracking: 2.6, anchor: 'middle' })}`;

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
  const H = 224;
  const defs = auroraDef('fglow', t.accent2, 0.55) +
    linearDef('fbg', t.surface, t.surfaceAlt, { x2: '100%', y2: '100%' }) +
    `<clipPath id="fcard"><rect x="0.75" y="1" width="${W - 1.5}" height="${H - 2}"/></clipPath>` +
    gridDef('fgrid', t, 32);

  const dots = [t.accent, t.accent2, t.accent3, t.accent4]
    .map((c, i) => rect({ x: 600 - 33 + i * 22, y: 186, w: 9, h: 9, fill: c, opacity: 0.85 }))
    .join('');

  const body = `
${rect({ x: 0.75, y: 1, w: W - 1.5, h: H - 2, fill: 'url(#fbg)' })}
<g clip-path="url(#fcard)">
  ${rect({ x: 0.75, y: 1, w: W - 1.5, h: H - 2, fill: 'url(#fgrid)' })}
  <ellipse cx="600" cy="250" rx="520" ry="200" fill="url(#fglow)" opacity="${t.auroraOpacity}"/>
</g>
${rect({ x: 0.75, y: 1, w: W - 1.5, h: H - 2, stroke: t.border, strokeWidth: 1.25 })}
${text(FOOTER.eyebrow, { x: 600, y: 66, size: 13, weight: 700, fill: t.faint, mono: true, tracking: 3.4, anchor: 'middle' })}
${text(FOOTER.headline, { x: 600, y: 128, size: 42, weight: 700, fill: t.text, tracking: -1.2, anchor: 'middle' })}
${text(FOOTER.sub, { x: 600, y: 164, size: 17, weight: 450, fill: t.muted, anchor: 'middle' })}
${dots}`;

  return svg({ w: W, h: H, defs, body, title: FOOTER.headline, desc: `${FOOTER.headline} ${FOOTER.sub}` });
}

/* ---------------------------------------------------------------- buttons -- */

function linkIcon(kind, x, y, color) {
  const g = (inner) => `<g transform="translate(${x} ${y})">${inner}</g>`;
  if (kind === 'grid') {
    const cell = (cx, cy, o) => rect({ x: cx, y: cy, w: 8, h: 8, fill: color, opacity: o });
    return g(cell(0, 0, 1) + cell(11, 0, 0.6) + cell(0, 11, 0.6) + cell(11, 11, 1));
  }
  if (kind === 'arrow') {
    return g(path('M3.5 15.5 L15.5 3.5 M6.5 3.5 H15.5 V12.5', { stroke: color, strokeWidth: 2.2, cap: 'butt', join: 'miter' }));
  }
  const pts = Array.from({ length: 10 }, (_, i) => {
    const r = i % 2 === 0 ? 9.5 : 4.1;
    const a = (Math.PI / 5) * i - Math.PI / 2;
    return `${round(9.5 + Math.cos(a) * r)} ${round(9.5 + Math.sin(a) * r)}`;
  });
  return g(path(`M${pts.join('L')}Z`, { fill: color }));
}

function button(t, link) {
  const H = 54, size = 16;
  // 24 icon gutter + 20 icon + 14 gap + label + 16 gap + 8 chevron + 22 tail
  const labelW = measure(link.label, size, { bold: true });
  const w = Math.ceil(labelW + 104);
  const color = t[link.accent];
  const body = `
${rect({ x: 0.75, y: 0.75, w: w - 1.5, h: H - 1.5, fill: t.surfaceAlt })}
${rect({ x: 0.75, y: 0.75, w: w - 1.5, h: H - 1.5, stroke: t.border, strokeWidth: 1.25 })}
${linkIcon(link.icon, 24, 17, color)}
${text(link.label, { x: 58, y: 33, size, weight: 600, fill: t.text })}
${path(`M${w - 30} 21 L${w - 23} 27 L${w - 30} 33`, { stroke: t.faint, strokeWidth: 1.8, cap: 'butt', join: 'miter' })}`;
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
