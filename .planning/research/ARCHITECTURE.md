# Architecture Research

**Domain:** React component library test suite + accessibility fixes (M3-Lib, 24 components)
**Researched:** 2026-02-17
**Confidence:** HIGH (based on direct codebase inspection + established testing-library patterns)

## Standard Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                     Test Suite Organization                          │
├─────────────────────────────────────────────────────────────────────┤
│  Tier 1: Presentational      │  Tier 2: Stateful Primitives         │
│  ┌──────────┐ ┌──────────┐   │  ┌──────────┐ ┌──────────┐          │
│  │ Divider  │ │CircProg  │   │  │  Badge   │ │  Button  │          │
│  │LinearPrg │ │ Toolbar  │   │  │IconButton│ │ Checkbox │          │
│  └──────────┘ └──────────┘   │  │  Card    │ │  Chip    │          │
│  No state. CVA variants only.│  │  Switch  │ │  Tabs    │          │
│  Pure rendering checks.      │  │ ExtFAB   │ └──────────┘          │
├──────────────────────────────┴──┴──────────────────────────────────┤
│  Tier 3: Compound / Context-Driven                                   │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐               │
│  │TextField │ │  NavBar  │ │  NavRail │ │ Snackbar │               │
│  │ Tooltip  │ │ FABMenu  │ └──────────┘ └──────────┘               │
│  └──────────┘ └──────────┘                                          │
│  Multiple sub-components. Context providers. Floating content.       │
├─────────────────────────────────────────────────────────────────────┤
│  Tier 4: Complex / Portal-Based                                      │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐                             │
│  │  Dialog  │ │DatePicker│ │TimePicker│                             │
│  │   Menu   │ └──────────┘ └──────────┘                             │
│  └──────────┘                                                        │
│  Portals. Focus traps. Keyboard nav. External primitives             │
│  (@base-ui/react). Animation (framer-motion). ARIA modal.           │
└─────────────────────────────────────────────────────────────────────┘
```

### Component Responsibilities

| Component | Tier | Test Complexity | Dependencies | Accessibility Surface |
|-----------|------|-----------------|-------------|----------------------|
| Divider | 1 | Low | None | `role="separator"`, `aria-orientation` |
| LinearProgress | 1 | Low | None | `role="progressbar"`, `aria-valuenow` |
| CircularProgress | 1 | Low | None | `role="progressbar"`, `aria-valuenow` |
| Toolbar | 1 | Low | None | `role="toolbar"`, `aria-label` |
| Badge / BadgeAnchor | 2 | Low | None | Count semantics, `aria-label` on anchor |
| Button | 2 | Low | m3-ripple | `disabled`, focus ring |
| IconButton | 2 | Low | m3-ripple | `aria-label` (required), `aria-pressed` |
| Card | 2 | Low | None | Semantic role (if interactive) |
| Checkbox | 2 | Medium | None | `role="checkbox"`, `aria-checked`, label association |
| Chip | 2 | Medium | m3-ripple | `role="option"` or `button`, `aria-selected` for filter |
| Switch | 2 | Medium | None | `role="switch"`, `aria-checked` |
| ExtendedFAB | 2 | Low | m3-ripple | `aria-label` |
| Tabs / Tab | 2 | Medium | m3-ripple | `role="tablist"/"tab"`, `aria-selected`, `aria-controls` |
| TextField | 3 | Medium | None | `aria-invalid`, `aria-describedby`, label `for` |
| NavigationBar | 3 | Medium | m3-ripple | `role="navigation"`, `aria-label`, `aria-current` |
| NavigationRail | 3 | Medium | m3-ripple | `role="navigation"`, `aria-label`, `aria-current` |
| Tooltip / RichTooltip | 3 | Medium | @base-ui/react | `role="tooltip"`, `aria-describedby` |
| FABMenu | 3 | Medium | m3-ripple | `aria-haspopup`, `aria-expanded`, `aria-controls` |
| Snackbar / SnackbarHost | 3 | Medium | sonner | `role="status"` or `aria-live="polite"` |
| Menu + subcomponents | 4 | High | Custom impl | Full menu pattern: `aria-haspopup`, `aria-expanded`, `aria-controls`, `role="menu"/"menuitem"` |
| Dialog + FullScreen | 4 | High | @base-ui/react | `role="dialog"`, `aria-modal`, `aria-labelledby`, focus trap |
| DatePicker | 4 | High | Custom impl | `role="dialog"`, calendar grid, date cell roles |
| TimePicker | 4 | High | Custom impl | `role="dialog"`, clock dial interactions |

## Recommended Project Structure

```
tests/
├── badge.test.tsx              # Tier 2 — done
├── button.test.tsx             # Tier 2 — done
├── button-group.test.tsx       # Tier 2 — done
├── divider.test.tsx            # Tier 1 — done
├── switch.test.tsx             # Tier 2 — done
├── text-field.test.tsx         # Tier 3 — done
├── navigation-bar.test.tsx     # Tier 3 — done (has pre-existing failures)
├── navigation-rail.test.tsx    # Tier 3 — done (has pre-existing failures)
├── menu.test.tsx               # Tier 4 — done
├── time-picker.test.tsx        # Tier 4 — done
├── tooltip.test.tsx            # Tier 3 — done
│
│   ── NOT YET COVERED ──
│
├── linear-progress.test.tsx    # Tier 1 — add first
├── circular-progress.test.tsx  # Tier 1 — add first
├── toolbar.test.tsx            # Tier 1 — add first
├── card.test.tsx               # Tier 2 — add second
├── icon-button.test.tsx        # Tier 2 — add second
├── checkbox.test.tsx           # Tier 2 — add second
├── chip.test.tsx               # Tier 2 — add second
├── tabs.test.tsx               # Tier 2 — add second
├── extended-fab.test.tsx       # Tier 2 — add second
├── snackbar.test.tsx           # Tier 3 — add third
├── fab-menu.test.tsx           # Tier 3 — add third
├── dialog.test.tsx             # Tier 4 — add fourth
└── date-picker.test.tsx        # Tier 4 — add fourth
```

### Structure Rationale

- **Tier 1 first:** No state, no context, no external dependencies. Quick wins. Establish the pattern for the milestone.
- **Tier 2 second:** Simple variants + some interactivity. Each adds one new test category (user events, role assertions).
- **Tier 3 third:** Compound components needing wrapper helpers. Build on patterns from Tier 2.
- **Tier 4 last:** Portals, focus traps, `@base-ui/react` internals. Need polyfills (Web Animations API already done in menu.test.tsx).

## Architectural Patterns

### Pattern 1: Flat Test Structure (no describe blocks)

**What:** All existing tests use top-level `test()` calls with section comment separators (`// === Section ===`). No nested `describe()` blocks.

