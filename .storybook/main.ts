import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { StorybookConfig } from '@storybook/react-vite';
import tailwindVite from '@tailwindcss/vite';

const getAbsolutePath = (value: string): string => {
  return resolve(fileURLToPath(new URL(import.meta.resolve(`${value}/package.json`, import.meta.url))), '..');
};

const config: StorybookConfig = {
  core: { allowedHosts: true },
  stories: ['../stories/**/*.stories.@(js|jsx|mjs|ts|tsx)'],
  addons: [
    '@storybook/addon-docs',
    '@storybook/addon-onboarding',
    getAbsolutePath('@storybook/addon-a11y'),
    'storybook/viewport',
    getAbsolutePath('@storybook/addon-vitest'),
  ],
  framework: {
    name: getAbsolutePath('@storybook/react-vite'),
    options: {},
  },
  typescript: {
    reactDocgen: 'react-docgen-typescript',
    check: true,
  },
  viteFinal: (config) => {
    // Tailwind CSS for Storybook stories (dev only, not shipped to consumers)
    config.plugins = config.plugins || [];
    config.plugins.push(tailwindVite());
    // Rolldown (Vite 8) tree-shakes reselect (sideEffects: false) out of the production
    // bundle but keeps @base-ui/utils' module-scope createSelectorCreator(...) call as a
    // "side effect", leaving a call to an undefined identifier that breaks every
    // floating-ui-based story (BottomSheet, Menu, Toolbar, Tooltip) in static builds.
    // Declaring the function pure lets the orphaned call be dropped with its import.
    // Dev mode is unaffected either way.
    config.build = config.build || {};
    config.build.rollupOptions = config.build.rollupOptions || {};
    config.build.rollupOptions.treeshake = { manualPureFunctions: ['createSelectorCreator', 'lruMemoize'] };
    return config;
  },
};

export default config;
