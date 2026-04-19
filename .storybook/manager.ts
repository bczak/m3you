import { addons } from 'storybook/manager-api';
import { create } from 'storybook/theming/create';

addons.setConfig({
  panelPosition: 'right',
  sidebar: {
    showRoots: true,
  },
  layoutCustomisations: {
    showToolbar: () => true,
  },
  theme: create({
    base: 'light',
    brandTitle: 'm3you',
    brandUrl: 'https://github.com/bczak/m3you',
    colorPrimary: '#416699',
    colorSecondary: '#8b5000',
    appBg: '#f5f1ea',
    appContentBg: '#fffdf8',
    appHoverBg: '#ece6dd',
    appPreviewBg: '#fffdf8',
    appBorderColor: '#ddd5c8',
    appBorderRadius: 18,
    barBg: '#faf6ef',
    barTextColor: '#4c4439',
    barSelectedColor: '#244f78',
    buttonBg: '#fffaf2',
    buttonBorder: '#ddd5c8',
    booleanBg: '#e8efe8',
    booleanSelectedBg: '#416699',
    inputBg: '#fffdf8',
    inputBorder: '#d7cfc2',
    inputTextColor: '#1e1b18',
    inputBorderRadius: 14,
    textColor: '#1d1b20',
    textInverseColor: '#fff8f2',
    textMutedColor: '#6c6459',
    fontBase: '"Google Sans Text", "Google Sans", system-ui, sans-serif',
    fontCode: 'ui-monospace, SFMono-Regular, SF Mono, Menlo, monospace',
  }),
});
