# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**m3you** — A Material Design 3 Expressive component library for React, built with plain CSS and CSS custom properties. Package manager is **bun**.

## Commands

```bash
bun run build          # Build with Vite
bun run dev            # Watch mode build
bun run test           # Run all tests (Vitest)
bun run test:watch     # Run tests in watch mode
bun run storybook      # Start Storybook on port 6006
bun run check          # Biome check (lint + format) with auto-fix
bun run lint           # Biome lint with auto-fix
bun run format         # Biome format with auto-fix
```

To run a single test file: `bun run test tests/badge.test.tsx` (or `bunx vitest run tests/badge.test.tsx`).

## Architecture

### Component Pattern

Every component lives in its own directory under `src/components/{ComponentName}/`:

```
src/components/Button/
  button.tsx    — Component implementation
  button.css    — Component styles (M3 design tokens as CSS custom properties)
```

1. **CSS** co-located as `{name}.css` in the component directory, imported as a side-effect in the `.tsx` file
2. **Variants** via data attributes (`data-variant`, `data-size`, `data-shape`, etc.) — styled in CSS
3. **Component** implemented with `React.forwardRef<TElement, React.PropsWithoutRef<XProps>>(…)`
4. **Class names**: `md-{component}` for root, `md-{component}__{part}` for sub-elements
5. **Utility**: `cx()` from `src/lib/cx.ts` — minimal class name joiner (filters falsy, joins with space)

All public components and types are re-exported from `src/index.tsx`.

### React 18 compatibility (peer range is `>=18.0.0`)

Development happens on **React 18** — the floor of the supported range — so a
React 19-only construct fails here immediately rather than only for consumers.
Do not reintroduce any of these:

- **`ref` as a plain prop.** React 18 strips `ref` before it reaches the props
  object. Use `forwardRef` — including for thin wrappers that only spread
  `{...props}` into a Base UI primitive, since `ref` rides along in that spread.
- **`use(SomeContext)`** — use `useContext`.
- **`<SomeContext value={…}>`** — use `<SomeContext.Provider value={…}>`.

The `React.PropsWithoutRef<XProps>` in the type argument is load-bearing: under
`@types/react` 18 the render function receives the raw props, whose `LegacyRef`
includes `string`, which the rest-spread then fails to pass to Base UI. Keep
`React.MutableRefObject` where refs are written to — 18's `RefObject` has a
`readonly current`.

The other end of the range is covered by the `React 19` CI job in
`.github/workflows/pr.yml`, which installs React 19 over the lockfile and reruns
the type-check, tests and build. The `docs/` workspace is a second React 19
signal: it pins its own `react@19` (fumadocs hard-requires `^19.2.0`) and
consumes the library, so it exercises the published surface on 19 every build.

### Styling — Three-Tier Token Architecture

Following `@material/web`'s pattern:

- **System tokens** (`--md-sys-*`): Design decisions — shape, color, typography, elevation, motion, state
- **Component tokens** (`--md-{component}-*`): Per-component overrides (defined in component CSS files)
- **Token files** in `src/styles/tokens/`:
  - `sys.shape.css` — 10-step M3 Expressive shape scale (0px to full)
  - `sys.typescale.css` — 15 type scales + Display XL + emphasized weights
  - `sys.elevation.css` — 6 levels as box-shadow values
  - `sys.motion.css` — 7 easing curves + 16 durations + spring approximations
  - `sys.state.css` — hover/focus/pressed/dragged/disabled opacities
  - `sys.color.css` — Light theme (49 roles, seed #416699)
  - `sys.color.dark.css` — Dark theme via `@media (prefers-color-scheme: dark)` + `[data-theme="dark"]`

- M3 color system: `primary`, `secondary`, `tertiary`, `error`, `surface`, `surface-container`, `outline` etc.
- Ripple effects via `m3-ripple` package (requires `Ripple` wrapper component)
- Dynamic theming via `applyM3Theme(seedHex)` from `src/lib/color.ts`
- Consumers import styles via `import 'm3you/styles.css'`
- Dark mode: set `data-theme="dark"` on `<html>` or rely on system preference

### Testing

- **Vitest** with `@testing-library/react` and `happy-dom`
- `vitest.setup.ts` globally extends `expect` with jest-dom matchers, polyfills `Element.animate()` for happy-dom, and runs `cleanup()` after each test
- Tests live in `tests/` directory, named `{component}.test.tsx`
- Tests assert `md-*` CSS class names and `data-*` attributes

### Stories

- **Storybook 10** with `@storybook/react-vite` (Tailwind via `@tailwindcss/vite` is injected in `.storybook/main.ts` for story styling only — it is not a runtime dep of the shipped library)
- Stories live in `stories/` directory, named `{Component}.stories.tsx`
- Pattern: `Meta<typeof Component>` + `StoryObj`, render functions for stateful stories

### Build & Bundle

- **Vite** library mode (unbundled ESM with DTS generation) configured in `vite.config.ts`
- Entry: `./src/**` — every file in src is a separate entry point
- `cssCodeSplit: false` — all CSS (tokens from `globals.css` + component CSS imports) bundled into single `dist/styles/globals.css`

## Linting Rules (Biome)

- Formatter: 2-space indent, 120 char line width, single quotes
- SVG icons need `aria-hidden="true"` for accessibility (Biome `a11y` rules)
- Import organization is automatic via `organizeImports`

## CSS Rules

- **NEVER** use `!important` — rely on specificity via data-attribute selectors and CSS custom properties for overrides

## Shape & Border Radius Rules

- **NEVER** use `border-radius: 9999px` or `var(--md-sys-shape-corner-full)` on components
- For **pill/capsule shapes** (wider than tall): use `calc(var(--_height) / 2)` where `--_height` is a CSS custom property set per size variant
- For **circles** (width === height): use `border-radius: 50%`
- The `--md-sys-shape-corner-full` token exists in `sys.shape.css` for reference but must NOT be used in component CSS
- This ensures smooth morph/shape animations — `9999px` breaks CSS transitions because intermediate values stay visually "round"
- For morph transitions, use `--md-sys-motion-easing-spring-default-spatial` for the M3 Expressive spring feel

## Path Aliases

- `@/*` maps to `./src/*` (configured in tsconfig.json)
