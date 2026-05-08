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
    getAbsolutePath("@storybook/addon-vitest")
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
    return config;
  },
};

export default config;
