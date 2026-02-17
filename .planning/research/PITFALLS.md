# Pitfalls Research

**Domain:** React component library — test coverage and accessibility retrofit
**Researched:** 2026-02-17
**Confidence:** HIGH (all pitfalls verified against actual codebase failures and component source)

---

## Critical Pitfalls

### Pitfall 1: Testing CSS Classes That No Longer Exist

**What goes wrong:**
Tests assert `toHaveClass('shadow-md')` or `toHaveClass('border-outline')` on a component, but the component's CVA definition has drifted since the test was written. The actual class may have been renamed (`shadow-lg`), removed, or replaced with an arbitrary value (`shadow-[0_2px_6px...]`). Tests fail with a mismatch even though the component looks and works correctly.

**Why it happens:**
Developers refine visual design (e.g., tweaking M3 elevation levels or border opacity) and update CVA variants without revisiting the test suite. The test suite wasn't run against the new definitions before merging. This is the root cause of the two pre-existing `button.test.tsx` failures: `elevated` uses `shadow-lg` (not `shadow-md`), and `outlined` uses `border-outline/40` (not `border-outline`).

**How to avoid:**
- Never copy class assertions from visual inspection of old code — always copy from the current CVA source at the time of writing the test.
- When a CVA variant changes, treat it as a required test update. Add a linting or CI step that runs tests before merge.
- For shadow and opacity values, prefer asserting structural behavior (`toBeInTheDocument`, role) over fragile exact class names when the styling detail isn't semantically meaningful to users.
- Use a snapshot of `buttonVariants({ variant: 'elevated' })` in tests to self-document what the current expected value is.

**Warning signs:**
- Test asserts a class like `shadow-md` but the component source clearly shows `shadow-lg` or an arbitrary value.
- Multiple class assertion failures on the same component after a styling update.
- The test message reads "Expected class X, received class Y" where Y is in the component source.

**Phase to address:**
Phase 1 (Fix pre-existing failures) — Audit every `toHaveClass` assertion against current CVA definitions before adding new tests.

---

### Pitfall 2: happy-dom Missing Web Animations API — m3-ripple Crashes

**What goes wrong:**
`m3-ripple` calls `element.animate()` on pointer events. happy-dom does not implement the Web Animations API (`Element.prototype.animate` is undefined). Any test that fires a click, keyDown, or pointer event on a component that includes `<Ripple />` throws `TypeError: e.animate is not a function`, which shows as an uncaught exception error in the test output even when the test itself passes.

This is the direct cause of the `navigation-rail.test.tsx` uncaught exception noise. The `menu.test.tsx` avoids it because it explicitly adds a `beforeAll` polyfill. `button.test.tsx` and `navigation-bar.test.tsx` do not polyfill, so any interaction tests on those files will have latent errors.

**Why it happens:**
happy-dom is not a full browser environment. The Web Animations API is not part of its implementation. `m3-ripple` assumes a real browser. The polyfill requirement is not documented in m3-ripple and must be discovered through failure.

**How to avoid:**
Add the polyfill in `rstest.setup.ts` globally (not per test file), so it applies to every test file automatically:

```typescript
// rstest.setup.ts
if (!Element.prototype.animate) {
  Element.prototype.animate = () =>
    ({ onfinish: null, cancel: () => {}, finished: Promise.resolve() }) as unknown as Animation;
}
```

The `menu.test.tsx` already demonstrates the correct pattern in a `beforeAll` — lifting this to the global setup file eliminates the need to repeat it per file.

**Warning signs:**
- `TypeError: e.animate is not a function` in test error output.
- `error | tests/[file].test.tsx` lines appearing before test results.
- Tests that fire `fireEvent.click` on buttons with `<Ripple />` produce uncaught exception noise.
- Any new component that includes `<Ripple />` immediately produces this error when interaction-tested.

**Phase to address:**
Phase 1 (Fix pre-existing failures) — Add to `rstest.setup.ts` before writing any new interaction tests.

---

### Pitfall 3: Testing ARIA Attributes That Components Don't Emit

**What goes wrong:**
A test asserts `toHaveAttribute('aria-label', 'Home')` on a `NavigationBarItem`, but the component renders a `<button>` with no `aria-label` attribute — the accessible name comes from the visible text content (the `label` prop renders as a `<span>` child). Testing Library's `getByRole('button', { name: 'Home' })` correctly finds it by accessible name, but `toHaveAttribute('aria-label')` returns null because the attribute was never applied.

