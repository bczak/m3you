import { cleanup, render, screen } from '@testing-library/react';
import { createRef } from 'react';
import { afterEach, expect, test } from 'vitest';
import { Divider } from '../src/components/Divider/divider';

afterEach(() => {
  cleanup();
});

test('renders as hr with implicit separator role', async () => {
  render(<Divider data-testid="divider" />);
  const divider = screen.getByTestId('divider');
  expect(divider.tagName).toBe('HR');
  expect(divider).toHaveRole('separator');
});

test('full-width variant sets data-variant="full-width"', async () => {
  render(<Divider variant="full-width" data-testid="divider" />);
  const divider = screen.getByTestId('divider');
  expect(divider).toHaveClass('md-divider');
  expect(divider).toHaveAttribute('data-variant', 'full-width');
});

test('inset variant sets data-variant="inset"', async () => {
  render(<Divider variant="inset" data-testid="divider" />);
  const divider = screen.getByTestId('divider');
  expect(divider).toHaveAttribute('data-variant', 'inset');
});

test('vertical orientation sets data-orientation and aria-orientation', async () => {
  render(<Divider orientation="vertical" data-testid="divider" />);
  const divider = screen.getByTestId('divider');
  expect(divider).toHaveAttribute('data-orientation', 'vertical');
  expect(divider).toHaveAttribute('aria-orientation', 'vertical');
});

test('horizontal orientation (default) sets data-orientation="horizontal"', async () => {
  render(<Divider data-testid="divider" />);
  const divider = screen.getByTestId('divider');
  expect(divider).toHaveAttribute('data-orientation', 'horizontal');
});

test('horizontal orientation does not set aria-orientation', async () => {
  render(<Divider orientation="horizontal" data-testid="divider" />);
  const divider = screen.getByTestId('divider');
  expect(divider).not.toHaveAttribute('aria-orientation');
});

test('forwards ref correctly', async () => {
  const ref = createRef<HTMLHRElement>();
  render(<Divider ref={ref} data-testid="divider" />);
  expect(ref.current).toBeInstanceOf(HTMLHRElement);
});

test('accepts custom className', async () => {
  render(<Divider className="custom-class" data-testid="divider" />);
  const divider = screen.getByTestId('divider');
  expect(divider).toHaveClass('custom-class');
  expect(divider).toHaveClass('md-divider');
});

test('passes through extra props', async () => {
  render(<Divider data-testid="divider" data-custom="hello" />);
  const divider = screen.getByTestId('divider');
  expect(divider).toHaveAttribute('data-custom', 'hello');
});
