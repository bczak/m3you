# Stack Research

**Domain:** React component library testing and accessibility validation
**Researched:** 2026-02-17
**Confidence:** HIGH (core tooling) / MEDIUM (Rstest per-file env, vitest-axe compatibility)

---

## Current Stack (Already Installed)

The following are already in place and should not be replaced — this milestone adds to the
existing setup, not alongside a parallel one.

| Package | Version | Role |
|---------|---------|------|
| `@rstest/core` | 0.8.1 | Test runner (Rspack-native, Vitest-compatible API) |
| `@rstest/adapter-rslib` | 0.2.0 | Inherits rslib config so tests use the same build pipeline |
| `@testing-library/react` | 16.3.2 | Component rendering and querying |
| `@testing-library/jest-dom` | 6.9.1 | DOM assertion matchers (`toBeInTheDocument`, `toHaveClass`, etc.) |
| `happy-dom` | 20.4.0 | DOM simulation environment for existing unit tests |

Setup wires matchers in `rstest.setup.ts` via `expect.extend(jestDomMatchers)`. All existing
tests run against happy-dom.

---

## Recommended Stack (New Additions)

### Core Testing Libraries

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| `@testing-library/user-event` | 14.6.1 (latest) | Realistic user interaction simulation | v14's `userEvent.setup()` fires the full event chain (keydown, keypress, keyup, focus, blur) that real users trigger. `fireEvent` only dispatches a single DOM event and misses intermediate states — keyboard handlers that check focus or sequence will fail when tested with `fireEvent` alone. Required for validating keyboard accessibility (Tab, Enter, Space, Escape, Arrow keys). |
| `vitest-axe` | latest | axe-core accessibility assertions in Rstest context | Fork of `jest-axe` designed for the Vitest `expect.extend` API, which Rstest shares. Wraps axe-core 4.x with a `toHaveNoViolations()` matcher. **Must run in jsdom, not happy-dom** — see critical constraint below. |
| `jsdom` | 26.x (latest) | DOM environment for accessibility tests | axe-core's `Node.prototype.isConnected` usage has a confirmed, unfixed bug in happy-dom. jsdom is the only working DOM simulator for axe. Rstest supports both environments side-by-side via the `projects` config. |

### Supporting Libraries

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `axe-core` | 4.x (transitive via `vitest-axe`) | Accessibility rule engine | Installed as a transitive dependency of `vitest-axe`. Catches ~57% of WCAG 2.x issues automatically. Do not install separately — let `vitest-axe` manage the version. |
| `@storybook/addon-a11y` | 10.x (matches existing storybook) | In-browser accessibility panel | Runs axe-core in a real browser via Storybook, catching issues jsdom cannot (color contrast, computed styles). Complements unit-level `vitest-axe` checks. Already partially available — project uses Storybook 10.x. |

### Development Tools

| Tool | Purpose | Notes |
|------|---------|-------|
| Rstest `projects` config | Isolate accessibility tests in jsdom environment | Define a second project entry in `rstest.config.ts` pointing to `tests/a11y/` with `testEnvironment: 'jsdom'`. Existing tests in `tests/` keep happy-dom. No test file annotation needed. |
| `@testing-library/jest-dom` | Already installed — extend to a11y setup file | Create a separate `rstest.setup.a11y.ts` that extends both `jest-dom` matchers and `vitest-axe` matchers. |

---

## Installation

```bash
# User interaction simulation (replaces direct fireEvent for keyboard tests)
bun add -D @testing-library/user-event

# Accessibility testing (requires jsdom environment, NOT happy-dom)
bun add -D vitest-axe jsdom
```

---

## Critical Constraint: happy-dom Breaks axe-core

**This is the most important fact in this document.**

`happy-dom` has a confirmed, unfixed bug in `Node.prototype.isConnected` that causes axe-core to
fail at runtime. The bug manifests in `vitest-axe` (and any direct `axe-core` usage) with an
unrecoverable error during the accessibility scan.

**The workaround is a two-project Rstest config:**

```typescript
// rstest.config.ts
import { withRslibConfig } from '@rstest/adapter-rslib';
import { defineConfig } from '@rstest/core';

export default defineConfig({
  projects: [
    {
      // Existing unit tests — keep happy-dom for speed
      extends: withRslibConfig(),
      include: ['tests/*.test.{ts,tsx}'],
      setupFiles: ['./rstest.setup.ts'],
      // testEnvironment defaults to happy-dom via rslib adapter
    },
    {
      // Accessibility tests — must use jsdom for axe-core
      extends: withRslibConfig(),
      name: 'a11y',
      include: ['tests/a11y/**/*.test.{ts,tsx}'],
      setupFiles: ['./rstest.setup.a11y.ts'],
      testEnvironment: 'jsdom',
    },
  ],
});
```

Accessibility tests live in `tests/a11y/`. Unit tests remain in `tests/`. Both run with
`bun run test`.

---

## Alternatives Considered

| Recommended | Alternative | When to Use Alternative |
|-------------|-------------|-------------------------|
| `vitest-axe` | `jest-axe` | Never for this project — `jest-axe` types clash with Rstest/Vitest's `expect` because it expects the Jest global type environment. `vitest-axe` resolves this cleanly. |
| `jsdom` (separate project) | Switch entire suite to jsdom | Only if all tests need axe-core. Penalty: slower tests, loses happy-dom's performance advantage for the 12 existing tests. Not worth it. |
| `@storybook/addon-a11y` only | No unit-level a11y | Insufficient: Storybook checks require manual story-by-story review. Unit-level `vitest-axe` tests run in CI on every commit. Both layers are needed. |
| `userEvent.setup()` | `fireEvent` | Use `fireEvent` only when `userEvent` cannot simulate a specific low-level event (e.g., custom synthetic events). For keyboard, focus, and click interactions, `userEvent` is required. |
| `@axe-core/react` | Direct runtime overlay | Development-only tool that logs violations to console. Does not run in CI. Not a substitute for `vitest-axe` assertions. |

