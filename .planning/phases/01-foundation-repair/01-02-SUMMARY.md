---
phase: 01-foundation-repair
plan: 02
subsystem: testing
tags: [react, tailwind, accessibility, aria, keyboard, cva]

# Dependency graph
requires:
  - phase: 01-foundation-repair/01-01
    provides: Centralised test setup (rstest.setup.ts) used by all test files
provides:
  - Corrected button test assertions matching current CVA output (shadow-lg, border-outline/40)
  - aria-label attribute on NavigationBarItem button for screen reader accessibility
  - Enter/Space keyboard handler in NavigationBarItem for keyboard navigation
affects:
  - 01-foundation-repair
  - Phase 2 (component accessibility work)

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "CVA variant class drift: tests must assert exact CVA output classes — check source on failure before changing test"
    - "aria-label on interactive items: button elements inside navigation containers need aria-label for screen reader identification"
    - "Keyboard handler pattern: button onKeyDown should fire action on Enter/Space, consistent with native button behavior"

key-files:
  created: []
  modified:
    - tests/button.test.tsx
    - src/components/ui/navigation-bar.tsx

key-decisions:
  - "Assert exact CVA output classes in tests — shadow-lg not shadow-md, border-outline/40 not border-outline"
  - "aria-label added directly to NavigationBarItem button element using label prop already in scope"
  - "handleKeyDown fires onValueChange on Enter/Space only when not disabled — matches handleClick guard"

patterns-established:
  - "Navigation item keyboard handler: Enter/Space fire onValueChange, disabled check matches click guard"
  - "ARIA on nav items: aria-label={label} before aria-current, sorted alphabetically per Biome"

requirements-completed:
  - INFRA-01
  - INFRA-02

# Metrics
duration: 1min
completed: 2026-02-17
---

# Phase 1 Plan 02: Fix Button Test Assertions and NavigationBarItem Accessibility Summary

**Stale CVA class assertions corrected in button.test.tsx and aria-label + Enter/Space keyboard handling added to NavigationBarItem, resolving all three failing test groups**

## Performance

- **Duration:** ~1 min
- **Started:** 2026-02-17T00:33:10Z
- **Completed:** 2026-02-17T00:34:04Z
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments
- Fixed two stale `toHaveClass` assertions in `button.test.tsx` that had drifted from CVA source: elevated variant now asserts `shadow-lg` (was `shadow-md`) and outlined variant asserts `border-outline/40` (was `border-outline`)
- Added `aria-label={label}` to the `<button>` element in `NavigationBarItem`, enabling screen-reader identification and `getByRole('button', { name: ... })` queries in tests
- Replaced no-op `handleKeyDown` with Enter/Space activation logic that mirrors `handleClick` guard (`!disabled`), making keyboard navigation work as expected

## Task Commits

Each task was committed atomically:

1. **Task 1: Fix stale class assertions in button.test.tsx** - `423555e` (fix)
2. **Task 2: Add aria-label and Enter/Space handler to NavigationBarItem** - `ea95fb3` (feat)

**Plan metadata:** (docs commit follows)

## Files Created/Modified
- `/Users/monster/Work/m3-lib/tests/button.test.tsx` - Updated `toHaveClass('shadow-md')` to `shadow-lg` and `toHaveClass('border-outline')` to `border-outline/40`
- `/Users/monster/Work/m3-lib/src/components/ui/navigation-bar.tsx` - Added `aria-label={label}` to button element; replaced empty `handleKeyDown` with Enter/Space `onValueChange` activation

## Decisions Made
- Test assertions must match exact CVA output — when a test fails for a class assertion, check source first. Here the source was correct and tests were stale.
- `aria-label` placed before `aria-current` to maintain alphabetical prop order (Biome-compatible).
- `handleKeyDown` guard uses `!disabled` to exactly mirror `handleClick` — prevents keyboard activation on disabled items.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None - both changes were minimal, targeted, and all 276 tests pass after execution.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- All button and navigation-bar test failures resolved
- NavigationBarItem is now keyboard accessible (Enter/Space) and screen-reader friendly (aria-label)
- Pre-existing test failures noted in MEMORY.md (button.test.tsx, navigation-bar.test.tsx, navigation-rail.test.tsx) are now fully resolved for navigation-bar; button suite is 100% green
- Ready to continue with remaining foundation-repair plans

---
*Phase: 01-foundation-repair*
*Completed: 2026-02-17*

## Self-Check: PASSED

- FOUND: tests/button.test.tsx
- FOUND: src/components/ui/navigation-bar.tsx
- FOUND: 01-02-SUMMARY.md
- FOUND commit: 423555e (fix stale button test assertions)
- FOUND commit: ea95fb3 (add aria-label and Enter/Space handler)
