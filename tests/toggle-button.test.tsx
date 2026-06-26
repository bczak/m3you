import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { createRef } from 'react';
import { afterEach, expect, test, vi } from 'vitest';
import { ToggleButton } from '../src/components/ToggleButton/toggle-button';

afterEach(cleanup);

// =============================================================================
// ToggleButton — Uncontrolled
// =============================================================================

test('renders unselected by default and reflects state on the underlying button', () => {
  render(<ToggleButton>Toggle</ToggleButton>);
  const button = screen.getByRole('button', { name: 'Toggle' });
  expect(button).toHaveClass('md-button');
  expect(button).toHaveAttribute('data-selected', 'false');
  expect(button).toHaveAttribute('aria-pressed', 'false');
});

test('honours defaultSelected for the initial uncontrolled state', () => {
  render(<ToggleButton defaultSelected>Toggle</ToggleButton>);
  const button = screen.getByRole('button', { name: 'Toggle' });
  expect(button).toHaveAttribute('data-selected', 'true');
  expect(button).toHaveAttribute('aria-pressed', 'true');
});

test('toggles internal state on click and reports the new value', () => {
  const onSelectedChange = vi.fn();
  const onClick = vi.fn();
  render(
    <ToggleButton onSelectedChange={onSelectedChange} onClick={onClick}>
      Toggle
    </ToggleButton>,
  );
  const button = screen.getByRole('button', { name: 'Toggle' });
  fireEvent.click(button);
  expect(button).toHaveAttribute('aria-pressed', 'true');
  expect(onSelectedChange).toHaveBeenCalledWith(true);
  expect(onClick).toHaveBeenCalledTimes(1);
  fireEvent.click(button);
  expect(button).toHaveAttribute('aria-pressed', 'false');
  expect(onSelectedChange).toHaveBeenLastCalledWith(false);
});

test('does not throw without onSelectedChange or onClick handlers', () => {
  render(<ToggleButton>Toggle</ToggleButton>);
  const button = screen.getByRole('button', { name: 'Toggle' });
  expect(() => fireEvent.click(button)).not.toThrow();
  expect(button).toHaveAttribute('aria-pressed', 'true');
});

// =============================================================================
// ToggleButton — Controlled
// =============================================================================

test('controlled mode keeps the selected prop and does not self-update', () => {
  const onSelectedChange = vi.fn();
  render(
    <ToggleButton selected={false} onSelectedChange={onSelectedChange}>
      Toggle
    </ToggleButton>,
  );
  const button = screen.getByRole('button', { name: 'Toggle' });
  expect(button).toHaveAttribute('aria-pressed', 'false');
  fireEvent.click(button);
  // Reports the would-be next value but stays controlled by the prop
  expect(onSelectedChange).toHaveBeenCalledWith(true);
  expect(button).toHaveAttribute('aria-pressed', 'false');
});

test('controlled selected=true renders pressed', () => {
  render(
    <ToggleButton selected onSelectedChange={() => {}}>
      Toggle
    </ToggleButton>,
  );
  expect(screen.getByRole('button', { name: 'Toggle' })).toHaveAttribute('aria-pressed', 'true');
});

// =============================================================================
// ToggleButton — Pass-through & ref
// =============================================================================

test('passes through Button props', () => {
  render(<ToggleButton variant="tonal">Toggle</ToggleButton>);
  expect(screen.getByRole('button', { name: 'Toggle' })).toHaveAttribute('data-variant', 'tonal');
});

test('forwards ref to the button element', () => {
  const ref = createRef<HTMLButtonElement>();
  render(<ToggleButton ref={ref}>Toggle</ToggleButton>);
  expect(ref.current).toBeInstanceOf(HTMLButtonElement);
});
