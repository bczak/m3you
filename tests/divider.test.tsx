import { afterEach, expect, test } from '@rstest/core';
import { cleanup, render, screen } from '@testing-library/react';
import { createRef } from 'react';
import { Divider } from '../src/components/ui/divider';

afterEach(() => {
  cleanup();
});

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
  expect(divider).not.toHaveClass('mx-4');
});

test('inset variant has mx-4', async () => {
  render(<Divider variant="inset" data-testid="divider" />);
  const divider = screen.getByTestId('divider');
  expect(divider).toHaveClass('mx-4');
});

test('vertical orientation has border-l and aria-orientation="vertical"', async () => {
  render(<Divider orientation="vertical" data-testid="divider" />);
  const divider = screen.getByTestId('divider');
  expect(divider).toHaveClass('border-l');
  expect(divider).toHaveAttribute('aria-orientation', 'vertical');
});

test('horizontal orientation (default) has border-t', async () => {
  render(<Divider data-testid="divider" />);
  const divider = screen.getByTestId('divider');
  expect(divider).toHaveClass('border-t');
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
});

test('passes through extra props', async () => {
  render(<Divider data-testid="divider" data-custom="hello" />);
  const divider = screen.getByTestId('divider');
  expect(divider).toHaveAttribute('data-custom', 'hello');
});
