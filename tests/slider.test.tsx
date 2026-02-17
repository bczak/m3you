import { afterEach, expect, test } from '@rstest/core';
import { cleanup, render, screen } from '@testing-library/react';
import { createRef } from 'react';
import { Slider } from '../src/components/ui/slider';

afterEach(() => {
  cleanup();
});

// Basic rendering
test('renders a range input', async () => {
  render(<Slider aria-label="Volume" />);
  const slider = screen.getByRole('slider', { name: 'Volume' });
  expect(slider).toBeInTheDocument();
});

test('renders with default value of 0', async () => {
  render(<Slider aria-label="Volume" />);
  const slider = screen.getByRole('slider', { name: 'Volume' });
  expect(slider).toHaveValue('0');
});

test('renders with specified value', async () => {
  render(<Slider aria-label="Volume" value={50} />);
  const slider = screen.getByRole('slider', { name: 'Volume' });
  expect(slider).toHaveValue('50');
});

// Min/Max
test('applies min and max attributes', async () => {
  render(<Slider aria-label="Volume" min={10} max={200} value={50} />);
  const slider = screen.getByRole('slider', { name: 'Volume' });
  expect(slider).toHaveAttribute('min', '10');
  expect(slider).toHaveAttribute('max', '200');
});

// Step (discrete)
test('applies step attribute for discrete slider', async () => {
  render(<Slider aria-label="Volume" step={10} value={50} />);
  const slider = screen.getByRole('slider', { name: 'Volume' });
  expect(slider).toHaveAttribute('step', '10');
});

// Disabled state
test('applies disabled state', async () => {
  render(<Slider aria-label="Volume" disabled value={50} />);
  const slider = screen.getByRole('slider', { name: 'Volume' });
  expect(slider).toBeDisabled();
});

// Ref forwarding
test('forwards ref correctly', async () => {
  const ref = createRef<HTMLInputElement>();
  render(<Slider ref={ref} aria-label="Volume" />);
  expect(ref.current).toBeInstanceOf(HTMLInputElement);
});

// Size variants
test('applies xs size class to container', async () => {
  const { container } = render(<Slider aria-label="Volume" size="xs" />);
  const wrapper = container.firstChild as HTMLElement;
  expect(wrapper).toHaveClass('h-8');
});

test('applies sm size class to container', async () => {
  const { container } = render(<Slider aria-label="Volume" size="sm" />);
  const wrapper = container.firstChild as HTMLElement;
  expect(wrapper).toHaveClass('h-10');
});

test('applies md size class to container', async () => {
  const { container } = render(<Slider aria-label="Volume" size="md" />);
  const wrapper = container.firstChild as HTMLElement;
  expect(wrapper).toHaveClass('h-12');
});

test('applies lg size class to container', async () => {
  const { container } = render(<Slider aria-label="Volume" size="lg" />);
  const wrapper = container.firstChild as HTMLElement;
  expect(wrapper).toHaveClass('h-14');
});

test('applies xl size class to container', async () => {
  const { container } = render(<Slider aria-label="Volume" size="xl" />);
  const wrapper = container.firstChild as HTMLElement;
  expect(wrapper).toHaveClass('h-16');
});

// Custom className
test('applies custom className', async () => {
  const { container } = render(<Slider aria-label="Volume" className="my-custom-class" />);
  const wrapper = container.firstChild as HTMLElement;
  expect(wrapper).toHaveClass('my-custom-class');
});

// Orientation
test('applies horizontal orientation by default', async () => {
  const { container } = render(<Slider aria-label="Volume" />);
  const wrapper = container.firstChild as HTMLElement;
  expect(wrapper).toHaveClass('w-full');
  expect(wrapper).toHaveClass('items-center');
});

test('applies vertical orientation classes', async () => {
  const { container } = render(<Slider aria-label="Volume" orientation="vertical" />);
  const wrapper = container.firstChild as HTMLElement;
  expect(wrapper).toHaveClass('h-full');
  expect(wrapper).toHaveClass('flex-col');
});

test('sets aria-orientation for vertical slider', async () => {
  render(<Slider aria-label="Volume" orientation="vertical" />);
  const slider = screen.getByRole('slider', { name: 'Volume' });
  expect(slider).toHaveAttribute('aria-orientation', 'vertical');
});

// Icon prop
test('renders inset icon when provided', async () => {
  const { container } = render(<Slider aria-label="Volume" icon={<span data-testid="icon">icon</span>} />);
  const icon = container.querySelector('[data-testid="icon"]');
  expect(icon).toBeInTheDocument();
});
