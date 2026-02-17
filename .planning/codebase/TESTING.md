# Testing Patterns

**Analysis Date:** 2026-02-17

## Test Framework

**Runner:**
- Rstest v0.8.1 (community test framework)
- Config: `rstest.config.ts`
- DOM: happy-dom v20.4.0 for lightweight environment

**Setup:**
- Setup file: `rstest.setup.ts` extends jest-dom matchers with `@testing-library/jest-dom`
- Adapter: `@rstest/adapter-rslib` bridges Rstest with Rslib build system

**Assertion Library:**
- `expect()` from `@rstest/core`
- jest-dom matchers extended (`.toBeInTheDocument()`, `.toHaveClass()`, etc.)

**Run Commands:**
```bash
bun run test          # Run all tests
bun run test:watch   # Watch mode - rerun on changes
```

## Test File Organization

**Location:**
- Co-located in `tests/` directory (separate from source)
- Mirrors component hierarchy approximately (not strict 1:1)

**Naming:**
- Pattern: `{component-name}.test.tsx`
- Examples: `button.test.tsx`, `switch.test.tsx`, `text-field.test.tsx`

**File Structure:**
```
/Users/monster/Work/m3-lib/tests/
├── badge.test.tsx
├── button.test.tsx
├── button-group.test.tsx
├── checkbox.test.tsx (missing)
├── divider.test.tsx
├── menu.test.tsx
├── switch.test.tsx
├── text-field.test.tsx
├── time-picker.test.tsx
├── tooltip.test.tsx
├── navigation-bar.test.tsx (has pre-existing failures)
├── navigation-rail.test.tsx (has pre-existing failures)
└── test.d.ts
```

## Test Structure

**Imports Pattern:**
- Test framework: `import { expect, test, afterEach, beforeAll } from '@rstest/core'`
- React utilities: `import { render, screen, fireEvent, cleanup } from '@testing-library/react'`
- React internals: `import { createRef, useState } from 'react'`
- Component under test: relative import from src

Example from `tests/button.test.tsx`:
```typescript
import { expect, test } from '@rstest/core';
import { render, screen } from '@testing-library/react';
import { createRef } from 'react';
import { Button } from '../src/components/ui/button';
```

**Suite Organization:**
- No explicit test suites (no describe blocks)
- Tests are flat with `test('description', async () => {...})`
- Section comments group related tests (e.g., `// Variant tests`, `// Ref forwarding test`)

Example from `tests/button.test.tsx`:
```typescript
// Variant tests
test('renders with default variant (filled)', async () => {
  render(<Button>Click me</Button>);
  const button = screen.getByRole('button', { name: 'Click me' });
  expect(button).toBeInTheDocument();
});

// Shape tests
test('renders with default shape (round)', async () => {
  render(<Button>Round Button</Button>);
  const button = screen.getByRole('button', { name: 'Round Button' });
  expect(button).toHaveClass('rounded-[1.25rem]');
});
```

**Cleanup Pattern:**
- Always include `afterEach(() => cleanup())` when using event handlers or state
- Required when using fireEvent or when testing stateful interactions

Example from `tests/switch.test.tsx`:
```typescript
import { afterEach, expect, test } from '@rstest/core';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';

afterEach(() => {
  cleanup();
});
```

## Test Structure Examples

### Simple Component Testing (Stateless)
From `tests/divider.test.tsx`:
```typescript
test('renders as hr with implicit separator role', async () => {
  render(<Divider data-testid="divider" />);
  const divider = screen.getByTestId('divider');
  expect(divider.tagName).toBe('HR');
  expect(divider).toHaveRole('separator');
});

test('full-width variant has border-outline-variant and no margin classes', async () => {
  render(<Divider variant="full-width" data-testid="divider" />);
  const divider = screen.getByTestId('divider');
  expect(divider).toHaveClass('border-outline-variant');
  expect(divider).not.toHaveClass('ml-4');
});
```

