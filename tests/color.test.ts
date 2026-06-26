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
  };
});

import { applyM3Theme, generateM3Theme } from '../src/lib/color';

const originalMatchMedia = window.matchMedia;

afterEach(() => {
  window.matchMedia = originalMatchMedia;
  document.documentElement.removeAttribute('data-theme');
  document.documentElement.removeAttribute('style');
});

const mockMatchMedia = (matches: boolean) => {
  window.matchMedia = vi.fn().mockReturnValue({ matches } as MediaQueryList) as typeof window.matchMedia;
};

const HEX = /^#[0-9a-fA-F]{6}$/;

test('generateM3Theme returns light and dark token maps with valid hex values', async () => {
  const theme = generateM3Theme('#416699');

  expect(Object.keys(theme.light).length).toBeGreaterThan(0);
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
});

test('applyM3Theme sets light tokens on documentElement by default', async () => {
  mockMatchMedia(false);

  const result = applyM3Theme('#416699');

  expect(result).toBeUndefined();
  const primary = document.documentElement.style.getPropertyValue('--md-sys-color-primary');
  expect(primary).not.toBe('');
  expect(primary).toBe(generateM3Theme('#416699').light['--md-sys-color-primary']);
});

test('applyM3Theme uses dark tokens when data-theme="dark"', async () => {
  mockMatchMedia(false);
  document.documentElement.setAttribute('data-theme', 'dark');

  applyM3Theme('#416699');

  const primary = document.documentElement.style.getPropertyValue('--md-sys-color-primary');
  expect(primary).toBe(generateM3Theme('#416699').dark['--md-sys-color-primary']);
});

test('applyM3Theme uses dark tokens when prefers-color-scheme is dark', async () => {
  mockMatchMedia(true);

  applyM3Theme('#ff0000');

  const primary = document.documentElement.style.getPropertyValue('--md-sys-color-primary');
  expect(primary).toBe(generateM3Theme('#ff0000').dark['--md-sys-color-primary']);
});

test('applyM3Theme targets a provided element', async () => {
  mockMatchMedia(false);
  const el = document.createElement('div');

  applyM3Theme('#00ff00', el);

  expect(el.style.getPropertyValue('--md-sys-color-primary')).not.toBe('');
  expect(document.documentElement.style.getPropertyValue('--md-sys-color-primary')).toBe('');
});
