# Phase 2: Accessibility Fixes and Stack Setup - Research

**Researched:** 2026-02-17
**Domain:** ARIA accessibility attributes, @testing-library/user-event v14, vitest-axe + jsdom, Rstest multi-project config
**Confidence:** HIGH

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| INFRA-06 | @testing-library/user-event installed and available for keyboard interaction tests | v14.6.1 already present as transitive dep; needs explicit `bun add` to package.json; userEvent.setup() is the v14 API pattern |
| INFRA-07 | vitest-axe + jsdom installed for accessibility scanning | Neither is installed; jsdom required because vitest-axe is incompatible with happy-dom (Node.prototype.isConnected bug); install with `bun add -D` |
| INFRA-08 | Two-project Rstest config created (happy-dom for unit tests, jsdom for a11y tests in tests/a11y/) | Rstest 0.8.1 `projects` config supports inline projects with per-project `extends`, `testEnvironment`, `include`, `setupFiles`, and `name` |
| A11Y-01 | IconButton emits aria-pressed when selected prop is provided | icon-button.tsx has `selected` prop but no `aria-pressed`; add `aria-pressed={selected}` when `selected !== undefined`; write test in tests/icon-button.test.tsx |
| A11Y-02 | Badge emits aria-label with count/content for screen readers | badge.tsx has no `aria-label`; dot variant has no visible text so needs `aria-label`; count variant should also have `aria-label`; write test in tests/badge.test.tsx (extends existing file) |
| A11Y-03 | Card interactive variant has tabIndex={0} and handles Enter/Space keyboard events | card.tsx ALREADY implements tabIndex and Enter/Space via handleKeyDown when onClick is provided; A11Y-03 requires writing tests/card.test.tsx to verify the existing implementation |
</phase_requirements>

## Summary

Phase 2 has two distinct categories of work: (1) stack setup — installing three packages (`jsdom`, `vitest-axe`, explicit `@testing-library/user-event`) and creating a two-project Rstest config that runs unit tests under happy-dom and axe accessibility tests under jsdom; and (2) accessibility fixes — adding `aria-pressed` to IconButton, `aria-label` to Badge, and writing tests that verify Card's existing keyboard behavior.

The Rstest multi-project config is well-supported in v0.8.1: the `projects` array accepts inline objects with `{ name, extends, include, testEnvironment, setupFiles }`. Each project can have its own `extends: withRslibConfig()` and point to different test directories via `include`. The vitest-axe package works with `@rstest/core`'s `expect.extend()` but NOT via `vitest-axe/extend-expect` (that file imports directly from `vitest`). Use `vitest-axe/matchers` with manual `expect.extend()` instead.

Card already has the keyboard interaction and tabIndex implementation complete. A11Y-03 is purely about test writing, not source changes. IconButton and Badge require small source additions (one attribute each) plus new or extended tests.

**Primary recommendation:** Install packages first, create the two-project config second, add ARIA attributes to sources third, then write all tests last so every test can be verified against working infrastructure.

---

## Standard Stack

### Core (all needed for this phase)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `@testing-library/user-event` | 14.6.1 (already installed) | Realistic user interaction simulation — keyboard, typing, click sequences | v14 is current stable; `userEvent.setup()` API handles full browser event sequences including focus, keydown, keyup |
| `jsdom` | latest | Full DOM environment compatible with axe-core | Required because vitest-axe's axe-core integration crashes with happy-dom's `Node.prototype.isConnected` bug |
| `vitest-axe` | 0.1.0 | axe-core accessibility scanning with `toHaveNoViolations()` matcher | Wraps axe-core with a Jest/Rstest-compatible `expect.extend()` matcher API |
| `axe-core` | (transitive dep of vitest-axe) | The actual accessibility rule engine | Industry standard; powers Deque's accessibility tooling |

### Already Installed (no action needed)