### Interactive Component Testing (Stateful)
From `tests/switch.test.tsx`:
```typescript
test('calls onCheckedChange when clicked', async () => {
  let checkedState = false;
  render(
    <Switch
      checked={checkedState}
      onCheckedChange={(checked) => {
        checkedState = checked;
      }}
      data-testid="switch"
    />,
  );
  const input = screen.getByRole('switch');
  fireEvent.click(input);
  expect(checkedState).toBe(true);
});
```

### Controlled Component Helper
From `tests/time-picker.test.tsx`:
```typescript
const ControlledTimePicker = ({
  initialOpen = true,
  value = { hours: 10, minutes: 30 },
  format = '12h' as '12h' | '24h',
  headerLabel,
}: {
  initialOpen?: boolean;
  value?: { hours: number; minutes: number } | null;
  format?: '12h' | '24h';
  headerLabel?: string;
}) => {
  const [open, setOpen] = useState(initialOpen);
  const [time, setTime] = useState(value);
  return (
    <>
      <button type="button" onClick={() => setOpen(true)} data-testid="open-btn">
        Open
      </button>
      <span data-testid="time-display">{time ? `${time.hours}:${time.minutes}` : 'none'}</span>
      <TimePicker
        open={open}
        onOpenChange={setOpen}
        value={time}
        onChange={setTime}
        format={format}
        headerLabel={headerLabel}
      />
    </>
  );
};

test('renders dialog when open', async () => {
  render(<ControlledTimePicker />);
  const dialog = screen.getByRole('dialog');
  expect(dialog).toBeInTheDocument();
});
```

## Mocking

**Framework:**
- No explicit mocking library (Rstest/happy-dom provides basic support)
- Manual mocks created as needed with hand-written replacements

**Polyfills Required:**
- `Element.prototype.animate` required for m3-ripple Web Animations API
- Set up in `beforeAll` hook before tests run

Example from `tests/menu.test.tsx`:
```typescript
import { afterEach, beforeAll, expect, test } from '@rstest/core';

beforeAll(() => {
  if (!Element.prototype.animate) {
    Element.prototype.animate = () =>
      ({ onfinish: null, cancel: () => {}, finished: Promise.resolve() }) as unknown as Animation;
  }
});
```

**What to Mock:**
- External Web APIs not provided by happy-dom (e.g., Web Animations API)
- Only when absolutely necessary for test environment compatibility

**What NOT to Mock:**
- React internals (use real React)
- DOM elements (use happy-dom provided by test runner)
- Component internals (test via public API)

## Query Patterns

**Preferred Query Order:**
1. `screen.getByRole()` - Most accessible, follows user interaction model
   - `screen.getByRole('button', { name: 'Label' })`
   - `screen.getByRole('textbox')`
   - `screen.getByRole('switch')`

2. `screen.getByText()` - For labels and text content
   - `screen.getByText('Error message')`

3. `screen.getByTestId()` - When semantic queries unavailable
   - `screen.getByTestId('custom-element')`

4. `screen.queryByX()` - When testing absence
   - `screen.queryByText('text')` returns null if not found

**Query Patterns from Tests:**

From `tests/text-field.test.tsx`:
```typescript
const input = screen.getByRole('textbox');
const label = screen.getByText('Name');
const supportingEl = document.getElementById(describedBy);
const wrapper = document.querySelector('.test-wrapper');
```

From `tests/switch.test.tsx`:
```typescript
const input = screen.getByRole('switch');
const label = screen.getByRole('switch').closest('label');
const track = label?.querySelector('[data-track]');
```

## Fixtures and Factories

**Test Data:**
- Inline props for simple cases
- Helper components for complex state (see ControlledTimePicker above)
- No dedicated fixtures file; data lives with tests

**Factory Pattern:**
- Helper functions return test-ready components with state management
- Used for complex controlled components (TimePicker, DatePicker)

Example helper from `tests/text-field.test.tsx`:
```typescript
// Simple inline data
render(<TextField label="Email" />);

// No dedicated factories, but inline when needed
render(<TextField label="Bio" maxCharCount={100} defaultValue="Hello" />);
```

