import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { createRef } from 'react';
import { afterEach, expect, test, vi } from 'vitest';

import { ExtendableFAB } from '../src/components/ExtendableFab/extendable-fab';

const originalResizeObserver = globalThis.ResizeObserver;

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  if (originalResizeObserver === undefined) {
    Reflect.deleteProperty(globalThis, 'ResizeObserver');
  } else {
    globalThis.ResizeObserver = originalResizeObserver;
  }
});

test('renders the collapsed FAB with default tokens, icon, label and ripple', () => {
  render(<ExtendableFAB data-testid="fab" icon={<span>icon</span>} label="Compose" />);

  const fab = screen.getByTestId('fab');
  expect(fab.tagName).toBe('BUTTON');
  expect(fab).toHaveAttribute('type', 'button');
  expect(fab).toHaveClass('md-extendable-fab');
  expect(fab).toHaveAttribute('data-variant', 'tonal');
  expect(fab).toHaveAttribute('data-size', 'md');
  expect(fab).not.toHaveAttribute('data-extended');
  expect(fab).not.toHaveAttribute('data-lowered');
  // Collapsed FAB with a string label exposes it as the accessible name.
  expect(fab).toHaveAttribute('aria-label', 'Compose');
  expect(fab.querySelector('.salty-ripple')).not.toBeNull();
  expect(fab.querySelector('.md-extendable-fab__icon')?.textContent).toBe('icon');
  expect(fab.querySelector('.md-extendable-fab__label')?.textContent).toBe('Compose');

  const content = fab.querySelector('.md-extendable-fab__content');
  expect(content).toHaveAttribute('aria-hidden', 'true');
});

test('merges custom className with the base class', () => {
  render(<ExtendableFAB data-testid="fab" className="custom" icon={<span>i</span>} label="L" />);
  expect(screen.getByTestId('fab')).toHaveClass('md-extendable-fab', 'custom');
});

test.each([
  'standard',
  'filled',
  'elevated',
  'tonal',
  'outlined',
  'text',
] as const)('supports the %s variant', (variant) => {
  render(<ExtendableFAB data-testid="fab" variant={variant} icon={<span>i</span>} label="L" />);
  expect(screen.getByTestId('fab')).toHaveAttribute('data-variant', variant);
});

test.each(['sm', 'md', 'lg'] as const)('supports the %s size', (size) => {
  render(<ExtendableFAB data-testid="fab" size={size} icon={<span>i</span>} label="L" />);
  expect(screen.getByTestId('fab')).toHaveAttribute('data-size', size);
});

test('lowered toggles the data-lowered attribute', () => {
  const { rerender } = render(<ExtendableFAB data-testid="fab" lowered icon={<span>i</span>} label="L" />);
  expect(screen.getByTestId('fab')).toHaveAttribute('data-lowered', 'true');

  rerender(<ExtendableFAB data-testid="fab" lowered={false} icon={<span>i</span>} label="L" />);
  expect(screen.getByTestId('fab')).not.toHaveAttribute('data-lowered');
});

test('extended exposes data-extended and reveals the content region', () => {
  render(<ExtendableFAB data-testid="fab" extended icon={<span>i</span>} label="Compose" />);

  const fab = screen.getByTestId('fab');
  expect(fab).toHaveAttribute('data-extended', 'true');
  // When extended the label is visible, so no auto aria-label is generated.
  expect(fab).not.toHaveAttribute('aria-label');
  const content = fab.querySelector('.md-extendable-fab__content');
  expect(content).not.toHaveAttribute('aria-hidden');
});

test('non-string labels do not produce an auto aria-label when collapsed', () => {
  render(<ExtendableFAB data-testid="fab" icon={<span>i</span>} label={<em>Compose</em>} />);
  expect(screen.getByTestId('fab')).not.toHaveAttribute('aria-label');
});

test('an explicit aria-label always wins', () => {
  render(<ExtendableFAB data-testid="fab" extended aria-label="Create new" icon={<span>i</span>} label="Compose" />);
  expect(screen.getByTestId('fab')).toHaveAttribute('aria-label', 'Create new');
});

test('forwards onTransitionEnd', () => {
  const handleTransitionEnd = vi.fn();
  render(<ExtendableFAB data-testid="fab" onTransitionEnd={handleTransitionEnd} icon={<span>i</span>} label="L" />);

  fireEvent.transitionEnd(screen.getByTestId('fab'));
  expect(handleTransitionEnd).toHaveBeenCalledTimes(1);
});

test('supports an object ref via setButtonRef', () => {
  const ref = createRef<HTMLButtonElement>();
  render(<ExtendableFAB ref={ref} data-testid="fab" icon={<span>i</span>} label="L" />);

  expect(ref.current).toBe(screen.getByTestId('fab'));
  expect(ref.current?.tagName).toBe('BUTTON');
});