| Library | Version | Purpose | Status |
|---------|---------|---------|--------|
| `@rstest/core` | 0.8.1 | Test runner with projects config | In package.json — already declared |
| `@rstest/adapter-rslib` | 0.2.0 | Bridges rslib.config.ts into rstest | In package.json — already declared |
| `happy-dom` | 20.4.0 | Fast DOM for unit tests | In package.json — already declared |
| `@testing-library/react` | 16.3.2 | render/screen/fireEvent/cleanup | In package.json — already declared |
| `@testing-library/jest-dom` | 6.9.1 | toHaveClass, toHaveAttribute etc. | In package.json — already declared |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| `vitest-axe` | `jest-axe` | jest-axe has Jest-specific type conflicts; vitest-axe was forked to avoid these; vitest-axe matchers are generic and work with rstest's expect |
| `jsdom` for a11y tests | Browser Mode | Browser mode requires Playwright and is heavier; jsdom is lighter and sufficient for axe-core scanning |
| Per-test `userEvent.setup()` | `fireEvent` | `userEvent` simulates real sequences (focus + keydown + keyup + keypress); `fireEvent` is fine for simple cases; INFRA-06 requires user-event to be importable but does not mandate replacing all existing fireEvent usage |

**Installation (bun):**
```bash
bun add -D jsdom vitest-axe @testing-library/user-event
```

Note: `@testing-library/user-event` is already installed as a transitive dep (`node_modules/@testing-library/user-event` exists at v14.6.1) but is NOT in package.json `devDependencies`. Adding it explicitly with `bun add -D` makes it an explicit dependency and ensures version stability.

---

## Architecture Patterns

### Recommended Directory Structure (after Phase 2)

```
tests/
├── badge.test.tsx           # existing — extend with aria-label tests
├── button.test.tsx          # existing — no changes
├── card.test.tsx            # NEW — unit tests + keyboard interaction
├── icon-button.test.tsx     # NEW — aria-pressed tests
├── ...                      # existing unit tests
└── a11y/                    # NEW directory for axe scans (jsdom project)
    └── (Phase 6: A11Y-04)   # a11y scan tests added in Phase 6

rstest.setup.ts              # existing — keep, used by both projects
rstest.setup.a11y.ts         # NEW — vitest-axe matchers + jsdom cleanup
rstest.config.ts             # REPLACE with two-project config
```

Note: `tests/a11y/` directory is established in Phase 2 for the jsdom project to include, even if Phase 6 is when the actual axe scan test files are written. The directory can be created empty or with a placeholder.

### Pattern 1: Two-Project Rstest Config

**What:** Top-level `projects` array in `defineConfig` with two inline project objects — one for happy-dom unit tests, one for jsdom accessibility tests.

**When to use:** When different test files need different environments (happy-dom incompatible with axe-core).

**Key constraint:** Each inline project that uses `withRslibConfig()` must specify it in the project's own `extends` field, not at the top level. The current top-level `extends: withRslibConfig()` must move into each project's inline config.

```typescript
// rstest.config.ts — two-project pattern
import { withRslibConfig } from '@rstest/adapter-rslib';
import { defineConfig } from '@rstest/core';

export default defineConfig({
  projects: [
    {
      name: 'unit',
      extends: withRslibConfig(),
      testEnvironment: 'happy-dom',
      setupFiles: ['./rstest.setup.ts'],
      include: ['tests/**/*.test.{ts,tsx}', '!tests/a11y/**'],
    },
    {
      name: 'a11y',
      extends: withRslibConfig(),
      testEnvironment: 'jsdom',
      setupFiles: ['./rstest.setup.ts', './rstest.setup.a11y.ts'],
      include: ['tests/a11y/**/*.test.{ts,tsx}'],
    },
  ],
});
```

Source: Rstest v0.8.1 type definitions (`index.d.ts` line 2323: `ProjectConfig = Omit<RstestConfig, 'projects' | ...>`; line 1140: `InlineProjectConfig = ProjectConfig & { name: string }`; line 2509: `projects?: TestProject[]`; line 3367: `TestProject = string | InlineProjectConfig`). Multi-project pattern confirmed from https://rstest.rs/guide/integration/rslib and https://rstest.rs/config/test/projects.