## Ref Forwarding Tests

**Pattern:**
- Create ref with `createRef<HTMLElement>()`
- Pass to component as ref prop
- Assert on ref.current properties

Example from `tests/button.test.tsx`:
```typescript
test('forwards ref correctly', async () => {
  const ref = createRef<HTMLButtonElement>();
  render(<Button ref={ref}>Ref Button</Button>);
  expect(ref.current).toBeInstanceOf(HTMLButtonElement);
});
```

From `tests/switch.test.tsx`:
```typescript
test('forwards ref correctly to input element', async () => {
  const ref = createRef<HTMLInputElement>();
  render(<Switch ref={ref} data-testid="switch" />);
  expect(ref.current).toBeInstanceOf(HTMLInputElement);
  expect(ref.current?.type).toBe('checkbox');
});
```

## Class Assertion Tests

**Tailwind Class Checks:**
- Assert presence: `expect(element).toHaveClass('class-name')`
- Assert absence: `expect(element).not.toHaveClass('class-name')`
- Multiple classes: chain multiple assertions or pass array

Example from `tests/button.test.tsx`:
```typescript
test('applies filled variant classes correctly', async () => {
  render(<Button variant="filled">Filled</Button>);
  const button = screen.getByRole('button', { name: 'Filled' });
  expect(button).toHaveClass('bg-primary');
  expect(button).toHaveClass('text-primary-foreground');
});
```

From `tests/switch.test.tsx`:
```typescript
test('track has correct M3 dimensions', async () => {
  render(<Switch data-testid="switch" />);
  const { track } = getTrackAndThumb();
  expect(track).toHaveClass('h-8'); // 32px
  expect(track).toHaveClass('w-[52px]');
  expect(track).toHaveClass('rounded-full');
});
```

## Event Testing

**Pattern:**
- Use `fireEvent` from @testing-library/react
- Fire on DOM element obtained from screen queries
- State assertions done on component props or external state variables

Example from `tests/switch.test.tsx`:
```typescript
test('calls onCheckedChange when clicked', async () => {
  let changedTo = false;
  render(
    <Switch
      onCheckedChange={(checked) => {
        changedTo = checked;
      }}
      data-testid="switch"
    />,
  );
  const input = screen.getByRole('switch');
  fireEvent.click(input);
  expect(changedTo).toBe(true);
});
```

From `tests/text-field.test.tsx`:
```typescript
test('label floats when input is focused', async () => {
  render(<TextField label="Name" />);
  const input = screen.getByRole('textbox');
  fireEvent.focus(input);
  const label = screen.getByText('Name');
  expect(label).toHaveClass('text-xs/4'); // Floating state
});

test('character counter updates on input', async () => {
  render(<TextField label="Bio" maxCharCount={50} />);
  const input = screen.getByRole('textbox');
  fireEvent.change(input, { target: { value: 'test' } });
  expect(screen.getByText('4 / 50')).toBeInTheDocument();
});
```

## Accessibility Testing

**Patterns:**
- Test ARIA attributes: `expect(element).toHaveAttribute('aria-invalid', 'true')`
- Test roles: `expect(element).toHaveRole('switch')`
- Test semantic relationships: `expect(label).toHaveAttribute('for', input.id)`

Example from `tests/text-field.test.tsx`:
```typescript
test('label is associated with input via htmlFor', async () => {
  render(<TextField label="Email" />);
  const input = screen.getByRole('textbox');
  const label = screen.getByText('Email');
  expect(label).toHaveAttribute('for', input.id);
});

test('aria-invalid is set when error', async () => {
  render(<TextField label="Email" error />);
  const input = screen.getByRole('textbox');
  expect(input).toHaveAttribute('aria-invalid', 'true');
});

test('aria-describedby links to supporting text', async () => {
  render(<TextField label="Email" supportingText="Enter email" />);
  const input = screen.getByRole('textbox');
  expect(input).toHaveAttribute('aria-describedby');
});
```

