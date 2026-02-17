# Phase 1: Foundation Repair - Research

**Researched:** 2026-02-17
**Domain:** Rstest test infrastructure, React Testing Library, component source fixes
**Confidence:** HIGH

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| INFRA-01 | Pre-existing button.test.tsx failures fixed (class assertion drift: elevated shadow-md→shadow-lg, outlined border-outline→border-outline/40) | Source confirmed: button.tsx uses `shadow-lg` and `border-outline/40`; test assertions expect old values. Fix is to update the two assertions to match actual CVA output. |
| INFRA-02 | Pre-existing navigation-bar.test.tsx failures fixed (aria-label assertion + missing Enter/Space keyboard handler) | Source confirmed: NavigationBarItem collapsed branch renders no `aria-label` attribute and `handleKeyDown` does not call `onValueChange`. Fix is to add `aria-label={label}` to the button element and add Enter/Space logic to `handleKeyDown`. |
| INFRA-03 | Pre-existing navigation-rail.test.tsx failures fixed (aria-label assertion + missing Enter/Space keyboard handler + animate polyfill) | Source confirmed: NavigationRailItem collapsed branch renders no `aria-label` attribute, `handleKeyDown` is a passthrough, and the file has no polyfill for `element.animate`. Fix is aria-label + keyDown handler + global polyfill in setup. |
| INFRA-04 | Global element.animate() polyfill added to rstest.setup.ts (currently per-file in menu.test.tsx) | menu.test.tsx already has the correct polyfill pattern in a `beforeAll`. Needs to be moved to rstest.setup.ts using the same guard check. |
| INFRA-05 | Global afterEach(cleanup) added to rstest.setup.ts (currently per-file) | navigation-bar.test.tsx, navigation-rail.test.tsx, and time-picker.test.tsx each register `afterEach(cleanup)` individually. Moving it to setup.ts is safe and idiomatic. |
</phase_requirements>

## Summary

Phase 1 fixes eight failing tests across three test files by making three categories of changes: (1) updating two stale class assertions in button.test.tsx that no longer match the component's CVA output, (2) adding missing `aria-label` attributes and Enter/Space keyboard handlers to NavigationBarItem and NavigationRailItem source components, and (3) centralising global test infrastructure (the `element.animate` polyfill and `afterEach(cleanup)`) into rstest.setup.ts so no individual test file has to carry it.

All failures are precisely understood. The test output has been run and the root cause of every failure is identified by reading the component source. No speculative research is needed — this is a pure code-reading and source-matching exercise.

**Primary recommendation:** Fix in strict dependency order — setup.ts globals first (unblocks rail tests immediately), then component source fixes, then update the two button class assertions last.

---

## Standard Stack

### Core (already installed — no new dependencies)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `@rstest/core` | 0.8.1 | Test runner / assertion engine | Project standard |
| `@testing-library/react` | current | DOM render + query utilities | Project standard |
| `@testing-library/jest-dom` | current | Custom matchers (`toHaveClass`, `toHaveAttribute`) | Project standard — extended in rstest.setup.ts |
| `class-variance-authority` | current | CVA variant output — what tests actually assert against | Source of truth for class strings |

**No new packages required.** All changes are to source code and test configuration.

---

## Architecture Patterns

### Rstest setupFiles — how it works

`rstest.config.ts` registers `./rstest.setup.ts` as a `setupFiles` entry. Code in `setupFiles` runs **once per test worker before any test file is processed**. This is the correct place for:

- Global polyfills that must exist before any component is rendered
- Global `afterEach(cleanup)` that applies to every test

```typescript
// rstest.setup.ts — what it becomes after this phase
import { afterEach } from '@rstest/core';
import { cleanup } from '@testing-library/react';
import { expect } from '@rstest/core';
import * as jestDomMatchers from '@testing-library/jest-dom/matchers';

expect.extend(jestDomMatchers);

// Global polyfill: happy-dom does not implement Web Animations API
// m3-ripple calls element.animate() on pointer events
if (typeof Element !== 'undefined' && !Element.prototype.animate) {
  Element.prototype.animate = () =>
    ({ onfinish: null, cancel: () => {}, finished: Promise.resolve() }) as unknown as Animation;
}

// Global cleanup: prevent DOM leakage between tests
afterEach(() => {
  cleanup();
});
```

