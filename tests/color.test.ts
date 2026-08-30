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

test('generateCustomColor returns a container pair per mode for a colour outside the scheme', async () => {
  const pair = generateCustomColor('#4caf50');

  expect(pair.light.container).toMatch(HEX);
  expect(pair.light.onContainer).toMatch(HEX);
  expect(pair.dark.container).toMatch(HEX);
  expect(pair.dark.onContainer).toMatch(HEX);
  // The container flips with the mode, the way the scheme's own containers do.
  expect(pair.light.container).not.toBe(pair.dark.container);
});
