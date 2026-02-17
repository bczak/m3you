# Coding Conventions

**Analysis Date:** 2026-02-17

## Naming Patterns

**Files:**
- Component files: PascalCase with `.tsx` extension (e.g., `Button.tsx`, `TextField.tsx`)
- Utility files: camelCase with `.ts` extension (e.g., `utils.ts`)
- Story files: PascalCase with `.stories.tsx` extension (e.g., `Button.stories.tsx`)
- Test files: kebab-case with `.test.tsx` extension (e.g., `button.test.tsx`)
- Variant exports: camelCase suffix with `Variants` (e.g., `buttonVariants`, `switchTrackVariants`)

**Functions:**
- Component functions: PascalCase (e.g., `Button`, `Checkbox`, `TimePicker`)
- Helper functions: camelCase (e.g., `getNumberPosition`, `getAngleFromPoint`, `getDisplayValue`)
- CVA variant functions: camelCase with `Variants` suffix (e.g., `switchTrackVariants`, `dividerVariants`)
- Event handlers: prefixed with `handle` in camelCase (e.g., `handleChange`, `handleClick`)
- Callbacks passed as props: camelCase (e.g., `onCheckedChange`, `onValueChange`, `onOpenChange`)

**Variables:**
- Constants: UPPER_SNAKE_CASE for immutable values (e.g., `CLOCK`, `HOUR_24_OUTER`, `MINUTES`)
- Regular variables: camelCase (e.g., `isSmall`, `actualSize`, `selectedVariant`)
- Type/interface parameters: PascalCase (e.g., `TimePickerMode`, `Selection`, `Period`)
- State variables: camelCase (e.g., `checked`, `disabled`, `variant`)

**Types:**
- Component props type: `ComponentNameProps` (e.g., `ButtonProps`, `CheckboxProps`, `TextFieldProps`)
- Component type exports use Omit pattern (e.g., `Omit<React.ComponentProps<'button'>, 'type'>`)
- Variant props use `VariantProps<typeof variantName>` from CVA (e.g., `VariantProps<typeof buttonVariants>`)
- Union types for enums: quoted strings (e.g., `'12h' | '24h'`, `'top-right' | 'top-left'`)

## Code Style

**Formatting:**
- Line width: 120 characters
- Indent: 2 spaces
- Quote style: Single quotes for JavaScript strings
- Trailing commas: Enforced

**Linting:**
- Framework: Biome v2.3.13
- Rule config in: `biome.json`
- Key enforcement: `useSortedClasses` (Tailwind classes must be in sorted order)
- CSS modules and Tailwind directives enabled
- Recommended rules enabled with `nursery` rule set

**Biome Rules Applied:**
```json
{
  "formatter": { "indentStyle": "space", "lineWidth": 120 },
  "javascript": { "formatter": { "quoteStyle": "single" } },
  "linter": { "rules": { "recommended": true, "nursery": { "useSortedClasses": "error" } } }
}
```

## Import Organization

**Order:**
1. External packages from `node_modules` (e.g., `cva`, `lucide-react`, `m3-ripple`, `React`)
2. Internal utility imports with relative paths (e.g., `'../../lib/utils'`)
3. Organized by Biome's automatic import sorting (organizeImports enabled)

**Path Aliases:**
- No path aliases configured; all imports use relative paths
- Relative paths follow pattern: `../../lib/utils`, `../dialog`, `../../components/ui/button`

**Import Style:**
- Named imports preferred: `import { cva } from 'class-variance-authority'`
- Namespace imports for React: `import * as React from 'react'`
- Type imports explicit: `import type { VariantProps } from 'class-variance-authority'`

Example from `src/components/ui/button.tsx`:
```typescript
import { cva, type VariantProps } from 'class-variance-authority';
import { Ripple } from 'm3-ripple';
import * as React from 'react';

import { cn } from '../../lib/utils';
```

## Component Structure

**React.forwardRef Pattern:**
- All components use `React.forwardRef` for ref forwarding
- Signature: `React.forwardRef<HTMLElement, ComponentProps>((props, ref) => ...)`
- Set `displayName` property immediately after component definition

Example from `src/components/ui/checkbox.tsx`:
```typescript
const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, checked = false, ...props }, ref) => {
    // ...
    return <input ref={inputRef} {...props} />;
  },
);
Checkbox.displayName = 'Checkbox';
```

**CVA Integration:**
- Define variants first as const (e.g., `const buttonVariants = cva(...)`)
- Pass defaults within CVA config: `defaultVariants: { variant: 'filled', shape: 'round' }`
- Use `compoundVariants` for state combinations (e.g., `selected: true + shape: 'round'`)
- Merge classes with `cn()` utility in component JSX

Example from `src/components/ui/button.tsx`:
```typescript
const buttonVariants = cva('base-classes', {
  variants: { variant: {...}, shape: {...}, size: {...} },
  compoundVariants: [...],
  defaultVariants: { variant: 'filled', shape: 'round', size: 'sm' },
});

export type ButtonProps = React.ComponentProps<'button'> &
  Omit<VariantProps<typeof buttonVariants>, 'selected'> & {
    selected?: boolean;
  };

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'filled', ...props }, ref) => (
    <button className={cn(buttonVariants({ variant, className }))} {...props} />
  ),
);
```

