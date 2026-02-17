# Requirements: M3-Lib Test Coverage & Accessibility

**Defined:** 2026-02-17
**Core Value:** Every component must be tested and accessible

## v1 Requirements

### Test Infrastructure

- [ ] **INFRA-01**: Pre-existing button.test.tsx failures fixed (class assertion drift: elevated shadow-md→shadow-lg, outlined border-outline→border-outline/40)
- [ ] **INFRA-02**: Pre-existing navigation-bar.test.tsx failures fixed (aria-label assertion + missing Enter/Space keyboard handler)
- [ ] **INFRA-03**: Pre-existing navigation-rail.test.tsx failures fixed (aria-label assertion + missing Enter/Space keyboard handler + animate polyfill)
- [ ] **INFRA-04**: Global element.animate() polyfill added to rstest.setup.ts (currently per-file in menu.test.tsx)
- [ ] **INFRA-05**: Global afterEach(cleanup) added to rstest.setup.ts (currently per-file)
- [ ] **INFRA-06**: @testing-library/user-event installed and available for keyboard interaction tests
- [ ] **INFRA-07**: vitest-axe + jsdom installed for accessibility scanning
- [ ] **INFRA-08**: Two-project Rstest config created (happy-dom for unit tests, jsdom for a11y tests in tests/a11y/)

### Accessibility Fixes

- [ ] **A11Y-01**: IconButton emits aria-pressed when selected prop is provided
- [ ] **A11Y-02**: Badge emits aria-label with count/content for screen readers
- [ ] **A11Y-03**: Card interactive variant has tabIndex={0} and handles Enter/Space keyboard events
- [ ] **A11Y-04**: axe-core scan test exists for every exported component (tests/a11y/*.test.tsx)

### Component Tests — Tier 1 (Presentational)

- [ ] **TEST-01**: LinearProgress test covers render, variant classes, determinate/indeterminate modes, aria-valuenow/min/max attributes
- [ ] **TEST-02**: CircularProgress test covers render, variant classes, determinate/indeterminate modes, role="progressbar" attributes
- [ ] **TEST-03**: Toolbar test covers render, role="toolbar", children rendering

### Component Tests — Tier 2 (Stateful)

- [ ] **TEST-04**: IconButton test covers render, variant classes, click handler, aria-pressed for selected state
- [ ] **TEST-05**: Card test covers render, variant classes, interactive keyboard support (Enter/Space), tabIndex
- [ ] **TEST-06**: Checkbox test covers render, checked/unchecked toggle, indeterminate state, disabled state, aria-checked
- [ ] **TEST-07**: Chip test covers render, variant classes, selectable chip aria-pressed, input chip delete/backspace keyboard
- [ ] **TEST-08**: ExtendedFAB test covers render, icon + label rendering, click handler, variant classes
- [ ] **TEST-09**: Tabs test covers render, tab selection, aria-selected, keyboard arrow navigation (roving tabindex)

### Component Tests — Tier 3 (Compound)

- [ ] **TEST-10**: FABMenu test covers render, open/close toggle, Escape to close, focus return to trigger, role="menu"/role="menuitem"
- [ ] **TEST-11**: Snackbar test covers render, imperative snackbar() API, auto-dismiss, action button, aria-live region

### Component Tests — Tier 4 (Complex/Portal)

- [ ] **TEST-12**: Dialog test covers render, open/close, DialogTitle/DialogDescription, focus management, Escape to close
- [ ] **TEST-13**: DatePicker test covers render, date selection, month navigation, year selection, min/max constraints, keyboard navigation

## v2 Requirements

### Extended Coverage

- **COV-01**: Visual regression tests via Storybook + Chromatic
- **COV-02**: Color contrast validation via @storybook/addon-a11y in browser
- **COV-03**: E2E component interaction tests
- **COV-04**: Test coverage reporting and thresholds

## Out of Scope

| Feature | Reason |
|---------|--------|
| Refactoring component implementations | Quality milestone only, no feature changes |
| Adding new components | Focus on coverage for existing 24 |
| Visual regression testing | Requires browser environment, separate tooling |
| Color contrast validation | Cannot be tested in jsdom, needs Storybook addon |
| Modifying existing passing tests | Only fix pre-existing failures, don't rewrite working tests |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| INFRA-01 | Phase 1 | Pending |
| INFRA-02 | Phase 1 | Pending |
| INFRA-03 | Phase 1 | Pending |
| INFRA-04 | Phase 1 | Pending |
| INFRA-05 | Phase 1 | Pending |
| INFRA-06 | Phase 2 | Pending |
| INFRA-07 | Phase 2 | Pending |
| INFRA-08 | Phase 2 | Pending |
| A11Y-01 | Phase 2 | Pending |
| A11Y-02 | Phase 2 | Pending |
| A11Y-03 | Phase 2 | Pending |
| A11Y-04 | Phase 6 | Pending |
| TEST-01 | Phase 3 | Pending |
| TEST-02 | Phase 3 | Pending |
| TEST-03 | Phase 3 | Pending |
| TEST-04 | Phase 3 | Pending |
| TEST-05 | Phase 3 | Pending |
| TEST-06 | Phase 3 | Pending |
| TEST-07 | Phase 3 | Pending |
| TEST-08 | Phase 3 | Pending |
| TEST-09 | Phase 3 | Pending |
| TEST-10 | Phase 4 | Pending |
| TEST-11 | Phase 4 | Pending |
| TEST-12 | Phase 5 | Pending |
| TEST-13 | Phase 5 | Pending |

**Coverage:**
- v1 requirements: 25 total
- Mapped to phases: 25
- Unmapped: 0

---
*Requirements defined: 2026-02-17*
*Last updated: 2026-02-17 after roadmap creation*
