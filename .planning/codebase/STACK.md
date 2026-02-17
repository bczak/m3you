# Technology Stack

**Analysis Date:** 2026-02-17

## Languages

**Primary:**
- TypeScript 5.9.3 - All source code, component definitions, and type definitions

**Secondary:**
- JavaScript - Build configuration files (postcss.config.mjs)

## Runtime

**Environment:**
- Node.js (version not pinned via .nvmrc)

**Package Manager:**
- Bun (indicated by bun.lock lockfile)
- Lockfile: `bun.lock` (present)

## Frameworks

**Core:**
- React 19.2.4 - UI component library foundation
- React DOM 19.2.4 - DOM rendering

**Build/Bundling:**
- Rslib 0.19.4 - Library bundling tool
- Rsbuild 1.7.2 - Build system (Rust-based)
- Rsbuild React Plugin 1.4.4 - React integration for Rsbuild

**Styling:**
- Tailwind CSS 4.1.18 - Utility-first CSS framework
- Tailwind CSS PostCSS 4.1.18 - PostCSS plugin for Tailwind
- PostCSS 8.5.6 - CSS transformation tool

**Component Patterns:**
- class-variance-authority 0.7.1 - CVA variant management for components
- clsx 2.1.1 - Utility for constructing className strings
- tailwind-merge 3.4.0 - Merges Tailwind classes intelligently

**Documentation:**
- Rspress 2.0.1 - Documentation site generator
- Rspress API DocGen Plugin 2.0.1 - Automatic API documentation from code
- Rspress Preview Plugin 2.0.1 - Live preview of components in docs

**Component Storybook:**
- Storybook 10.2.3 - Component development environment
- Storybook React 10.2.3 - React adapter for Storybook
- Storybook Addon Docs 10.2.3 - Documentation addon
- Storybook Addon Onboarding 10.2.3 - Onboarding addon
- Storybook React Rsbuild 3.2.2 - Rsbuild integration for Storybook
- Storybook Addon Rslib 3.2.2 - Rslib integration for Storybook

**Testing:**
- Rstest 0.8.1 - Test runner (Rust-based)
- Rstest Adapter Rslib 0.2.0 - Rslib integration for Rstest
- Testing Library React 16.3.2 - Component testing utilities
- Testing Library Jest DOM 6.9.1 - DOM matchers
- happy-dom 20.4.0 - Lightweight DOM implementation for tests

**Code Quality:**
- Biome 2.3.13 - Fast linter and formatter
  - Replaces ESLint and Prettier
  - Config: `biome.json`

## Key Dependencies

**Critical:**
- m3-ripple 1.1.3 - Material Design 3 ripple effect component (used in all interactive components)
- @base-ui/react 1.0.0 - Unstyled accessible component primitives (Dialog, Tooltip bases)

**Icon & Animation:**
- lucide-react 0.563.0 - SVG icon library (used throughout components)
- react-icons 5.5.0 - React icon library
- framer-motion 12.29.2 - Animation library
- motion 12.29.2 - Motion library (likely alternative/complement to framer-motion)

**Notifications:**
- sonner 2.0.7 - Toast notification library (used by Snackbar component)

## Configuration

**Environment:**
- Environment files: Not used (no .env files detected)
- Configuration is entirely code-based via config files

**Build:**
- TypeScript: `tsconfig.json` - Target ES2022, strict mode, module resolution bundler
- Build output: `rslib.config.ts` - ESM format, unbundled, DTS generation enabled
- CSS: `postcss.config.mjs` - Tailwind CSS v4 PostCSS plugin
- Formatting/Linting: `biome.json`
  - Indent: 2 spaces
  - Line width: 120 characters
  - Quote style: Single quotes
  - CSS modules: enabled
  - Tailwind directives: enabled
  - Linting rule: useSortedClasses (enforced as error)
  - Organized imports: enabled

**Storybook:**
- Config: `.storybook/main.ts`
- Story files: `stories/**/*.stories.@(js|jsx|mjs|ts|tsx)`
- Preview: `.storybook/preview.ts` - Imports global styles

**Documentation:**
- Config: `rspress.config.ts`
- Docs root: `docs/` directory
- API docgen tool: react-docgen-typescript

**Testing:**
- Config: `rstest.config.ts`
- Setup file: `rstest.setup.ts` - Extends Rstest with Testing Library Jest DOM matchers
- Test environment: happy-dom

## Platform Requirements

**Development:**
- TypeScript 5.9+
- Node.js (version unspecified, recommend checking project documentation)
- Bun package manager
- Modern browser for Storybook dev server

**Production:**
- React 16.9.0+ (peer dependency)
- React DOM 16.9.0+ (peer dependency)
- Browsers: Target ES2022
- Distribution: ESM format (unbundled components)

## Build & Output

**Library Output:**
- Format: ES Module (ESM)
- Location: `dist/` directory
- Includes: Bundled JavaScript, TypeScript type definitions (`.d.ts`), CSS files
- Unbundled: Dependencies included, CSS as separate files for tree-shaking

**Entry Points:**
- Main: `dist/index.js` (exports all components and utilities)
- Styles: `dist/styles/globals.css` (Material Design 3 theme colors)

---

*Stack analysis: 2026-02-17*