test('supports a function ref via setButtonRef', () => {
  const received: Array<HTMLButtonElement | null> = [];
  const { unmount } = render(
    <ExtendableFAB
      ref={(node) => {
        received.push(node);
      }}
      data-testid="fab"
      icon={<span>i</span>}
      label="L"
    />,
  );

  expect(received[0]).toBe(screen.getByTestId('fab'));

  unmount();
  // The function ref is invoked with null on unmount.
  expect(received).toContain(null);
});

test('keeps widths null while the measured label has no width', () => {
  // Without a getBoundingClientRect override happy-dom reports width 0, so the
  // measure layout effect bails out and never assigns content widths.
  render(<ExtendableFAB data-testid="fab" extended icon={<span>i</span>} label="Compose" />);

  const content = screen.getByTestId('fab').querySelector('.md-extendable-fab__content') as HTMLElement;
  // contentStyle stays undefined, so no inline width is applied.
  expect(content.style.width).toBe('');
});

test('measures the label and applies content widths when measurable (collapsed)', () => {
  vi.spyOn(Element.prototype, 'getBoundingClientRect').mockReturnValue({
    width: 48,
    height: 0,
    top: 0,
    left: 0,
    right: 48,
    bottom: 0,
    x: 0,
    y: 0,
    toJSON: () => ({}),
  } as DOMRect);

  render(<ExtendableFAB data-testid="fab" icon={<span>i</span>} label="Compose" />);

  const content = screen.getByTestId('fab').querySelector('.md-extendable-fab__content') as HTMLElement;
  // Collapsed: content width collapses to 0 even though the label measured 48.
  expect(content.style.width).toBe('0px');
});

test('measures the label and applies content widths when extended', () => {
  vi.spyOn(Element.prototype, 'getBoundingClientRect').mockReturnValue({
    width: 64,
    height: 0,
    top: 0,
    left: 0,
    right: 64,
    bottom: 0,
    x: 0,
    y: 0,
    toJSON: () => ({}),
  } as DOMRect);

  render(<ExtendableFAB data-testid="fab" extended icon={<span>i</span>} label="Compose" />);

  const fab = screen.getByTestId('fab');
  const content = fab.querySelector('.md-extendable-fab__content') as HTMLElement;
  expect(content.style.width).toBe('64px');
  expect(fab.style.getPropertyValue('--_extendable-fab-visible-content-width')).toBe('64px');
});

test('re-measuring on window resize keeps a stable width and reacts to changes', () => {
  const rect = vi.spyOn(Element.prototype, 'getBoundingClientRect');
  rect.mockReturnValue({
    width: 40,
    height: 0,
    top: 0,
    left: 0,
    right: 40,
    bottom: 0,
    x: 0,
    y: 0,
    toJSON: () => ({}),
  } as DOMRect);

  render(<ExtendableFAB data-testid="fab" extended icon={<span>i</span>} label="Compose" />);

  const content = screen.getByTestId('fab').querySelector('.md-extendable-fab__content') as HTMLElement;
  expect(content.style.width).toBe('40px');

  // Same width on resize -> state object is reused (no change).
  act(() => {
    window.dispatchEvent(new Event('resize'));
  });
  expect(content.style.width).toBe('40px');

  // Different width on resize -> new state object is committed.
  rect.mockReturnValue({
    width: 90,
    height: 0,
    top: 0,
    left: 0,
    right: 90,
    bottom: 0,
    x: 0,
    y: 0,
    toJSON: () => ({}),
  } as DOMRect);
  act(() => {
    window.dispatchEvent(new Event('resize'));
  });
  expect(content.style.width).toBe('90px');
});

test('observes the label with a ResizeObserver when one is available', () => {
  const observe = vi.fn();
  const disconnect = vi.fn();
  const unobserve = vi.fn();
  class StubResizeObserver {
    observe = observe;
    disconnect = disconnect;
    unobserve = unobserve;
  }
  globalThis.ResizeObserver = StubResizeObserver as unknown as typeof ResizeObserver;

  const { unmount } = render(<ExtendableFAB data-testid="fab" icon={<span>i</span>} label="Compose" />);

  expect(observe).toHaveBeenCalledTimes(1);

  unmount();
  expect(disconnect).toHaveBeenCalledTimes(1);
});

test('works without a ResizeObserver implementation', () => {
  Reflect.deleteProperty(globalThis, 'ResizeObserver');

  expect(() => render(<ExtendableFAB data-testid="fab" icon={<span>i</span>} label="Compose" />)).not.toThrow();
  expect(screen.getByTestId('fab')).toBeInTheDocument();
});
