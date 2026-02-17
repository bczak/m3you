# Project Research Summary

**Project:** M3-Lib — Test Coverage and Accessibility Milestone
**Domain:** React component library — testing retrofit and accessibility compliance
**Researched:** 2026-02-17
**Confidence:** HIGH

## Executive Summary

M3-Lib is a 24-component Material Design 3 React library that has accumulated substantial implementation but inconsistent test coverage: 11 of 24 components have tests, and those tests contain 8 pre-existing failures caused by stale class assertions, a missing Web Animations API polyfill, incorrect ARIA attribute expectations, and incomplete keyboard event handlers. The recommended approach is a bottom-up testing retrofit structured by component complexity tier, beginning with the two foundational infrastructure fixes (global `rstest.setup.ts` polyfill + cleanup, pre-existing test failures) before adding any new coverage. Accessibility fixes are not a separate phase — they are applied immediately alongside each component's tests to avoid a permanently red CI.

The stack additions are minimal and well-scoped: `@testing-library/user-event` v14 for keyboard interaction simulation, `vitest-axe` + `jsdom` for axe-core accessibility scanning. The critical constraint is that axe-core is incompatible with happy-dom due to a known `Node.prototype.isConnected` bug; this requires a two-project Rstest config with accessibility tests in `tests/a11y/` running under jsdom while existing tests keep happy-dom for speed. Two known accessibility gaps in the components themselves must be fixed before their tests can be written: `IconButton` is missing `aria-pressed` on the `selected` prop, and the dot-only `Badge` has no `aria-label`.

The overall risk profile is low. All patterns are established by the existing 11 test files, the test runner (Rstest 0.8.1) is already configured, and the failing tests have clear, mechanical fixes. The only elevated-complexity work is in Tier 4 components (Dialog, DatePicker) which use `@base-ui/react` portals and focus traps — these require behavioral testing at the M3 wrapper layer rather than asserting on `@base-ui/react` internals.

## Key Findings

### Recommended Stack

The existing test stack (Rstest + Testing Library + happy-dom) is kept intact. Two packages are added: `@testing-library/user-event` v14 for realistic keyboard simulation (required for WCAG 2.1 keyboard operability tests), and `vitest-axe` + `jsdom` for automated axe-core accessibility scanning in CI. Storybook already has the `@storybook/addon-a11y` panel available for color contrast and visual focus checks that jsdom cannot perform.

The happy-dom / jsdom split is non-negotiable: axe-core crashes in happy-dom with an unrecoverable runtime error. The two-project Rstest config (`projects` array in `rstest.config.ts`) isolates this cleanly — no test file annotations needed, just directory-based routing.

**Core technologies:**
- `@testing-library/user-event` v14: Realistic keyboard/pointer simulation — required for full event-chain testing (focus, blur, keydown, keypress, keyup). `fireEvent` alone produces false positives for keyboard accessibility.
- `vitest-axe` + `jsdom`: axe-core integration for WCAG rule checking — vitest-axe uses the Vitest-compatible `expect.extend` API that Rstest shares; jsdom is required because happy-dom breaks axe-core.
- Two-project Rstest config: Isolates existing happy-dom tests from new jsdom accessibility tests — both run under `bun run test`.
- `@storybook/addon-a11y`: Browser-level accessibility checks (color contrast, focus ring visibility) — complements unit-level vitest-axe.

### Expected Features

The milestone must deliver complete test coverage for all 24 components and fix 2 known accessibility gaps. Two ARIA fixes are blockers that must precede their corresponding tests.

**Must have (table stakes):**
- Pre-existing failure fixes — 8 failures in 4 test files must be resolved before adding new tests
- `IconButton` aria-pressed fix — `selected` prop must emit `aria-pressed`; blocks toggle state testing
- `Badge` aria-label fix — dot badge needs an accessible label; blocks badge screen reader test
- Tests for all 13 currently untested components: Card, Checkbox, Chip, CircularProgress, LinearProgress, Dialog, ExtendedFAB, FABMenu, IconButton, Snackbar, Tabs, Toolbar, DatePicker
- ARIA role and attribute correctness for every interactive component
- Keyboard activation tests (Enter/Space) for all interactive components
- `aria-live="polite"` verification for Snackbar

