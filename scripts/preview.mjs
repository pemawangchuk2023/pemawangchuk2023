/**
 * Renders the generated assets on GitHub's own canvas colours and screenshots
 * both themes, so layout regressions are caught before they reach the profile.
 *
 *   node scripts/preview.mjs              all assets, both themes
 *   node scripts/preview.mjs hero,stack   just those
 *
 * Output lands in .preview/ (git-ignored). Set CHROME to override the browser.
 */

import { writeFile, mkdir, access } from 'node:fs/promises';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { dirname, join } from 'node:path';

const run = promisify(execFile);
const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(ROOT, '.preview');

const DEFAULT_ASSETS = ['hero', 'work-head', 'work-fdh', 'work-recorder', 'practice', 'stack', 'loop', 'footer'];
const CANDIDATES = [
  process.env.CHROME,
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/usr/bin/google-chrome',
  '/usr/bin/chromium',
].filter(Boolean);

async function findBrowser() {
  for (const candidate of CANDIDATES) {
    try {
      await access(candidate);
      return candidate;
    } catch {
      /* try the next one */
    }
  }
  throw new Error(`no Chrome-family browser found; set CHROME=/path/to/chrome`);
}

const page = (theme, names) => `<!doctype html><meta charset="utf-8"><style>
  html,body{margin:0}
  body{background:${theme === 'dark' ? '#0d1117' : '#ffffff'};padding:24px 32px;
       font:14px -apple-system,'Segoe UI',sans-serif;color:${theme === 'dark' ? '#e6edf3' : '#1f2328'}}
  .col{max-width:880px;margin:0 auto}
  img{display:block;width:100%;margin:0 0 20px}
  h2{font-size:12px;font-weight:600;letter-spacing:.06em;text-transform:uppercase;
     color:${theme === 'dark' ? '#7d8590' : '#59636e'};margin:24px 0 8px;
     border-bottom:1px solid ${theme === 'dark' ? '#30363d' : '#d1d9e0'};padding-bottom:6px}
</style><div class="col">
${names.map((n) => `<h2>${n}</h2><img src="${pathToFileURL(join(ROOT, 'assets', `${n}-${theme}.svg`))}">`).join('\n')}
</div>`;

const names = process.argv[2]?.split(',').map((s) => s.trim()).filter(Boolean) ?? DEFAULT_ASSETS;
const browser = await findBrowser();
await mkdir(OUT, { recursive: true });

for (const theme of ['dark', 'light']) {
  const html = join(OUT, `preview-${theme}.html`);
  const png = join(OUT, `preview-${theme}.png`);
  await writeFile(html, page(theme, names), 'utf8');
  await run(browser, [
    '--headless', '--disable-gpu', '--hide-scrollbars', '--force-device-scale-factor=1',
    '--virtual-time-budget=1500', '--window-size=944,2800',
    `--screenshot=${png}`, String(pathToFileURL(html)),
  ]);
  console.log(`.preview/preview-${theme}.png`);
}
