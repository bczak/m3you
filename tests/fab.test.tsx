import { render, screen } from '@testing-library/react';
import { createRef } from 'react';
import { expect, test } from 'vitest';
import { ExtendableFAB } from '../src/components/ExtendableFab/extendable-fab';
import { ExtendedFAB } from '../src/components/ExtendedFab/extended-fab';
import { FAB } from '../src/components/Fab/fab';

test('renders FAB with the icon-button implementation', async () => {
  render(
    <FAB aria-label="Create">
      <span aria-hidden="true">+</span>
    </FAB>,
  );

  const button = screen.getByRole('button', { name: 'Create' });
  expect(button).toHaveClass('md-icon-button');
  expect(button).toHaveClass('md-fab');
  expect(button).toHaveAttribute('data-shape', 'square');
  expect(button).toHaveAttribute('data-width', 'default');
  expect(button).toHaveAttribute('data-size', 'md');
});

test('forwards refs through FAB', async () => {
  const ref = createRef<HTMLButtonElement>();

  render(
    <FAB ref={ref} aria-label="Create">
      <span aria-hidden="true">+</span>
    </FAB>,
  );

  expect(ref.current).toBeInstanceOf(HTMLButtonElement);
});

test('renders ExtendedFAB with the button implementation', async () => {
  render(<ExtendedFAB icon={<span aria-hidden="true">+</span>} label="Compose" />);

  const button = screen.getByRole('button', { name: 'Compose' });
  expect(button).toHaveClass('md-button');
  expect(button).toHaveClass('md-extended-fab');
  expect(button).toHaveAttribute('data-shape', 'square');
});

test('forwards refs through ExtendedFAB', async () => {
  const ref = createRef<HTMLButtonElement>();

  render(<ExtendedFAB ref={ref} icon={<span aria-hidden="true">+</span>} label="Compose" />);

  expect(ref.current).toBeInstanceOf(HTMLButtonElement);
});

test('keeps ExtendableFAB collapsed and uses the label as aria-label', async () => {
  const { container } = render(
    <ExtendableFAB extended={false} icon={<span aria-hidden="true">+</span>} label="Compose" />,
  );

  const button = screen.getByRole('button', { name: 'Compose' });
  expect(button).toHaveClass('md-extendable-fab');
  expect(button).not.toHaveAttribute('data-extended');
  expect(container.querySelector('.md-extendable-fab__content')).not.toBeNull();
});

test('renders ExtendableFAB label content when expanded', async () => {
  const { container } = render(<ExtendableFAB extended icon={<span aria-hidden="true">+</span>} label="Compose" />);

  const button = screen.getByRole('button', { name: 'Compose' });
  const label = container.querySelector('.md-extendable-fab__label');
  expect(button).toHaveAttribute('data-extended', 'true');
  expect(label).not.toBeNull();
  expect(label).toHaveTextContent('Compose');
});

test('keeps ExtendableFAB content mounted while collapsed for width animation', async () => {
  const { container, rerender } = render(
    <ExtendableFAB extended icon={<span aria-hidden="true">+</span>} label="Compose" />,
  );

  rerender(<ExtendableFAB extended={false} icon={<span aria-hidden="true">+</span>} label="Compose" />);

  const button = screen.getByRole('button', { name: 'Compose' });
  const content = container.querySelector('.md-extendable-fab__content');

  expect(button).not.toHaveAttribute('data-extended');
  expect(content).not.toBeNull();
  expect(content).toHaveAttribute('aria-hidden', 'true');
});

test('forwards refs through ExtendableFAB', async () => {
  const ref = createRef<HTMLButtonElement>();

  render(<ExtendableFAB ref={ref} extended icon={<span aria-hidden="true">+</span>} label="Compose" />);

  expect(ref.current).toBeInstanceOf(HTMLButtonElement);
});

// `fabSize` is the M3-facing alias ('small' | 'medium' | 'large'); it maps onto
// the internal 'sm' | 'md' | 'lg' scale and, when absent, `size` passes through.
test.each([
  ['large', 'lg'],
  ['medium', 'md'],
  ['small', 'md'],
] as const)('FAB fabSize=%s resolves to size=%s', async (fabSize, expected) => {
  render(<FAB aria-label="Create" fabSize={fabSize} />);

  expect(screen.getByRole('button', { name: 'Create' })).toHaveAttribute('data-size', expected);
});

test('FAB falls back to size when fabSize is absent', async () => {
  render(<FAB aria-label="Create" size="lg" />);

  expect(screen.getByRole('button', { name: 'Create' })).toHaveAttribute('data-size', 'lg');
});

test.each([
  ['large', 'lg'],
  ['medium', 'md'],
] as const)('ExtendedFAB fabSize=%s resolves to size=%s', async (fabSize, expected) => {
  render(<ExtendedFAB fabSize={fabSize} label="Compose" />);

  expect(screen.getByRole('button', { name: 'Compose' })).toHaveAttribute('data-size', expected);
});

// ExtendableFAB maps all three names explicitly rather than collapsing the
// non-large cases, so each arm needs its own case.
test.each([
  ['small', 'sm'],
  ['medium', 'md'],
  ['large', 'lg'],
] as const)('ExtendableFAB fabSize=%s resolves to size=%s', async (fabSize, expected) => {
  render(<ExtendableFAB fabSize={fabSize} icon={<span aria-hidden="true">+</span>} label="Compose" />);

  expect(screen.getByRole('button', { name: 'Compose' })).toHaveAttribute('data-size', expected);
});
