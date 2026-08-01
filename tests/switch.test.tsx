import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { createRef } from 'react';
import { afterEach, expect, test, vi } from 'vitest';
import { Switch } from '../src/components/ui/switch';

// Cleanup after each test to prevent DOM pollution
afterEach(() => {
  cleanup();
});

// Helper to get track and thumb elements
const getTrackAndThumb = () => {
  const label = screen.getByRole('switch').closest('label');
  const track = label?.querySelector('[data-track]');
  const thumb = label?.querySelector('[data-thumb]');
  return { label, track, thumb };
};

// Basic rendering tests
test('renders switch in unchecked state by default', async () => {
  render(<Switch data-testid="switch" />);
  const input = screen.getByRole('switch');
  expect(input).toBeInTheDocument();
  expect(input).not.toBeChecked();
});

test('renders switch in checked state when checked prop is true', async () => {
  render(<Switch checked data-testid="switch" />);
  const input = screen.getByRole('switch');
  expect(input).toBeChecked();
});

// Variant tests
test('renders primary variant track styles when unchecked', async () => {
  render(<Switch variant="primary" data-testid="switch" />);
  const { track } = getTrackAndThumb();
  expect(track).toHaveClass('border-outline');
  expect(track).toHaveClass('bg-surface-container-highest');
});

test('renders primary variant track styles when checked', async () => {
  render(<Switch variant="primary" checked data-testid="switch" />);
  const { track } = getTrackAndThumb();
  expect(track).toHaveClass('border-primary');
  expect(track).toHaveClass('bg-primary');
});

test('renders error variant track styles when unchecked', async () => {
  render(<Switch variant="error" data-testid="switch" />);
  const { track } = getTrackAndThumb();
  expect(track).toHaveClass('border-error');
  expect(track).toHaveClass('bg-surface-container-highest');
});

test('renders error variant track styles when checked', async () => {
  render(<Switch variant="error" checked data-testid="switch" />);
  const { track } = getTrackAndThumb();
  expect(track).toHaveClass('border-error');
  expect(track).toHaveClass('bg-error');
});

// Size tests (track dimensions)
test('track has correct M3 dimensions', async () => {
  render(<Switch data-testid="switch" />);
  const { track } = getTrackAndThumb();
  expect(track).toHaveClass('h-8'); // 32px
  expect(track).toHaveClass('w-[52px]');
  expect(track).toHaveClass('rounded-full');
});

// Thumb tests
test('thumb is smaller when unchecked without icon', async () => {
  render(<Switch data-testid="switch" />);
  const { thumb } = getTrackAndThumb();
  expect(thumb).toHaveClass('size-4'); // 16px
});

test('thumb is larger when checked', async () => {
  render(<Switch checked data-testid="switch" />);
  const { thumb } = getTrackAndThumb();
  expect(thumb).toHaveClass('size-6'); // 24px
});

// Icon tests
test('does not show icons by default', async () => {
  render(<Switch data-testid="switch" />);
  const svg = document.querySelector('svg');
  // Icons are rendered but hidden with scale-0
  expect(svg).toBeNull();
});

test('shows icons when showIcons is true', async () => {
  render(<Switch showIcons data-testid="switch" />);
  const svgs = document.querySelectorAll('svg');
  expect(svgs.length).toBe(2); // Check and X icons
});

test('thumb is larger when unchecked with icons', async () => {
  render(<Switch showIcons data-testid="switch" />);
  const { thumb } = getTrackAndThumb();
  expect(thumb).toHaveClass('size-6'); // 24px with icon
});

// Disabled state tests
test('renders disabled state correctly', async () => {
  render(<Switch disabled data-testid="switch" />);
  const input = screen.getByRole('switch');
  const { label } = getTrackAndThumb();
  expect(input).toBeDisabled();
  expect(label).toHaveClass('opacity-38');
  expect(label).toHaveClass('pointer-events-none');
});

