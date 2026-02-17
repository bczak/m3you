# Codebase Concerns

**Analysis Date:** 2026-02-17

## Known Test Failures

**Button variant assertions:**
- Issue: Tests expect `shadow-md` for elevated variant but actual output is `shadow-lg`; tests expect `border-outline` for outlined variant but actual output is `border-outline/40`
- Files: `tests/button.test.tsx`, `src/components/ui/button.tsx`
- Impact: Button tests fail despite components rendering with correct styling; inability to validate visual correctness
- Fix approach: Update test expectations to match actual CVA variant output in `button.tsx` (elevated uses `shadow-lg` not `shadow-md`; outlined uses `border-outline/40` not `border-outline`)

**NavigationBar and NavigationRail missing aria-label:**
- Issue: Tests expect `aria-label` attribute on NavigationBarItem and NavigationRailItem buttons but components don't add it
- Files: `tests/navigation-bar.test.tsx` (lines 111-119), `tests/navigation-rail.test.tsx` (lines 240-248), `src/components/ui/navigation-bar.tsx` (lines 155-165), `src/components/ui/navigation-rail.tsx`
- Impact: Missing accessibility attribute; keyboard navigation tests fail for Enter/Space key handling
- Fix approach: Add `aria-label={label}` prop to button element in both NavigationBarItem (line 156) and NavigationRailItem

**NavigationBar/Rail keyboard event handling:**
- Issue: Tests expect Enter and Space key presses to trigger value change, but `handleKeyDown` doesn't call the handler - only captures custom `onKeyDown` prop
- Files: `tests/navigation-bar.test.tsx` (lines 154-171, 173-190), `tests/navigation-rail.test.tsx` (lines 283-319), `src/components/ui/navigation-bar.tsx` (lines 129-131)
- Impact: Keyboard navigation for selection doesn't work; violates accessibility standard for button groups
- Fix approach: In both components, add Enter/Space key event handling in `handleKeyDown` to call `handleClick` similar to menu item pattern

**m3-ripple animation compatibility:**
- Issue: m3-ripple package attempts to use `element.animate()` API which is not available in happy-dom test environment
- Files: `node_modules/m3-ripple/dist/index.js:134`, triggered by `src/components/ui/navigation-rail.tsx`, `src/components/ui/time-picker.tsx`
- Symptoms: Uncaught TypeError in tests for NavigationRail and TimePicker when clicking/interacting with buttons that contain Ripple component
- Blocks: Tests for NavigationRail and TimePicker cannot run to completion
- Workaround: Mock or polyfill `Element.prototype.animate` in test setup; currently `rstest.setup.ts` doesn't provide this
- Fix approach: Add Web Animations API polyfill to `rstest.setup.ts` or mock implementation

## Complexity & Maintenance Concerns

**Large components with complex state:**
- Files: `src/components/ui/date-picker.tsx` (1141 lines), `src/components/ui/menu.tsx` (798 lines), `src/components/ui/time-picker.tsx` (617 lines)
- Why fragile: Large monolithic components with extensive internal state management, multiple context providers, and complex DOM traversal logic make them difficult to test and modify
- Safe modification: Break these into smaller subcomponents; extract state management hooks; use composition patterns
- Test coverage: date-picker and time-picker tests crash due to m3-ripple animation issues; menu.test.tsx has 50 passing tests but component is difficult to reason about

**Date/Time picker implementation complexity:**
- Files: `src/components/ui/date-picker.tsx` (calendar math, date parsing, month navigation), `src/components/ui/time-picker.tsx` (clock geometry, angle calculations, pointer tracking)
- Problem: Math-heavy components with calculations for calendar positions, clock angles, and pointer interactions lack detailed comments; off-by-one errors and edge cases are difficult to spot
- Examples: `getCalendarDays()` creates calendar grid with previous/next month days; `getAngleFromPoint()` for time selection uses trigonometry
- Improvement path: Add detailed comments explaining algorithm logic; create unit tests for helper functions separately from component tests

**Menu component keyboard and focus management:**
- Files: `src/components/ui/menu.tsx` (lines 100-350+)
- Why fragile: Complex keyboard navigation, focus trapping, and submenu interaction state; manual DOM traversal for item collection; type casting to `HTMLElement` without validation
- Safe modification: Use existing ARIA menu patterns; extract keyboard handler logic; test keyboard interactions thoroughly
- Test coverage: 50 passing tests but reflects happy path; edge cases around nested menus and focus management untested

## Type Safety & Validation Gaps

**Date/Time parsing without full validation:**
- Files: `src/components/ui/date-picker.tsx` (lines 61-72)
- Risk: `parseDate()` regex doesn't validate date ranges (e.g., February 30 could create invalid date that JavaScript coerces)
- Current check: After parsing, validates `date.getMonth() !== month || date.getDate() !== day` to catch invalid dates, which is defensive but not obvious
- Recommendation: Add explicit validation for month (0-11) and day (1-31) ranges before creating date object

