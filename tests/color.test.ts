import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { afterEach, expect, test, vi } from 'vitest';

// The real @material/material-color-utilities ships extensionless ESM imports that
// vitest cannot resolve when the package is externalized (it only works bundled by
// Vite). Mocking it keeps src/lib/color.ts fully executed for coverage while
// providing deterministic, valid color values.
vi.mock('@material/material-color-utilities', () => {
  const colorFor = (prop: string, isDark: boolean) => {
    let h = isDark ? 1 : 2;
    for (let i = 0; i < prop.length; i++) {
      h = (h * 31 + prop.charCodeAt(i)) % 0x1000000;
    }
    return h;
  };
  return {
    argbFromHex: (hex: string) => Number.parseInt(hex.replace('#', ''), 16),
    hexFromArgb: (n: number) => `#${(n % 0x1000000).toString(16).padStart(6, '0')}`,
    Hct: { fromInt: (n: number) => ({ int: n }) },
    SchemeContent: function SchemeContent(_hct: unknown, isDark: boolean, _contrast: number) {
      return new Proxy({}, { get: (_t, prop) => colorFor(String(prop), isDark) });
    },
    customColor: (_source: number, custom: { value: number }) => ({
      light: { colorContainer: colorFor('container', false), onColorContainer: colorFor(`on${custom.value}`, false) },
      dark: { colorContainer: colorFor('container', true), onColorContainer: colorFor(`on${custom.value}`, true) },
    }),
  };
});

import { applyM3Theme, generateCustomColor, generateM3Theme } from '../src/lib/color';

afterEach(() => {
  document.documentElement.removeAttribute('data-theme');
  document.documentElement.removeAttribute('style');
});

const HEX = /^#[0-9a-fA-F]{6}$/;

test('generateM3Theme returns light and dark token maps with valid hex values', async () => {
  const theme = generateM3Theme('#416699');

  expect(Object.keys(theme.light)).toHaveLength(49);
  expect(Object.keys(theme.light).length).toBe(Object.keys(theme.dark).length);

  for (const value of Object.values(theme.light)) {
    expect(value).toMatch(HEX);
  }
  for (const value of Object.values(theme.dark)) {
    expect(value).toMatch(HEX);
  }

  // Light and dark schemes differ for surface.
  expect(theme.light['--md-sys-color-surface']).not.toBe(theme.dark['--md-sys-color-surface']);
  expect(theme.light['--md-sys-color-primary']).toMatch(HEX);
  expect(theme.light['--md-sys-color-surface-tint']).toBe(theme.light['--md-sys-color-primary']);
  expect(theme.dark['--md-sys-color-surface-tint']).toBe(theme.dark['--md-sys-color-primary']);
});

test('applyM3Theme writes both modes and a live light-dark mapping on documentElement', async () => {
  const result = applyM3Theme('#416699');
  const theme = generateM3Theme('#416699');

  expect(result).toBeUndefined();
  const primary = document.documentElement.style.getPropertyValue('--md-sys-color-primary');
  expect(primary).toBe('light-dark(var(--md-seed-color-primary-light), var(--md-seed-color-primary-dark))');
  expect(document.documentElement.style.getPropertyValue('--md-seed-color-primary-light')).toBe(
    theme.light['--md-sys-color-primary'],
  );
  expect(document.documentElement.style.getPropertyValue('--md-seed-color-primary-dark')).toBe(
    theme.dark['--md-sys-color-primary'],
  );
  expect(document.documentElement.style.getPropertyValue('--md-sys-color-surface-tint')).toBe(
    'var(--md-sys-color-primary)',
  );
});

test('generated mappings switch live through element, ancestor, and system color-scheme', async () => {
  const ancestor = document.createElement('section');
  const el = document.createElement('div');
  ancestor.append(el);
  document.body.append(ancestor);
  applyM3Theme('#ff0000', el);
  const mapping = el.style.getPropertyValue('--md-sys-color-primary');

  el.dataset.theme = 'dark';
  expect(el.style.getPropertyValue('--md-sys-color-primary')).toBe(mapping);
  el.removeAttribute('data-theme');
  ancestor.dataset.theme = 'light';
  expect(el.style.getPropertyValue('--md-sys-color-primary')).toBe(mapping);
  ancestor.remove();

  const globals = readFileSync(resolve(process.cwd(), 'src/styles/globals.css'), 'utf8');
  expect(globals).toContain(':root {\n  color-scheme: light dark;');
  expect(globals).toContain('[data-theme="light"]');
  expect(globals).toContain('[data-theme="dark"]');
});