**Source pattern:** Copied directly from the working polyfill in `tests/menu.test.tsx` lines 17-23.

### CVA class output — what the tests must assert

Read from `src/components/ui/button.tsx`:

| Variant | Actual CVA class | Test currently asserts | Status |
|---------|-----------------|----------------------|--------|
| `elevated` | `shadow-lg` | `shadow-md` | DRIFT — test wrong |
| `outlined` | `border-outline/40` | `border-outline` | DRIFT — test wrong |

The component is correct (it was changed after the tests were written). The test assertions are stale. Fix is to update the test expectations to match current CVA output.

### NavigationBarItem — missing accessibility attributes and keyboard handling

Read from `src/components/ui/navigation-bar.tsx` lines 155-239:

**Problem 1 — aria-label missing:**
The `<button>` element has `aria-current` but no `aria-label`. The test queries with `screen.getByRole('button', { name: 'Home' })` — this works because the label text is rendered inside the button. However the explicit `expect(item).toHaveAttribute('aria-label', 'Home')` assertion fails because the attribute is not present on the element.

Fix: Add `aria-label={label}` to the `<button>` element in NavigationBarItem.

**Problem 2 — Enter/Space key handler is a no-op:**
```typescript
// Current (lines 129-131):
const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
  props.onKeyDown?.(e);   // Only forwards the event — never calls onValueChange
};
```

The test fires `fireEvent.keyDown(searchItem, { key: 'Enter' })` and expects `selectedValue` to change to `'search'`. It does not because `handleKeyDown` never calls `onValueChange`.

Fix:
```typescript
const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
  if ((e.key === 'Enter' || e.key === ' ') && !disabled) {
    onValueChange?.(value);
  }
  props.onKeyDown?.(e);
};
```

### NavigationRailItem — same two problems as NavigationBar, plus animate crash

Read from `src/components/ui/navigation-rail.tsx` lines 195-303:

**Problem 1 — aria-label missing from collapsed branch (lines 227-265):**
The collapsed branch renders a `<button>` with `aria-current` but no `aria-label`. The expanded branch (lines 271-301) correctly has `aria-label={label}`, but the collapsed branch does not.

Fix: Add `aria-label={label}` to the collapsed branch `<button>` element (line ~234).

**Problem 2 — handleKeyDown is passthrough (lines 207-209):**
Same pattern as NavigationBarItem — `handleKeyDown` only forwards the event.

Fix: Same Enter/Space handler pattern as NavigationBarItem.

**Problem 3 — element.animate crash:**
`m3-ripple` calls `element.animate()` on pointer events. `happy-dom` does not implement the Web Animations API. When tests `fireEvent.click()` on a NavigationRailItem, the ripple fires and crashes. The navigation-rail test file has no `beforeAll` polyfill (unlike menu.test.tsx). Moving the polyfill to rstest.setup.ts fixes this for all files simultaneously.

**Note on time-picker.test.tsx:** The same animate crash also affects time-picker.test.tsx (4 test files were reported failing, but the phase scope is only 3). The global polyfill fix in rstest.setup.ts will also fix time-picker.test.tsx as a side effect. This is desirable — but it is not a named requirement in this phase.

### getByRole with `name:` — how computed accessible name works

`screen.getByRole('button', { name: 'Home' })` resolves the accessible name via the accessibility tree. For a `<button>`, the computed name is derived from:
1. `aria-labelledby` → referenced element text
2. `aria-label` → literal string
3. Button's inner text content (concatenated text nodes)