---

## What NOT to Use

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| `react-axe` / `@axe-core/react` | Development overlay only, not testable in CI, deprecated in the Deque org | `vitest-axe` in tests + `@storybook/addon-a11y` in Storybook |
| `fireEvent` for keyboard tests | Fires a single synthetic event, does not simulate focus management or event sequences. Keyboard accessibility tests written with `fireEvent` give false positives — the handler fires in test but not in real browser with AT. | `userEvent.setup()` from `@testing-library/user-event` |
| `axe-core` directly (without `vitest-axe`) | Requires manually awaiting results and writing custom expect logic. `vitest-axe` handles the wrapper and provides the `toHaveNoViolations()` matcher already. | `vitest-axe` |
| Switching entire suite to jsdom | happy-dom is ~2-5x faster than jsdom for unit tests. Existing tests don't need axe-core. Changing the global environment would slow down all 12 existing test files unnecessarily. | Two-project Rstest config |
| `@testing-library/user-event` v13 or below | v13 has a fundamentally different API (no `setup()`, direct method calls only). v14 is required for the modern `async/await` pattern and correct event sequencing. | `@testing-library/user-event` v14 |

---

## Stack Patterns by Test Type

**Unit tests — variant rendering, class application, ref forwarding:**
- Environment: happy-dom (fast)
- Tools: `@testing-library/react` + `@testing-library/jest-dom`
- Pattern: `render()` → `screen.getByRole()` → `expect().toHaveClass()`
- Location: `tests/*.test.tsx`

**Interaction tests — click, keyboard, focus:**
- Environment: happy-dom
- Tools: `@testing-library/react` + `@testing-library/user-event` v14
- Pattern: `const user = userEvent.setup()` → `render()` → `await user.click()` / `await user.keyboard('{Space}')`
- Location: `tests/*.test.tsx` (same files as unit tests)

**Accessibility tests — ARIA attributes, roles, violations:**
- Environment: **jsdom** (required for axe-core)
- Tools: `@testing-library/react` + `vitest-axe`
- Pattern: `render()` → `expect(await axe(container)).toHaveNoViolations()`
- Location: `tests/a11y/*.test.tsx`
- Limitation: color contrast rules disabled in jsdom (no computed styles). Color contrast must be checked in Storybook's addon-a11y panel in a real browser.

**Visual accessibility — color contrast, focus ring visibility:**
- Environment: real browser (Storybook)
- Tools: `@storybook/addon-a11y`
- Pattern: story renders → addon-a11y panel → review violations tab
- Location: `stories/*.stories.tsx` (already exist for all components)

---

## Version Compatibility

| Package | Compatible With | Notes |
|---------|-----------------|-------|
| `@rstest/core` 0.8.1 | `@testing-library/user-event` 14.x | Rstest uses the same `expect` API as Vitest — user-event works without config changes |
| `vitest-axe` latest | `@rstest/core` 0.8.x | vitest-axe uses `expect.extend()` which is part of the Vitest-compatible API that Rstest implements. Extend in the a11y setup file. |
| `vitest-axe` latest | `jsdom` 26.x | Works. Does NOT work with happy-dom (known bug). |
| `@testing-library/jest-dom` 6.9.1 | `@testing-library/react` 16.x | Already compatible, no changes needed. |
| `@storybook/addon-a11y` | `storybook` 10.2.3 | Same major version — compatible. Install and add to `.storybook/main.ts` addons array. |

---

## Accessibility Rule Scope (axe-core in jsdom)

axe-core running in jsdom **cannot check:**
- Color contrast (no computed CSS)
- Focus-visible ring visibility (no rendered pixels)
- Animation or motion (no browser rendering)

axe-core running in jsdom **can check:**
- Missing `aria-label` / `aria-labelledby` on interactive elements
- Incorrect or missing roles (`role="switch"`, `role="checkbox"`, etc.)
- Missing `aria-pressed` on toggle buttons (filter chips, icon buttons with `selected` prop)
- `aria-hidden="true"` on decorative icons (already enforced by Biome rule)
- Button elements without accessible names
- Form inputs without associated labels
- Heading hierarchy violations
- Duplicate IDs

This scope covers the specific gaps identified in the project: missing `aria-pressed`, `aria-label`,
and keyboard handler coverage across 12 untested components.

---

## Sources

- [vitest-axe README — happy-dom incompatibility documented](https://github.com/chaance/vitest-axe/blob/main/README.md) — HIGH confidence (official source)
- [Rstest React guide — environment configuration](https://rstest.rs/guide/framework/react) — HIGH confidence (official docs)
- [Rstest Rslib adapter — projects config for per-directory environments](https://rstest.rs/guide/integration/rslib) — HIGH confidence (official docs)
- [Testing Library — user-event intro](https://testing-library.com/docs/user-event/intro/) — HIGH confidence (official docs)
- [Storybook accessibility testing docs](https://storybook.js.org/docs/writing-tests/accessibility-testing) — HIGH confidence (official docs)
- [axe-core GitHub — WCAG coverage and jsdom limitations](https://github.com/dequelabs/axe-core) — HIGH confidence (official source)
- [vitest-axe npm](https://www.npmjs.com/package/vitest-axe) — MEDIUM confidence (package registry)
- [WebSearch: axe-core happy-dom Node.prototype.isConnected bug](https://github.com/vitest-dev/vitest/discussions/1607) — MEDIUM confidence (multiple sources confirm)

---
*Stack research for: M3-Lib — testing and accessibility milestone*
*Researched: 2026-02-17*
