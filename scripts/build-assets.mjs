/**
 * Generates every profile asset, once per theme, into ./assets.
 *
 *   node scripts/build-assets.mjs
 *
 * Layout is computed rather than hand-placed: text is measured from the real
 * font metrics, lines wrap, and heights follow their content. Change the copy
 * in profile.mjs or a colour in tokens.mjs and the composition re-solves itself.
 *
 * House style, "the ledger": the profile is set like a statement of account.
 * No boxes and no backgrounds, only hairline rules, a year column, tabular
 * mono labels and an accountant's double underline under the closing line.
 * The canvas is sized to GitHub's README column (see W in tokens.mjs) so the
 * font sizes below are real on-screen pixels.
 */

import { writeFile, mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

import { THEMES, W } from './tokens.mjs';
import { IDENTITY, FY, WORK, PRACTICE, STACK, LOOP, LINKS, FOOTER } from './profile.mjs';
import { svg, rect, circle, path, hr, vr, arrow, round } from './svg.mjs';
import { F, Type } from './type.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(ROOT, 'assets');

/** Wraps svg() so each builder only has to hand over its Type instance. */
const doc = ({ T, w = W, ...rest }) => svg({ w, glyphs: T.defs(), ...rest });

/* ------------------------------------------------------------------- hero -- */

/**
 * Deterministic craggy ridge: midpoint displacement over a trend that rises
 * to the right, so the line reads as a Himalayan skyline and a chart at once.
 * It stays low under the text block and inside the 300-440 chart band.
 */
function ridge() {
  let seed = 7;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647) * 2 - 1;
  const N = 128;
  const ys = new Array(N + 1).fill(0);
  let amp = 64;
  for (let step = N; step > 1; step /= 2, amp *= 0.6) {
    for (let i = step / 2; i < N; i += step) ys[i] = (ys[i - step / 2] + ys[i + step / 2]) / 2 + rnd() * amp;
  }
  const x1 = W - 26;
  return ys.map((n, i) => {
    const t = i / N;
    const k = Math.min(1, Math.max(0, (t - 0.4) / 0.6));
    const trend = 404 - 84 * (k * k * (3 - 2 * k));
    return [x1 * t, Math.min(428, trend + n * (0.55 + t * 0.45))];
  });
}

function hero(t) {
  const T = new Type();
  const H = 486;
  const pts = ridge();
  const [ex, ey] = pts[pts.length - 1];
  const lineD = 'M' + pts.map(([x, y]) => `${round(x)} ${round(y)}`).join('L');
  let len = 0;
  for (let i = 1; i < pts.length; i++) len += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
  len = Math.ceil(len);
  /* Status sits clear of the highest ridge point beneath it. */
  const labelY = Math.min(...pts.filter(([x]) => x > ex - 210).map(([, y]) => y)) - 14;

  /* The name is fitted to run the full column width, edge to edge. */
  const fit = (W - 4) / T.measure(IDENTITY.name, { font: F.d8, size: 1 });
  const nameSize = round(fit * 1.04);

  /* The line is always fully drawn; motion is a highlight travelling along it,
     so a renderer that freezes on frame 0 still shows the whole composition. */
  const css = `
    .scan{stroke-dasharray:90 ${len};animation:scan 7s cubic-bezier(.45,0,.25,1) infinite}
    @keyframes scan{from{stroke-dashoffset:90}to{stroke-dashoffset:-${len}}}
    .ping{transform-box:fill-box;transform-origin:center;animation:ping 2.4s ease-out infinite}
    @keyframes ping{0%{transform:scale(1);opacity:.7}100%{transform:scale(4.2);opacity:0}}
  `;
  const defs = `<linearGradient id="area" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="${t.saffron}" stop-opacity="${t.areaTop}"/>
      <stop offset="100%" stop-color="${t.saffron}" stop-opacity="0"/>
    </linearGradient>`;

  const months = FY.map((m, i) => {
    const x = (i + 0.5) * (W / 12);
    return vr(round(i * (W / 12)) + 0.5, 432, 440, t.ruleHi) +
      T.run(m, { font: F.m4, size: 11, x, y: 466, fill: t.faint, tracking: 1.2, anchor: 'middle' });
  }).join('');

  const body = `
${T.run(IDENTITY.place, { font: F.m5, size: 12, x: 0, y: 22, fill: t.text, tracking: 2 })}
${T.run(IDENTITY.coords, { font: F.m4, size: 12, x: W, y: 22, fill: t.faint, tracking: 1, anchor: 'end' })}
${hr(0, W, 40, t.rule)}
${T.run(IDENTITY.name, { font: F.d8, size: nameSize, x: -2, y: 168, fill: t.text, tracking: -nameSize * 0.04 })}
${T.run(IDENTITY.role, { font: F.d7, size: 22, x: 0, y: 216, fill: t.text, tracking: -0.2 })}
${T.lines(IDENTITY.lede, { font: F.d4, size: 17, x: 0, y: 250, leading: 27, fill: t.muted })}
${months}
<path d="${lineD}V440H0Z" fill="url(#area)"/>
${path(lineD, { stroke: t.saffron, strokeWidth: 2, join: 'miter' })}
${path(lineD, { stroke: t.text, strokeWidth: 2.5, cls: 'scan', join: 'miter', opacity: 0.85 })}
${hr(0, W, 440, t.ruleHi)}
${circle({ cx: ex, cy: ey, r: 5, fill: t.vermilion, cls: 'ping' })}
${circle({ cx: ex, cy: ey, r: 5, fill: t.vermilion })}
${T.run(IDENTITY.status, { font: F.m5, size: 11.5, x: ex - 18, y: labelY, fill: t.vermilion, tracking: 1.6, anchor: 'end' })}
`;

  return doc({
    T, h: H, css, defs, body,
    title: `${IDENTITY.name}, ${IDENTITY.role}`,
    desc: `${IDENTITY.name}. ${IDENTITY.role}. ${IDENTITY.lede.join(' ')} Thimphu, Bhutan. Open to collaborate.`,
  });
}

