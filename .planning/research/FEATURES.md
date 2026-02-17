# Feature Research

**Domain:** React component library — test coverage and accessibility milestone
**Researched:** 2026-02-17
**Confidence:** HIGH (based on official M3 spec, WAI-ARIA spec, and inspection of existing codebase)

---

## Feature Landscape

### Table Stakes (Users Expect These)

Features without which the library cannot be credibly called tested or accessible. These
are what any consumer evaluating the library checks first.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Smoke test: renders without throwing | Every tested component must pass this before anything else | LOW | Uses `render()` + `toBeInTheDocument()` |
| Ref forwarding verification | All components use `React.forwardRef`; consumers depend on this | LOW | `createRef` + `instanceof` check; pattern established in `button.test.tsx` |
| Variant/prop renders correct classes | Library is CVA-based; variant correctness IS the API | MEDIUM | `toHaveClass` checks; already the dominant pattern in existing tests |
| Disabled state: pointer-events blocked, aria-disabled set | Non-interactive disabled components are an accessibility failure | LOW | Button, IconButton, Chip, Checkbox, Switch all have disabled states |
| Interactive components: keyboard activation (Enter/Space) | WCAG 2.1 SC 2.1.1 — all functionality must be keyboard-operable | MEDIUM | Card, Chip, Tabs already have `onKeyDown` handlers; tests must cover them |
| Focus-visible ring present on interactive components | WCAG 2.1 SC 2.4.7 — focus must be visible | LOW | Most components already have `focus-visible:ring-2`; test for class presence |
| ARIA role correctness | Screen readers identify components by role; wrong role = unusable | LOW | `getByRole()` is both the test query and the a11y assertion |
| aria-checked / aria-selected / aria-pressed for state | Toggle state components without these are silent to screen readers | LOW | Switch (done), Filter Chip (`aria-pressed` done), Tab (`aria-selected` done) |
| progressbar: aria-valuenow / aria-valuemin / aria-valuemax | Screen readers announce progress by reading these attributes | LOW | CircularProgress and LinearProgress already have them; need tests to guard against regression |
| Dialog: focus trap and Escape key closes | Without this, keyboard users are stranded inside modal dialogs | HIGH | Dialog uses `@base-ui/react/dialog` which handles this; tests need to verify it works via the primitives |
| Snackbar: `aria-live` region present | Screen readers won't announce notifications without a live region | LOW | Snackbar already uses `<output aria-live="polite">`; test must verify this attribute |
| IconButton: aria-label when toggle (selected prop) | An icon-only button without an accessible name is an accessibility blocker | LOW | **Known gap:** `selected` prop currently has no `aria-pressed` output |
| Badge: aria-label on dot badge | A visual-only badge communicates nothing to screen readers | LOW | **Known gap:** small badge (no count text) has no text or label |
| Card interactive: role="button" and tabIndex=0 | Interactive `<div>` without role and tabIndex is keyboard-inaccessible | LOW | Already implemented; tests must verify behavior |
| onCheckedChange / onValueChange fires correctly | Controlled component contracts must be testable | LOW | Interaction tests with `fireEvent`; pattern established in `switch.test.tsx` |
| afterEach(cleanup) in every test file | Prevents DOM pollution between tests in the same run | LOW | Rstest/happy-dom requirement; already enforced in newer tests |

---

### Differentiators (Competitive Advantage)