This is the pre-existing failure in both `navigation-bar.test.tsx` and `navigation-rail.test.tsx`: the item is accessible (text content provides the name) but the test incorrectly expects a redundant `aria-label` attribute.

**Why it happens:**
Two valid approaches exist for accessible names: (1) visible text content computed by the browser, and (2) explicit `aria-label`. Developers writing tests assume explicit attribute = correct, without checking how the component actually provides accessible names. An explicit `aria-label` would be redundant with visible text and is only needed for icon-only buttons.

**How to avoid:**
- Distinguish between components that need explicit `aria-label` (icon-only buttons, decorative-only content) versus components where text content IS the accessible name.
- Test accessible names with `getByRole('button', { name: 'Home' })` rather than `toHaveAttribute('aria-label')`.
- Only assert `aria-label` when the component source explicitly sets it.
- For `NavigationBarItem` and `NavigationRailItem`, the fix is: either add `aria-label={label}` to the button element in source, or remove the `toHaveAttribute('aria-label')` assertion from tests and rely on the computed name.

**Warning signs:**
- `expect(element).toHaveAttribute("aria-label", "X")` failure with `Received: null`.
- Component is found by `getByRole(..., { name: 'X' })` in the same test (proving it IS accessible), yet `toHaveAttribute` fails.
- Test was written without looking at the component source's rendered HTML.

**Phase to address:**
Phase 1 (Fix pre-existing failures) — Choose one approach per component type (explicit attribute OR computed name) and make source + test agree.

---

### Pitfall 4: Keyboard Event Tests Passing to Disconnected Handler

**What goes wrong:**
A test fires `fireEvent.keyDown(button, { key: 'Enter' })` expecting `onValueChange` to fire, but the component's `onKeyDown` handler is a pass-through stub that calls `props.onKeyDown?.(e)` without doing anything with Enter/Space internally. The button is a native `<button>` element — keyDown on it does NOT automatically trigger `onClick`. The test expectation fails because Enter key never calls `onValueChange`.

This is the exact failure in `NavigationBarItem handles Enter key press` and the Space equivalent. The `handleKeyDown` in `NavigationBar` passes through to `props.onKeyDown` but does not call `onValueChange?.(value)` on Enter/Space.

**Why it happens:**
Developers write tests for expected keyboard behavior before implementing it, or assume native button semantics extend to custom keyDown logic. A `<button type="button">` does fire click on Enter in real browsers, but `fireEvent.keyDown` in Testing Library does NOT simulate the browser's implicit click-on-Enter behavior — it only dispatches the raw event.

**How to avoid:**
- To test keyboard activation: either use `fireEvent.click` (tests the click path), `userEvent.keyboard('{Enter}')` (simulates real browser behavior including implicit click), or implement explicit Enter/Space handling in the component's `onKeyDown`.
- When writing keyboard interaction tests with `fireEvent.keyDown`, verify the component's `handleKeyDown` explicitly handles that key.
- Prefer `@testing-library/user-event` over `fireEvent` for keyboard interaction tests — `userEvent.keyboard` triggers the full event chain including implicit click behavior.

**Warning signs:**
- `fireEvent.keyDown(el, { key: 'Enter' })` followed by an assertion that a callback was called, but the callback depends on `onClick`.
- Component's `handleKeyDown` function does not include `Enter` or ` ` in its switch/if statement.
- Test passes in a real browser but fails in JSDOM/happy-dom.

**Phase to address:**
Phase 1 (Fix pre-existing failures) — Either fix component to handle Enter/Space in `onKeyDown`, or use `userEvent.keyboard` in tests. Phase 2 (keyboard navigation coverage) should use `userEvent` from the start.

---

### Pitfall 5: Not Calling `cleanup()` — DOM Pollution Between Tests

**What goes wrong:**
State from one test leaks into the next. A component rendered in test N is still in the DOM when test N+1 runs. `screen.getByRole` finds elements from the previous test, causing false positives, or multiple matching elements cause `TestingLibraryElementError: Found multiple elements`.

**Why it happens:**
`@testing-library/react` v16+ does NOT auto-cleanup in all environments. In Rstest (not Jest), `afterEach(cleanup)` must be called explicitly. Some test files in this codebase include it (`navigation-bar.test.tsx`, `tooltip.test.tsx`) but `button.test.tsx` does not.