/* ---------------------------------------------------------------- buttons -- */

function button(t, link) {
  const T = new Type();
  const H = 44, size = 12.5, track = 1.6;
  // 20 gutter + label + 14 gap + 11 arrow + 18 tail
  const w = Math.ceil(T.measure(link.label, { font: F.m5, size, tracking: track }) + 63);
  const fg = link.primary ? t.onAccent : t.text;
  const body = `
${rect({ x: 0.5, y: 0.5, w: w - 1, h: H - 1, fill: link.primary ? t.saffron : 'none', stroke: link.primary ? t.saffron : t.ruleHi })}
${T.run(link.label, { font: F.m5, size, x: 20, y: 27, fill: fg, tracking: track })}
${arrow(w - 29, 27.5, link.primary ? t.onAccent : t.saffron, 10, 1.6)}`;
  return doc({ T, w, h: H, body, title: link.label, desc: `Link: ${link.label.toLowerCase()}` });
}

/* ------------------------------------------------------------------- work -- */

const COL = { year: 0, name: 112, tags: 660, end: W };

function workHead(t) {
  const T = new Type();
  const H = 34;
  const lab = (s, x, anchor) => T.run(s, { font: F.m5, size: 11, x, y: 16, fill: t.faint, tracking: 1.8, anchor });
  const body = `${lab('YEAR', COL.year)}${lab('PROJECT', COL.name)}${lab('DETAIL', COL.tags)}${lab('LIVE', COL.end, 'end')}${hr(0, W, H - 1, t.ruleHi)}`;
  return doc({ T, h: H, body, title: 'Selected work', desc: 'Columns: year, project, detail, live link.' });
}

function workRow(t, p, last) {
  const T = new Type();
  const H = 132;
  const desc = T.wrap(p.body, COL.tags - COL.name - 48, { font: F.d4, size: 16 });
  const body = `
${T.run(p.year, { font: F.m4, size: 13, x: COL.year, y: 45, fill: t.faint, tracking: 1 })}
${T.run(p.name, { font: F.d7, size: 25, x: COL.name, y: 46, fill: t.text, tracking: -0.5 })}
${T.lines(desc, { font: F.d4, size: 16, x: COL.name, y: 78, leading: 24, fill: t.muted })}
${p.tags.map((tag, i) => T.run(tag, { font: F.m4, size: 11, x: COL.tags, y: 44 + i * 20, fill: t.faint, tracking: 1.4 })).join('')}
${arrow(W - 13, 46, t.saffron, 12, 1.8)}
${hr(0, W, H - 0.5, last ? t.ruleHi : t.rule)}`;
  return doc({ T, h: H, body, title: `${p.name} (${p.year})`, desc: `${p.body} ${p.tags.join(', ').toLowerCase()}.` });
}

/* --------------------------------------------------------------- practice -- */

function practice(t) {
  const T = new Type();
  const H = 214, gap = 36;
  const cw = (W - gap * 2) / 3;
  const body = PRACTICE.map((p, i) => {
    const x = i * (cw + gap);
    const lines = T.wrap(p.body, cw - 8, { font: F.d4, size: 16 });
    return `
${hr(round(x), round(x + cw), 1, t.ruleHi, 2)}${hr(round(x), round(x + 32), 1, t.saffron, 2)}
${T.run(p.when, { font: F.m5, size: 11.5, x, y: 34, fill: t.faint, tracking: 1.8 })}
${T.run(p.title, { font: F.d7, size: 23, x, y: 80, fill: t.text, tracking: -0.4 })}
${T.lines(lines, { font: F.d4, size: 16, x, y: 114, leading: 24, fill: t.muted })}`;
  }).join('');
  return doc({
    T, h: H, body,
    title: 'Practice: public finance, software, open protocols',
    desc: PRACTICE.map((p) => `${p.when.toLowerCase()}, ${p.title}: ${p.body}`).join(' '),
  });
}

/* ------------------------------------------------------------------ stack -- */