Features that distinguish this library from generic React UI libraries in test and a11y quality.
None are required, but they move the library from "it passes CI" to "it can be trusted".

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Tabs: Arrow key navigation test (ArrowLeft/ArrowRight/Home/End) | The Tab component already implements roving tabindex; test coverage proves it works correctly | MEDIUM | Requires `fireEvent.keyDown` + focus assertion; Tabs `handleKeyDown` is already implemented |
| Input Chip: Delete/Backspace fires onClose | M3-specific keyboard behaviour; no other library documents this test | LOW | `fireEvent.keyDown` with `key: 'Delete'` on the chip |
| FABMenu: Escape key closes + focus returns to trigger | WCAG 2.1 SC 2.1.2 — no keyboard trap; focus return is the differentiating requirement | MEDIUM | FABMenu already handles Escape + `triggerRef.current?.focus()`; test verifies it |
| Snackbar: action button fires onAction callback | Imperative API correctness: `snackbar()` call ends up rendering a Snackbar with correct callbacks | MEDIUM | Test the component layer directly (not the Sonner layer) |
| CircularProgress: indeterminate omits aria-valuenow | WAI-ARIA spec says indeterminate progressbars MUST NOT have `aria-valuenow` | LOW | One assertion, high value: guards against a common regression |
| Checkbox indeterminate: `input.indeterminate` set via ref | The indeterminate state is DOM-only (not an HTML attribute); tests that skip this miss a real bug surface | MEDIUM | Verify `inputRef.current.indeterminate === true`; tricky in happy-dom |
| Filter chip: aria-pressed reflects selected state | Already implemented; test proves it and protects against removal | LOW | `toHaveAttribute('aria-pressed', 'true'/'false')` |
| Dialog: has role="dialog" and aria-labelledby | Base UI sets these; a test guards against the primitive being swapped out | MEDIUM | Requires rendering with `open={true}` via controlled state |
| Accessible name on close button in Input Chip | The nested close `<button>` has `aria-label="Remove {label}"`; this must be tested | LOW | `getByRole('button', { name: /Remove/i })` |
| Screen-reader-only native input in Switch/Checkbox | The `sr-only` class on the hidden input is a dependency of the a11y model; test prevents accidental removal | LOW | `toHaveClass('sr-only')` assertion |

---

### Anti-Features (Commonly Requested, Often Problematic)

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|-----------------|-------------|
| CSS class name assertions for every prop combination | Seems thorough; gives high coverage numbers | Tests break on any Tailwind class refactor even if behavior is identical; "false negative" trap | Test behavior: does the component communicate the right role/state? Test classes only for M3 spec correctness (e.g., M3 track dimensions), not arbitrary variant combinations |
| Visual regression / screenshot tests | Catches visual regressions that unit tests miss | Requires a separate tool (Chromatic, Percy), a browser environment, and per-OS snapshot diffing; massively increases CI cost for a library not yet shipping | Defer until the library has real consumers; class assertions cover spec correctness adequately for now |
| Testing Ripple animation behavior | Ripple is a satisfied UX detail that affects nothing functional | `m3-ripple` is a third-party package; testing it means testing someone else's code, and animations don't run in happy-dom | Exclude Ripple from test assertions; rely on `m3-ripple`'s own tests |
| axe-core / jest-axe automated a11y scan per component | Automated a11y scanning sounds like a force multiplier | axe-core runs in a real browser; happy-dom doesn't provide sufficient CSSOM/layout context for meaningful results, producing false positives and missed failures | Fix known specific ARIA gaps directly (aria-label, aria-pressed); test them with targeted attribute assertions, not a scanner |
| Testing Sonner integration in Snackbar imperative API | `snackbar()` calls `sonnerToast.custom()`; testing the full flow validates the integration | Sonner operates via a portal that requires a mounted `SnackbarHost`; the test becomes an integration test of a third-party library, not M3-Lib | Test the `<Snackbar>` component in isolation; mock Sonner if the imperative API needs coverage |
| Keyboard navigation E2E tests (Playwright/Cypress) | Provides the highest confidence | This library has no app, only components; E2E adds infrastructure cost with no routing or server to exercise | RTL fireEvent covers keyboard paths sufficiently at the component level; defer E2E |
| 100% line coverage target | Feels like a quality gate | Line coverage counts lines, not behaviors; it incentivizes trivial tests to hit untested lines and creates false confidence | Target 100% of defined behaviors in the component API, not 100% of lines |

---

## Feature Dependencies

```
afterEach(cleanup) in test file
    └──required by──> all other tests in that file
                          (DOM pollution breaks query results)

getByRole() queries
    └──required by──> any assertion that uses a semantic element
    └──depends on──> correct ARIA role being set in the component

aria-label / accessible name
    └──required by──> getByRole(... { name: '...' }) queries
    └──required by──> screen reader usability

Controlled component (checked/value prop) tests
    └──requires──> callback prop (onCheckedChange/onValueChange) tests
                   (controlled means nothing if callback doesn't fire)

Tabs keyboard navigation (ArrowKey) test
    └──requires──> Tab selection test (click/Enter)
                   (keyboard navigation to a tab that doesn't activate is not useful)

FABMenu Escape key test
    └──requires──> FABMenu open state test
                   (you can't close what isn't open)

Dialog Escape / focus trap
    └──requires──> Dialog open state test

IconButton aria-pressed fix
    └──required before──> IconButton toggle state test
                          (test the fixed attribute, not the current broken state)

Badge aria-label fix
    └──required before──> Badge screen reader test
                          (same: test the fix, not the gap)
```