**How to avoid:**
Add `afterEach(cleanup)` to every test file, or configure it globally in `rstest.setup.ts`:

```typescript
import { afterEach } from '@rstest/core';
import { cleanup } from '@testing-library/react';
afterEach(() => { cleanup(); });
```

Adding it to the global setup file means it never needs to be repeated per file.

**Warning signs:**
- Tests pass in isolation but fail when run together.
- `Found multiple elements with role "X"` errors.
- Test N+1 finds elements that were only rendered in test N.
- Tests pass when run in a specific order but fail when shuffled.

**Phase to address:**
Phase 1 — Add global cleanup to `rstest.setup.ts` before any new test files are created.

---

### Pitfall 6: Testing @base-ui/react Components as If They're Custom-Managed

**What goes wrong:**
Components like `Tooltip` and `Dialog` are thin wrappers around `@base-ui/react` primitives. `@base-ui/react` manages its own ARIA state internally (`role="tooltip"`, `aria-describedby`, `aria-modal`, focus trap). Tests that assert specific ARIA attributes by hand (e.g., `aria-expanded`, `aria-controls`) may fail because `@base-ui/react` generates them differently, uses different attribute values, or doesn't expose them at all.

Conversely, tests that try to test focus trap behavior or portal rendering may fail because happy-dom's event model doesn't fully support the pointer capture / focus management strategies `@base-ui/react` uses.

**Why it happens:**
Developers treat wrapper components as if they own all accessibility behavior, not recognizing that `@base-ui/react` is the source of truth. The ARIA output of `@base-ui/react` components should be trusted, not re-asserted.

**How to avoid:**
- For `@base-ui/react`-based components, test at the behavioral level: "content is visible when open", "content is hidden when closed", "trigger renders correctly".
- Don't assert internal ARIA attributes that `@base-ui/react` manages — test what the user sees and can interact with.
- Test dialog/tooltip open/close behavior using `open` prop + content visibility, not by asserting internal ARIA wiring.
- For portal content (Tooltip using `BaseTooltip.Portal`), use `screen.queryByText` not `getByRole('tooltip')` if the happy-dom environment doesn't fully support ARIA role computation on portals.

**Warning signs:**
- Tests for Dialog/Tooltip asserting `aria-controls`, `aria-expanded`, `aria-modal` fail with unexpected values.
- `getByRole('tooltip')` returns null despite content being rendered.
- Focus-related tests on dialogs behave differently in happy-dom vs. real browser.

**Phase to address:**
Phase 3 (Dialog/Tooltip tests) — Understand what `@base-ui/react` manages vs. what the wrapper adds before writing assertions.

---

### Pitfall 7: Asserting Tailwind Classes After Biome Auto-Sort

**What goes wrong:**
A test is written with the class order matching the source file. Biome's `useSortedClasses` rule then re-orders classes in the source. The class is still present in the element (order doesn't matter for CSS) but a human reviewer may accidentally change the assertion to match the "wrong" order, or future class additions cause unexpected merging via `cn()` / `tailwind-merge`.

More critically: if `cn()` (tailwind-merge) deduplicates or overrides classes at runtime, a class present in the CVA definition may be silently removed because a later class in the merge wins. Tests asserting the overridden class will fail.

**Why it happens:**
`tailwind-merge` resolves conflicting Tailwind classes by keeping only the "winning" one. If a CVA `compoundVariant` adds `bg-primary` but the base class also has a background, one wins. Tests that assert the losing class will fail even though the rule was written correctly.

**How to avoid:**
- Before writing `toHaveClass('X')`, verify via `element.className` in a quick test run that X is actually in the rendered output.
- When compound variants override base variant classes (e.g., selected state overriding bg), test only the final output class, not intermediate CVA classes.
- Biome class sorting is cosmetic — never reorder assertions to "match" sorted source. `toHaveClass` is order-independent.

**Warning signs:**
- `toHaveClass('bg-primary')` fails but element renders with the correct background visually.
- Component has a `compoundVariant` that adds a conflicting `bg-*` class.
- `cn()` output has fewer classes than expected because tailwind-merge deduplicated.

**Phase to address:**
Phase 2 (adding variant/state tests for all components) — Verify actual rendered class lists before asserting.

---