### Pattern 2: vitest-axe Setup for Rstest (NOT vitest-axe/extend-expect)

**What:** Manual `expect.extend()` using `vitest-axe/matchers` — avoids the vitest-specific `extend-expect` entry point.

**Why:** `vitest-axe/extend-expect` imports `expect` from `vitest` directly. Rstest is not vitest; its expect comes from `@rstest/core`. The matchers themselves (`to-have-no-violations.ts`) are generic and compatible with any `expect.extend()` implementation.

```typescript
// rstest.setup.a11y.ts — a11y-only setup file
import { expect } from '@rstest/core';
import * as axeMatchers from 'vitest-axe/matchers';

expect.extend(axeMatchers);
```

TypeScript type augmentation (in a `.d.ts` file or the setup file):
```typescript
import type { AxeMatchers } from 'vitest-axe/matchers';

declare module '@rstest/core' {
  interface Assertion extends AxeMatchers {}
  interface AsymmetricMatchersContaining extends AxeMatchers {}
}
```

Source: vitest-axe README (https://github.com/chaance/vitest-axe); `to-have-no-violations.ts` analysis confirming it returns `{ actual, message, pass }` — the generic matcher protocol.

### Pattern 3: IconButton aria-pressed

**What:** Add `aria-pressed` attribute to the `<Button>` element inside IconButton when `selected` is defined.

**ARIA spec:** A button that maintains a pressed/unpressed state should have `aria-pressed`. When `selected === true`, `aria-pressed="true"`. When `selected === false`, `aria-pressed="false"`. When `selected === undefined` (not a toggle), `aria-pressed` should be omitted entirely.

```tsx
// icon-button.tsx — inside IconButton forwardRef render
<Button
  variant="text"
  ref={ref}
  aria-pressed={selected !== undefined ? selected : undefined}
  className={cn(iconButtonVariants({ variant, shape, size, width, morph, selected: selectedVariant, className }))}
  {...props}
>
  {children}
</Button>
```

**Important:** `aria-pressed` goes BEFORE spreading `{...props}` so that explicit `aria-pressed` in props can override it. Current prop order in `{...props}` spread means props passed by the caller would override the computed value — verify which order is correct. Based on Phase 1 precedent (`aria-label` placed before `aria-current`), place `aria-pressed` before the `{...props}` spread.

Source: ARIA authoring practices — toggle button pattern. WAI-ARIA 1.2 specification section 6.8 (button role, aria-pressed).

### Pattern 4: Badge aria-label

**What:** Add `aria-label` to the Badge `<span>` for screen reader announcement.

**Behavior:**
- Dot variant (no count): `aria-label` should describe the badge (e.g., `"notification"` or a custom label from prop). Without any context, a default like `"has notification"` is appropriate.
- Count variant: `aria-label` should expose the count (e.g., `"5 notifications"` or just `"5"`).

**Implementation approach:** Accept an `ariaLabel` prop. For the count variant default, use the display value as the aria-label. For the dot variant, require the consumer to pass an `ariaLabel` or use a generic default.

```tsx
// badge.tsx — updated Badge component
export type BadgeProps = ... & {
  /** Accessible label for screen readers. For dot badges (no visible text), this is required for accessibility. */
  ariaLabel?: string;
};

// In render:
<span
  ref={ref}
  aria-label={ariaLabel ?? (isSmall ? undefined : getDisplayValue() ?? undefined)}
  className={cn(badgeVariants({ size: actualSize, className }))}
  {...props}
>
```

**Alternative interpretation:** A11Y-02 says "Badge emits aria-label with count/content for screen readers". The simplest correct interpretation: for dot badges, add `aria-label` from a prop (default to `undefined` — caller must provide it for accessibility); for count badges, set `aria-label` automatically to the display value. This matches the requirement without over-engineering.

Source: WAI-ARIA 1.2 specification; testing-library accessibility queries guide.

### Pattern 5: Card Interactive Variant Tests

**What:** Card's interactive behavior (tabIndex, Enter/Space handling) is ALREADY IMPLEMENTED in `card.tsx`. A11Y-03 requires writing tests that verify it.

**Existing implementation (card.tsx lines 28-64):**
```tsx
const isInteractive = Boolean(onClick);
// tabIndex set when interactive and not disabled
tabIndex={isInteractive && !disabled ? 0 : undefined}
// handleKeyDown calls onClick on Enter/Space
const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
  if (isInteractive && !disabled && (e.key === 'Enter' || e.key === ' ')) {
    e.preventDefault();
    onClick?.(e as unknown as React.MouseEvent<HTMLDivElement>);
  }
  onKeyDown?.(e);
};
```

No source changes to card.tsx are needed. Write `tests/card.test.tsx` using the existing `fireEvent.keyDown` pattern.

### Pattern 6: @testing-library/user-event v14

**What:** The v14 API uses `userEvent.setup()` which returns an instance with async methods.

**When to use:** Use `userEvent` when you need to simulate realistic sequences (e.g., focus then keypress). Use `fireEvent` for simple single-event tests. INFRA-06 requires user-event to be importable — demonstrate it works by using it in at least one test (card keyboard test is a good candidate).

```typescript
// v14 pattern — import from @testing-library/user-event
import userEvent from '@testing-library/user-event';

test('responds to Enter key', async () => {
  const user = userEvent.setup();
  const onClick = vi.fn();
  render(<Card onClick={onClick}><div>Content</div></Card>);
  const card = screen.getByRole('button');
  await user.click(card); // OR
  await user.keyboard('{Enter}');
  expect(onClick).toHaveBeenCalled();
});
```

Source: Testing Library user-event v14 docs at https://testing-library.com/docs/user-event/intro/

### Anti-Patterns to Avoid

- **Using `vitest-axe/extend-expect`:** This imports `expect` from `vitest` which is not installed. Use `vitest-axe/matchers` with `expect.extend()` from `@rstest/core` instead.
- **Keeping top-level `extends` with a `projects` array:** When `projects` is defined, the top-level config acts as a container; `extends` must be placed inside each inline project config, not at the root.
- **Happy-dom for axe tests:** axe-core will crash with happy-dom due to `Node.prototype.isConnected` bug. The jsdom project config is not optional — it is a hard requirement.
- **`aria-pressed` without `selected !== undefined` check:** `aria-pressed` should only be emitted when the button IS a toggle button (i.e., `selected` prop is explicitly provided). Uncontrolled icon buttons (no `selected` prop) should NOT have `aria-pressed`.
- **`aria-label` as mandatory on Badge:** The dot badge needs `aria-label` but the implementation should accept it as an optional prop (consumer provides meaningful context). Don't hard-code a label — the component doesn't know the context.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Accessibility rule checking | Custom ARIA attribute validators | `axe-core` via `vitest-axe` | axe-core covers 57+ accessibility rules, handles complex DOM trees, maintained by Deque |
| Toggle button accessibility | Custom `data-selected` attribute + CSS | `aria-pressed` (native ARIA) | Screen readers understand `aria-pressed`; custom attributes are invisible to AT |
| Realistic keyboard simulation | Chain of `fireEvent.keyDown` + `fireEvent.keyUp` | `userEvent.keyboard()` or `userEvent.click()` | user-event handles full event sequences including focus management |

**Key insight:** axe-core's `Node.prototype.isConnected` dependency is a known hard constraint — it requires jsdom. There is no workaround in the happy-dom environment. The two-project config is the solution, not a workaround.

---

## Common Pitfalls

### Pitfall 1: `vitest-axe/extend-expect` imports from `vitest`
**What goes wrong:** `import "vitest-axe/extend-expect"` in rstest.setup.a11y.ts fails at runtime because `vitest` is not installed.
**Why it happens:** vitest-axe was built for vitest; its convenience entry point hardcodes `import { expect } from "vitest"`.
**How to avoid:** Use `import * as axeMatchers from "vitest-axe/matchers"` and call `expect.extend(axeMatchers)` using `expect` from `@rstest/core`.
**Warning signs:** Runtime error `Cannot find module 'vitest'`.

### Pitfall 2: Top-level `extends` not inherited by `projects`
**What goes wrong:** Moving to `projects` config but keeping `extends: withRslibConfig()` at the root. Tests fail to resolve modules because the rslib aliases (path mappings etc.) are not applied to the project runners.
**Why it happens:** In Rstest, when `projects` is defined, each project runs its own context. Top-level options outside `projects` have limited inheritance.
**How to avoid:** Move `extends: withRslibConfig()` into EACH inline project config.
**Warning signs:** Import resolution errors for `src/components/...` paths in tests.

### Pitfall 3: happy-dom a11y test crashes
**What goes wrong:** Running axe tests in the happy-dom environment causes `Cannot read properties of null (reading 'isConnected')` errors.
**Why it happens:** axe-core walks the DOM tree and relies on `Node.prototype.isConnected` which happy-dom doesn't implement correctly.
**How to avoid:** Ensure the jsdom project's `include` pattern only matches `tests/a11y/**` and the unit project excludes that directory.
**Warning signs:** Error stack trace mentioning `isConnected` from `axe-core`.

### Pitfall 4: `aria-pressed` on non-toggle buttons
**What goes wrong:** Adding `aria-pressed={false}` to every IconButton without checking whether `selected` was explicitly provided. Screen readers announce all icon buttons as toggle buttons.
**Why it happens:** Developer assumes all icon buttons are toggles.
**How to avoid:** Only emit `aria-pressed` when `selected !== undefined`. The existing `selectedVariant = selected !== undefined ? selected : undefined` logic already distinguishes this case.
**Warning signs:** Accessibility tests fail for icon buttons where `selected` was not provided.

### Pitfall 5: Biome `useSortedClasses` / import sort on new files
**What goes wrong:** New test files fail Biome check because imports are not sorted or Tailwind classes are not in sorted order.
**Why it happens:** Biome enforces organized imports and sorted Tailwind classes (enforced globally).
**How to avoid:** Run `bun run check` after creating each new file.
**Warning signs:** `bun run check` exits non-zero.

### Pitfall 6: Duplicate `afterEach(cleanup)` in a11y setup
**What goes wrong:** `rstest.setup.a11y.ts` adds another `afterEach(cleanup)` on top of the one already in `rstest.setup.ts` (which is also in the jsdom project's setupFiles).
**Why it happens:** Developer copies cleanup pattern without checking that `rstest.setup.ts` already handles it.
**How to avoid:** `rstest.setup.a11y.ts` should ONLY add axe matchers — no cleanup registration needed.
**Warning signs:** Cleanup called twice per test; potential console warnings.

### Pitfall 7: `include` pattern syntax for negation
**What goes wrong:** Using `!tests/a11y/**` in the unit project's include causes no tests to be found because Rstest doesn't support negation in `include` (use `exclude` instead).
**Why it happens:** Developer assumes glob negation works like `.gitignore`.
**How to avoid:** Use `exclude: ['tests/a11y/**']` on the unit project OR rely on the fact that the unit project's `include` pattern `tests/**/*.test.{ts,tsx}` implicitly includes a11y files — but the a11y environment being jsdom is enforced by the project that DOES include them.
**Recommended approach:** The safest approach is to NOT exclude a11y from the unit project and instead accept that a11y test files (in tests/a11y/) will ALSO run under happy-dom if any exist. Since Phase 2 only sets up the directory structure and Phase 6 writes a11y tests, this is not an immediate problem. If isolation is needed, use `exclude` not negation in `include`.

---

## Code Examples

Verified patterns from official sources and project codebase:

### Two-project rstest.config.ts

```typescript
// Source: Rstest docs https://rstest.rs/guide/integration/rslib + type definitions
import { withRslibConfig } from '@rstest/adapter-rslib';
import { defineConfig } from '@rstest/core';

export default defineConfig({
  projects: [
    {
      name: 'unit',
      extends: withRslibConfig(),
      testEnvironment: 'happy-dom',
      setupFiles: ['./rstest.setup.ts'],
      include: ['tests/**/*.test.{ts,tsx}'],
      exclude: ['tests/a11y/**'],
    },
    {
      name: 'a11y',
      extends: withRslibConfig(),
      testEnvironment: 'jsdom',
      setupFiles: ['./rstest.setup.ts', './rstest.setup.a11y.ts'],
      include: ['tests/a11y/**/*.test.{ts,tsx}'],
    },
  ],
});
```

### rstest.setup.a11y.ts

```typescript
// Source: vitest-axe README https://github.com/chaance/vitest-axe + rstest expect API
import { expect } from '@rstest/core';
import * as axeMatchers from 'vitest-axe/matchers';

expect.extend(axeMatchers);
```

### IconButton aria-pressed addition

```tsx
// Source: icon-button.tsx — add aria-pressed to the Button render
// WAI-ARIA 1.2 toggle button pattern
<Button
  variant="text"
  ref={ref}
  aria-pressed={selected !== undefined ? selected : undefined}
  className={cn(iconButtonVariants({ variant, shape, size, width, morph, selected: selectedVariant, className }))}
  {...props}
>
  {children}
</Button>
```

### Icon button test pattern (tests/icon-button.test.tsx)

```tsx
// Source: project pattern from navigation-bar.test.tsx + ARIA spec
import { expect, test } from '@rstest/core';
import { render, screen } from '@testing-library/react';
import { IconButton } from '../src/components/ui/icon-button';

test('renders without aria-pressed when selected is not provided', async () => {
  render(<IconButton>icon</IconButton>);
  const btn = screen.getByRole('button');
  expect(btn).not.toHaveAttribute('aria-pressed');
});

test('renders aria-pressed="true" when selected is true', async () => {
  render(<IconButton selected={true}>icon</IconButton>);
  const btn = screen.getByRole('button');
  expect(btn).toHaveAttribute('aria-pressed', 'true');
});

test('renders aria-pressed="false" when selected is false', async () => {
  render(<IconButton selected={false}>icon</IconButton>);
  const btn = screen.getByRole('button');
  expect(btn).toHaveAttribute('aria-pressed', 'false');
});
```

### Badge aria-label addition

```tsx
// badge.tsx — updated type and render
export type BadgeProps = ... & {
  /** Accessible label for screen readers. Required for dot badges (no visible count text). */
  ariaLabel?: string;
};

// In render (inside Badge forwardRef):
<span
  ref={ref}
  aria-label={ariaLabel ?? (!isSmall ? getDisplayValue() ?? undefined : undefined)}
  className={cn(badgeVariants({ size: actualSize, className }))}
  {...props}
>
```

### Card test pattern using fireEvent (tests/card.test.tsx)

```tsx
// Source: navigation-bar.test.tsx pattern for fireEvent.keyDown
import { expect, test } from '@rstest/core';
import { fireEvent, render, screen } from '@testing-library/react';
import { Card } from '../src/components/ui/card';

test('interactive card has tabIndex 0', async () => {
  render(<Card onClick={() => {}}>Content</Card>);
  const card = screen.getByRole('button');
  expect(card).toHaveAttribute('tabIndex', '0');
});

test('interactive card responds to Enter key', async () => {
  let clicked = false;
  render(<Card onClick={() => { clicked = true; }}>Content</Card>);
  const card = screen.getByRole('button');
  fireEvent.keyDown(card, { key: 'Enter' });
  expect(clicked).toBe(true);
});

test('interactive card responds to Space key', async () => {
  let clicked = false;
  render(<Card onClick={() => { clicked = true; }}>Content</Card>);
  const card = screen.getByRole('button');
  fireEvent.keyDown(card, { key: ' ' });
  expect(clicked).toBe(true);
});

test('non-interactive card has no tabIndex', async () => {
  render(<Card>Content</Card>);
  const card = screen.getByRole('generic'); // div without role
  expect(card).not.toHaveAttribute('tabIndex');
});
```

Note: `role='button'` is set by card.tsx when `onClick` is provided (`isInteractive = Boolean(onClick)`).

### user-event v14 keyboard test (demonstrates INFRA-06)

```typescript
// Source: https://testing-library.com/docs/user-event/intro/
import userEvent from '@testing-library/user-event';

test('card responds to keyboard via userEvent', async () => {
  const user = userEvent.setup();
  let clicked = false;
  render(<Card onClick={() => { clicked = true; }}>Content</Card>);
  const card = screen.getByRole('button');
  card.focus();
  await user.keyboard('{Enter}');
  expect(clicked).toBe(true);
});
```

### Badge aria-label tests (extend tests/badge.test.tsx)

```tsx
// New tests to add to badge.test.tsx
test('count badge has aria-label with display value', async () => {
  render(<Badge count={5} data-testid="badge" />);
  const badge = screen.getByTestId('badge');
  expect(badge).toHaveAttribute('aria-label', '5');
});

test('dot badge has no aria-label by default', async () => {
  render(<Badge data-testid="badge" />);
  const badge = screen.getByTestId('badge');
  expect(badge).not.toHaveAttribute('aria-label');
});

test('dot badge renders provided ariaLabel', async () => {
  render(<Badge ariaLabel="has notification" data-testid="badge" />);
  const badge = screen.getByTestId('badge');
  expect(badge).toHaveAttribute('aria-label', 'has notification');
});
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Single rstest.config.ts with one environment | Two-project config (happy-dom + jsdom) | Phase 2 | Enables axe-core accessibility scanning without breaking unit tests |
| No `aria-pressed` on IconButton | `aria-pressed` emitted when `selected` prop provided | Phase 2 | Screen readers correctly announce toggle state |
| Badge with no accessible text for dot variant | Badge with optional `ariaLabel` prop | Phase 2 | Dot badges can be announced by screen readers |
| `fireEvent` for all keyboard tests | `userEvent.setup()` for realistic sequences | Phase 2 (new tests) | More accurate simulation of real keyboard interaction |

**Deprecated/outdated:**
- Top-level `extends: withRslibConfig()` in rstest.config.ts: replaced by per-project `extends` inside the `projects` array
- `vitest-axe/extend-expect`: do not use — imports from vitest; use `vitest-axe/matchers` with `expect.extend()` instead

---

## Open Questions

1. **Does the `projects` config inherit the root-level `extends` from the current rstest.config.ts?**
   - What we know: Rstest docs show `extends` inside each inline project config in the multi-project example. The type `ProjectConfig = Omit<RstestConfig, 'projects' | 'reporters' | ...>` includes `extends`. The root `extends` field is not documented as being inherited by projects.
   - What's unclear: Whether Rstest merges the root `extends` into each project or requires explicit repetition.
   - Recommendation: Put `extends: withRslibConfig()` in EACH inline project config. This is the pattern shown in official docs and is safe regardless of inheritance behavior.

2. **What default `ariaLabel` for the dot Badge variant?**
   - What we know: A11Y-02 says "Badge emits aria-label with count/content for screen readers." The dot variant has no count content.
   - What's unclear: Should the default for dot badges be `undefined` (requiring consumer to pass `ariaLabel`), or a hardcoded string like `"notification"`?
   - Recommendation: Default to `undefined` for dot badges. The component has no context about what it represents. Document `ariaLabel` as required for accessibility when using the dot variant. Tests should verify that a provided `ariaLabel` is rendered and that count badges auto-set `aria-label` from the display value.

3. **Will `bun run test` run both projects when configured?**
   - What we know: Rstest docs state "results from all projects will be combined and displayed."
   - What's unclear: Whether `bun run test` (which calls `rstest`) automatically discovers and runs both projects.
   - Recommendation: Confirmed by type definitions — `projects` is a standard config key consumed by the CLI. No special flags needed.

4. **Does the existing `rstest.setup.ts` work correctly under jsdom?**
   - What we know: `rstest.setup.ts` currently has the `Element.prototype.animate` polyfill and `afterEach(cleanup)`. The polyfill guard is `if (!Element.prototype.animate)` — jsdom does implement some of the Web Animations API, so the guard may prevent the polyfill from running unnecessarily under jsdom.
   - What's unclear: Whether jsdom's partial Web Animations support is sufficient for m3-ripple, or whether the polyfill is still needed.
   - Recommendation: Keep `rstest.setup.ts` as-is in both project setupFiles. The guard check makes it safe. Since a11y tests in tests/a11y/ will not interact with Ripple (they scan static component HTML), this is not a practical concern.

---

## Sources

### Primary (HIGH confidence)
- `/Users/monster/Work/m3-lib/node_modules/@rstest/core/dist/index.d.ts` — Confirmed: `EnvironmentName = 'node' | 'jsdom' | 'happy-dom'`, `projects?: TestProject[]`, `TestProject = string | InlineProjectConfig`, `InlineProjectConfig = ProjectConfig & { name: string }`, `ProjectConfig` includes `testEnvironment`, `setupFiles`, `extends`, `include`, `exclude`
- `src/components/ui/icon-button.tsx` — Confirmed: `selected` prop exists, no `aria-pressed` attribute emitted
- `src/components/ui/badge.tsx` — Confirmed: no `aria-label` attribute emitted anywhere
- `src/components/ui/card.tsx` — Confirmed: `tabIndex` and `handleKeyDown` (Enter/Space → onClick) already implemented when `onClick` is provided; no source changes needed for A11Y-03
- `/Users/monster/Work/m3-lib/node_modules/@testing-library/user-event/package.json` — Confirmed: v14.6.1 installed (transitive dep, not in package.json devDependencies)
- `bun run test` output — Confirmed: 276 tests passing, 11 files, pure happy-dom baseline
- `package.json` — Confirmed: `jsdom`, `vitest-axe`, `@testing-library/user-event` are NOT in devDependencies

### Secondary (MEDIUM confidence)
- https://rstest.rs/guide/integration/rslib — Multi-project config pattern with `extends: withRslibConfig()` per project; per-project `include` and `testEnvironment`
- https://rstest.rs/config/test/projects — Inline project config syntax; `type Projects = (string | ProjectConfig)[]`
- https://rstest.rs/config/test/test-environment — jsdom/happy-dom/node options; jsdom requires separate `jsdom` package installation
- https://github.com/chaance/vitest-axe — README: jsdom required (happy-dom incompatible due to `Node.prototype.isConnected` bug); setup via `expect.extend(matchers)` pattern
- https://github.com/chaance/vitest-axe/blob/main/src/extend-expect.ts — Confirmed `import { expect } from "vitest"` — cannot use this entry point with rstest
- https://github.com/chaance/vitest-axe/blob/main/src/to-have-no-violations.ts — Confirmed generic matcher protocol (`{ actual, message, pass }`) — compatible with rstest's expect.extend()
- https://testing-library.com/docs/user-event/intro/ — userEvent.setup() API pattern; v14 async methods

### Tertiary (LOW confidence)
- None — all critical claims are backed by PRIMARY or SECONDARY sources.

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all versions confirmed from installed node_modules; install commands verified from package.json absence
- Architecture (two-project config): HIGH — verified from @rstest/core type definitions and official docs
- vitest-axe/rstest compatibility: HIGH — confirmed by reading extend-expect.ts source (vitest import) and to-have-no-violations.ts (generic matcher)
- A11Y fixes (icon-button, badge): HIGH — source-reading confirmed missing attributes; ARIA spec confirms correct attributes
- A11Y-03 (card): HIGH — source-reading confirmed existing implementation; only tests needed
- Pitfalls: HIGH — derived from direct source analysis and confirmed behavior

**Research date:** 2026-02-17
**Valid until:** 2026-03-17 (stable libraries; no fast-moving deps; Rstest 0.8.1 config API unlikely to change within 30 days)
