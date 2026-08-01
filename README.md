# m3you

Material Design 3 Expressive component library for React, built with plain CSS and CSS custom properties.

## Installation

```bash
npm install m3you
# or
bun add m3you
```

### Peer dependencies

```bash
npm install react react-dom
```

React 19+ is required.

## Setup

Import the stylesheet once in your app entry point:

```tsx
import 'm3you/styles.css';
```

No bundler plugins, no Tailwind, no PostCSS config required — everything ships as plain CSS with M3 design tokens as CSS custom properties.

## Usage

```tsx
import { Button, Card, TextField } from 'm3you';

function App() {
  return (
    <Card>
      <TextField label="Name" />
      <Button variant="filled">Submit</Button>
    </Card>
  );
}
```

## Components

| Category | Components |
|---|---|
| **Actions** | Button, ButtonGroup, ConnectedButtonGroup, IconButton, ToggleButton, ToggleIconButton, Fab, ExtendedFab, FabMenu |
| **Communication** | Badge, Snackbar, CircularProgress, LinearProgress, LoadingIndicator |
| **Containment** | Card, Dialog, BottomSheet, SideSheet, Tooltip, Divider, Toolbar |
| **Navigation** | NavigationBar, NavigationRail, Tabs, AppBar, SearchBar |
| **Selection** | Checkbox, Chip, Switch, RadioButton, Slider, DatePicker, TimePicker |
| **Text Input** | TextField (filled, outlined) |
| **Menu** | Menu with sub-menus, groups, dividers |

## Theming

m3you uses M3 design tokens exposed as CSS custom properties (`--md-sys-*`). Generate a custom palette from any seed color:

```tsx
import { applyM3Theme } from 'm3you';

applyM3Theme('#6750A4');
```

You can also override any CSS custom property directly:

```css
:root {
  --md-sys-color-primary: #6750a4;
  --md-sys-color-on-primary: #ffffff;
  /* ... */
}
```

### Dark mode

Dark mode is applied in two ways:

- **System preference** — `prefers-color-scheme: dark` switches tokens automatically.
- **Manual override** — set `data-theme="dark"` (or `"light"`) on `<html>` or any ancestor.

## Development

```bash
bun install
bun run dev            # Vite watch-mode build
bun run build          # Library build (ESM + DTS)
bun run test           # Vitest
bun run test:watch     # Vitest in watch mode
bun run storybook      # Storybook on port 6006
bun run check          # Biome lint + format (auto-fix)
```

## Tech stack

- **React 19+** with TypeScript
- **Plain CSS + CSS custom properties** (no runtime CSS-in-JS, no Tailwind in the shipped bundle)
- **Vite** (library mode) + `vite-plugin-dts` for build
- **Vitest** + `@testing-library/react` + `happy-dom` for tests
- **Storybook 10** (`@storybook/react-vite`) for component explorer
- **Biome** for lint/format
- **`@base-ui/react`** for accessible primitives (dialog, menu, tooltip, popover)
- **`m3-ripple`** for Material ripple effects
- **`@material/material-color-utilities`** for dynamic theme generation

## License

[MIT](LICENSE)
