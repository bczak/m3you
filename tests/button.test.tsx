import { render, screen } from '@testing-library/react';
import { createRef } from 'react';
import { expect, test } from 'vitest';
import { Button } from '../src/components/ui/button';

// Variant tests
test('renders with default variant (filled)', async () => {
  render(<Button>Click me</Button>);
  const button = screen.getByRole('button', { name: 'Click me' });
  expect(button).toBeInTheDocument();
  expect(button).toHaveClass('md-button');
  expect(button).toHaveAttribute('data-variant', 'filled');
});

test('applies filled variant correctly', async () => {
  render(<Button variant="filled">Filled</Button>);
  const button = screen.getByRole('button', { name: 'Filled' });
  expect(button).toHaveClass('md-button');
  expect(button).toHaveAttribute('data-variant', 'filled');
});

test('applies elevated variant correctly', async () => {
  render(<Button variant="elevated">Elevated</Button>);
  const button = screen.getByRole('button', { name: 'Elevated' });
  expect(button).toHaveClass('md-button');
  expect(button).toHaveAttribute('data-variant', 'elevated');
});

test('applies tonal variant correctly', async () => {
  render(<Button variant="tonal">Tonal</Button>);
  const button = screen.getByRole('button', { name: 'Tonal' });
  expect(button).toHaveClass('md-button');
  expect(button).toHaveAttribute('data-variant', 'tonal');
});

test('applies outlined variant correctly', async () => {
  render(<Button variant="outlined">Outlined</Button>);
  const button = screen.getByRole('button', { name: 'Outlined' });
  expect(button).toHaveClass('md-button');
  expect(button).toHaveAttribute('data-variant', 'outlined');
});

test('applies text variant correctly', async () => {
  render(<Button variant="text">Text</Button>);
  const button = screen.getByRole('button', { name: 'Text' });
  expect(button).toHaveClass('md-button');
  expect(button).toHaveAttribute('data-variant', 'text');
});

// Shape tests
test('renders with default shape (round)', async () => {
  render(<Button>Round Button</Button>);
  const button = screen.getByRole('button', { name: 'Round Button' });
  expect(button).toHaveAttribute('data-shape', 'round');
});

test('applies round shape correctly', async () => {
  render(<Button shape="round">Round</Button>);
  const button = screen.getByRole('button', { name: 'Round' });
  expect(button).toHaveAttribute('data-shape', 'round');
});

test('applies square shape correctly', async () => {
  render(<Button shape="square">Square</Button>);
  const button = screen.getByRole('button', { name: 'Square' });
  expect(button).toHaveAttribute('data-shape', 'square');
});

// Size tests
test('renders with default size (sm)', async () => {
  render(<Button>Default Button</Button>);
  const button = screen.getByRole('button', { name: 'Default Button' });
  expect(button).toHaveAttribute('data-size', 'sm');
});

test('applies xs size correctly', async () => {
  render(<Button size="xs">XS Button</Button>);
  const button = screen.getByRole('button', { name: 'XS Button' });
  expect(button).toHaveAttribute('data-size', 'xs');
});

test('applies sm size correctly', async () => {
  render(<Button size="sm">SM Button</Button>);
  const button = screen.getByRole('button', { name: 'SM Button' });
  expect(button).toHaveAttribute('data-size', 'sm');
});

test('applies md size correctly', async () => {
  render(<Button size="md">MD Button</Button>);
  const button = screen.getByRole('button', { name: 'MD Button' });
  expect(button).toHaveAttribute('data-size', 'md');
});

test('applies lg size correctly', async () => {
  render(<Button size="lg">LG Button</Button>);
  const button = screen.getByRole('button', { name: 'LG Button' });
  expect(button).toHaveAttribute('data-size', 'lg');
});

test('applies xl size correctly', async () => {
  render(<Button size="xl">XL Button</Button>);
  const button = screen.getByRole('button', { name: 'XL Button' });
  expect(button).toHaveAttribute('data-size', 'xl');
});

// Ref forwarding test
test('forwards ref correctly', async () => {
  const ref = createRef<HTMLButtonElement>();
  render(<Button ref={ref}>Ref Button</Button>);
  expect(ref.current).toBeInstanceOf(HTMLButtonElement);
});

// Disabled state test
test('applies disabled state correctly', async () => {
  render(<Button disabled>Disabled Button</Button>);
  const button = screen.getByRole('button', { name: 'Disabled Button' });
  expect(button).toBeDisabled();
});

// Morph test
test('applies morph data attribute when enabled', async () => {
  render(<Button morph>Morph Button</Button>);
  const button = screen.getByRole('button', { name: 'Morph Button' });
  expect(button).toHaveAttribute('data-morph');
});

test('does not apply morph data attribute when disabled', async () => {
  render(<Button morph={false}>No Morph</Button>);
  const button = screen.getByRole('button', { name: 'No Morph' });
  expect(button).not.toHaveAttribute('data-morph');
});

// Custom className merge
test('merges custom className', async () => {
  render(<Button className="custom-class">Custom</Button>);
  const button = screen.getByRole('button', { name: 'Custom' });
  expect(button).toHaveClass('md-button');
  expect(button).toHaveClass('custom-class');
});
