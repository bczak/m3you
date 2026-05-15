import type { Preview } from '@storybook/react-vite';
import { createElement } from 'react';
import { INITIAL_VIEWPORTS } from 'storybook/viewport';
import { generateM3Theme } from '../src/lib/color';
import '../src/styles/globals.css';

const DEFAULT_SEED = '#416699';

// Clean up any global theme state an earlier version of this preview may have
// applied to <html>/<body>. Runs once per module load. Without this, HMR
// leaves stale data-theme and inline --md-sys-color-* vars on the root,
// which defeats the per-story scoping below.
if (typeof document !== 'undefined') {
  const root = document.documentElement;
  const body = document.body;
  root.removeAttribute('data-theme');
  root.style.colorScheme = '';
  root.style.removeProperty('--sb-m3-seed');
  for (let i = root.style.length - 1; i >= 0; i--) {
    const prop = root.style.item(i);
    if (prop.startsWith('--md-sys-')) root.style.removeProperty(prop);
  }
  if (body) {
    body.removeAttribute('data-theme');
    body.style.colorScheme = '';
  }
}

// Scope M3 theme tokens to a per-story wrapper (instead of <html>) so the
// Storybook docs/canvas chrome keeps its own background and only the story
// content reflects the selected theme + seed.
const buildThemeStyle = (seed: string, isDark: boolean): React.CSSProperties => {
  const { light, dark } = generateM3Theme(seed);
  const tokens = isDark ? dark : light;
  const style: Record<string, string> = {
    colorScheme: isDark ? 'dark' : 'light',
    backgroundColor: 'var(--md-sys-color-surface)',
    color: 'var(--md-sys-color-on-surface)',
    minHeight: '100%',
  };
  for (const [name, value] of Object.entries(tokens)) {
    style[name] = value;
  }
  return style as React.CSSProperties;
};

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

      return createElement(
        'div',
        {
          'data-theme': isDark ? 'dark' : 'light',
          style: buildThemeStyle(seed, isDark),
        },
        createElement(Story),
      );
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

    a11y: {
      // 'todo' - show a11y violations in the test UI only
      // 'error' - fail CI on a11y violations
      // 'off' - skip a11y checks entirely
      test: 'todo'
    }
  },
};

export default preview;
