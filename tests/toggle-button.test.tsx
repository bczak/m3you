import { readFileSync } from 'node:fs';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { createRef } from 'react';
import { afterEach, expect, test, vi } from 'vitest';
import { ToggleButton } from '../src/components/ToggleButton/toggle-button';

afterEach(cleanup);

// happy-dom loads no CSS, so the selection-styling contract reads the stylesheet text.
const buttonCss = readFileSync('src/components/Button/button.css', 'utf8');

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

// =============================================================================
// ToggleButton — selection styling (Button stylesheet)
// =============================================================================

test('morphs on press by default and accepts morph={false}', () => {
  render(
    <>
      <ToggleButton>On</ToggleButton>
      <ToggleButton morph={false}>Off</ToggleButton>
    </>,
  );
  expect(screen.getByRole('button', { name: 'On' })).toHaveAttribute('data-morph', 'true');
  expect(screen.getByRole('button', { name: 'Off' })).not.toHaveAttribute('data-morph');
});

test('an outlined toggle fades its stroke with the fill when the selection changes', () => {
  // Selected=True drops the outline-variant stroke for an inverse-surface fill …
  expect(buttonCss).toMatch(
    /&\[data-selected="true"\]\[data-variant="outlined"\]\s*\{[^}]*background-color:\s*var\(--md-sys-color-inverse-surface\);[^}]*border-color:\s*transparent/,
  );
  // … so border-color must transition on the same timing as background-color, or the ring snaps.
  const transition = buttonCss.match(/\.md-button\s*\{[^{}]*?transition:([^;]*);/)?.[1] ?? '';
  const timing = (property: string) => transition.match(new RegExp(`(?:^|,)\\s*${property}\\s+([^,]+)`))?.[1].trim();
  expect(timing('border-color')).toBeDefined();
  expect(timing('border-color')).toBe(timing('background-color'));
});

test('selected and unselected elevated toggles keep the per-size elevation', () => {
  render(
    <ToggleButton variant="elevated" size="lg" defaultSelected>
      Elevated
    </ToggleButton>,
  );
  const button = screen.getByRole('button', { name: 'Elevated' });
  expect(button).toHaveAttribute('data-variant', 'elevated');
  expect(button).toHaveAttribute('data-size', 'lg');
  expect(button).toHaveAttribute('data-selected', 'true');
  for (const selected of ['true', 'false']) {
    const body = buttonCss.match(
      new RegExp(`&\\[data-selected="${selected}"\\]\\[data-variant="elevated"\\]\\s*\\{([^}]*)\\}`),
    )?.[1];
    expect(body).toBeDefined();
    expect(body).not.toMatch(/box-shadow/);
  }
});

test('a disabled selected outlined toggle keeps the on-surface 10% container without a stroke', () => {
  render(
    <ToggleButton variant="outlined" defaultSelected disabled>
      Disabled
    </ToggleButton>,
  );
  const button = screen.getByRole('button', { name: 'Disabled' });
  expect(button).toBeDisabled();
  expect(button).toHaveAttribute('data-selected', 'true');
  expect(buttonCss).toMatch(
    /&:is\(\[data-disabled\], :disabled\)\[data-variant="outlined"\] \{\s*background-color:\s*color-mix\(\s*in srgb,\s*var\(--md-sys-color-on-surface\) calc\(var\(--md-sys-state-disabled-container-opacity\) \* 100%\)/,
  );
  expect(buttonCss).toMatch(
    /&:is\(\[data-disabled\], :disabled\)\[data-selected="true"\]\[data-variant="outlined"\]\s*\{\s*border-color:\s*transparent/,
  );
});