**Should have (competitive):**
- Tabs Arrow key navigation (ArrowLeft/ArrowRight/Home/End) — roving tabindex is implemented but untested
- FABMenu Escape + focus-return test — WCAG 2.1 SC 2.1.2 focus management
- Checkbox indeterminate DOM state via ref — covers a real bug surface hidden from HTML attributes
- Dialog role="dialog" + Escape key close + aria-labelledby — modal a11y is highest-risk surface
- CircularProgress indeterminate omits aria-valuenow — per WAI-ARIA spec requirement
- Input Chip Delete/Backspace onClose and close button accessible name

**Defer (v2+):**
- Visual regression testing (Chromatic/Percy) — requires browser environment and baseline snapshots
- E2E keyboard navigation with Playwright — no app to drive
- axe-core deep-dive for Date/TimePicker — complex ARIA patterns best as a sub-milestone
- 100% line coverage target — incentivizes trivial tests; target 100% of defined behaviors instead

### Architecture Approach

Test files are organized by component complexity tier, which both structures build order and sets expectations for test complexity. The existing flat test structure (top-level `test()` calls, section comment separators, no `describe` blocks) is maintained for consistency. All foundational setup concerns (Web Animations polyfill, `afterEach(cleanup)`) are moved to `rstest.setup.ts` globally rather than repeated per file.

**Major components / tiers:**
1. Tier 1 — Presentational (LinearProgress, CircularProgress, Toolbar): No state, no external deps. Establish patterns first.
2. Tier 2 — Stateful Primitives (IconButton, Card, Checkbox, Chip, ExtendedFAB, Tabs): CVA variants + simple interactivity. One new test category added per component.
3. Tier 3 — Compound / Context-Driven (FABMenu, Snackbar): Multiple sub-components, context providers, floating content.
4. Tier 4 — Portal / Complex (Dialog, DatePicker): `@base-ui/react` focus traps, portals, keyboard navigation. Test behavioral outcomes only — do not assert `@base-ui/react` internal ARIA wiring.

### Critical Pitfalls

1. **Stale class assertions against CVA drift** — Always copy class assertions from the current CVA source at time of writing; the two `button.test.tsx` failures (`shadow-md` vs. `shadow-lg`, `border-outline` vs. `border-outline/40`) are the canonical example. Never copy from visual inspection of old code.

2. **Missing Web Animations API polyfill** — `m3-ripple` calls `element.animate()` on pointer events; happy-dom has no Web Animations API. Any test file for a Ripple-using component without the polyfill will throw `TypeError: e.animate is not a function`. Fix: add to `rstest.setup.ts` globally.

3. **ARIA attribute vs. computed accessible name confusion** — `NavigationBarItem` and `NavigationRailItem` provide their accessible name via visible text content (a `<span>` child), not an explicit `aria-label` attribute. Tests asserting `toHaveAttribute('aria-label')` fail with `null` even though the element is accessible. Fix: use `getByRole('button', { name: 'Home' })` to query by computed name, not by explicit attribute.

4. **DOM pollution from missing cleanup** — `@testing-library/react` v16 does not auto-cleanup in Rstest. Missing `afterEach(cleanup)` causes DOM to persist between tests, producing false positives and "Found multiple elements" failures. Fix: add to `rstest.setup.ts` globally.

5. **Testing @base-ui/react internals** — Dialog and Tooltip are thin wrappers around `@base-ui/react` primitives. Asserting `aria-controls`, `aria-expanded`, or internal `data-*` attributes will produce brittle failures as `@base-ui/react` manages these internally. Fix: test behavioral outcomes (is content visible? does Escape close it?) at the M3 wrapper layer only.

## Implications for Roadmap

Based on research, suggested phase structure:

### Phase 1: Foundation Repair
**Rationale:** All 8 pre-existing failures must be eliminated before adding any new tests; a red baseline makes it impossible to tell whether new work is working. Infrastructure fixes (global polyfill, global cleanup) must also come first so new test files don't repeat anti-patterns.
**Delivers:** Green baseline (`bun run test` passes); `rstest.setup.ts` with global Web Animations polyfill and `afterEach(cleanup)`; corrected class assertions in `button.test.tsx`; resolved `aria-label` and keyboard failures in `navigation-bar.test.tsx` and `navigation-rail.test.tsx`.
**Addresses:** Pitfalls 1–5 (class drift, animate polyfill, ARIA computed name, keyboard handler, DOM pollution)
**Avoids:** Building new tests on a red baseline that obscures regression signals

