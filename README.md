# m3you

Material Design 3 component library for React, built with Tailwind CSS v4.

## Installation

```bash
npm install m3you
# or
bun add m3you
```

### Peer dependencies

m3you requires React 18+ and Tailwind CSS 4+:

```bash
npm install react react-dom tailwindcss
```

## Setup

Import the stylesheet in your app entry point:

```tsx
import 'm3you/styles.css';
```

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
| **Actions** | Button, ButtonGroup, ConnectedButtonGroup, IconButton, ExtendedFAB, FABMenu |
| **Communication** | Badge, Snackbar, CircularProgress, LinearProgress |
| **Containment** | Card, Dialog, BottomSheet, SideSheet, Tooltip, RichTooltip, Divider, Toolbar |
| **Navigation** | NavigationBar, NavigationRail, Tabs, AppBar, SearchBar, SearchView |
| **Selection** | Checkbox, Chip, Switch, RadioButton, Slider, DatePicker, TimePicker |
| **Text Input** | TextField (filled, outlined) |
| **Menu** | Menu with sub-menus, groups, dividers |

## Theming

m3you uses M3 design tokens as CSS custom properties. Generate a custom theme from any seed color:

```tsx
import { generateM3Theme, applyM3Theme } from 'm3you';

const theme = generateM3Theme('#6750A4');
applyM3Theme(theme);
```

Or override CSS custom properties directly:

```css
:root {
  --color-primary: #6750a4;
  --color-on-primary: #ffffff;
  /* ... */
}
```

Dark mode is supported via `prefers-color-scheme: dark`, or by adding `.dark` / `.light` classes to the root element.

## Development

```bash
bun run dev            # Watch mode
bun run build          # Build for production
bun run test           # Run tests
bun run storybook      # Start Storybook
bun run lint           # Lint with Biome
bun run format         # Format with Biome
```

## Tech Stack

- **React** with TypeScript
- **Tailwind CSS v4** for styling
- **class-variance-authority** for variant management
- **Base UI** for accessible primitives (dialogs, menus, tooltips, drawers)
- **m3-ripple** for Material ripple effects
- **Rslib** for bundling (unbundled ESM + DTS)

## License

[MIT](LICENSE)