**When to use:** All new test files should follow this pattern for consistency with the existing 11 test files.

**Trade-offs:** Less grouping structure than describe/it, but flatter output is easier to scan in Rstest output.

**Example:**
```typescript
import { afterEach, expect, test } from '@rstest/core';
import { cleanup, render, screen } from '@testing-library/react';

afterEach(() => { cleanup(); });

// ── Rendering ────────────────────────────────────────────────────────────────

test('renders with default variant', async () => {
  render(<Component />);
  expect(screen.getByRole('...')).toBeInTheDocument();
});

// ── Accessibility ─────────────────────────────────────────────────────────────

test('has correct aria attributes', async () => {
  render(<Component />);
  expect(screen.getByRole('...')).toHaveAttribute('aria-label', '...');
});
```

### Pattern 2: Web Animations API Polyfill

**What:** happy-dom does not implement the Web Animations API (`Element.prototype.animate`). Components using m3-ripple require this polyfill in `beforeAll`.

**When to use:** Any test file covering a component that includes `<Ripple />`. This includes: Button, IconButton, ExtendedFAB, NavigationBar items, NavigationRail items, Tabs, Chip, FABMenu items.

**Trade-offs:** Must be added manually per test file. Forgetting it causes silent failures where ripple initialization throws.

**Example:**
```typescript
import { afterEach, beforeAll, expect, test } from '@rstest/core';

beforeAll(() => {
  if (!Element.prototype.animate) {
    Element.prototype.animate = () =>
      ({ onfinish: null, cancel: () => {}, finished: Promise.resolve() }) as unknown as Animation;
  }
});
```

### Pattern 3: Controlled Wrapper for Stateful Components

**What:** For components that require controlled state in tests (pickers, dialogs, menus with open state), create a local wrapper component inside the test file rather than using `rerender`.

**When to use:** TimePicker, DatePicker, Dialog, FABMenu — any component where `open` is prop-driven and triggering via user events may not work in happy-dom.

**Trade-offs:** More setup per file, but tests are more readable and stable than `rerender`-based approaches.

**Example:**
```typescript
const ControlledDialog = ({ initialOpen = true }) => {
  const [open, setOpen] = React.useState(initialOpen);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger data-testid="trigger">Open</DialogTrigger>
      <DialogContent data-testid="content">
        <DialogTitle>Title</DialogTitle>
      </DialogContent>
    </Dialog>
  );
};
```

### Pattern 4: Role-Based Queries First, TestId as Fallback

**What:** Always query by ARIA role first (`getByRole`), fall back to `data-testid` only when role is ambiguous or the element has no role.

**When to use:** All test files. This validates accessibility semantics as a side effect of testing behavior.

