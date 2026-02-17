# M3-Lib Test Coverage & Accessibility

## What This Is

A quality improvement milestone for M3-Lib, a Material Design 3 component library built with React, Tailwind CSS v4, and CVA. This milestone adds missing test coverage for 13 untested components and fixes accessibility gaps across the library.

## Core Value

Every component must be tested and accessible — tests catch regressions, ARIA compliance ensures the library works for all users.

## Requirements

### Validated

- ✓ 24/24 components have Storybook stories — existing
- ✓ 11/24 components have tests (badge, button, button-group, divider, menu, navigation-bar, navigation-rail, switch, text-field, time-picker, tooltip) — existing
- ✓ All components exported from src/index.tsx — existing
- ✓ Interactive components use proper ARIA roles (switch, tabs, menu, fab-menu, progress, dialog, toolbar) — existing

### Active

- [ ] Add tests for all 13 untested components
- [ ] Fix IconButton missing aria-pressed for selected/toggle state
- [ ] Fix Badge missing aria-label for screen reader count announcement
- [ ] Fix Card interactive variant missing keyboard support (Enter/Space) and tabIndex
- [ ] Verify all components pass accessibility checks

### Out of Scope

- Refactoring existing component implementations — quality only, no feature changes
- Adding new components — focus on coverage for existing ones
- Modifying existing passing tests — only add new tests
- Visual/design changes — accessibility and test coverage only

## Context

- Library has 24 components in `src/components/ui/`
- Tests use `@rstest/core` + `@testing-library/react` with `happy-dom`
- Tests live in `tests/` directory, named `{component}.test.tsx`
- Stories live in `stories/` directory, named `{Component}.stories.tsx`
- Biome enforces sorted Tailwind classes, SVG accessibility (`aria-hidden="true"`)
- Some pre-existing test failures in button.test.tsx, navigation-bar.test.tsx, navigation-rail.test.tsx (not related to this work)
- Dialog and Tooltip use `@base-ui/react` which handles ARIA internally
- Components use `React.forwardRef` pattern with CVA variants

## Constraints

- **Test framework**: Rstest + @testing-library/react (existing setup)
- **Test pattern**: Must follow existing conventions (afterEach(cleanup), describe/it blocks)
- **No breaking changes**: Accessibility fixes must be backward-compatible
- **Biome compliance**: All new code must pass biome lint/format

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Fix a11y in components directly | Backward-compatible additions (aria attributes, keyboard handlers) | — Pending |
| Follow existing test patterns | Consistency with 11 existing test files | — Pending |

---
*Last updated: 2026-02-17 after initialization*
