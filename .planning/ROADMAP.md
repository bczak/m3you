# Roadmap: M3-Lib Test Coverage & Accessibility

## Overview

This milestone retrofits test coverage and fixes accessibility gaps across M3-Lib's 24 Material Design 3 components. Work proceeds bottom-up: repair the broken baseline first, fix the two component-level accessibility gaps that block their own tests, then add tests by complexity tier (presentational → stateful → compound → portal/complex), and finish with an automated axe-core scan layer that adds a second coverage dimension once all targeted fixes are confirmed green.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [x] **Phase 1: Foundation Repair** - Fix 8 pre-existing test failures and harden global test setup (completed 2026-02-17)
- [ ] **Phase 2: Accessibility Fixes and Stack Setup** - Fix component-level ARIA gaps and install tooling needed for keyboard and axe tests
- [ ] **Phase 3: Tier 1 and Tier 2 Component Tests** - Tests for 9 presentational and stateful components
- [ ] **Phase 4: Tier 3 Compound Component Tests** - Tests for FABMenu and Snackbar
- [ ] **Phase 5: Tier 4 Portal and Complex Component Tests** - Tests for Dialog and DatePicker
- [ ] **Phase 6: Axe-Core Accessibility Scan Layer** - Automated axe-core scans for all exported components

## Phase Details

### Phase 1: Foundation Repair
**Goal**: The test suite runs with a green baseline — no pre-existing failures obscure regressions from new work
**Depends on**: Nothing (first phase)
**Requirements**: INFRA-01, INFRA-02, INFRA-03, INFRA-04, INFRA-05
**Success Criteria** (what must be TRUE):
  1. `bun run test` produces 0 failures in button.test.tsx, navigation-bar.test.tsx, and navigation-rail.test.tsx
  2. rstest.setup.ts contains a global `element.animate()` polyfill — no individual test file needs its own polyfill
  3. rstest.setup.ts contains a global `afterEach(cleanup)` — no individual test file needs its own cleanup registration
  4. Class assertions in button.test.tsx match the current CVA output (elevated shadow class and outlined border-opacity class are correct)
  5. Navigation bar and rail tests use computed accessible name queries (`getByRole` with `name:`) and include Enter/Space keyboard handlers
**Plans**: 3 plans

Plans:
- [x] 01-01-PLAN.md — Centralise global test infrastructure (animate polyfill + afterEach cleanup) into rstest.setup.ts
- [x] 01-02-PLAN.md — Fix button.test.tsx class assertions and NavigationBarItem aria-label + keyboard handler
- [x] 01-03-PLAN.md — Fix NavigationRailItem collapsed branch aria-label and keyboard handler

### Phase 2: Accessibility Fixes and Stack Setup
**Goal**: Component-level ARIA gaps are fixed and the full test toolchain (user-event, vitest-axe, jsdom, two-project config) is operational
**Depends on**: Phase 1
**Requirements**: INFRA-06, INFRA-07, INFRA-08, A11Y-01, A11Y-02, A11Y-03
**Success Criteria** (what must be TRUE):
  1. IconButton renders `aria-pressed` when the `selected` prop is provided
  2. Badge renders an `aria-label` on the dot variant (no visible text) so screen readers announce its presence
  3. Card interactive variant responds to Enter and Space key events and has `tabIndex={0}`
  4. `@testing-library/user-event` v14 is importable in any test file
  5. `vitest-axe` and `jsdom` are installed; `bun run test` runs both happy-dom (unit) and jsdom (a11y) project configs without errors
**Plans**: TBD