### Phase 2: Accessibility Gap Fixes + Stack Setup
**Rationale:** Two component source fixes are blocking their own tests — they must land before Phase 3 test writing begins. Stack additions (`user-event`, `vitest-axe`, `jsdom`, two-project config) must be in place before any accessibility tests can run.
**Delivers:** `IconButton` with `aria-pressed` on selected state; `Badge` with `aria-label` on dot badge; `@testing-library/user-event` installed; `vitest-axe` + `jsdom` installed; `rstest.config.ts` updated with two-project config; `rstest.setup.a11y.ts` created.
**Uses:** `vitest-axe`, `jsdom`, `@testing-library/user-event` v14 from STACK.md
**Avoids:** Writing tests for known broken states (produces permanently red CI)

### Phase 3: Tier 1 + Tier 2 Component Tests
**Rationale:** Start with the lowest-complexity components to build momentum and verify the test pattern before tackling stateful components. Tier 2 components unlock confidence for compound component testing in Phase 4.
**Delivers:** Tests for LinearProgress, CircularProgress, Toolbar (Tier 1); tests for IconButton, Card, Checkbox, Chip, ExtendedFAB, Tabs (Tier 2) including variant rendering, ARIA attributes, keyboard interaction, and ref forwarding.
**Addresses:** 9 of the 13 untested components; P1 and P2 features from FEATURES.md
**Implements:** Standard test category order (Rendering → Variants → States → Accessibility → Keyboard → Ref)
**Avoids:** Pitfall 2 (polyfill now global), Pitfall 4 (use `userEvent.keyboard` for keyboard tests), Pitfall 7 (verify rendered classList before asserting)

### Phase 4: Tier 3 Compound Component Tests
**Rationale:** FABMenu and Snackbar require wrapper helpers and compound rendering setup; Snackbar tests require `SnackbarHost` mounted and tests of the imperative `snackbar()` API. Build on patterns proven in Phase 3.
**Delivers:** Tests for FABMenu (open/close, Escape + focus return, aria-haspopup/expanded); tests for Snackbar (render, action button, aria-live="polite")
**Addresses:** WCAG 2.1 SC 2.1.2 (no keyboard trap) for FABMenu; live region verification for Snackbar
**Avoids:** Pitfall 5 (test Snackbar component directly, not Sonner integration)

### Phase 5: Tier 4 Portal/Complex Component Tests
**Rationale:** Dialog and DatePicker are the highest-complexity components. Dialog uses `@base-ui/react` focus management; DatePicker is a full calendar grid with custom keyboard navigation. Both require careful behavioral (not internal) testing strategy.
**Delivers:** Tests for Dialog (open/close, role="dialog", Escape key, aria-labelledby, focus trap behavioral verification); tests for DatePicker (calendar render, date cell roles, selected date, out-of-range disabled state)
**Addresses:** Highest-risk accessibility surface (modal dialogs)
**Avoids:** Pitfall 6 (no assertions on `@base-ui/react` internal ARIA wiring); Pitfall 3 (behavioral outcome testing)

### Phase 6: Axe-Core Accessibility Scan Layer
**Rationale:** With all components tested and known gaps fixed, add automated axe-core scans as a second coverage layer. These run in the jsdom project configured in Phase 2 and catch WCAG violations that targeted attribute assertions may miss.
**Delivers:** `tests/a11y/*.test.tsx` files for each component; automated `toHaveNoViolations()` assertions in CI; Storybook `@storybook/addon-a11y` integration confirmed working
**Uses:** `vitest-axe`, `jsdom` environment from Phase 2
**Avoids:** Running axe-core in happy-dom (confirmed incompatible — Node.prototype.isConnected bug)

### Phase Ordering Rationale

- Phase 1 before everything: A red baseline masks regressions. Infrastructure fixes (polyfill, cleanup) eliminate the entire class of "environment setup" failures from new test files.
- Phase 2 before Phase 3: Component source fixes must precede the tests that verify them. Stack additions must precede any test that uses `userEvent` or `vitest-axe`.
- Tier 1 before Tier 2 before Tier 3 before Tier 4: Complexity increases predictably; patterns established in each tier carry into the next. The dependency graph (IconButton before FABMenu, Button before ExtendedFAB) is satisfied by tier ordering.
- Phase 6 last: Axe-core scans add the most value once all targeted ARIA fixes are confirmed passing — scanning broken components produces noise, not signal.

### Research Flags