**Trade-offs:** Sometimes requires adding correct roles to components (which is an accessibility fix itself).

**Example:**
```typescript
// Preferred
const dialog = screen.getByRole('dialog');
const button = screen.getByRole('button', { name: 'Save' });
const tab = screen.getByRole('tab', { name: 'Profile' });

// Fallback (acceptable for non-semantic wrappers)
const wrapper = screen.getByTestId('wrapper');
```

### Pattern 5: Accessibility-First Test Categories

**What:** Every new test file follows a standard set of test categories in order. Accessibility tests are not optional extras — they are a required section alongside rendering tests.

**When to use:** All new test files.

**Standard category order:**
1. Rendering (default state renders correctly)
2. Variants / Props (CVA variant classes applied)
3. States (disabled, error, selected, checked)
4. Accessibility (ARIA attributes, role semantics, label associations)
5. Keyboard interaction (for interactive components)
6. Ref forwarding
7. Custom className pass-through

## Data Flow

### Test Execution Flow

```
Rstest runner
    ↓
happy-dom environment (no real browser layout, no CSS computed styles)
    ↓
@testing-library/react render()
    ↓
Component tree (React 19) → DOM (happy-dom)
    ↓
screen queries (getByRole, getByTestId, getByText)
    ↓
jest-dom matchers (toHaveClass, toHaveAttribute, toBeInTheDocument)
```

### Constraint: No Computed Styles

happy-dom does not compute CSS. This means:
- `toHaveClass('bg-primary')` works (checks class string)
- Checking visual computed colors via `getComputedStyle` does NOT work
- All style assertions must be class-name based

### Constraint: No Layout

happy-dom has no layout engine. This means:
- Positioning tests (dropdown appears below trigger) cannot use viewport coordinates
- Positioning is tested indirectly via class names (`top-full`, `right-0`, etc.)
- `getBoundingClientRect()` returns zeros

### Accessibility Fix Integration Flow

```
Identify failing a11y test
    ↓
Add test asserting correct ARIA attribute / role / label
    ↓ (test fails — red)
Fix component source in src/components/ui/[name].tsx
    ↓ (test passes — green)
Verify fix does not break Storybook visual / existing tests
```

## Scaling Considerations

| Scale | Architecture Adjustments |
|-------|--------------------------|
| 11 components tested | Current state — flat test files, good pattern |
| 24 components tested | Add 13 new test files following identical pattern. No architecture change needed. |
| Accessibility audit pass | Run axe-core or similar against Storybook; use failing tests to drive fixes |

### Scaling Priorities

1. **Test coverage gap:** 13 of 24 components have no tests at all. Getting these to basic coverage is the first bottleneck before any accessibility work can be systematic.
2. **Accessibility depth:** After basic coverage exists, a second pass adds axe-core integration tests for WCAG-level violations (landmark roles, focus order, color contrast tokens).

## Anti-Patterns

### Anti-Pattern 1: Testing CSS Variables for Color

**What people do:** Assert `getComputedStyle(element).color === 'rgb(103, 80, 164)'` to verify M3 color tokens.

**Why it's wrong:** happy-dom does not resolve CSS custom properties (`--md-sys-color-primary`). These assertions always return empty string or zero values, making tests meaningless or always-passing.

**Do this instead:** Assert the Tailwind class name is present: `expect(element).toHaveClass('bg-primary')`. The color mapping from `bg-primary` → actual color is a Tailwind build concern, not a component test concern.

### Anti-Pattern 2: Skipping afterEach cleanup

**What people do:** Omit `afterEach(() => { cleanup(); })`, or add it to some files but not others.

**Why it's wrong:** Rendered component trees persist between tests in the same suite, causing DOM pollution. The `button.test.tsx` file already demonstrates this anti-pattern — it is missing `afterEach(cleanup)`, which causes some tests to see stale DOM from prior tests.

**Do this instead:** Every test file must have `afterEach(() => { cleanup(); })` as the first setup block after imports.

### Anti-Pattern 3: Grouping Accessibility Fixes with Unrelated Test Phases

**What people do:** Mix accessibility fixes into the same phase as new feature development or visual changes.

**Why it's wrong:** Accessibility fixes often require component source changes (adding `aria-*` attributes, wrapping in semantic elements). Mixing them with feature work makes rollbacks ambiguous and PRs hard to review.

**Do this instead:** Treat accessibility fixes as their own deliverable within each component phase. When writing tests for a component, fix any accessibility gaps found immediately — don't defer them to a separate "a11y phase."

### Anti-Pattern 4: Testing @base-ui/react Internals

**What people do:** Write tests that assert on internal ARIA attributes injected by `@base-ui/react` Dialog or Tooltip primitives (e.g., internal `data-side`, `data-state` attributes).