### Phase 3: Tier 1 and Tier 2 Component Tests
**Goal**: All 9 presentational and stateful components have test files covering rendering, variants, ARIA attributes, and keyboard interaction
**Depends on**: Phase 2
**Requirements**: TEST-01, TEST-02, TEST-03, TEST-04, TEST-05, TEST-06, TEST-07, TEST-08, TEST-09
**Success Criteria** (what must be TRUE):
  1. LinearProgress and CircularProgress test files verify `role="progressbar"`, `aria-valuenow`/`aria-valuemin`/`aria-valuemax` for determinate mode, and absence of `aria-valuenow` in indeterminate mode
  2. Toolbar test file verifies `role="toolbar"` and children render correctly
  3. IconButton test file verifies variant class rendering, click handling, and `aria-pressed` toggling for the selected state
  4. Card test file verifies interactive variant keyboard activation (Enter/Space fires click) and `tabIndex={0}`
  5. Checkbox test file verifies checked/unchecked toggle, indeterminate DOM state, disabled state, and `aria-checked`
  6. Chip test file verifies selectable chip `aria-pressed` and input chip Delete/Backspace keyboard handling
  7. ExtendedFAB test file verifies icon and label render and click handling
  8. Tabs test file verifies `aria-selected`, active panel display, and ArrowLeft/ArrowRight keyboard navigation
**Plans**: TBD

### Phase 4: Tier 3 Compound Component Tests
**Goal**: FABMenu and Snackbar have test files that cover compound rendering, open/close behavior, keyboard dismissal, focus management, and ARIA live regions
**Depends on**: Phase 3
**Requirements**: TEST-10, TEST-11
**Success Criteria** (what must be TRUE):
  1. FABMenu test file verifies that triggering the FABMenu opens the menu (`role="menu"` content appears), Escape closes it, and focus returns to the trigger button
  2. FABMenu test file verifies `aria-haspopup` and `aria-expanded` state transitions on the trigger
  3. Snackbar test file verifies the imperative `snackbar()` API displays a message in an `aria-live="polite"` region and the message auto-dismisses
  4. Snackbar test file verifies an action button in the snackbar is focusable and clickable
**Plans**: TBD

### Phase 5: Tier 4 Portal and Complex Component Tests
**Goal**: Dialog and DatePicker have test files that verify behavioral outcomes (open/close, keyboard navigation, ARIA roles) without asserting on @base-ui/react internals
**Depends on**: Phase 4
**Requirements**: TEST-12, TEST-13
**Success Criteria** (what must be TRUE):
  1. Dialog test file verifies that opening the dialog makes content visible with `role="dialog"`, and Escape closes it
  2. Dialog test file verifies `aria-labelledby` points to the dialog title element when DialogTitle is used
  3. DatePicker test file verifies the calendar grid renders with date cells selectable by click and the selected date is reflected in the input
  4. DatePicker test file verifies month navigation (prev/next) changes the displayed month header
  5. DatePicker test file verifies dates outside the min/max range are rendered as disabled and cannot be selected
**Plans**: TBD

### Phase 6: Axe-Core Accessibility Scan Layer
**Goal**: Every exported component has an automated axe-core scan test that catches WCAG violations not covered by targeted attribute assertions
**Depends on**: Phase 5
**Requirements**: A11Y-04
**Success Criteria** (what must be TRUE):
  1. A `tests/a11y/` directory exists containing one test file per exported component
  2. Every a11y test file calls `toHaveNoViolations()` on the rendered component with color-contrast rules disabled
  3. `bun run test` runs all a11y tests in the jsdom project and they all pass
  4. The two-project Rstest config correctly routes `tests/a11y/` to jsdom and `tests/` to happy-dom
**Plans**: TBD

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4 → 5 → 6

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation Repair | 3/3 | Complete | 2026-02-17 |
| 2. Accessibility Fixes and Stack Setup | 0/TBD | Not started | - |
| 3. Tier 1 and Tier 2 Component Tests | 0/TBD | Not started | - |
| 4. Tier 3 Compound Component Tests | 0/TBD | Not started | - |
| 5. Tier 4 Portal and Complex Component Tests | 0/TBD | Not started | - |
| 6. Axe-Core Accessibility Scan Layer | 0/TBD | Not started | - |