test('does not call onCheckedChange when disabled', async () => {
  let changed = false;
  render(
    <Switch
      disabled
      onCheckedChange={() => {
        changed = true;
      }}
      data-testid="switch"
    />,
  );
  const input = screen.getByRole('switch');
  fireEvent.click(input);
  expect(changed).toBe(false);
});

// Interaction tests
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

test('composes native onChange with onCheckedChange and uncontrolled state', () => {
  const onChange = vi.fn();
  const onCheckedChange = vi.fn();
  render(<Switch onChange={onChange} onCheckedChange={onCheckedChange} />);

  const input = screen.getByRole('switch');
  fireEvent.click(input);

  expect(input).toBeChecked();
  expect(onChange).toHaveBeenCalledTimes(1);
  expect(onCheckedChange).toHaveBeenCalledWith(true);
});

test('toggles state when label is clicked', async () => {
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
  const { label } = getTrackAndThumb();
  if (label) {
    fireEvent.click(label);
  }
  expect(checkedState).toBe(true);
});

// Ref forwarding test
test('forwards ref correctly to input element', async () => {
  const ref = createRef<HTMLInputElement>();
  render(<Switch ref={ref} data-testid="switch" />);
  expect(ref.current).toBeInstanceOf(HTMLInputElement);
  expect(ref.current?.type).toBe('checkbox');
});

// Accessibility tests
test('has correct role attribute', async () => {
  render(<Switch data-testid="switch" />);
  const input = screen.getByRole('switch');
  expect(input).toHaveAttribute('role', 'switch');
});

test('has correct aria-checked attribute when unchecked', async () => {
  render(<Switch data-testid="switch" />);
  const input = screen.getByRole('switch');
  expect(input).toHaveAttribute('aria-checked', 'false');
});

test('has correct aria-checked attribute when checked', async () => {
  render(<Switch checked data-testid="switch" />);
  const input = screen.getByRole('switch');
  expect(input).toHaveAttribute('aria-checked', 'true');
});

test('native input is screen reader only', async () => {
  render(<Switch data-testid="switch" />);
  const input = screen.getByRole('switch');
  expect(input).toHaveClass('sr-only');
});

// Custom className test
test('accepts custom className', async () => {
  render(<Switch className="custom-class" data-testid="switch" />);
  const { label } = getTrackAndThumb();
  expect(label).toHaveClass('custom-class');
});

// Transition classes test
test('has transition classes for animations', async () => {
  render(<Switch data-testid="switch" />);
  const { track } = getTrackAndThumb();
  expect(track).toHaveClass('transition-all');
  expect(track).toHaveClass('duration-300');
  expect(track).toHaveClass('ease-out');
});

// Focus ring test
test('has focus ring classes for keyboard navigation', async () => {
  render(<Switch data-testid="switch" />);
  const { track } = getTrackAndThumb();
  expect(track).toHaveClass('focus-visible:ring-2');
  expect(track).toHaveClass('focus-visible:ring-ring');
});

// State layer tests
test('has state layer for hover effects', async () => {
  render(<Switch data-testid="switch" />);
  const { label } = getTrackAndThumb();
  const stateLayer = label?.querySelector('.size-10.rounded-full');
  expect(stateLayer).toBeInTheDocument();
});

// Combined props test
test('works with all props combined', async () => {
  let checkedState = true;
  const ref = createRef<HTMLInputElement>();

  render(
    <Switch
      ref={ref}
      checked={checkedState}
      variant="error"
      showIcons
      onCheckedChange={(checked) => {
        checkedState = checked;
      }}
      className="custom-combined-class"
      data-testid="switch"
    />,
  );

  const input = screen.getByRole('switch');
  const { label, track } = getTrackAndThumb();

  expect(input).toBeChecked();
  expect(label).toHaveClass('custom-combined-class');
  expect(track).toHaveClass('bg-error');
  expect(ref.current).toBeInstanceOf(HTMLInputElement);
  expect(document.querySelectorAll('svg').length).toBe(2);

  fireEvent.click(input);
  expect(checkedState).toBe(false);
});
