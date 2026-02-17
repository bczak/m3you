# External Integrations

**Analysis Date:** 2026-02-17

## APIs & External Services

**Not detected** - This is a component library with no external API integrations.

## Data Storage

**Databases:**
- Not applicable - Component library does not use databases

**File Storage:**
- Local filesystem only - Build artifacts stored in `dist/` directory

**Caching:**
- None - Component library does not implement caching

## Authentication & Identity

**Not applicable** - Component library does not implement authentication

## Monitoring & Observability

**Error Tracking:**
- None - Component library does not include error tracking

**Logs:**
- Console-based development logging only (no persistent logging infrastructure)

## CI/CD & Deployment

**Hosting:**
- Documentation: Rspress generated static site
- Storybook: Static site generation available
- Library distribution: npm package (m3you)

**CI Pipeline:**
- Not detected - No GitHub Actions workflows or CI configuration files found

## Environment Configuration

**Required env vars:**
- None - No environment variables required for library functionality

**Secrets location:**
- Not applicable - Component library contains no secrets or credentials

## Webhooks & Callbacks

**Incoming:**
- Not applicable

**Outgoing:**
- Not applicable

## Third-Party Component Libraries & APIs Used

**Component Primitives (via @base-ui/react):**
- Dialog primitives (for `Dialog` component)
- Tooltip primitives (for `Tooltip` component)

**Visual Effects:**
- m3-ripple package (v1.1.3) - Material Design 3 ripple effects
  - Used in: `Button`, `IconButton`, `Card`, `Chip`, `Checkbox`, `Switch`, `NavigationBar`, `NavigationBarItem`, `NavigationRail`, `DatePicker`, `TimePicker`, `Tabs`

**Icon Assets:**
- lucide-react - SVG icons for: Menu (Check, ChevronRight), Chip (Check, X), Switch (Check, X), DatePicker (Calendar, Pencil, ChevronLeft, ChevronRight), Checkbox (Check, Minus), Snackbar (X), FAB (Plus), TimePicker (Clock, Keyboard)
- react-icons - Available but minimal usage detected

**Animations:**
- framer-motion 12.29.2 - Animation library (included, usage pattern not detected in initial scan)
- motion 12.29.2 - Motion utilities (included, usage pattern not detected in initial scan)

**Notifications:**
- sonner 2.0.7 - Toast notification library
  - Used in: `Snackbar` component (`src/components/ui/snackbar.tsx`)
  - Exports: `Toaster as SonnerToaster`, `toast as sonnerToast`

## Development & Build Infrastructure

**Build Tools:**
- Rslib - Rust-based library bundler
- Rsbuild - Rust-based build system
- PostCSS - CSS transformation pipeline
- Tailwind CSS - Utility-first CSS generation

**Documentation Generation:**
- Rspress - Static site generator for documentation
- react-docgen-typescript - API documentation parser

**Component Development:**
- Storybook 10.2 - Component sandbox and documentation
- Storybook React Rsbuild - Storybook integration with Rsbuild

**Code Quality:**
- Biome - Linter and formatter (ESLint + Prettier replacement)

**Testing:**
- Rstest - Test runner (Rust-based)
- Testing Library React - DOM testing utilities
- happy-dom - Lightweight DOM for test environment

## Import Patterns

All external library integrations are localized to specific components:

**Component-specific integrations:**
- `src/components/ui/snackbar.tsx` - sonner (Toaster, toast)
- `src/components/ui/dialog.tsx` - @base-ui/react (Dialog primitives)
- `src/components/ui/tooltip.tsx` - @base-ui/react (Tooltip primitives)
- `src/components/ui/menu.tsx` - lucide-react (Check, ChevronRight icons)
- `src/components/ui/chip.tsx` - lucide-react (Check, X icons)
- `src/components/ui/checkbox.tsx` - lucide-react (Check, Minus icons)
- `src/components/ui/switch.tsx` - lucide-react (Check, X icons)
- `src/components/ui/date-picker.tsx` - lucide-react (CalendarIcon, Check, ChevronDown, ChevronLeft, ChevronRight, Pencil icons)
- `src/components/ui/snackbar.tsx` - lucide-react (X icon)
- `src/components/ui/fab-menu.tsx` - lucide-react (PlusIcon)
- `src/components/ui/time-picker.tsx` - lucide-react (Clock, Keyboard icons)

**Ripple effects:**
- m3-ripple used across all interactive components (buttons, chips, cards, etc.)

---

*Integration audit: 2026-02-17*
