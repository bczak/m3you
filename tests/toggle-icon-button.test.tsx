import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { createRef } from 'react';
import { afterEach, expect, test, vi } from 'vitest';
import { StandardButtonGroup } from '../src/components/ButtonGroup/standard-button-group';
import { ToggleIconButton } from '../src/components/ToggleIconButton/toggle-icon-button';

afterEach(cleanup);

// =============================================================================
// ToggleIconButton — Uncontrolled
// =============================================================================

test('renders unselected by default on the underlying icon button', () => {
  render(<ToggleIconButton aria-label="star" />);
  const button = screen.getByRole('button', { name: 'star' });
  expect(button).toHaveClass('md-icon-button');
  expect(button).toHaveAttribute('data-selected', 'false');
  expect(button).toHaveAttribute('aria-pressed', 'false');
});

test('honours defaultSelected for the initial uncontrolled state', () => {
  render(<ToggleIconButton defaultSelected aria-label="star" />);
  const button = screen.getByRole('button', { name: 'star' });
  expect(button).toHaveAttribute('data-selected', 'true');
  expect(button).toHaveAttribute('aria-pressed', 'true');
});

test('toggles internal state on click and reports the new value', () => {
  const onSelectedChange = vi.fn();
  const onClick = vi.fn();
  render(<ToggleIconButton aria-label="star" onSelectedChange={onSelectedChange} onClick={onClick} />);
  const button = screen.getByRole('button', { name: 'star' });
  fireEvent.click(button);
  expect(button).toHaveAttribute('aria-pressed', 'true');
  expect(onSelectedChange).toHaveBeenCalledWith(true);
  expect(onClick).toHaveBeenCalledTimes(1);
  fireEvent.click(button);
  expect(button).toHaveAttribute('aria-pressed', 'false');
  expect(onSelectedChange).toHaveBeenLastCalledWith(false);
});

test('does not throw without onSelectedChange or onClick handlers', () => {
  render(<ToggleIconButton aria-label="star" />);
  const button = screen.getByRole('button', { name: 'star' });
  expect(() => fireEvent.click(button)).not.toThrow();
  expect(button).toHaveAttribute('aria-pressed', 'true');
});

// =============================================================================
// ToggleIconButton — Controlled
// =============================================================================

test('controlled mode keeps the selected prop and does not self-update', () => {
  const onSelectedChange = vi.fn();
  render(<ToggleIconButton aria-label="star" selected={false} onSelectedChange={onSelectedChange} />);
  const button = screen.getByRole('button', { name: 'star' });
  expect(button).toHaveAttribute('aria-pressed', 'false');
  fireEvent.click(button);
  expect(onSelectedChange).toHaveBeenCalledWith(true);
  expect(button).toHaveAttribute('aria-pressed', 'false');
});

test('controlled selected=true renders pressed', () => {
  render(<ToggleIconButton aria-label="star" selected onSelectedChange={() => {}} />);
  expect(screen.getByRole('button', { name: 'star' })).toHaveAttribute('aria-pressed', 'true');
});

// =============================================================================
// ToggleIconButton — Pass-through & ref
// =============================================================================

test('passes through IconButton props', () => {
  render(<ToggleIconButton aria-label="star" variant="tonal" />);
  expect(screen.getByRole('button', { name: 'star' })).toHaveAttribute('data-variant', 'tonal');
});

test('a coloured standard toggle keeps its colour family while the selected state flips', () => {
  // The colour role only paints the selected state of a standard toggle (the
  // CSS resets data-selected="false" to on-surface-variant), so both attributes
  // must be present and track the toggle for that rule to apply.
  render(<ToggleIconButton aria-label="star" variant="standard" color="tertiary" />);
  const button = screen.getByRole('button', { name: 'star' });
  expect(button).toHaveAttribute('data-variant', 'standard');
  expect(button).toHaveAttribute('data-color', 'tertiary');
  expect(button).toHaveAttribute('data-selected', 'false');

  fireEvent.click(button);
  expect(button).toHaveAttribute('data-color', 'tertiary');
  expect(button).toHaveAttribute('data-selected', 'true');
  expect(button).toHaveAttribute('aria-pressed', 'true');
});

test('forwards ref to the button element', () => {
  const ref = createRef<HTMLButtonElement>();
  render(<ToggleIconButton aria-label="star" ref={ref} />);
  expect(ref.current).toBeInstanceOf(HTMLButtonElement);
});

// =============================================================================
// ToggleIconButton — Morph
// =============================================================================

test('morphs on press by default and opts out with morph={false}', () => {
  const { rerender } = render(<ToggleIconButton aria-label="star" />);
  expect(screen.getByRole('button', { name: 'star' })).toHaveAttribute('data-morph', 'true');

  rerender(<ToggleIconButton aria-label="star" morph={false} />);
  expect(screen.getByRole('button', { name: 'star' })).not.toHaveAttribute('data-morph');
});

test("follows a button group's morph instead of forcing it on", () => {
  render(
    <StandardButtonGroup morph={false}>
      <ToggleIconButton aria-label="star" />
    </StandardButtonGroup>,
  );
  expect(screen.getByRole('button', { name: 'star' })).not.toHaveAttribute('data-morph');
});