**Exports:**
- Always export both component and variants: `export { Button, buttonVariants }`
- Always export component props type: `export type { ButtonProps }`
- Located at end of file after component definition

## Error Handling

**Error Boundaries:**
- No explicit error boundary pattern enforced; relies on React's default error handling
- Props validation happens at type level (TypeScript)

**Null Checks:**
- Conditional rendering: `{condition ? <Component /> : null}`
- Optional chaining: `obj?.property`
- Nullish coalescing for defaults: `value ?? defaultValue`
- No non-null assertions (`!`) enforced by Biome

**Props Validation:**
- Type safety enforced through TypeScript props interfaces
- Default values provided in CVA `defaultVariants` or function parameters

Example from `src/components/ui/badge.tsx`:
```typescript
const isSmall = size === 'small' || count === undefined || count === 0;
const getDisplayValue = () => {
  if (isSmall) return null;
  if (count !== undefined && count > max) return `${max}+`;
  return count?.toString();
};
if (!visible) return null;
```

## Logging

**Framework:** No logging framework; `console` methods not used in components
**Pattern:** Components are pure and rely on React DevTools for debugging
**Testing:** `console` output captured in test assertions when needed

## Comments

**When to Comment:**
- Document complex algorithms or math: See `time-picker.tsx` functions like `getNumberPosition`, `getAngleFromPoint`
- Clarify Material Design 3 specifications (e.g., M3 measurements in comments)
- Explain state management edge cases (e.g., indeterminate checkbox precedence over checked)
- Section dividers for logical groupings in longer files

**Pattern for Sections:**
```typescript
// ── Types ───────────────────────────────────────────────────────────────────

// ── Clock Constants ─────────────────────────────────────────────────────────

// ── Helpers ─────────────────────────────────────────────────────────────────

// ── CVA Variants ────────────────────────────────────────────────────────────
```

**JSDoc/TSDoc:**
- Used selectively for exported types and public APIs
- Inline comments explain parameter meaning and constraints

Example from `src/components/ui/badge.tsx`:
```typescript
export type BadgeProps = Omit<React.ComponentProps<'span'>, 'children'> &
  VariantProps<typeof badgeVariants> & {
    /** The count to display in the badge. If undefined or 0, shows a small dot badge. */
    count?: number;
    /** Maximum count to display before showing overflow (e.g., 999+). Defaults to 999. */
    max?: number;
    /** Whether to show the badge. Defaults to true. */
    visible?: boolean;
  };
```

**Block Comments:**
- Explain non-obvious logic or Material Design intent
- Located above the code they describe

Example from `src/components/ui/button.tsx`:
```typescript
// Only pass selected to variants if it's defined and variant is not 'text'
// (text buttons are not toggleable)
const selectedVariant = selected !== undefined && variant !== 'text' ? selected : undefined;
```

## SVG and Icon Usage

**Accessibility:**
- Decorative icons include `aria-hidden="true"` to hide from screen readers
- Icons from `lucide-react` package used throughout

Example from `src/components/ui/checkbox.tsx`:
```typescript
<span aria-hidden="true" className={cn('pointer-events-none', checkboxVariants(...))}>
  {indeterminate ? <Minus /> : checked ? <Check /> : null}
</span>
```

## Accessibility Requirements

**ARIA Attributes:**
- Use semantic HTML elements (button, input, label) when possible
- Add `aria-hidden="true"` to decorative SVG elements
- Use `aria-checked`, `aria-expanded`, `aria-invalid` for state
- Use `aria-describedby` for supporting text and help text links
- Use proper `role` attributes where needed (e.g., `role="switch"`)

**Screen Reader Only:**
- Utility class: `sr-only` for hidden native inputs

Example from `src/components/ui/checkbox.tsx`:
```typescript
<input
  ref={inputRef}
  type="checkbox"
  checked={checked}
  className="sr-only"
  {...props}
/>
```

## Tailwind CSS Patterns

**Class Sorting:**
- Enforced by Biome's `useSortedClasses` rule (must be error-level)
- Automatic class sorting by Tailwind's default order
- Responsive prefixes ordered: `xs:`, `sm:`, `md:`, `lg:`, etc.

**Color System:**
- Theme colors from M3 spec: `primary`, `secondary`, `tertiary`, `error`
- Surface containers: `surface-container-lowest`, `surface-container-low`, `surface-container-default`, `surface-container-high`, `surface-container-highest`
- Variants: `-foreground`, `-container`, `-container-foreground`, `-variant`
- Defined in `src/styles/globals.css` using Tailwind v4 `@theme` directive

**Dynamic Classes:**
- Use `cn()` utility (clsx + tailwind-merge) for conditional/dynamic classes
- Never pass undefined or false values directly to cn()

Example from `src/components/ui/checkbox.tsx`:
```typescript
className={cn(
  'group relative inline-flex size-12 cursor-pointer items-center justify-center',
  disabled && 'pointer-events-none opacity-38',
  className,
)}
```

---

*Convention analysis: 2026-02-17*
