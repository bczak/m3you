import type { DynamicScheme } from '@material/material-color-utilities';
import { argbFromHex, customColor, Hct, hexFromArgb, SchemeContent } from '@material/material-color-utilities';

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
  // Surface tint is an alias of Primary in the M3 role collection.
  ['--md-sys-color-surface-tint', (s) => s.primary],

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

/** A container colour and the colour that stays legible on it. */
export type CustomColorPair = { container: string; onContainer: string };

/**
 * The container pair M3 derives for a *custom colour* — one colour from outside
 * the scheme, such as a category's or a calendar's own, that still has to sit on
 * the app's surfaces. This is M3's own custom-colour mapping, so the pair behaves
 * like the scheme's containers do: a pale tint of the colour under a dark glyph
 * in light mode, a deep one under a light glyph in dark mode.
 *
 * Throws on anything `argbFromHex` cannot read, which is what a caller wants: a
 * colour that silently fell back would be a wrong colour, not a missing one.
 */
export function generateCustomColor(sourceHex: string): { light: CustomColorPair; dark: CustomColorPair } {
  const argb = argbFromHex(sourceHex);
  // `blend: false` keeps the colour its own rather than harmonising it towards
  // the seed: the point of a custom colour here is that it identifies something.
  const { light, dark } = customColor(argb, { value: argb, name: sourceHex, blend: false });

  return {
    light: { container: hexFromArgb(light.colorContainer), onContainer: hexFromArgb(light.onColorContainer) },
    dark: { container: hexFromArgb(dark.colorContainer), onContainer: hexFromArgb(dark.onColorContainer) },
  };
}

export function applyM3Theme(seedHex: string, element?: HTMLElement): void {
  const el = element ?? document.documentElement;
  const { light, dark } = generateM3Theme(seedHex);

  for (const [name, lightValue] of Object.entries(light)) {
    const role = name.replace('--md-sys-color-', '');
    const lightName = `--md-seed-color-${role}-light`;
    const darkName = `--md-seed-color-${role}-dark`;
    el.style.setProperty(lightName, lightValue);
    el.style.setProperty(darkName, dark[name]);
    el.style.setProperty(
      name,
      role === 'surface-tint' ? 'var(--md-sys-color-primary)' : `light-dark(var(${lightName}), var(${darkName}))`,
    );
  }
}
