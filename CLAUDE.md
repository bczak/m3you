# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**m3you** — A Material Design 3 (M3) component library for React, built with Tailwind CSS v4 and class-variance-authority (CVA). Package manager is **bun**.

## Commands

```bash
bun run build          # Build with Rslib
bun run dev            # Watch mode build
bun run test           # Run all tests (Rstest)
bun run test:watch     # Run tests in watch mode
bun run storybook      # Start Storybook on port 6006
bun run check          # Biome check (lint + format) with auto-fix
bun run lint           # Biome lint with auto-fix
bun run format         # Biome format with auto-fix
```

To run a single test file: `bunx rstest tests/badge.test.tsx`

## Architecture

### Component Pattern

Every component in `src/components/ui/` follows the same structure:

1. **Variants** defined with `cva()` from class-variance-authority
2. **Component** implemented with `React.forwardRef`
3. **Exports**: both the component and its `*Variants` function
4. **Utility**: `cn()` from `src/lib/utils.ts` (wraps `clsx` + `tailwind-merge`) for merging class names

All public components and types are re-exported from `src/index.tsx`.

### Styling

- **Tailwind CSS v4** with M3 design tokens defined as CSS custom properties in `src/styles/globals.css`
- M3 color system: `primary`, `secondary`, `tertiary`, `error`, `surface`, `surface-container`, `outline` etc.
- Ripple effects via `m3-ripple` package (requires `Ripple` wrapper component)
- Consumers import styles via `import 'm3you/styles.css'`

### Testing

- **Rstest** (`@rstest/core`) with `@testing-library/react` and `happy-dom`
- `rstest.setup.ts` globally extends `expect` with jest-dom matchers, polyfills `Element.animate()` for happy-dom, and runs `cleanup()` after each test
- Tests live in `tests/` directory, named `{component}.test.tsx`

### Stories

- **Storybook 10** with `storybook-react-rsbuild`
- Stories live in `stories/` directory, named `{Component}.stories.tsx`
- Pattern: `Meta<typeof Component>` + `StoryObj`, render functions for stateful stories

### Build & Bundle

- **Rslib** (unbundled ESM with DTS generation) configured in `rslib.config.ts`
- Entry: `./src/**` — every file in src is a separate entry point
- PostCSS with `@tailwindcss/postcss` for processing Tailwind

## Linting Rules (Biome)

- Formatter: 2-space indent, 120 char line width, single quotes
- `useSortedClasses`: **error** — Tailwind classes must be sorted
- SVG icons need `aria-hidden="true"` for accessibility (Biome `a11y` rules)
- Import organization is automatic via `organizeImports`

## Path Aliases

- `@/*` maps to `./src/*` (configured in tsconfig.json)