The tests succeed with `getByRole` because the label text is rendered inside the button. However, the tests additionally assert `expect(item).toHaveAttribute('aria-label', 'Home')` — that requires the explicit attribute to be present on the DOM element. Adding `aria-label={label}` satisfies both queries and the explicit attribute assertion.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Web Animations polyfill | Custom animation stub | Exact pattern from menu.test.tsx | Already battle-tested in this project, one guard check |
| Test cleanup | Per-test cleanup blocks | Global `afterEach(cleanup)` in setup.ts | Prevents DOM leakage globally, idiomatic React Testing Library |
| Keyboard handling | State machine / event delegation | `e.key === 'Enter' \|\| e.key === ' '` guard in `handleKeyDown` | Simple, directly testable, matches existing test patterns |

---

## Common Pitfalls

### Pitfall 1: The `aria-label` attribute vs. accessible name
**What goes wrong:** Developer adds `aria-label` to an inner span instead of the `<button>` element itself.
**Why it happens:** The label text is rendered in a child `<span>`. It's tempting to label the span.
**How to avoid:** `aria-label` must be on the interactive element (the `<button>`), not its children.
**Warning signs:** `toHaveAttribute('aria-label', ...)` fails but `getByRole('button', { name: ... })` passes.

### Pitfall 2: Space key value is `' '` (a space character), not `'Space'`
**What goes wrong:** Writing `e.key === 'Space'` instead of `e.key === ' '`.
**Why it happens:** The KeyboardEvent `code` is `'Space'` but `key` is `' '`.
**How to avoid:** Check `e.key === ' '` exactly as the tests do (`fireEvent.keyDown(el, { key: ' ' })`).
**Warning signs:** Space key test fails, Enter key test passes.

