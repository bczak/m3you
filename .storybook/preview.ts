import type { Preview } from '@storybook/react';
import { INITIAL_VIEWPORTS } from 'storybook/viewport';
import { generateM3Theme } from '../src/lib/color';
import '../src/styles/globals.css';
import './storybook.css';

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
    viewport: { value: undefined, isRotated: false },
  },
  decorators: [
    (Story, context) => {
      const theme = context.globals.theme ?? 'light';
      const seed = context.globals.seed ?? DEFAULT_SEED;
      const isDark = theme === 'dark';
      const root = document.documentElement;
      const body = document.body;

      root.setAttribute('data-theme', isDark ? 'dark' : 'light');
      root.style.colorScheme = isDark ? 'dark' : 'light';
      root.style.setProperty('--sb-m3-seed', seed);
      body.setAttribute('data-theme', isDark ? 'dark' : 'light');
      body.style.colorScheme = isDark ? 'dark' : 'light';

      applyTheme(seed, isDark);

      return Story();
    },
  ],
  parameters: {
    viewport: {
      options: INITIAL_VIEWPORTS,
    },
    layout: 'padded',
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    docs: {
      canvas: {
        sourceState: 'hidden',
      },
      toc: true,
    },
    options: {
      storySort: {
        method: 'alphabetical',
        order: [
          'Actions',
          [
            'Button',
            'Icon Button',
            'Standard Button Group',
            'Connected Button Group',
            'Toggle Button',
            'Toggle Icon Button',
            'Split Button',
            'FAB',
            'Extended FAB',
            'FAB Menu',
          ],
          'Communication',
          ['Badge', 'Circular Progress', 'Linear Progress', 'Loading Indicator', 'Snackbar'],
          'Containment',
          ['Card', 'Dialog', 'Divider', 'Menu', 'Tooltip'],
          'Navigation',
          ['App Bar', 'Navigation Bar', 'Navigation Rail', 'Tabs', 'Toolbar'],
          'Selection',
          ['Checkbox', 'Chip', 'Radio Button', 'Slider', 'Switch'],
          'Inputs',
          ['Text Field'],
        ],
      },
    },
  },
};

export default preview;
