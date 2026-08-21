import type { Preview } from '@storybook/react-vite';
import { createElement, useLayoutEffect } from 'react';
import { INITIAL_VIEWPORTS } from 'storybook/viewport';
import { generateM3Theme } from '../src/lib/color';
import '../src/styles/globals.css';
import './preview.css';

const DEFAULT_SEED = '#416699';

// Material Design 3 window size classes (https://m3.material.io/foundations/layout/applying-layout/window-size-classes).
// M3 lays out to width-based breakpoints, not device names, so these let you verify responsive
// components (NavigationRail expand/collapse, AppBar, etc.) at the exact class thresholds.
// Widths sit inside each class; the dp range is in the name for reference.
const M3_VIEWPORTS = {
  m3Compact: { name: 'M3 Compact · phone (0–599)', styles: { width: '412px', height: '917px' }, type: 'mobile' },
  m3Medium: { name: 'M3 Medium · foldable (600–839)', styles: { width: '700px', height: '840px' }, type: 'tablet' },
  m3Expanded: { name: 'M3 Expanded · tablet (840–1199)', styles: { width: '1024px', height: '800px' }, type: 'tablet' },
  m3Large: { name: 'M3 Large · desktop (1200–1599)', styles: { width: '1280px', height: '800px' }, type: 'desktop' },
  m3ExtraLarge: {
    name: 'M3 Extra-large · desktop (1600+)',
    styles: { width: '1600px', height: '1000px' },
    type: 'desktop',
  },
} as const;

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
  // No backgroundColor here on purpose. Under `layout: 'centered'` this wrapper
  // is shrink-to-fit, so painting the surface on it draws a tinted box around
  // the component rather than a page behind it — most visible on docs pages,
  // where useCanvasSurface leaves the canvas alone and the box sits on top of
  // whatever the canvas is showing. Story view still gets its surface from
  // useCanvasSurface, which paints <body> edge to edge.
  const style: Record<string, string> = {
    colorScheme: isDark ? 'dark' : 'light',
    color: 'var(--md-sys-color-on-surface)',
    minHeight: '100%',
  };
  for (const [name, value] of Object.entries(tokens)) {
    style[name] = value;
  }
  return style as React.CSSProperties;
};

// Paint the story canvas itself rather than a wrapper around the component.
//
// The wrapper carries the tokens (so docs pages keep neutral chrome), but a
// wrapper cannot paint the canvas: under `layout: 'centered'` Storybook centres
// the story by making <body> a flex container, leaving #storybook-root
// shrink-to-fit. The surface colour then reads as a tinted box drawn around the
// component instead of as the page behind it. Overriding that in CSS loses to
// Storybook's own stylesheet, which is injected after this module.
//
// Setting it on <body> is reliable and correct: inside the preview iframe, body
// *is* the canvas — the sidebar and toolbar live in the parent document. It is
// applied only in story view so docs pages are left alone.
function useCanvasSurface(isStory: boolean, isDark: boolean, surface: string) {
  useLayoutEffect(() => {
    if (!isStory) return;
    const { body } = document;
    const previousBackground = body.style.backgroundColor;
    const previousScheme = body.style.colorScheme;

    body.style.backgroundColor = surface;
    body.style.colorScheme = isDark ? 'dark' : 'light';

    return () => {
      body.style.backgroundColor = previousBackground;
      body.style.colorScheme = previousScheme;
    };
  }, [isStory, isDark, surface]);
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
      const palette = generateM3Theme(seed);
      const surface = (isDark ? palette.dark : palette.light)['--md-sys-color-surface'];

      useCanvasSurface(context.viewMode === 'story', isDark, surface);

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
      // M3 window size classes first (primary), then the common device presets.
      options: { ...M3_VIEWPORTS, ...INITIAL_VIEWPORTS },
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
          ['Card', 'Carousel', 'Dialog', 'Divider', 'List', 'Menu', 'Tooltip'],
          'Navigation',
          ['App Bar', 'Navigation Bar', 'Navigation Rail', 'Tabs', 'Toolbar'],
          'Selection',
          ['Checkbox', 'Chip', 'Radio Button', 'Slider', 'Switch'],
          'Inputs',
          ['Text Field'],
          'Guidance',
        ],
      },
    },

    a11y: {
      // 'todo' - show a11y violations in the test UI only
      // 'error' - fail CI on a11y violations
      // 'off' - skip a11y checks entirely
      test: 'error',
    },
  },
};

export default preview;