**Why it's wrong:** These are implementation details of an external library. They may change across patch versions, making tests brittle.

**Do this instead:** Test observable behavior (is content visible? does Escape close it?) and ARIA semantics that M3-Lib is responsible for (the `aria-label` passed to a trigger, the M3 class names on the popup).

### Anti-Pattern 5: Missing Ripple Polyfill in Ripple-Using Components

**What people do:** Write tests for Button, IconButton, Chip, NavigationBarItem, etc. without the Web Animations API polyfill.

**Why it's wrong:** m3-ripple calls `element.animate()` on mount. In happy-dom this throws, causing test failures that appear to be about the component under test but are actually about the environment.

**Do this instead:** Add the `beforeAll` polyfill block (see Pattern 2) to every test file where the component tree includes `<Ripple />`.

## Integration Points

### External Boundaries

| Boundary | Communication | Notes |
|----------|---------------|-------|
| m3-ripple ↔ component | `<Ripple />` rendered inside component | Requires Web Animations API polyfill in tests |
| @base-ui/react ↔ Dialog, Tooltip | Component wraps `DialogPrimitive.*` and `TooltipPrimitive.*` | Tests should not pierce into primitive internals; test M3-layer behavior only |
| sonner ↔ Snackbar | `SnackbarHost` renders `<SonnerToaster>` | Testing `snackbar()` imperative calls requires rendering `SnackbarHost` in test setup |
| framer-motion / motion ↔ FABMenu, DatePicker | Animation wrappers | happy-dom does not run animations; `AnimatePresence` children render synchronously; no `waitFor` needed for visibility |

## Component Coverage Map and Build Order

### Phase ordering rationale

Build test coverage bottom-up by complexity tier. Accessibility fixes discovered during testing are applied immediately in the same work unit.

```
Phase A — Tier 1 (Presentational): 3 components
  LinearProgress → CircularProgress → Toolbar
  Rationale: Zero external deps, zero state. Establish pattern for new devs.
  A11y concerns: progressbar role, aria-valuenow/min/max, aria-label on Toolbar

Phase B — Tier 2 (Stateful Primitives): 6 components
  IconButton → Card → Checkbox → Chip → ExtendedFAB → Tabs
  Rationale: All use CVA. IconButton must have aria-label. Chip has filter/input/assist
             semantic differences. Tabs has full tablist/tab/tabpanel pattern.
  A11y concerns: aria-label on IconButton (required per M3), aria-checked on Checkbox,
                 aria-selected on filter/input Chip, aria-selected + aria-controls on Tab

Phase C — Tier 3 (Compound): 2 components
  FABMenu → Snackbar
  Rationale: FABMenu is custom compound (like Menu but simpler). Snackbar needs
             SnackbarHost in test and tests the imperative snackbar() API.
  A11y concerns: FABMenu aria-haspopup/expanded/controls, Snackbar aria-live="polite"

Phase D — Tier 4 (Portal/Complex): 2 components
  Dialog → DatePicker
  Rationale: Dialog uses @base-ui/react — test at M3 layer only. DatePicker is largest
             component (calendar grid, year picker, modal variant, keyboard nav).
             TimePicker already has tests.
  A11y concerns: Dialog aria-modal + aria-labelledby, DatePicker role="gridcell" for
                 day cells, aria-selected for selected date, aria-disabled for
                 out-of-range dates

Pre-existing test failures (not in scope to introduce but must not worsen):
  button.test.tsx — missing cleanup, some class assertions may be stale
  navigation-bar.test.tsx — pre-existing failures
  navigation-rail.test.tsx — pre-existing failures
```

### Dependency ordering within phases

```
IconButton (before Chip, ExtendedFAB — both import IconButton internally)
Checkbox (independent — no deps on other components)
Card (independent)
Chip (independent, but inspect if it uses Button internally)
ExtendedFAB (imports Button internally — Button test must pass first)
Tabs (independent, uses m3-ripple — needs polyfill)
FABMenu (imports Button + IconButton — both must pass first)
Dialog (independent of other components)
DatePicker (independent, uses createPortal — not @base-ui)
```

## Sources

- Direct inspection of `/Users/monster/Work/m3-lib/src/components/ui/` (24 component files) — HIGH confidence
- Direct inspection of `/Users/monster/Work/m3-lib/tests/` (11 existing test files) — HIGH confidence
- Direct inspection of `/Users/monster/Work/m3-lib/package.json` (dependency versions) — HIGH confidence
- Established @testing-library/react patterns (role-based queries, cleanup) — HIGH confidence
- M3 accessibility spec knowledge for ARIA roles per component type — MEDIUM confidence (verify against material.io spec during implementation)

---
*Architecture research for: M3-Lib component library test suite and accessibility fixes*
*Researched: 2026-02-17*
