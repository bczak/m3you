# m3you

Material Design 3 Expressive component library for React, built with plain CSS and CSS custom properties.

**[Documentation](https://material.you)** · [Components](https://material.you/components) · [Showcase](https://material.you/showcase) · [Theme playground](https://material.you/theme) · [Storybook](https://storybook.material.you)

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
| **Containment** | Card, Carousel, List, Dialog, BottomSheet, SideSheet, Tooltip, Divider, Toolbar |
| **Navigation** | NavigationBar, NavigationRail, Tabs, AppBar, SearchBar |
| **Selection** | Checkbox, Chip, Switch, RadioButton, Slider, DatePicker, TimePicker |
| **Text Input** | TextField (filled, outlined) |
| **Menu** | Menu with sub-menus, groups, dividers |

## Material 3 catalog coverage

m3you implements every component family currently recommended by the [Material 3 component catalog](https://m3.material.io/components). Of the 36 catalog families, 34 have direct component APIs and the two retired families have expressive replacements:

| M3 family | m3you API | Status |
|---|---|---|
| [Carousel](https://m3.material.io/components/carousel/overview) | `Carousel`, `CarouselItem` | All six current layouts |
| [Lists](https://m3.material.io/components/lists/overview) | `List`, `ListItem`, `ListDivider` | Expressive standard and segmented appearances |
| [Navigation drawer](https://m3.material.io/components/navigation-drawer/overview) | Expanded `NavigationRail` | Retired by M3 in May 2025 |
| [Segmented buttons](https://m3.material.io/components/segmented-buttons/overview) | `ConnectedButtonGroup` | Retired by M3 in May 2025 |

### Navigation drawer replacement

Use an expanded rail for new designs. Standard modality remains inline; modal modality overlays content with a dismissible scrim.

```tsx
<NavigationRail state="expanded" modality="standard" />
<NavigationRail state="expanded" modality="modal" />
```

### Segmented button replacement

Connected button groups provide the same single- or multiple-selection behavior with the current M3 Expressive button shapes and sizes.

```tsx
<ConnectedButtonGroup selectionMode="single" required>
  <Button>Day</Button>
  <Button>Week</Button>
  <Button>Month</Button>
</ConnectedButtonGroup>

<ConnectedButtonGroup selectionMode="multiple">
  <Button>Labels</Button>
  <Button>Guides</Button>
  <Button>Grid</Button>
</ConnectedButtonGroup>
```

### Carousel accessibility

Carousels are labelled native scroll regions. Items expose their position to assistive technology, keyboard arrows move between enabled items, full-screen layouts use vertical navigation, and reduced-motion preferences remove parallax and size morphing. Non-full-screen carousels should provide a `showAllAction` that reaches the same content without horizontal scrolling.

```tsx
<Carousel label="Featured places" title="Featured" showAllAction={<Button>Show all</Button>}>
  <CarouselItem label="Mountain retreat" href="/places/mountain">
    <img src="/mountain.jpg" alt="" />
  </CarouselItem>
  <CarouselItem label="Coastal trail" onClick={openCoastalTrail}>
    <img src="/coast.jpg" alt="" />
  </CarouselItem>
</Carousel>
```

### Expressive list selection

Selection uses stable string values rather than item indexes. Listbox semantics, roving focus, disabled-item skipping, and a non-color selection indicator are applied automatically.

```tsx
<List mode="multi-select" aria-label="Notification channels" value={channels} onValueChange={setChannels}>
  <ListItem value="email" headline="Email" supportingText="Daily summary" />
  <ListItem value="push" headline="Push notifications" />
  <ListItem value="sms" headline="Text message" disabled />
</List>
```

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

bun run docs:dev       # Documentation site on port 3000
bun run docs:build     # Static build of the documentation site
```

The documentation site lives in [`docs/`](docs) as a bun workspace and imports
the library straight from `src/`, so component edits hot-reload into it. Its
props tables are generated from the TypeScript source — see
[`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md) for hosting.

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
