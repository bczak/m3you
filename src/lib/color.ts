import type { DynamicScheme } from '@material/material-color-utilities';
import { argbFromHex, Hct, hexFromArgb, SchemeContent } from '@material/material-color-utilities';

type TokenMap = Record<string, string>;

const TOKEN_GETTERS: [string, (s: DynamicScheme) => number][] = [
  // Primary
  ['--color-primary', (s) => s.primary],
  ['--color-on-primary', (s) => s.onPrimary],
  ['--color-primary-container', (s) => s.primaryContainer],
  ['--color-on-primary-container', (s) => s.onPrimaryContainer],
  ['--color-primary-fixed', (s) => s.primaryFixed],
  ['--color-primary-fixed-dim', (s) => s.primaryFixedDim],
  ['--color-on-primary-fixed', (s) => s.onPrimaryFixed],
  ['--color-on-primary-fixed-variant', (s) => s.onPrimaryFixedVariant],
  ['--color-inverse-primary', (s) => s.inversePrimary],

  // Secondary
  ['--color-secondary', (s) => s.secondary],
  ['--color-on-secondary', (s) => s.onSecondary],
  ['--color-secondary-container', (s) => s.secondaryContainer],
  ['--color-on-secondary-container', (s) => s.onSecondaryContainer],
  ['--color-secondary-fixed', (s) => s.secondaryFixed],
  ['--color-secondary-fixed-dim', (s) => s.secondaryFixedDim],
  ['--color-on-secondary-fixed', (s) => s.onSecondaryFixed],
  ['--color-on-secondary-fixed-variant', (s) => s.onSecondaryFixedVariant],

  // Tertiary
  ['--color-tertiary', (s) => s.tertiary],
  ['--color-on-tertiary', (s) => s.onTertiary],
  ['--color-tertiary-container', (s) => s.tertiaryContainer],
  ['--color-on-tertiary-container', (s) => s.onTertiaryContainer],
  ['--color-tertiary-fixed', (s) => s.tertiaryFixed],
  ['--color-tertiary-fixed-dim', (s) => s.tertiaryFixedDim],
  ['--color-on-tertiary-fixed', (s) => s.onTertiaryFixed],
  ['--color-on-tertiary-fixed-variant', (s) => s.onTertiaryFixedVariant],

  // Error
  ['--color-error', (s) => s.error],
  ['--color-on-error', (s) => s.onError],
  ['--color-error-container', (s) => s.errorContainer],
  ['--color-on-error-container', (s) => s.onErrorContainer],

  // Surface
  ['--color-surface', (s) => s.surface],
  ['--color-on-surface', (s) => s.onSurface],
  ['--color-surface-variant', (s) => s.surfaceVariant],
  ['--color-on-surface-variant', (s) => s.onSurfaceVariant],
  ['--color-surface-dim', (s) => s.surfaceDim],
  ['--color-surface-bright', (s) => s.surfaceBright],
  ['--color-surface-container-lowest', (s) => s.surfaceContainerLowest],
  ['--color-surface-container-low', (s) => s.surfaceContainerLow],
  ['--color-surface-container', (s) => s.surfaceContainer],
  ['--color-surface-container-high', (s) => s.surfaceContainerHigh],
  ['--color-surface-container-highest', (s) => s.surfaceContainerHighest],
  ['--color-surface-tint', (s) => s.surfaceTint],

  // Outline
  ['--color-outline', (s) => s.outline],
  ['--color-outline-variant', (s) => s.outlineVariant],

  // Inverse
  ['--color-inverse-surface', (s) => s.inverseSurface],
  ['--color-inverse-on-surface', (s) => s.inverseOnSurface],

  // Background
  ['--color-background', (s) => s.background],
  ['--color-on-background', (s) => s.onBackground],

  // Shadow & Scrim
  ['--color-shadow', (s) => s.shadow],
  ['--color-scrim', (s) => s.scrim],
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
  const isDark = el.classList.contains('dark') || window.matchMedia('(prefers-color-scheme: dark)').matches;
  const { light, dark } = generateM3Theme(seedHex);
  const tokens = isDark ? dark : light;

  for (const [name, value] of Object.entries(tokens)) {
    el.style.setProperty(name, value);
  }
}
