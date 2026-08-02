import { readFileSync } from 'node:fs';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { createRef } from 'react';
import { afterEach, expect, test, vi } from 'vitest';
import { Switch } from '../src/components/Switch/switch';

const switchCss = readFileSync('src/components/Switch/switch.css', 'utf8');

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
test('exposes the unchecked primary track state to shipped CSS', async () => {
  render(<Switch variant="primary" data-testid="switch" />);
  const { track } = getTrackAndThumb();
  expect(track).toHaveAttribute('data-variant', 'primary');
  expect(track).toHaveAttribute('data-checked', 'false');
});

test('renders primary variant track styles when checked', async () => {
  render(<Switch variant="primary" checked data-testid="switch" />);
  const { track } = getTrackAndThumb();
  expect(track).toHaveAttribute('data-variant', 'primary');
  expect(track).toHaveAttribute('data-checked', 'true');
});

test('renders error variant track styles when unchecked', async () => {
  render(<Switch variant="error" data-testid="switch" />);
  const { track } = getTrackAndThumb();
  expect(track).toHaveAttribute('data-variant', 'error');
  expect(track).toHaveAttribute('data-checked', 'false');
});

test('renders error variant track styles when checked', async () => {
  render(<Switch variant="error" checked data-testid="switch" />);
  const { track } = getTrackAndThumb();
  expect(track).toHaveAttribute('data-variant', 'error');
  expect(track).toHaveAttribute('data-checked', 'true');
});

// Size tests (track dimensions)
test('track has correct M3 dimensions in shipped CSS', async () => {
  render(<Switch data-testid="switch" />);
  const { track } = getTrackAndThumb();
  expect(track).toHaveClass('md-switch__track');
  expect(switchCss).toContain('height: 32px;\n  width: 52px;');
  expect(switchCss).toContain('border-radius: calc(32px / 2)');
});

// Thumb tests
test('thumb is smaller when unchecked without icon', async () => {
  render(<Switch data-testid="switch" />);
  const { thumb } = getTrackAndThumb();
  expect(thumb).toHaveAttribute('data-checked', 'false');
  expect(thumb).toHaveAttribute('data-with-icon', 'false');
});

test('thumb is larger when checked', async () => {
  render(<Switch checked data-testid="switch" />);
  const { thumb } = getTrackAndThumb();
  expect(thumb).toHaveAttribute('data-checked', 'true');
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
  expect(thumb).toHaveAttribute('data-with-icon', 'true');
  expect(thumb).toHaveAttribute('data-checked', 'false');
});

// Disabled state tests
test('renders disabled state correctly', async () => {
  render(<Switch disabled data-testid="switch" />);
  const input = screen.getByRole('switch');
  const { label } = getTrackAndThumb();
  expect(input).toBeDisabled();
  expect(label).toHaveAttribute('data-disabled');
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

test('native input uses the canonical visually-hidden class', async () => {
  render(<Switch data-testid="switch" />);
  const input = screen.getByRole('switch');
  expect(input).toHaveClass('md-switch__input');
  expect(switchCss).toContain('clip: rect(0, 0, 0, 0)');
});

// Custom className test
test('accepts custom className', async () => {
  render(<Switch className="custom-class" data-testid="switch" />);
  const { label } = getTrackAndThumb();
  expect(label).toHaveClass('custom-class');
});

// Transition classes test
test('has tokenized transitions for animations', async () => {
  render(<Switch data-testid="switch" />);
  const { track } = getTrackAndThumb();
  expect(track).toHaveClass('md-switch__track');
  expect(switchCss).toContain(
    'background-color var(--md-sys-motion-duration-short2) var(--md-sys-motion-easing-standard)',
  );
});

// Focus ring test
test('has a visible focus outline for keyboard navigation', async () => {
  render(<Switch data-testid="switch" />);
  const { label } = getTrackAndThumb();
  expect(label).toHaveClass('md-switch');
  expect(switchCss).toContain('&:has(input:focus-visible) {');
  expect(switchCss).toContain('outline: 2px solid var(--md-sys-color-primary)');
});

// State layer tests
test('has state layer for hover effects', async () => {
  render(<Switch data-testid="switch" />);
  const { label } = getTrackAndThumb();
  const stateLayer = label?.querySelector('.md-switch__state-layer');
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
  expect(track).toHaveAttribute('data-variant', 'error');
  expect(track).toHaveAttribute('data-checked', 'true');
  expect(ref.current).toBeInstanceOf(HTMLInputElement);
  expect(document.querySelectorAll('svg').length).toBe(2);

  fireEvent.click(input);
  expect(checkedState).toBe(false);
});