Phases likely needing deeper research during planning:
- **Phase 5 (DatePicker):** Complex ARIA grid pattern (role="grid", role="gridcell", aria-selected for date cells). M3 spec doesn't document ARIA for DatePicker; WAI-ARIA Date Picker Dialog pattern from W3C should be consulted during planning.
- **Phase 6 (axe-core scope):** Which axe-core rules are meaningful in jsdom vs. which require a real browser. Color contrast rules must be explicitly disabled in jsdom config to avoid false failures.

Phases with standard patterns (skip research-phase):
- **Phase 1 (Foundation Repair):** All fixes have direct causes identified; no research needed, mechanical fixes.
- **Phase 2 (Stack Setup):** All packages and config patterns documented in STACK.md.
- **Phase 3 (Tier 1 + Tier 2):** Well-documented Testing Library patterns; existing test files provide complete examples.
- **Phase 4 (Tier 3):** FABMenu and Snackbar patterns are documented; compound test wrappers are established.

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | All packages verified against official docs; jsdom/happy-dom incompatibility confirmed by multiple sources including vitest-axe README |
| Features | HIGH | Derived from direct codebase inspection of 24 components + existing tests; gaps identified from running `bun run test` and reading source |
| Architecture | HIGH | Directly based on existing test files (11 examples) and codebase structure; tier system mirrors actual component dependency graph |
| Pitfalls | HIGH | All 8 pitfalls verified against actual test failures from `bun run test` output and component source inspection |

**Overall confidence:** HIGH

### Gaps to Address

- **DatePicker ARIA pattern**: The WAI-ARIA Date Picker Dialog Pattern from W3C should be consulted during Phase 5 planning. The DatePicker component is custom-implemented (not @base-ui/react), so test assertions will need to mirror the W3C pattern for calendar grids.
- **lucide-react aria-hidden default**: STACK.md and PITFALLS.md note that lucide-react sets `aria-hidden="true"` by default, but this should be verified for the exact version in use before asserting it in tests.
- **Checkbox indeterminate in happy-dom**: FEATURES.md flags that testing `inputRef.current.indeterminate === true` may be tricky in happy-dom. This needs a quick happy-dom compatibility check during Phase 3 planning before committing to the test approach.
- **@base-ui/react Dialog focus trap verification**: happy-dom's event model may not fully support `@base-ui/react`'s pointer capture / focus management strategy. The behavioral test approach (content visible/hidden, Escape closes) should be validated during Phase 5 before attempting deeper focus trap assertions.

## Sources

### Primary (HIGH confidence)
- `/Users/monster/Work/m3-lib/src/components/ui/` — 24 component files, direct inspection
- `/Users/monster/Work/m3-lib/tests/` — 11 existing test files, direct inspection
- `/Users/monster/Work/m3-lib/rstest.setup.ts` — global setup file, direct inspection
- [vitest-axe README](https://github.com/chaance/vitest-axe/blob/main/README.md) — happy-dom incompatibility documented
- [Rstest React guide](https://rstest.rs/guide/framework/react) — environment configuration
- [Rstest Rslib adapter](https://rstest.rs/guide/integration/rslib) — projects config for per-directory environments
- [Testing Library — user-event intro](https://testing-library.com/docs/user-event/intro/) — v14 API
- [Storybook accessibility testing docs](https://storybook.js.org/docs/writing-tests/accessibility-testing) — addon-a11y integration
- [axe-core GitHub](https://github.com/dequelabs/axe-core) — WCAG coverage and jsdom limitations
- [WAI-ARIA Roles — MDN](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Roles) — role semantics
- [Accessibility — React Aria / React Spectrum](https://react-spectrum.adobe.com/react-aria/accessibility.html) — accessible name patterns

### Secondary (MEDIUM confidence)
- [DigitalA11Y — role=progressbar](https://www.digitala11y.com/progressbar-role/) — aria-valuenow requirements
- [DigitalA11Y — role=tablist](https://www.digitala11y.com/tablist-role/) — tablist/tab/tabpanel pattern
- [Material Design 3 Chips Accessibility](https://m3.material.io/components/chips/accessibility) — chip ARIA roles
- [vitest-axe npm](https://www.npmjs.com/package/vitest-axe) — package registry confirmation
- [Vitest discussions — axe-core happy-dom bug](https://github.com/vitest-dev/vitest/discussions/1607) — multiple sources confirm

### Tertiary (LOW confidence)
- None — all relevant findings have multiple confirming sources.

---
*Research completed: 2026-02-17*
*Ready for roadmap: yes*
