/**
 * Design tokens for the profile assets.
 *
 * Every generated SVG is emitted twice, once per theme, and paired in the
 * README with <picture media="(prefers-color-scheme: ...)"> so the artwork
 * follows the reader's GitHub theme instead of fighting it.
 *
 * There are no surface colours: every asset has a transparent background, so
 * it sits on GitHub's light (#ffffff), dark (#0d1117) and dark-dimmed
 * (#212830) canvases alike. Ink colours are chosen to hold contrast on all of
 * them. Saffron is taken from the Bhutanese flag; in light mode it deepens to
 * ochre so it stays legible on white.
 */

/** Static instances; opentype.js cannot read variable-font axes. */
export const FONT_FILES = {
  d4: 'Schibsted-400.ttf',
  d5: 'Schibsted-500.ttf',
  d7: 'Schibsted-700.ttf',
  d8: 'Schibsted-800.ttf',
  m4: 'DMMono-Regular.ttf',
  m5: 'DMMono-Medium.ttf',
};

const dark = {
  name: 'dark',
  text: '#ECEEF1',
  muted: '#A3ACB7',
  faint: '#808A96',
  rule: '#2B323C',
  ruleHi: '#3D4652',
  saffron: '#F5B93E',
  vermilion: '#FF6B3D',
  onAccent: '#0D1117',
  areaTop: 0.2,
};

const light = {
  name: 'light',
  text: '#101418',
  muted: '#535D69',
  faint: '#737C87',
  rule: '#DADFE5',
  ruleHi: '#BCC4CD',
  saffron: '#A66A00',
  vermilion: '#D9480F',
  onAccent: '#FFFFFF',
  areaTop: 0.14,
};

export const THEMES = { dark, light };

/**
 * Canvas width shared by every asset.
 *
 * This is deliberately close to GitHub's rendered README column (~880px). The
 * assets are displayed at width:100%, so a wider canvas would be scaled DOWN
 * in the browser and every font size would render smaller than it is set here.
 * At this width the numbers below are close to true on-screen pixels.
 */
export const W = 900;
