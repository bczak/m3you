import type { Preview } from '@storybook/react';
import { generateM3Theme } from '../src/lib/color';
import '../src/styles/globals.css';

const DEFAULT_SEED = '#416699';

function applyTheme(seed: string, isDark: boolean) {
  const { light, dark } = generateM3Theme(seed);
  const tokens = isDark ? dark : light;
  const root = document.documentElement;

  for (const [name, value] of Object.entries(tokens)) {
    root.style.setProperty(name, value);
  }
}

const preview: Preview = {
  globalTypes: {
    theme: {
      description: 'M3 color scheme',
      toolbar: {
        title: 'Theme',
        icon: 'moon',
        items: [
          { value: 'light', title: 'Light', icon: 'sun' },
          { value: 'dark', title: 'Dark', icon: 'moon' },
        ],
        dynamicTitle: true,
      },
    },
    seed: {
      description: 'M3 seed color',
      toolbar: {
        title: 'Seed',
        icon: 'paintbrush',
        items: [
          { value: '#416699', title: 'Blue (default)' },
          { value: '#6750A4', title: 'Purple (M3 baseline)' },
          { value: '#006C4C', title: 'Green' },
          { value: '#BA1A1A', title: 'Red' },
          { value: '#8B5000', title: 'Orange' },
        ],
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: {
    theme: 'light',
    seed: DEFAULT_SEED,
  },
  decorators: [
    (Story, context) => {
      const theme = context.globals.theme ?? 'light';
      const seed = context.globals.seed ?? DEFAULT_SEED;
      const isDark = theme === 'dark';
      const root = document.documentElement;

      root.classList.remove('light', 'dark');
      root.classList.add(isDark ? 'dark' : 'light');

      applyTheme(seed, isDark);

      return Story();
    },
  ],
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
};

export default preview;