test('applyM3Theme targets a provided element', async () => {
  const el = document.createElement('div');

  applyM3Theme('#00ff00', el);

  expect(el.style.getPropertyValue('--md-sys-color-primary')).not.toBe('');
  expect(document.documentElement.style.getPropertyValue('--md-sys-color-primary')).toBe('');
});

test('applyM3Theme re-declares the focus colour on the element it themes', () => {
  // A var() inside a custom property resolves where it is declared, so an alias
  // left on an ancestor would keep that ancestor's Secondary inside `el`.
  const el = document.createElement('div');

  applyM3Theme('#00ff00', el);

  expect(el.style.getPropertyValue('--md-sys-state-focus-indicator-color')).toBe('var(--md-sys-color-secondary)');
});

test('the focus colour alias is declared in every colour scope, not on :root alone', () => {
  const stateCss = readFileSync(resolve(process.cwd(), 'src/styles/tokens/sys.state.css'), 'utf8');
  const declarations = [...stateCss.matchAll(/([^{}]+)\{([^}]*)\}/g)].filter(([, , body]) =>
    body.includes('--md-sys-state-focus-indicator-color:'),
  );

  // One rule, so the alias cannot drift between scopes.
  expect(declarations).toHaveLength(1);
  const [, selector, body] = declarations[0];
  const selectors = selector
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .split(',')
    .map((s) => s.trim());
  expect(selectors).toEqual([':root', '[data-theme="light"]', '[data-theme="dark"]']);
  expect(body).toContain('--md-sys-state-focus-indicator-color: var(--md-sys-color-secondary);');
});

test('generateCustomColor returns a container pair per mode for a colour outside the scheme', async () => {
  const pair = generateCustomColor('#4caf50');

  expect(pair.light.container).toMatch(HEX);
  expect(pair.light.onContainer).toMatch(HEX);
  expect(pair.dark.container).toMatch(HEX);
  expect(pair.dark.onContainer).toMatch(HEX);
  // The container flips with the mode, the way the scheme's own containers do.
  expect(pair.light.container).not.toBe(pair.dark.container);
});

test('scoped data-theme blocks cover every role, read the applied seed, and include a light scope', () => {
  const tokens = resolve(process.cwd(), 'src/styles/tokens');
  const lightCss = readFileSync(resolve(tokens, 'sys.color.css'), 'utf8');
  const darkCss = readFileSync(resolve(tokens, 'sys.color.dark.css'), 'utf8');
  const block = (selector: string) => {
    const start = darkCss.indexOf(`\n${selector} {\n`);
    expect(start).toBeGreaterThan(-1);
    return darkCss.slice(start, darkCss.indexOf('\n}', start + 1));
  };
  const defaults = (css: string) =>
    Object.fromEntries([...css.matchAll(/--md-sys-color-([a-z-]+): (#[0-9a-f]{6});/g)].map((m) => [m[1], m[2]]));
  const lightDefaults = defaults(lightCss);
  const darkDefaults = defaults(darkCss);

  for (const [selector, mode, expected] of [
    ['[data-theme="dark"]', 'dark', darkDefaults],
    ['[data-theme="light"]', 'light', lightDefaults],
  ] as const) {
    const css = block(selector);
    // A nested scope inherits the seed applyM3Theme() published on an ancestor,
    // and falls back to the default palette when there is none.
    for (const [role, hex] of Object.entries(expected)) {
      expect(css).toContain(`--md-sys-color-${role}: var(--md-seed-color-${role}-${mode}, ${hex});`);
    }
    expect(css).toContain('--md-sys-color-surface-tint: var(--md-sys-color-primary);');
  }
  expect(Object.keys(lightDefaults)).toHaveLength(48);
});