**Type casting without guards:**
- Files: `src/components/ui/menu.tsx` (line 410): `(e as unknown as React.MouseEvent<HTMLButtonElement>)`
- Risk: Unsafe double cast indicates type mismatch in event handling; masks actual issue
- Recommendation: Fix event type at source; don't use `as unknown as` pattern

**Missing prop validation:**
- Files: `src/components/ui/text-field.tsx` (lines 20, 28-30)
- Risk: Component accepts `maxCharCount` prop without validating it's positive; accepts `type` with specific string union but no runtime guard
- Recommendation: Add defensive checks for prop validity

## Performance Concerns

**No memoization for expensive computations:**
- Files: `src/components/ui/date-picker.tsx` (getCalendarDays called on every render)
- Problem: `getCalendarDays()` is called in render path without memoization; creates new array and objects every render
- Improvement path: Use `useMemo` to cache calendar grid when year/month don't change

**No virtualization for long lists:**
- Files: `src/components/ui/menu.tsx` (lines 550+)
- Problem: Large menus with many items render all items in DOM even if off-screen
- Current: No visible signs of virtualization or lazy rendering
- Scaling limit: Performance will degrade with 100+ menu items

**Context updates cause full subtree re-renders:**
- Files: `src/components/ui/menu.tsx` (MenuContext, SubMenuContext)
- Problem: Context value changes on open/close/selection trigger re-render of all menu items
- Improvement path: Memoize context value; split contexts by update frequency

## Accessibility Issues

**Missing keyboard support in navigation components:**
- Currently failing: NavigationBar and NavigationRail don't respond to Enter/Space to select items
- Impact: Keyboard-only users cannot navigate
- Status: Known from test failures

**Menu role/aria patterns:**
- Files: `src/components/ui/menu.tsx`
- Implementation: Menu uses standard ARIA menu roles but lacks some attributes
- Recommendation: Verify against WAI-ARIA authoring practices for menu patterns

## Dependency Risks

**m3-ripple incompatibility with test environment:**
- Package: m3-ripple v1.1.3
- Risk: Uses Web Animations API (`element.animate()`) which happy-dom doesn't implement
- Impact: Cannot run interactive tests for components using ripple without workarounds
- Migration plan: Either patch happy-dom/test setup with polyfill, or use mock ripple in tests

**Tailwind CSS v4 / PostCSS integration:**
- Files: `rslib.config.ts`, `tailwind.config.*`, PostCSS config
- Risk: Relatively new Tailwind v4 may have edge cases; custom theme colors in globals.css use @theme directive
- Current: No known issues but limited production usage

**Base UI React (dependency v1.0.0):**
- Usage: Unknown/not visible in component code
- Risk: Being imported but may be unused; version 1.0.0 may have breaking changes in minor updates
- Recommendation: Verify if actually used; if not, consider removing

## Missing Features/Incomplete Implementation

**TimePicker orientation auto-detection:**
- Files: `src/components/ui/time-picker.tsx` (line 18: `Orientation = 'portrait' | 'landscape' | 'auto'`)
- Issue: Type includes 'auto' but implementation doesn't handle it
- Impact: Attempting to use `orientation="auto"` will not work as intended

**No disabled state in some components:**
- Files: Some navigation items accept `disabled` but may not be fully integrated
- Risk: Partial implementation could lead to unexpected behavior

## Code Quality Issues

**Biome lint suppressions without explanation:**
- Files: `src/components/ui/menu.tsx` (line 538: `biome-ignore lint/a11y/useSemanticElements`)
- Impact: Suppression has comment explaining why (fieldset styling), which is good practice - but shows linter conflicts exist
- Observation: Only one suppression found; generally good compliance

**Unused dependencies:**
- Files: Check `package.json`
- Potential: `motion` and `framer-motion` both imported; may be duplication
- Recommendation: Audit which one is actually used; remove duplicate

## Test Coverage Gaps

**Missing unit tests for helpers:**
- Files: `src/components/ui/date-picker.tsx` (helper functions like `getDaysInMonth`, `parseDate`, `isSameDay`)
- Risk: Math-heavy helpers lack focused unit tests; bugs go unnoticed
- Recommendation: Create separate test files for utility functions

**No E2E tests:**
- Risk: Integration across components (Menu + other components) untested in realistic scenarios
- Recommendation: Add E2E tests with storybook or similar

**Event edge cases:**
- Files: All components using pointer/keyboard events
- Risk: Edge cases like rapid clicks, key repeats, etc. not tested
- Recommendation: Add targeted tests for event edge cases

---

*Concerns audit: 2026-02-17*