### Pitfall 8: SVG Accessibility Gaps — Biome Enforces but Tests Don't Verify

**What goes wrong:**
Biome enforces `aria-hidden="true"` on decorative SVG icons. Components are updated to comply, but tests never verify that icon-only elements have the correct attribute. Accessibility regressions slip in when a future refactor removes `aria-hidden` or adds a meaningful SVG without proper labeling.

**Why it happens:**
Accessibility tests are often written for role/label behavior but not for icon-specific attributes. Biome catches `aria-hidden` at lint time but doesn't catch cases where a meaningful SVG (one that conveys information) lacks a title or aria-label.

**How to avoid:**
- For `IconButton` and any icon-only interactive element, write a test asserting the icon `<svg>` has `aria-hidden="true"` (or equivalent).
- For icon + label combinations (NavigationBarItem, Chip, Button with icon), assert the SVG is decorative and the label carries the accessible name.
- Check that any `<svg>` rendered by lucide-react icons has `aria-hidden="true"` on it — lucide-react sets `aria-hidden="true"` by default in v0.x but verify this holds for the version in use.

**Warning signs:**
- `IconButton` tests don't include any `aria-hidden` assertion.
- A refactor changes icon rendering logic but no test catches the aria regression.
- Biome reports zero lint errors but icon accessibility was degraded at the DOM level.

**Phase to address:**
Phase 2 (accessibility fixes) — Include `aria-hidden` assertions in icon-containing component tests.

---

## Technical Debt Patterns

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| `toHaveClass` assertions copied from CVA source without running tests | Fast to write | Break on every CVA refactor | Never — always run tests to verify |
| Per-file `beforeAll` animate polyfill instead of global setup | Explicit per file | Must be added to every new test file | Never — global setup eliminates repetition |
| Per-file `afterEach(cleanup)` instead of global setup | Explicit per file | Same duplication problem | Never — use global setup |
| Skipping keyboard interaction tests for complex components | Faster initial coverage | Keyboard accessibility untested, regressions invisible | Only acceptable as a documented deferral with a TODO |
| Testing only rendered classes, not ARIA behavior | Simpler tests | Accessible name and role bugs invisible | Never for interactive components — must test both |

---

## Integration Gotchas

| Integration | Common Mistake | Correct Approach |
|-------------|----------------|------------------|
| m3-ripple + happy-dom | Fire interaction events without polyfill, get `animate is not a function` errors | Add `Element.prototype.animate` polyfill to `rstest.setup.ts` globally |
| @base-ui/react + Testing Library | Assert internal ARIA wiring (`aria-controls`, `aria-expanded` exact values) | Test behavioral outcomes: content visible/hidden, trigger text present |
| @base-ui/react Portal + happy-dom | `getByRole('tooltip')` fails because portals may not render into happy-dom's body | Use `screen.queryByText` or `screen.getByText` instead of role queries for portal content |
| CVA compoundVariants + tailwind-merge | Assert a class from a base variant when a compound variant overrides it | Render the component with the specific prop combination and check actual classList |
| lucide-react icons + accessibility tests | Assume `aria-hidden` is set without verifying | Query `svg` element and assert `getAttribute('aria-hidden') === 'true'` |
| Rstest + @testing-library/react cleanup | Expect auto-cleanup like Jest | Manually call `afterEach(cleanup)` or add to global setup |

---

## Performance Traps

Not applicable at component library test scale. All tests complete in ~1.4s with 276 tests.

---

## "Looks Done But Isn't" Checklist

- [ ] **button.test.tsx class assertions:** The two failing tests (`elevated` expects `shadow-md`, `outlined` expects `border-outline`) pass only after updating assertions to match current CVA definitions (`shadow-lg`, `border-outline/40`). Verify by running the test suite.
- [ ] **Web Animations polyfill:** `rstest.setup.ts` must include the `Element.prototype.animate` polyfill. Verify by checking the file and running any test that fires click events on components with `<Ripple />`.
- [ ] **Global cleanup:** `rstest.setup.ts` must include `afterEach(cleanup)`. Verify no per-file cleanup is the only line of defense.
- [ ] **NavigationBarItem aria-label:** Either the component adds `aria-label={label}` to the button, or the test assertions are corrected to not expect the attribute. Verify both source and test agree.
- [ ] **NavigationBarItem/RailItem Enter/Space:** Component `handleKeyDown` explicitly handles Enter and Space keys, or tests use `userEvent.keyboard` which simulates the full browser event chain. Verify by running the keyboard test cases.
- [ ] **New test files include no per-file polyfill:** After global setup handles polyfill, no new test files should add their own `beforeAll(() => { Element.prototype.animate = ... })`. Verify by searching new test files.
- [ ] **Icon-only buttons have aria-label in source:** `IconButton` and similar components have `aria-label` or `aria-labelledby` tested. Verify with a targeted accessibility assertion test.
- [ ] **@base-ui/react Dialog and Tooltip tests use behavioral assertions:** No test for Dialog/Tooltip asserts internal ARIA attributes managed by `@base-ui/react`. Verify by reviewing test assertions.