function stack(t) {
  const T = new Type();
  const x0 = 200, size = 18, sep = '   /   ';
  const sepW = T.measure(sep, { font: F.d4, size });
  const parts = [];
  let y = 0;
  STACK.forEach(([label, items], ri) => {
    let lx = x0, ly = y + 42;
    items.forEach((item, i) => {
      const iw = T.measure(item, { font: F.d5, size });
      if (lx + iw > W && lx > x0) { lx = x0; ly += 32; }
      parts.push(T.run(item, { font: F.d5, size, x: lx, y: ly, fill: t.text }));
      lx += iw;
      if (i < items.length - 1) {
        if (lx + sepW > W - 60) {
          lx = x0;
          ly += 32;
        } else {
          parts.push(T.run('/', { font: F.d4, size, x: lx + sepW / 2, y: ly, fill: t.ruleHi, anchor: 'middle' }));
          lx += sepW;
        }
      }
    });
    parts.push(T.run(label, { font: F.m5, size: 11.5, x: 0, y: y + 40, fill: t.faint, tracking: 1.8 }));
    y = ly + 24;
    parts.push(hr(0, W, round(y) - 0.5, ri === STACK.length - 1 ? t.ruleHi : t.rule));
  });
  return doc({
    T, h: Math.ceil(y), body: `${hr(0, W, 0.5, t.ruleHi)}${parts.join('')}`,
    title: 'Stack',
    desc: STACK.map(([l, i]) => `${l}: ${i.join(', ')}`).join('. '),
  });
}

/* ------------------------------------------------------------------- loop -- */

function loop(t) {
  const T = new Type();
  const H = 150, step = W / 4;
  const css = `.flow{stroke-dasharray:4 6;animation:flow 1.6s linear infinite}@keyframes flow{to{stroke-dashoffset:-20}}`;
  const stages = LOOP.map(([n, title, body], i) => {
    const x = i * step;
    const lines = T.wrap(body, step - 36, { font: F.d4, size: 15 });
    return `
${rect({ x, y: 14, w: 10, h: 10, fill: i === LOOP.length - 1 ? t.vermilion : t.saffron })}
${T.run(n, { font: F.m5, size: 12, x: x + 20, y: 23.5, fill: t.faint, tracking: 1.4 })}
${T.run(title, { font: F.d7, size: 21, x, y: 72, fill: t.text, tracking: -0.3 })}
${T.lines(lines, { font: F.d4, size: 15, x, y: 102, leading: 22, fill: t.muted })}`;
  }).join('');
  const links = LOOP.slice(1).map((_, i) =>
    path(`M${round(i * step + 54)} 19H${round((i + 1) * step - 14)}`, { stroke: t.ruleHi, strokeWidth: 1.25, cls: 'flow', cap: 'butt' }),
  ).join('');
  return doc({
    T, h: H, css, body: links + stages,
    title: 'How I work: understand, model, build, explain',
    desc: LOOP.map(([n, a, b]) => `${n} ${a}: ${b}`).join(' '),
  });
}

/* ----------------------------------------------------------------- footer -- */

function footer(t) {
  const T = new Type();
  const H = 214, hs = 54, htrack = -1.6;
  const hw = round(T.measure(FOOTER.headline, { font: F.d8, size: hs, tracking: htrack }));
  const body = `
${hr(0, W, 0.5, t.ruleHi)}
${T.run(FOOTER.eyebrow, { font: F.m5, size: 11.5, x: 0, y: 40, fill: t.faint, tracking: 1.8 })}
${T.run(FOOTER.local, { font: F.m4, size: 11.5, x: W, y: 40, fill: t.faint, tracking: 1.4, anchor: 'end' })}
${T.run(FOOTER.headline, { font: F.d8, size: hs, x: -1, y: 114, fill: t.text, tracking: htrack })}
${hr(0, hw, 132, t.saffron, 2)}${hr(0, hw, 138, t.saffron, 2)}
${T.run(FOOTER.sub, { font: F.d4, size: 17, x: 0, y: 182, fill: t.muted })}`;
  return doc({ T, h: H, body, title: FOOTER.headline, desc: `${FOOTER.headline} ${FOOTER.sub}` });
}

/* ------------------------------------------------------------------- main -- */

const BUILDERS = { hero, 'work-head': workHead, practice, stack, loop, footer };

await mkdir(OUT, { recursive: true });
const written = [];
const emit = async (name, contents) => {
  await writeFile(join(OUT, `${name}.svg`), contents, 'utf8');
  written.push(`assets/${name}.svg`.padEnd(34) + `${String(Buffer.byteLength(contents)).padStart(6)} B`);
};

for (const theme of Object.values(THEMES)) {
  for (const [name, build] of Object.entries(BUILDERS)) await emit(`${name}-${theme.name}`, build(theme));
  for (const [i, p] of WORK.entries()) await emit(`work-${p.id}-${theme.name}`, workRow(theme, p, i === WORK.length - 1));
  for (const link of LINKS) await emit(`btn-${link.id}-${theme.name}`, button(theme, link));
}

console.log(written.join('\n'));
console.log(`\n${written.length} files written to assets/`);
