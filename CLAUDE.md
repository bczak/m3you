# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

M3-Lib is a Material Design 3 (M3) component library built with React, Tailwind CSS v4, and class-variance-authority (CVA). Components use the `m3-ripple` package for Material ripple effects.

## Commands

```bash
bun run build          # Build library for production
bun run dev            # Watch mode - rebuild on changes
bun run lint           # Lint with Biome (auto-fix)
bun run format         # Format with Biome
bun run check          # Run both lint and format
bun run test           # Run tests with Rstest
bun run test:watch     # Run tests in watch mode
bun run storybook      # Start Storybook dev server
bun run build:storybook # Build Storybook
bun run doc            # Start Rspress docs dev server
bun run doc:build      # Build documentation
```

## Architecture

### Build System
- **Rslib** for library bundling (ESM format, unbundled)
- **Tailwind CSS v4** with PostCSS integration
- **Biome** for linting/formatting (single quotes, 2-space indent, 120 line width)
- **Rstest** for testing with happy-dom

### Component Pattern
Components use CVA for variant management:
- Define variants with `cva()` from class-variance-authority
- Use `compoundVariants` for complex state combinations (size + shape, selected + variant)
- Export both component and variants (e.g., `Button` and `buttonVariants`)
- Use `cn()` utility from `src/lib/utils.ts` for class merging (clsx + tailwind-merge)

### Styling
- Theme colors defined in `src/styles/globals.css` using Tailwind v4 `@theme` directive
- M3 color system: primary, secondary, tertiary, error, surface variants
- Surface containers: lowest, low, default, high, highest
- All buttons include `<Ripple />` from m3-ripple

### Exports
Library exports from `src/index.tsx`:
- Components: `Button`, `ButtonGroup`
- Variants: `buttonVariants`, `buttonGroupVariants`
- Types: `ButtonProps`, `ButtonGroupProps`
- Utilities: `cn`
- Styles: `./styles.css` (import separately)

## Documentation Links

- Rslib: https://rslib.rs/llms.txt
- Rsbuild: https://rsbuild.rs/llms.txt
- Rstest: https://rstest.rs/llms.txt
- Rspress: https://rspress.rs/llms.txt

## Biome Rules

- `useSortedClasses`: Tailwind classes must be sorted (enforced)
- Organized imports enabled
- CSS modules and Tailwind directives supported
