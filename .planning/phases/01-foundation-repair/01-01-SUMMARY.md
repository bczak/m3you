---
phase: 01-foundation-repair
plan: 01
subsystem: testing
tags: [rstest, testing-library, happy-dom, polyfill, cleanup]

# Dependency graph
requires: []
provides:
  - "Global Element.prototype.animate polyfill in rstest.setup.ts for happy-dom"
  - "Global afterEach(cleanup) in rstest.setup.ts preventing DOM leakage between tests"
affects: [all test files, navigation-bar, navigation-rail, time-picker, any future test files]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Global test setup in rstest.setup.ts: polyfills and cleanup registered once, inherited by all test files"

key-files:
  created: []
  modified:
    - rstest.setup.ts
    - tests/navigation-bar.test.tsx
    - tests/navigation-rail.test.tsx
    - tests/time-picker.test.tsx

key-decisions:
  - "Centralise Element.prototype.animate polyfill to rstest.setup.ts so all test files benefit automatically"
  - "Centralise afterEach(cleanup) to rstest.setup.ts so new test files cannot accidentally omit it"

patterns-established:
  - "Setup-file-first: all global test infrastructure (polyfills, teardown) lives in rstest.setup.ts, not in individual test files"

requirements-completed:
  - INFRA-04
  - INFRA-05

# Metrics
duration: 1min
completed: 2026-02-17
---

# Phase 01 Plan 01: Centralise Test Infrastructure Summary

**Global Element.prototype.animate polyfill and afterEach(cleanup) moved to rstest.setup.ts, making the test suite self-healing and unblocking navigation-rail tests from animate crashes**

## Performance

- **Duration:** ~1 min
- **Started:** 2026-02-17T12:10:27Z
- **Completed:** 2026-02-17T12:11:30Z
- **Tasks:** 2
- **Files modified:** 4

## Accomplishments
- Added `Element.prototype.animate` polyfill guard to `rstest.setup.ts` — all tests now have happy-dom Web Animations API coverage without per-file setup
- Added global `afterEach(cleanup)` to `rstest.setup.ts` — DOM is always torn down between tests regardless of how new test files are written
- Removed redundant `afterEach(cleanup)` registrations from `navigation-bar.test.tsx`, `navigation-rail.test.tsx`, and `time-picker.test.tsx`
- Navigation-rail tests now fail on ARIA/keyDown issues instead of crashing on `element.animate` — expected progression, addressed in Plan 03

## Task Commits

Each task was committed atomically:

1. **Task 1: Add global polyfill and cleanup to rstest.setup.ts** - `f06a606` (feat)
2. **Task 2: Remove per-file afterEach(cleanup) from three test files** - `4ad45df` (refactor)

**Plan metadata:** (docs commit follows)

## Files Created/Modified
- `rstest.setup.ts` - Added animate polyfill guard and global afterEach(cleanup); imports expanded to include afterEach and cleanup
- `tests/navigation-bar.test.tsx` - Removed afterEach(cleanup) and unused afterEach/cleanup imports
- `tests/navigation-rail.test.tsx` - Removed afterEach(cleanup) and unused afterEach/cleanup imports
- `tests/time-picker.test.tsx` - Removed afterEach(cleanup) and unused afterEach/cleanup imports

## Decisions Made
- Placed polyfill as a top-level guard (`if (!Element.prototype.animate)`) rather than inside a `beforeAll` — top-level code in setupFiles runs before any test in any file, making it truly global
- Kept `menu.test.tsx` untouched per plan spec — its `beforeAll` polyfill is redundant after this change but harmless

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None. Biome auto-sorted imports in `rstest.setup.ts` (moved `@testing-library/react` after `@testing-library/jest-dom/matchers` alphabetically) — this is expected Biome behavior and correct.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Test infrastructure is now self-healing — new test files get polyfill and cleanup automatically
- Navigation-rail tests are unblocked from animate crashes; they now surface real ARIA/keyDown failures to be fixed in Plan 03
- Plan 02 (button/chip component fixes) can proceed independently

---
*Phase: 01-foundation-repair*
*Completed: 2026-02-17*

## Self-Check: PASSED

- rstest.setup.ts: FOUND
- tests/navigation-bar.test.tsx: FOUND
- tests/navigation-rail.test.tsx: FOUND
- tests/time-picker.test.tsx: FOUND
- 01-01-SUMMARY.md: FOUND
- commit f06a606: FOUND
- commit 4ad45df: FOUND