### Pitfall 3: Duplicate cleanup registration
**What goes wrong:** Adding global `afterEach(cleanup)` to setup.ts but not removing it from individual test files causes cleanup to run twice per test.
**Why it happens:** The per-file registrations are not removed after globalizing.
**How to avoid:** Remove `afterEach(cleanup)` from navigation-bar.test.tsx, navigation-rail.test.tsx, and time-picker.test.tsx after adding the global registration. (The `afterEach` import can stay if `afterEach` is still used for other purposes — but in these files it's only used for cleanup.)
**Warning signs:** Tests pass but there are console warnings about double cleanup, or tests become brittle.

### Pitfall 4: Polyfill guard check placement
**What goes wrong:** Placing the polyfill inside a `beforeAll` call in setup.ts.
**Why it happens:** Confusion between `beforeAll` (runs before tests in a file) and top-level code (runs when setup file is evaluated).
**How to avoid:** In `setupFiles`, top-level code runs globally before any file. The guard check `if (!Element.prototype.animate)` at the top level is correct. Using `beforeAll` also works but is redundant indirection.
**Warning signs:** If placed inside a `beforeAll`, it still works — but it's cleaner at top level.

### Pitfall 5: Biome `useSortedClasses` on new aria attribute
**What goes wrong:** Adding `aria-label={label}` after existing props triggers a Biome import sort warning.
**Why it happens:** Biome enforces sorted Tailwind classes but also organized imports.
**How to avoid:** Run `bun run check` after each file edit to catch Biome violations before committing.

---

## Code Examples

### Global polyfill in rstest.setup.ts (source: menu.test.tsx pattern)
```typescript
// Polyfill Element.prototype.animate for m3-ripple (happy-dom lacks Web Animations API)
if (typeof Element !== 'undefined' && !Element.prototype.animate) {
  Element.prototype.animate = () =>
    ({ onfinish: null, cancel: () => {}, finished: Promise.resolve() }) as unknown as Animation;
}
```

### Global afterEach(cleanup) in rstest.setup.ts
```typescript
import { afterEach } from '@rstest/core';
import { cleanup } from '@testing-library/react';

afterEach(() => {
  cleanup();
});
```

### aria-label on NavigationBarItem button
```tsx
// In NavigationBarItem render (navigation-bar.tsx)
<button
  ref={ref}
  type="button"
  aria-label={label}            // ADD THIS LINE
  aria-current={isActive ? 'page' : undefined}
  disabled={disabled}
  className={cn(navigationBarItemVariants({ active: isActive, orientation, className }))}
  onClick={handleClick}
  onKeyDown={handleKeyDown}
  {...props}
>
```

### Enter/Space keyboard handler
```typescript
// In NavigationBarItem and NavigationRailItem
const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
  if ((e.key === 'Enter' || e.key === ' ') && !disabled) {
    onValueChange?.(value);
  }
  props.onKeyDown?.(e);
};
```

### Updated button.test.tsx assertions (INFRA-01)
```typescript
// BEFORE (stale):
expect(button).toHaveClass('shadow-md');    // elevated variant
expect(button).toHaveClass('border-outline'); // outlined variant

// AFTER (matching current CVA output in button.tsx):
expect(button).toHaveClass('shadow-lg');        // elevated: 'bg-surface-container text-foreground shadow-lg'
expect(button).toHaveClass('border-outline/40'); // outlined: 'border border-outline/40 bg-transparent text-primary'
```

### NavigationRailItem collapsed branch — aria-label (INFRA-03)
```tsx
// Collapsed branch return (navigation-rail.tsx ~line 229)
<button
  ref={ref}
  type="button"
  aria-label={label}            // ADD THIS LINE — matches expanded branch which already has it
  aria-current={isActive ? 'page' : undefined}
  disabled={disabled}
  className={...}
  onClick={handleClick}
  onKeyDown={handleKeyDown}
  {...props}
>
```

---

## State of the Art

| Old Approach | Current Approach | Impact |
|--------------|------------------|--------|
| Per-file `beforeAll(() => polyfill)` | Global setup in `setupFiles` entry | Polyfill runs once globally, cannot be forgotten in new test files |
| Per-file `afterEach(cleanup)` | Global `afterEach(cleanup)` in setup.ts | Consistent cleanup, new test files cannot forget it |
| Button tests asserting old class names | Tests asserting current CVA output | Tests accurately reflect component state |

---

## Open Questions

1. **Should the per-file `afterEach(cleanup)` registrations be removed from individual test files after globalizing?**
   - What we know: Double registration causes cleanup to run twice but does not break tests in practice.
   - What's unclear: Whether rstest/testing-library handles idempotent double cleanup gracefully.
   - Recommendation: Remove per-file registrations from navigation-bar.test.tsx, navigation-rail.test.tsx, and time-picker.test.tsx. Do NOT remove from files that use `afterEach` for other things.

2. **Does time-picker.test.tsx need to be in scope?**
   - What we know: It also fails due to the animate error (not a named requirement), and the global polyfill will fix it as a side effect.
   - What's unclear: Nothing — this is purely additive and safe.
   - Recommendation: Accept the side-effect fix. Document it in the plan as "additional benefit".

---

## Sources

### Primary (HIGH confidence)
- Direct codebase reading — `src/components/ui/button.tsx` — confirmed exact CVA class strings for elevated and outlined variants
- Direct codebase reading — `src/components/ui/navigation-bar.tsx` — confirmed missing `aria-label` and no-op `handleKeyDown`
- Direct codebase reading — `src/components/ui/navigation-rail.tsx` — confirmed collapsed branch missing `aria-label`, no-op `handleKeyDown`
- Direct codebase reading — `rstest.setup.ts` — confirmed current state: only `expect.extend`, no polyfill, no cleanup
- Direct codebase reading — `tests/menu.test.tsx` lines 17-23 — confirmed working polyfill pattern
- `bun run test` output (live) — confirmed exact 8 failures with error messages and stack traces

### Secondary (MEDIUM confidence)
- Rstest v0.8.1 docs (https://rstest.rs/llms.txt) — `setupFiles` runs before tests, top-level code in setup file is global

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — confirmed by live test run and source reading
- Architecture: HIGH — exact errors and fixes identified from source
- Pitfalls: HIGH — derived directly from the specific failure modes observed

**Research date:** 2026-02-17
**Valid until:** 2026-03-17 (stable codebase, no fast-moving dependencies involved)
