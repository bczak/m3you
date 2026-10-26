import { generateM3Theme } from 'm3you';
import { createContext, type ReactNode, use, useCallback, useEffect, useMemo, useState } from 'react';
import { seedStylesheet } from './seed-css';

/**
 * Seed colours offered in the header picker. The first entry is the library
 * default and matches the tokens compiled into `sys.color.css`.
 */
export const SEED_PRESETS = [
  { name: 'Blue', value: '#416699' },
  { name: 'Purple', value: '#6750A4' },
  { name: 'Green', value: '#006C4C' },
  { name: 'Red', value: '#BA1A1A' },
  { name: 'Orange', value: '#8B5000' },
  { name: 'Teal', value: '#00696E' },
] as const;

export const DEFAULT_SEED: string = SEED_PRESETS[0].value;

const STORAGE_KEY = 'm3you-docs-seed';
const STYLE_ID = 'm3you-seed-tokens';

/**
 * Emit both palettes into a single stylesheet keyed by `data-theme`, rather than
 * writing inline styles on `<html>`.
 *
 * Inline styles would win over the `[data-theme="dark"]` rules in the library's
 * own token files, pinning the page to one palette. Emitting
 * `:root[data-theme="…"]` rules keeps light/dark switching in CSS where it
 * belongs. The stylesheet also publishes the seed variables nested
 * `data-theme` scopes read; see `seedStylesheet`.
 */
function writeSeedStylesheet(seed: string) {
  if (typeof document === 'undefined') return;

  const { light, dark } = generateM3Theme(seed);

  let style = document.getElementById(STYLE_ID) as HTMLStyleElement | null;
  if (!style) {
    style = document.createElement('style');
    style.id = STYLE_ID;
    document.head.append(style);
  }

  style.textContent = seedStylesheet(light, dark);
}

type SeedContextValue = {
  seed: string;
  setSeed: (seed: string) => void;
  resetSeed: () => void;
  isCustom: boolean;
};

const SeedContext = createContext<SeedContextValue | null>(null);

export function SeedProvider({ children }: { children: ReactNode }) {
  const [seed, setSeedState] = useState(DEFAULT_SEED);

  // Restore the reader's last seed on mount. Deliberately client-only: the site
  // is prerendered, so the markup must not depend on localStorage.
  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored && /^#[0-9a-f]{6}$/i.test(stored)) setSeedState(stored);
  }, []);

  useEffect(() => {
    writeSeedStylesheet(seed);
  }, [seed]);

  const setSeed = useCallback((next: string) => {
    setSeedState(next);
    window.localStorage.setItem(STORAGE_KEY, next);
  }, []);

  const resetSeed = useCallback(() => {
    setSeedState(DEFAULT_SEED);
    window.localStorage.removeItem(STORAGE_KEY);
  }, []);

  const value = useMemo(
    () => ({ seed, setSeed, resetSeed, isCustom: seed !== DEFAULT_SEED }),
    [seed, setSeed, resetSeed],
  );

  return <SeedContext value={value}>{children}</SeedContext>;
}

export function useSeed(): SeedContextValue {
  const context = use(SeedContext);
  if (!context) throw new Error('useSeed must be used inside <SeedProvider>');
  return context;
}
