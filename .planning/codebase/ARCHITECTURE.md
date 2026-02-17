# Architecture

**Analysis Date:** 2026-02-17

## Pattern Overview

**Overall:** Component Library with Variant-Driven Styling

**Key Characteristics:**
- Single-responsibility components using Class Variance Authority (CVA) for variant management
- Declarative styling via Tailwind CSS v4 with theme variables
- Composable patterns for complex components using React Context
- Forwardable refs for all components via `React.forwardRef`
- Ripple effects from external `m3-ripple` package integrated into interactive components
- Material Design 3 (M3) specification compliance with M3 color tokens and measurements

## Layers

**Component Layer:**
- Purpose: Render interactive UI elements following Material Design 3 specifications
- Location: `src/components/ui/`
- Contains: Button, TextField, Checkbox, Navigation components, Dialog, Menu, Snackbar, etc.
- Depends on: CVA for variants, Ripple for effects, utilities (cn), theme colors from CSS
- Used by: Public API exported from `src/index.tsx`, Storybook stories, applications consuming the library

**Utility Layer:**
- Purpose: Provide reusable helper functions for class merging and styling
- Location: `src/lib/utils.ts`
- Contains: `cn()` utility function (clsx + tailwind-merge)
- Depends on: clsx, tailwind-merge
- Used by: All components

**Styling Layer:**
- Purpose: Define theme colors, animations, and M3-specific CSS rules
- Location: `src/styles/globals.css`
- Contains: Tailwind theme variables via @theme directive, keyframe animations, data-attribute pseudo-selectors for connected shapes
- Depends on: Tailwind CSS v4
- Used by: All components via Tailwind class utilities

## Data Flow

**Simple Components (Button, Badge, Icon Button):**

1. Props passed to component → defaultVariants merged with provided props
2. CVA processes variants + compoundVariants → generates className string
3. className merged with custom className via `cn()` → tailwind-merge handles conflicts
4. Component renders with final merged class string
5. Ripple component inserted for interactive feedback

**Stateful Components (TextField, Checkbox, NavigationBar):**

1. Props received → internal state initialized (focus, value, checked status)
2. Event handlers (onChange, onFocus, onBlur) update internal state
3. State used to compute derived values (floating label position, visual checked state)
4. Conditional data-attributes set on container (data-focused, data-error, data-populated)
5. CSS and classes apply based on data-attributes and variant combinations
6. Parent callbacks invoked via `onValueChange`, `onCheckedChange`, `onValueChange` props

**Context-Based Components (NavigationBar, Menu):**

1. Root component creates context with shared state (current value, onValueChange callback)
2. Child components consume context via custom hook (useNavigationBar, useMenu)
3. Child click handlers call parent's onValueChange through context
4. Parent component re-renders, updates context value, children re-render to show selected state
5. No two-way binding — parent controls value, children notify parent of changes

**State Management:**

- **Uncontrolled (internal):** TextField, Checkbox maintain internal state until controlled prop provided
- **Controlled (external):** When value/checked prop provided, internal state ignored
- **Dual control:** Components support both patterns simultaneously (isControlled check)
- **Context propagation:** NavigationBar, Menu, Dialog pass selection state via React Context
- **Imperative API:** Snackbar exported as function `snackbar()` using Sonner toast library

## Key Abstractions

**CVA Pattern:**
- Purpose: Encapsulate variant logic separate from component logic
- Examples: `buttonVariants`, `checkboxVariants`, `textFieldVariants`
- Pattern: Define base classes + variants object + compoundVariants + defaultVariants, then pass to component via className

**Component Props Extension:**
- Purpose: Extend native HTML element props while adding custom M3-specific props
- Examples: `type TextFieldProps = Omit<React.ComponentProps<'input'>, 'type'> & { label?: string, error?: boolean }`
- Pattern: Spread native HTML props separately from custom props to maintain native behavior

**Ripple Effect Integration:**
- Purpose: Add Material Design ripple feedback to interactive components
- Examples: Button, Checkbox, IconButton all include `<Ripple />`
- Pattern: Import from `m3-ripple` package, insert as child element within interactive surface

**Context + Custom Hook Pattern:**
- Purpose: Share selection state between parent and children without prop drilling
- Examples: NavigationBar/NavigationBarItem, Menu/MenuItem, Dialog tree
- Pattern: Create context, export custom hook for error handling, Provider wraps children

**Forwarded Refs:**
- Purpose: Allow parent components access to underlying DOM elements
- Examples: All components use `React.forwardRef<HTMLElement, Props>`
- Pattern: Forward ref to native HTML element or custom component ref

## Entry Points

**Library Export:**
- Location: `src/index.tsx`
- Triggers: Import from 'm3you' or './dist/index.js'
- Responsibilities: Re-export all components and variants, export utility `cn()`, import global styles once

**Individual Component:**
- Location: `src/components/ui/[component-name].tsx`
- Triggers: Direct import from package
- Responsibilities: Define CVA variants, implement component logic, export both component and variants

**Styles:**
- Location: `src/styles/globals.css`
- Triggers: Imported by `src/index.tsx` or explicitly imported in consuming app
- Responsibilities: Apply theme colors, animations, and data-attribute selectors needed by all components

## Error Handling

**Strategy:** Defensive with clear error boundaries

**Patterns:**
- Context consumption validates context exists before using: `if (!context) throw new Error('Component must be within Provider')`
- Indeterminate checkbox managed via ref imperative handle to set `input.indeterminate = true`
- Invalid combinations handled via compoundVariants (e.g., text buttons ignore selected prop)
- No explicit error states in most components — rely on error prop + CSS classes to signal errors (TextField, form context)

## Cross-Cutting Concerns

**Logging:** None — no logging implementation in component layer

**Validation:**
- HTML5 native validation used where applicable (text input type, disabled attribute)
- TextField includes maxCharCount with character display
- DatePicker/TimePicker include min/max input validation
- No client-side validation library — validation handled by consuming app or HTML5

**Authentication:** Not applicable — component library is UI-only, no auth integration

**Accessibility:**
- Hidden inputs with sr-only class for form controls (Checkbox, RadioButton if present)
- aria-label on icon buttons and close buttons
- aria-live="polite" on Snackbar for notifications
- aria-hidden="true" on decorative SVG icons
- Form controls connected via htmlFor and id attributes
- Dialog follows WAI-ARIA dialog pattern via @base-ui/react
- Navigation components use proper semantic HTML (nav, role="navigation")

**Styling/Theme:**
- All colors reference CSS custom properties (--color-primary, etc.) defined in globals.css
- Tailwind @theme directive provides M3 color system
- No inline styles — purely CSS/Tailwind classes
- Shape rules (border-radius morphing) handled via CSS pseudo-selectors on data-attributes