### Dependency Notes

- **cleanup requires nothing but must run first:** `afterEach(cleanup)` is the foundation of every test file's isolation. Any test missing it is a latent failure.
- **ARIA fixes must precede their tests:** The three known gaps (IconButton `aria-pressed`, Badge `aria-label`, Card interactive a11y) must be implemented in the same work unit as their tests. Writing tests for a known broken state produces a permanently red CI.
- **Interaction tests depend on role queries:** `fireEvent` tests rely on `getByRole` to locate elements. If a component lacks a correct ARIA role, the test cannot query the element in a meaningful way.

---

## MVP Definition

### Launch With (v1 — Milestone deliverable)

Minimum coverage set that makes the milestone meaningful: every component tested, known gaps fixed.

**Fix first (blocks tests):**
- [ ] IconButton: add `aria-pressed={selected}` when `selected` prop is defined — fixes known a11y gap, unblocks toggle state test
- [ ] Badge: add `aria-label` (e.g., `aria-label={count ? \`${displayValue} notifications\` : 'New notification'}`) on the `<span>` — fixes known a11y gap for dot badge

**Then test (13 untested components):**
- [ ] Card — render variants, interactive keyboard (Enter/Space), role="button" when interactive, disabled state
- [ ] Checkbox — render, checked/indeterminate states, onCheckedChange callback, disabled, ref forwarding, aria-hidden on visual span
- [ ] Chip — render all types (assist/filter/input/suggestion), aria-pressed for filter, Delete/Backspace fires onClose for input, disabled
- [ ] CircularProgress — render, progressbar role, aria-valuenow reflects value, indeterminate omits aria-valuenow
- [ ] LinearProgress — same as CircularProgress (both use identical ARIA model)
- [ ] Dialog — open/close via trigger, role="dialog", Escape key closes, basic aria-labelledby
- [ ] ExtendedFAB — render, variant, icon rendering, ref forwarding (thin wrapper over Button; low complexity)
- [ ] FABMenu — open/close, Escape closes + focus returns to trigger, scrim rendering
- [ ] IconButton — render, variants, selected state + aria-pressed (after fix), ref forwarding
- [ ] Snackbar — render message, actionLabel renders button, closable renders dismiss, aria-live="polite" present
- [ ] Tabs — render tablist, Tab selection fires onValueChange, aria-selected reflects active, ArrowLeft/ArrowRight keyboard navigation
- [ ] Toolbar — render, children rendering (likely thin wrapper; verify structure)

**Badge (existing, needs a11y test):**
- [ ] Badge — add test: dot badge has aria-label, large badge has accessible text content

### Add After Validation (v1.x)

Features to add once core coverage is in place:

- [ ] Input Chip close button accessible name test — `getByRole('button', { name: /Remove/i })` — low complexity, high value
- [ ] Filter Chip aria-pressed verified via `getByRole('button')` + attribute check
- [ ] CircularProgress indeterminate class animation assertion (has `animate-circular-progress-dash`)
- [ ] TextField: additional a11y tests (aria-invalid, aria-describedby for supporting text)

### Future Consideration (v2+)

Features to defer until library has real consumer adoption:

- [ ] Visual regression testing (Chromatic/Percy) — needs browser environment and baseline snapshots
- [ ] axe-core integration — requires JSDOM or real browser, not happy-dom
- [ ] E2E keyboard navigation with Playwright — no app to drive yet
- [ ] Date picker / Time picker a11y deep-dive — complex ARIA patterns (combobox, grid roles); best addressed as a dedicated sub-milestone

---

## Feature Prioritization Matrix

