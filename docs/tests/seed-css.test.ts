import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { copyableThemeCss, seedStylesheet, seedVariables } from '../src/lib/seed-css';

/**
 * The library's `[data-theme]` blocks match nested scopes too, and set every
 * colour role from `--md-seed-color-<role>-light/-dark`. A palette published only
 * as `--md-sys-color-*` on `:root[data-theme=…]` therefore resets to the default
 * inside the playground stages and the /theme sampler. These tests resolve the
 * library's own scope blocks against what the site and the copied CSS publish.
 */

const here = dirname(fileURLToPath(import.meta.url));
const tokensDir = resolve(here, '../../src/styles/tokens');

type TokenMap = Record<string, string>;

const stripComments = (css: string) => css.replace(/\/\*[\s\S]*?\*\//g, '');

function declarations(body: string): TokenMap {
  const tokens: TokenMap = {};
  for (const declaration of body.split(';')) {
    const colon = declaration.indexOf(':');
    if (colon === -1) continue;
    tokens[declaration.slice(0, colon).trim()] = declaration.slice(colon + 1).trim();
  }
  return tokens;
}

/** Top-level rules only; the token files and the generated CSS nest nothing else. */
function rules(css: string): { selector: string; tokens: TokenMap }[] {
  return [...stripComments(css).matchAll(/([^{}]+)\{([^{}]*)\}/g)].map((match) => ({
    selector: match[1].trim(),
    tokens: declarations(match[2]),
  }));
}

/** The library's scope block for one mode, as written in sys.color.dark.css. */
function libraryScope(mode: 'light' | 'dark'): TokenMap {
  const css = stripComments(readFileSync(resolve(tokensDir, 'sys.color.dark.css'), 'utf8'));
  const body = css.match(new RegExp(`^\\[data-theme="${mode}"\\]\\s*\\{([^}]*)\\}`, 'm'))?.[1];
  if (!body) throw new Error(`sys.color.dark.css has no top-level [data-theme="${mode}"] block`);
  return declarations(body);
}

/**
 * Computed values on a scope element: its own declarations, with `var()` read
 * from the scope first and then from what it inherits, else the fallback.
 */
function computeScope(own: TokenMap, inherited: TokenMap): TokenMap {
  const resolveValue = (value: string, seen: Set<string>): string =>
    value.replace(/var\((--[\w-]+)(?:,\s*([^()]*))?\)/g, (_, name: string, fallback: string | undefined) => {
      if (name in own && !seen.has(name)) return resolveValue(own[name], new Set([...seen, name]));
      if (name in inherited) return inherited[name];
      return fallback?.trim() ?? '';
    });

  const computed: TokenMap = { ...inherited };
  for (const [name, value] of Object.entries(own)) computed[name] = resolveValue(value, new Set([name]));
  return computed;
}

/** Every role the library declares, filled with values that name their mode. */
function fakePalette(): { light: TokenMap; dark: TokenMap } {
  const base = readFileSync(resolve(tokensDir, 'sys.color.css'), 'utf8');
  const roles = [...new Set([...base.matchAll(/(--md-sys-color-[\w-]+)\s*:/g)].map((match) => match[1]))];
  const palette = { light: {} as TokenMap, dark: {} as TokenMap };
  for (const role of roles) {
    palette.light[role] = role === '--md-sys-color-surface-tint' ? 'light-primary' : `light-${role}`;
    palette.dark[role] = role === '--md-sys-color-surface-tint' ? 'dark-primary' : `dark-${role}`;
  }
  palette.light['--md-sys-color-primary'] = 'light-primary';
  palette.dark['--md-sys-color-primary'] = 'dark-primary';
  return palette;
}

/** Custom properties declared on a plain `:root`, so inherited whatever `data-theme` says. */
function unconditionalRoot(css: string): TokenMap {
  return Object.assign(
    {},
    ...rules(css)
      .filter((rule) => rule.selector === ':root')
      .map((rule) => rule.tokens),
  );
}

function expectScopesFollow(css: string, palette: { light: TokenMap; dark: TokenMap }) {
  const inherited = unconditionalRoot(css);
  for (const mode of ['light', 'dark'] as const) {
    const scope = computeScope(libraryScope(mode), inherited);
    const roles = Object.keys(palette[mode]);
    expect(roles.length).toBeGreaterThan(40);
    for (const role of roles) expect([mode, role, scope[role]]).toEqual([mode, role, palette[mode][role]]);
  }
}

describe('seedVariables', () => {
  it('names a light and a dark variable per role, as applyM3Theme does', () => {
    const variables = seedVariables(
      { '--md-sys-color-primary': '#111111', '--md-sys-color-surface-tint': '#111111' },
      { '--md-sys-color-primary': '#222222', '--md-sys-color-surface-tint': '#222222' },
    );
    expect(variables).toEqual({
      '--md-seed-color-primary-light': '#111111',
      '--md-seed-color-primary-dark': '#222222',
    });
  });

  it('ignores anything that is not a colour role, and roles missing from the dark half', () => {
    expect(seedVariables({ '--other': 'x', '--md-sys-color-scrim': '#000000' }, {})).toEqual({
      '--md-seed-color-scrim-light': '#000000',
    });
  });
});

describe('seedStylesheet (the site seed picker)', () => {
  const palette = fakePalette();
  const css = seedStylesheet(palette.light, palette.dark);

  it('keeps the page palette keyed by data-theme, with light before it resolves', () => {
    const bySelector = Object.fromEntries(rules(css).map((rule) => [rule.selector, rule.tokens]));
    expect(bySelector[':root[data-theme="light"]']).toEqual(palette.light);
    expect(bySelector[':root[data-theme="dark"]']).toEqual(palette.dark);
    expect(bySelector[':root:not([data-theme])']).toEqual(palette.light);
  });

  it('carries the seed into nested light and dark scopes', () => {
    expectScopesFollow(css, palette);
  });
});

describe('copyableThemeCss (the /theme Copy CSS button)', () => {
  const palette = fakePalette();

  it.each([
    ['light', ':root'],
    ['dark', '[data-theme="dark"]'],
  ] as const)('copies the %s roles under %s', (mode, selector) => {
    const css = copyableThemeCss('#6750A4', palette, mode);
    expect(css.startsWith('/* m3you — generated from seed #6750A4 */\n')).toBe(true);
    expect(rules(css)[0]).toEqual({ selector, tokens: palette[mode] });
  });

  it.each(['light', 'dark'] as const)('keeps nested scopes on the palette when the %s CSS is pasted', (mode) => {
    expectScopesFollow(copyableThemeCss('#6750A4', palette, mode), palette);
  });
});
