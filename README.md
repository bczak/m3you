# m3you

A Material Design 3 (M3) component library for React, built with Tailwind CSS v4 and class-variance-authority (CVA).

## Installation

```bash
bun add m3you
```

```tsx
import 'm3you/styles.css';
import { Button } from 'm3you';
```

## Components

### Implemented

| Category | Component | Variants / Notes |
|---|---|---|
| **Actions** | Button | filled, elevated, tonal, outlined, text |
| | ButtonGroup | grouped buttons |
| | ConnectedButtonGroup | connected segmented buttons |
| | IconButton | filled, elevated, tonal, outlined, text |
| | ExtendedFAB | FAB with icon + label |
| | FABMenu | FAB with expandable menu |
| **Communication** | Badge | small, large; with BadgeAnchor |
| | Snackbar | single-line, multi-line, closable; imperative API |
| | CircularProgress | determinate, indeterminate |
| | LinearProgress | determinate, indeterminate, buffer |
| **Navigation** | NavigationBar | with NavigationBarItem |
| | NavigationRail | with NavigationRailItem, sections, menu button |
| **Selection** | Checkbox | with indeterminate state |
| | Chip | assist, filter, input, suggestion |
| | Switch | with icon support |
| **Text Input** | TextField | filled, outlined; leading/trailing icons, supporting text, error state |

### Roadmap

| Category | Component | Status |
|---|---|---|
| **Actions** | Segmented Button | Planned |
| **Containment** | Card | Planned |
| | Dialog | Planned |
| | Bottom Sheet | Planned |
| | Side Sheet | Planned |
| | Carousel | Planned |
| | Tooltip | Planned |
| | List | Planned |
| | Divider | Planned |
| **Navigation** | Navigation Drawer | Planned |
| | Tabs | Planned |
| | Bottom App Bar | Planned |
| | Top App Bar | Planned |
| | Search | Planned |
| **Selection** | Radio Button | Planned |
| | Slider | Planned |
| **Text Input** | Date Picker | Planned |
| | Time Picker | Planned |
| | Menu | Planned |

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
- **m3-ripple** for Material ripple effects
- **Rslib** for bundling
- **Rstest** for testing
- **Storybook** for component development
- **Biome** for linting and formatting

## License

MIT
