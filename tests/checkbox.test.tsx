import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { createRef } from 'react';
import { afterEach, expect, test, vi } from 'vitest';
import { Checkbox } from '../src/components/Checkbox/checkbox';

afterEach(cleanup);

// =============================================================================
// Checkbox — Default rendering
// =============================================================================

test('renders an unchecked checkbox with primary defaults', () => {
  const { container } = render(<Checkbox />);
  const label = container.querySelector('label.md-checkbox');
  expect(label).toBeInTheDocument();
  expect(label).toHaveAttribute('data-variant', 'primary');
  expect(label).not.toHaveAttribute('data-disabled');

  const input = screen.getByRole('checkbox');
  expect(input).toHaveAttribute('type', 'checkbox');
  expect(input).toHaveClass('md-checkbox__input');
  expect(input).not.toBeChecked();

  const box = container.querySelector('.md-checkbox__box');
  expect(box).toHaveAttribute('data-checked', 'false');
  expect(box).toHaveAttribute('data-variant', 'primary');
  expect(box).toHaveAttribute('aria-hidden', 'true');
  // No icon when unchecked / not indeterminate
  expect(container.querySelector('.md-checkbox__icon')).not.toBeInTheDocument();
});

// =============================================================================
// Checkbox — Checked
// =============================================================================

test('renders a checked checkbox with the check icon', () => {
  const { container } = render(<Checkbox checked />);
  expect(screen.getByRole('checkbox')).toBeChecked();
  const box = container.querySelector('.md-checkbox__box');
  expect(box).toHaveAttribute('data-checked', 'true');
  expect(container.querySelector('.md-checkbox__icon')).toBeInTheDocument();
});

// =============================================================================
// Checkbox — Indeterminate
// =============================================================================

test('renders an indeterminate checkbox and sets the indeterminate DOM property', () => {
  const { container } = render(<Checkbox indeterminate />);
  const input = screen.getByRole('checkbox') as HTMLInputElement;
  expect(input.indeterminate).toBe(true);
  const box = container.querySelector('.md-checkbox__box');
  // indeterminate counts as visually checked
  expect(box).toHaveAttribute('data-checked', 'true');
  expect(container.querySelector('.md-checkbox__icon')).toBeInTheDocument();
});

test('indeterminate takes precedence over checked', () => {
  const { container } = render(<Checkbox indeterminate checked />);
  const input = screen.getByRole('checkbox') as HTMLInputElement;
  expect(input.indeterminate).toBe(true);
  expect(container.querySelector('.md-checkbox__box')).toHaveAttribute('data-checked', 'true');
});

test('clearing indeterminate updates the DOM property', () => {
  const { rerender } = render(<Checkbox indeterminate />);
  const input = screen.getByRole('checkbox') as HTMLInputElement;
  expect(input.indeterminate).toBe(true);
  rerender(<Checkbox indeterminate={false} />);
  expect(input.indeterminate).toBe(false);
});

// =============================================================================
// Checkbox — Variant
// =============================================================================

test('applies the error variant to label and box', () => {
  const { container } = render(<Checkbox variant="error" />);
  expect(container.querySelector('label.md-checkbox')).toHaveAttribute('data-variant', 'error');
  expect(container.querySelector('.md-checkbox__box')).toHaveAttribute('data-variant', 'error');
});

// =============================================================================
// Checkbox — Disabled
// =============================================================================

test('applies disabled state to label and input', () => {
  const { container } = render(<Checkbox disabled />);
  expect(container.querySelector('label.md-checkbox')).toHaveAttribute('data-disabled', 'true');
  expect(screen.getByRole('checkbox')).toBeDisabled();
});

// =============================================================================
// Checkbox — Change handlers
// =============================================================================

test('calls onCheckedChange with the new checked state on change', () => {
  const onCheckedChange = vi.fn();
  render(<Checkbox checked={false} onCheckedChange={onCheckedChange} />);
  const input = screen.getByRole('checkbox');
  fireEvent.click(input);
  expect(onCheckedChange).toHaveBeenCalledTimes(1);
  expect(onCheckedChange).toHaveBeenCalledWith(true);
  expect(input).not.toBeChecked();
});

test('supports defaultChecked and composes both change callbacks', () => {
  const onChange = vi.fn();
  const onCheckedChange = vi.fn();
  render(<Checkbox defaultChecked onChange={onChange} onCheckedChange={onCheckedChange} />);

  const input = screen.getByRole('checkbox');
  expect(input).toBeChecked();
  fireEvent.click(input);

  expect(input).not.toBeChecked();
  expect(onChange).toHaveBeenCalledTimes(1);
  expect(onCheckedChange).toHaveBeenCalledWith(false);
});

test('does not throw when no change handlers are provided', () => {
  render(<Checkbox />);
  const input = screen.getByRole('checkbox');
  expect(() => fireEvent.click(input)).not.toThrow();
});

// =============================================================================
// Checkbox — Ref forwarding
// =============================================================================

test('forwards ref to the native input', () => {
  const ref = createRef<HTMLInputElement>();
  render(<Checkbox ref={ref} />);
  expect(ref.current).toBeInstanceOf(HTMLInputElement);
  expect(ref.current?.type).toBe('checkbox');
});

// =============================================================================
// Checkbox — className merge
// =============================================================================

test('merges custom className onto the label', () => {
  const { container } = render(<Checkbox className="custom" />);
  const label = container.querySelector('label.md-checkbox');
  expect(label).toHaveClass('md-checkbox');
  expect(label).toHaveClass('custom');
});
