/**
 * Turns a generated palette into CSS. Shared by the site's own seed stylesheet
 * and the /theme page's "Copy CSS" button, and free of imports so the docs tests
 * can exercise it without resolving the library.
 */

type TokenMap = Record<string, string>;

const ROLE_PREFIX = '--md-sys-color-';

/**
 * The `--md-seed-color-<role>-light` / `-dark` pairs for a palette.
 *
 * The library's `[data-theme="light"]` and `[data-theme="dark"]` blocks match
 * nested scopes as well as `<html>`, and set every role from these variables,
 * falling back to the default palette when they are absent. A palette written
 * only as `--md-sys-color-*` therefore stops at the first nested scope; publishing
 * the pairs on `:root` is what carries it into a light or dark section. This is
 * the same set `applyM3Theme` writes. Surface tint is skipped: every scope
 * aliases it to Primary instead of reading a seed variable.
 */
export function seedVariables(light: TokenMap, dark: TokenMap): TokenMap {
  const variables: TokenMap = {};
  for (const [name, lightValue] of Object.entries(light)) {
    if (!name.startsWith(ROLE_PREFIX)) continue;
    const role = name.slice(ROLE_PREFIX.length);
    if (role === 'surface-tint') continue;
    variables[`--md-seed-color-${role}-light`] = lightValue;
    if (dark[name]) variables[`--md-seed-color-${role}-dark`] = dark[name];
  }
  return variables;
}

function minifiedRule(selector: string, tokens: TokenMap): string {
  return `${selector}{${Object.entries(tokens)
    .map(([name, value]) => `${name}:${value};`)
    .join('')}}`;
}

function readableRule(selector: string, tokens: TokenMap): string {
  const body = Object.entries(tokens)
    .map(([name, value]) => `  ${name}: ${value};`)
    .join('\n');
  return `${selector} {\n${body}\n}\n`;
}

/**
 * The site's own seed stylesheet: both palettes keyed by `data-theme`, plus the
 * seed variables that nested scopes read.
 *
 * `:root[data-theme="…"]` is `(0,2,0)`, which outranks both the base `:root`
 * and the `[data-theme]` blocks it needs to override on `<html>`. Without the
 * seed variables, a nested `data-theme` scope (the component playgrounds, the
 * /theme sampler, the phone frames) would reset to the default palette.
 */
export function seedStylesheet(light: TokenMap, dark: TokenMap): string {
  return (
    minifiedRule(':root', seedVariables(light, dark)) +
    minifiedRule(':root[data-theme="light"]', light) +
    minifiedRule(':root[data-theme="dark"]', dark) +
    // Before next-themes resolves, no `data-theme` is set. Falling back to the
    // light palette avoids a flash of the compiled-in default seed.
    minifiedRule(':root:not([data-theme])', light)
  );
}

/**
 * What the /theme page copies: the chosen mode's roles, then the seed variables
 * for both modes, so `data-theme` sections nested anywhere in the consumer's page
 * keep the palette in either mode.
 */
export function copyableThemeCss(seed: string, palette: { light: TokenMap; dark: TokenMap }, mode: 'light' | 'dark') {
  const selector = mode === 'dark' ? '[data-theme="dark"]' : ':root';
  return (
    `/* m3you — generated from seed ${seed} */\n` +
    readableRule(selector, palette[mode]) +
    '\n/* Nested [data-theme="light"] and [data-theme="dark"] sections set their roles from these. */\n' +
    readableRule(':root', seedVariables(palette.light, palette.dark))
  );
}
