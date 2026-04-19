import type { DynamicScheme } from '@material/material-color-utilities';
import { argbFromHex, Hct, hexFromArgb, SchemeContent } from '@material/material-color-utilities';

type TokenMap = Record<string, string>;

const TOKEN_GETTERS: [string, (s: DynamicScheme) => number][] = [
  // Primary
  ['--md-sys-color-primary', (s) => s.primary],
  ['--md-sys-color-on-primary', (s) => s.onPrimary],
  ['--md-sys-color-primary-container', (s) => s.primaryContainer],
  ['--md-sys-color-on-primary-container', (s) => s.onPrimaryContainer],
  ['--md-sys-color-primary-fixed', (s) => s.primaryFixed],
  ['--md-sys-color-primary-fixed-dim', (s) => s.primaryFixedDim],
  ['--md-sys-color-on-primary-fixed', (s) => s.onPrimaryFixed],
  ['--md-sys-color-on-primary-fixed-variant', (s) => s.onPrimaryFixedVariant],
  ['--md-sys-color-inverse-primary', (s) => s.inversePrimary],

  // Secondary
  ['--md-sys-color-secondary', (s) => s.secondary],
  ['--md-sys-color-on-secondary', (s) => s.onSecondary],
  ['--md-sys-color-secondary-container', (s) => s.secondaryContainer],
  ['--md-sys-color-on-secondary-container', (s) => s.onSecondaryContainer],
  ['--md-sys-color-secondary-fixed', (s) => s.secondaryFixed],
  ['--md-sys-color-secondary-fixed-dim', (s) => s.secondaryFixedDim],
  ['--md-sys-color-on-secondary-fixed', (s) => s.onSecondaryFixed],
  ['--md-sys-color-on-secondary-fixed-variant', (s) => s.onSecondaryFixedVariant],

  // Tertiary
  ['--md-sys-color-tertiary', (s) => s.tertiary],
  ['--md-sys-color-on-tertiary', (s) => s.onTertiary],
  ['--md-sys-color-tertiary-container', (s) => s.tertiaryContainer],
  ['--md-sys-color-on-tertiary-container', (s) => s.onTertiaryContainer],
  ['--md-sys-color-tertiary-fixed', (s) => s.tertiaryFixed],
  ['--md-sys-color-tertiary-fixed-dim', (s) => s.tertiaryFixedDim],
  ['--md-sys-color-on-tertiary-fixed', (s) => s.onTertiaryFixed],
  ['--md-sys-color-on-tertiary-fixed-variant', (s) => s.onTertiaryFixedVariant],

  // Error
  ['--md-sys-color-error', (s) => s.error],
  ['--md-sys-color-on-error', (s) => s.onError],
  ['--md-sys-color-error-container', (s) => s.errorContainer],
  ['--md-sys-color-on-error-container', (s) => s.onErrorContainer],

  // Surface
  ['--md-sys-color-surface', (s) => s.surface],
  ['--md-sys-color-on-surface', (s) => s.onSurface],
  ['--md-sys-color-surface-variant', (s) => s.surfaceVariant],
  ['--md-sys-color-on-surface-variant', (s) => s.onSurfaceVariant],
  ['--md-sys-color-surface-dim', (s) => s.surfaceDim],
  ['--md-sys-color-surface-bright', (s) => s.surfaceBright],
  ['--md-sys-color-surface-container-lowest', (s) => s.surfaceContainerLowest],
  ['--md-sys-color-surface-container-low', (s) => s.surfaceContainerLow],
  ['--md-sys-color-surface-container', (s) => s.surfaceContainer],
  ['--md-sys-color-surface-container-high', (s) => s.surfaceContainerHigh],
  ['--md-sys-color-surface-container-highest', (s) => s.surfaceContainerHighest],
  ['--md-sys-color-surface-tint', (s) => s.surfaceTint],

  // Outline
  ['--md-sys-color-outline', (s) => s.outline],
  ['--md-sys-color-outline-variant', (s) => s.outlineVariant],

  // Inverse
  ['--md-sys-color-inverse-surface', (s) => s.inverseSurface],
  ['--md-sys-color-inverse-on-surface', (s) => s.inverseOnSurface],

  // Background
  ['--md-sys-color-background', (s) => s.background],
  ['--md-sys-color-on-background', (s) => s.onBackground],

  // Shadow & Scrim
  ['--md-sys-color-shadow', (s) => s.shadow],
  ['--md-sys-color-scrim', (s) => s.scrim],
];

function extractTokens(scheme: DynamicScheme): TokenMap {
  const tokens: TokenMap = {};
  for (const [name, getter] of TOKEN_GETTERS) {
    tokens[name] = hexFromArgb(getter(scheme));
  }
  return tokens;
}

export function generateM3Theme(seedHex: string): { light: TokenMap; dark: TokenMap } {
  const hct = Hct.fromInt(argbFromHex(seedHex));
  const lightScheme = new SchemeContent(hct, false, 0.0);
  const darkScheme = new SchemeContent(hct, true, 0.0);

  return {
    light: extractTokens(lightScheme),
    dark: extractTokens(darkScheme),
  };
}

export function applyM3Theme(seedHex: string, element?: HTMLElement): void {
  const el = element ?? document.documentElement;
  const isDark = el.getAttribute('data-theme') === 'dark' || window.matchMedia('(prefers-color-scheme: dark)').matches;
  const { light, dark } = generateM3Theme(seedHex);
  const tokens = isDark ? dark : light;

  for (const [name, value] of Object.entries(tokens)) {
    el.style.setProperty(name, value);
  }
}