---

## Recovery Strategies

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| Class assertion mismatch | LOW | Diff test assertion against current CVA source, update assertion to match actual class output |
| animate polyfill missing | LOW | Add 4 lines to `rstest.setup.ts`, remove per-file `beforeAll` polyfills |
| Missing cleanup | LOW | Add `afterEach(cleanup)` to global setup, remove per-file copies |
| aria-label expected but not emitted | LOW-MEDIUM | Either add `aria-label={label}` to component (source fix) or remove/correct assertion (test fix) |
| Keyboard event handler incomplete | MEDIUM | Add Enter/Space handling to component's `onKeyDown`, or switch tests to `userEvent.keyboard` |
| @base-ui/react ARIA assertion failures | MEDIUM | Rewrite assertions to test behavioral outcomes, not ARIA internals |
| tailwind-merge overrides expected class | MEDIUM | Trace `cn()` output for the specific prop combination, update assertion to the winning class |

---

## Pitfall-to-Phase Mapping

| Pitfall | Prevention Phase | Verification |
|---------|------------------|--------------|
| CSS class drift (button failures) | Phase 1: Fix pre-existing failures | All tests pass: `bun run test` shows 0 failures |
| m3-ripple animate polyfill | Phase 1: Fix pre-existing failures | No `e.animate is not a function` in test output |
| ARIA attribute vs computed name confusion | Phase 1: Fix pre-existing failures | `NavigationBar`/`NavigationRail` aria-label tests pass |
| Keyboard event handler gaps | Phase 1: Fix pre-existing failures | Enter/Space tests pass for NavigationBarItem and NavigationRailItem |
| DOM pollution (missing cleanup) | Phase 1: Global test setup | Tests pass in any order, no "multiple elements" errors |
| @base-ui/react ARIA over-assertion | Phase 3: Dialog/Tooltip tests | Dialog and Tooltip tests written using behavioral assertions only |
| SVG accessibility not tested | Phase 2: Component accessibility coverage | IconButton and similar tests include `aria-hidden` assertions |
| tailwind-merge class override | Phase 2: Variant/state tests | Selected/compoundVariant tests verify actual rendered class list |

---

## Sources

- Direct analysis of test failures: `bun run test` output showing 8 failures across 4 test files (2026-02-17)
- `/Users/monster/Work/m3-lib/tests/button.test.tsx` — class assertions vs. actual CVA source
- `/Users/monster/Work/m3-lib/src/components/ui/button.tsx` — CVA `elevated` uses `shadow-lg`, `outlined` uses `border-outline/40`
- `/Users/monster/Work/m3-lib/tests/navigation-bar.test.tsx` — `aria-label` and keyboard test failures
- `/Users/monster/Work/m3-lib/src/components/ui/navigation-bar.tsx` — `handleKeyDown` passes through without handling Enter/Space
- `/Users/monster/Work/m3-lib/tests/menu.test.tsx` — demonstrates correct per-file `beforeAll` animate polyfill
- `/Users/monster/Work/m3-lib/rstest.setup.ts` — global setup currently lacks polyfill and cleanup
- `/Users/monster/Work/m3-lib/node_modules/m3-ripple/dist/index.js` — calls `element.animate()` on pointer events
- happy-dom v20.4.0 — does not implement Web Animations API (`Element.prototype.animate`)
- `@base-ui/react` v1.0.0 — manages its own ARIA state for Dialog, Tooltip
- MEMORY.md: `afterEach(cleanup)` requirement documented as required pattern

---

*Pitfalls research for: React component library — test coverage and accessibility retrofit*
*Researched: 2026-02-17*