| Feature | User Value | Implementation Cost | Priority |
|---------|------------|---------------------|----------|
| Fix IconButton aria-pressed | HIGH — toggle buttons are a core pattern | LOW — one attribute in forwardRef body | P1 |
| Fix Badge aria-label | HIGH — dot badges are invisible to screen readers | LOW — one computed string | P1 |
| Checkbox tests | HIGH — form controls are safety-critical | MEDIUM — indeterminate state tricky in happy-dom | P1 |
| Chip tests | HIGH — four variants, keyboard behaviours | MEDIUM — multiple code paths | P1 |
| Dialog tests | HIGH — modal a11y is highest-risk surface | MEDIUM — requires open state, Base UI primitives | P1 |
| Tabs tests | HIGH — roving tabindex is complex; already implemented but untested | MEDIUM — keyboard test setup | P1 |
| CircularProgress / LinearProgress tests | MEDIUM — progress ARIA model is clear and already correct | LOW — mostly attribute assertions | P1 |
| Snackbar tests | MEDIUM — live region is critical; imperative API less so | LOW — test Snackbar component directly | P1 |
| FABMenu tests | MEDIUM — custom keyboard handling exists | MEDIUM — open state + focus management | P1 |
| Card tests | MEDIUM — keyboard activation is already implemented | LOW — test the existing handler | P2 |
| ExtendedFAB tests | LOW — thin wrapper over Button | LOW — mostly smoke test | P2 |
| Toolbar tests | LOW — likely thin wrapper | LOW | P2 |
| Input Chip close button accessible name | MEDIUM — icon-only nested button must have label | LOW | P2 |
| Visual regression tests | HIGH long-term | HIGH — new toolchain | P3 |
| E2E keyboard tests | MEDIUM | HIGH — new infrastructure | P3 |

**Priority key:**
- P1: Must have for milestone
- P2: Should have, include in milestone if time allows
- P3: Defer — not in scope for this milestone

---

## Competitor Feature Analysis

How comparable M3 libraries handle test coverage and accessibility:

| Feature | MUI (Material UI) | Radix UI / shadcn | Our Approach |
|---------|--------------------|--------------------|--------------|
| Test framework | Jest + Testing Library | Vitest + Testing Library | Rstest + Testing Library (same principles) |
| a11y approach | ARIA attributes + axe-core in CI | Radix primitives handle a11y by default | Manual ARIA on custom components; Base UI for Dialog |
| aria-pressed on toggle buttons | Yes, on ToggleButton | Yes, via Radix Toggle | **Gap**: IconButton selected prop missing it |
| aria-label on badge | Yes, configurable via prop | n/a | **Gap**: dot badge has no text or label |
| Keyboard nav tests | Arrow keys tested for Tabs, MenuList | Radix handles in primitive | Tabs has the code; needs tests |
| Dialog focus trap | Radix FocusTrap / Floating UI | Radix Dialog primitive | Base UI Dialog primitive handles it |
| Progress ARIA | Tested with aria-valuenow assertions | n/a | Already implemented; needs tests |

---

## Sources

- [WAI-ARIA Roles — MDN](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Roles) — HIGH confidence
- [WAI-ARIA: role=progressbar — DigitalA11Y](https://www.digitala11y.com/progressbar-role/) — MEDIUM confidence
- [WAI-ARIA: role=tablist — DigitalA11Y](https://www.digitala11y.com/tablist-role/) — MEDIUM confidence
- [Accessibility — React Aria / React Spectrum](https://react-spectrum.adobe.com/react-aria/accessibility.html) — HIGH confidence
- [About Queries — Testing Library](https://testing-library.com/docs/queries/about/) — HIGH confidence
- [Testing Implementation Details — Kent C. Dodds](https://kentcdodds.com/blog/testing-implementation-details) — MEDIUM confidence
- [Material Design 3 Chips Accessibility](https://m3.material.io/components/chips/accessibility) — MEDIUM confidence (page rendered as CSS/analytics only; M3 spec cross-referenced with component code)
- [Material Design 3 Buttons Accessibility](https://m3.material.io/components/buttons/accessibility) — MEDIUM confidence (same)
- Codebase inspection of `/Users/monster/Work/m3-lib/src/components/ui/` and `/Users/monster/Work/m3-lib/tests/` — HIGH confidence (direct source)

---
*Feature research for: M3-Lib test coverage and accessibility milestone*
*Researched: 2026-02-17*
