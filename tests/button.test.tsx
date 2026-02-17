import { expect, test } from '@rstest/core';
import { render, screen } from '@testing-library/react';
import { createRef } from 'react';
import { Button } from '../src/components/ui/button';

// Variant tests
test('renders with default variant (filled)', async () => {
  render(<Button>Click me</Button>);
  const button = screen.getByRole('button', { name: 'Click me' });
  expect(button).toBeInTheDocument();
  expect(button).toHaveClass('bg-primary');
});

test('applies filled variant classes correctly', async () => {
  render(<Button variant="filled">Filled</Button>);
  const button = screen.getByRole('button', { name: 'Filled' });
  expect(button).toHaveClass('bg-primary');
  expect(button).toHaveClass('text-primary-foreground');
});

test('applies elevated variant classes correctly', async () => {
  render(<Button variant="elevated">Elevated</Button>);
  const button = screen.getByRole('button', { name: 'Elevated' });
  expect(button).toHaveClass('bg-surface-container');
  expect(button).toHaveClass('text-foreground');
  expect(button).toHaveClass('shadow-lg');
});

test('applies tonal variant classes correctly', async () => {
  render(<Button variant="tonal">Tonal</Button>);
  const button = screen.getByRole('button', { name: 'Tonal' });
  expect(button).toHaveClass('bg-secondary-container');
  expect(button).toHaveClass('text-secondary-container-foreground');
});

test('applies outlined variant classes correctly', async () => {
  render(<Button variant="outlined">Outlined</Button>);
  const button = screen.getByRole('button', { name: 'Outlined' });
  expect(button).toHaveClass('border');
  expect(button).toHaveClass('border-outline/40');
  expect(button).toHaveClass('bg-transparent');
});

test('applies text variant classes correctly', async () => {
  render(<Button variant="text">Text</Button>);
  const button = screen.getByRole('button', { name: 'Text' });
  expect(button).toHaveClass('bg-transparent');
  expect(button).toHaveClass('text-primary');
});

// Shape tests
test('renders with default shape (round)', async () => {
  render(<Button>Round Button</Button>);
  const button = screen.getByRole('button', { name: 'Round Button' });
  // Default size is sm, so round radius is 1.25rem (height/2)
  expect(button).toHaveClass('rounded-[1.25rem]');
});

test('applies round shape classes correctly', async () => {
  render(<Button shape="round">Round</Button>);
  const button = screen.getByRole('button', { name: 'Round' });
  // Default size is sm, so round radius is 1.25rem (height/2)
  expect(button).toHaveClass('rounded-[1.25rem]');
});

test('applies square shape classes correctly for sm size (default)', async () => {
  render(<Button shape="square">Square</Button>);
  const button = screen.getByRole('button', { name: 'Square' });
  expect(button).toHaveClass('rounded-lg');
});

test('applies square shape classes correctly for xs size', async () => {
  render(
    <Button shape="square" size="xs">
      Square XS
    </Button>,
  );
  const button = screen.getByRole('button', { name: 'Square XS' });
  expect(button).toHaveClass('rounded-lg');
});

test('applies square shape classes correctly for lg size', async () => {
  render(
    <Button shape="square" size="lg">
      Square LG
    </Button>,
  );
  const button = screen.getByRole('button', { name: 'Square LG' });
  expect(button).toHaveClass('rounded-2xl');
});

// Size tests
test('renders with default size (sm)', async () => {
  render(<Button>Default Button</Button>);
  const button = screen.getByRole('button', { name: 'Default Button' });
  expect(button).toHaveClass('h-10');
  expect(button).toHaveClass('px-4');
  expect(button).toHaveClass('text-sm');
});

test('applies xs size classes correctly', async () => {
  render(<Button size="xs">XS Button</Button>);
  const button = screen.getByRole('button', { name: 'XS Button' });
  expect(button).toHaveClass('h-8');
  expect(button).toHaveClass('px-3');
  expect(button).toHaveClass('text-xs');
});

test('applies sm size classes correctly', async () => {
  render(<Button size="sm">SM Button</Button>);
  const button = screen.getByRole('button', { name: 'SM Button' });
  expect(button).toHaveClass('h-10');
  expect(button).toHaveClass('px-4');
  expect(button).toHaveClass('text-sm');
});

test('applies md size classes correctly', async () => {
  render(<Button size="md">MD Button</Button>);
  const button = screen.getByRole('button', { name: 'MD Button' });
  expect(button).toHaveClass('px-6');
  expect(button).toHaveClass('py-4');
  expect(button).toHaveClass('text-base');
});

test('applies lg size classes correctly', async () => {
  render(<Button size="lg">LG Button</Button>);
  const button = screen.getByRole('button', { name: 'LG Button' });
  expect(button).toHaveClass('px-12');
  expect(button).toHaveClass('py-8');
  expect(button).toHaveClass('text-lg');
});

test('applies xl size classes correctly', async () => {
  render(<Button size="xl">XL Button</Button>);
  const button = screen.getByRole('button', { name: 'XL Button' });
  expect(button).toHaveClass('px-16');
  expect(button).toHaveClass('py-12');
  expect(button).toHaveClass('text-xl');
});

// Ref forwarding test
test('forwards ref correctly', async () => {
  const ref = createRef<HTMLButtonElement>();
  render(<Button ref={ref}>Ref Button</Button>);
  expect(ref.current).toBeInstanceOf(HTMLButtonElement);
});

// Disabled state test
test('applies disabled state classes correctly', async () => {
  render(<Button disabled>Disabled Button</Button>);
  const button = screen.getByRole('button', { name: 'Disabled Button' });
  expect(button).toBeDisabled();
  expect(button).toHaveClass('disabled:opacity-50');
  expect(button).toHaveClass('disabled:pointer-events-none');
});

// Ripple positioning test
test('has relative class for ripple positioning', async () => {
  render(<Button>Ripple Button</Button>);
  const button = screen.getByRole('button', { name: 'Ripple Button' });
  expect(button).toHaveClass('relative');
});