From `tests/menu.test.tsx`:
```typescript
test('renders trigger with correct ARIA attributes', async () => {
  render(
    <Menu>
      <MenuTrigger data-testid="trigger">Open</MenuTrigger>
      <MenuContent>
        <MenuItem>Item 1</MenuItem>
      </MenuContent>
    </Menu>,
  );
  const trigger = screen.getByTestId('trigger');
  expect(trigger).toHaveAttribute('aria-haspopup', 'menu');
  expect(trigger).toHaveAttribute('aria-expanded', 'false');
});
```

## Coverage

**Requirements:** Not enforced (no coverage threshold in config)

**View Coverage:**
- No coverage reporting configured in rstest.config.ts
- Use `bun run test --coverage` if coverage plugin installed (not currently)

## Test Types

**Unit Tests:**
- Single component in isolation
- Props combinations and variants
- State management (onChange, onCheckedChange callbacks)
- Ref forwarding
- Accessibility attributes

**Integration Tests:**
- Multiple components together (menu with trigger and content)
- Component composition (field with icons and counter)
- Context providers and shared state

**E2E Tests:** Not used in this repo

## Common Test Patterns

### Async/Await Pattern
All tests use `async` keyword (from Rstest):
```typescript
test('description', async () => {
  render(<Component />);
  // assertions
});
```

### Multiple Assertions Per Test
Group related assertions in single test:
```typescript
test('applies variant classes correctly', async () => {
  render(<Button variant="filled">Filled</Button>);
  const button = screen.getByRole('button');
  expect(button).toHaveClass('bg-primary');
  expect(button).toHaveClass('text-primary-foreground');
  expect(button).toHaveClass('relative'); // For ripple positioning
});
```

### Testing Conditional Rendering
Use `queryBy` to test absence, `getBy` for presence:
```typescript
test('shows error text and replaces supporting text', async () => {
  render(
    <TextField label="Email" supportingText="Enter email" errorText="Invalid" />
  );
  expect(screen.getByText('Invalid email')).toBeInTheDocument();
  expect(screen.queryByText('Enter your email')).not.toBeInTheDocument();
});
```

### Testing Event State Changes
Track external state during event:
```typescript
test('updates on value change', async () => {
  let capturedValue = '';
  render(
    <TextField
      label="Name"
      onValueChange={(v) => {
        capturedValue = v;
      }}
    />,
  );
  const input = screen.getByRole('textbox');
  fireEvent.change(input, { target: { value: 'hello' } });
  expect(capturedValue).toBe('hello');
});
```

### Testing Complex State
Use controlled component wrapper for multi-step interactions:
```typescript
const [open, setOpen] = useState(true);
const [value, setValue] = useState(initialValue);

render(
  <>
    <Modal open={open} onChange={setOpen}>
      <Form value={value} onChange={setValue} />
    </Modal>
  </>
);
// Test interactions with state wrapper
```

## Section Comments

Tests organize related assertions with section headers:

```typescript
// ── Basic Rendering ───────────────────────────────────────────────────────────
test('renders in unchecked state by default', async () => {...});
test('renders in checked state when checked prop is true', async () => {...});

// ── Variant tests ──────────────────────────────────────────────────────────────
test('applies variant classes correctly', async () => {...});

// ── Interaction tests ──────────────────────────────────────────────────────────
test('calls callback on change', async () => {...});

// ── Accessibility tests ────────────────────────────────────────────────────────
test('has correct role attribute', async () => {...});
test('has correct aria-checked attribute', async () => {...});
```

## Known Test Gaps

**Files Without Tests:**
- `src/components/ui/checkbox.tsx` - No test file exists
- Several other components lack comprehensive test coverage

**Pre-existing Test Failures:**
- `button.test.tsx` - Some tests may fail (documented in CLAUDE.md memory)
- `navigation-bar.test.tsx` - Pre-existing failures
- `navigation-rail.test.tsx` - Pre-existing failures

---

*Testing analysis: 2026-02-17*
