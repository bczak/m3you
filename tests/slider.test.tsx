import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { createRef } from 'react';
import { afterEach, expect, test, vi } from 'vitest';
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

// Size variants — container heights sized to fit handle
test('applies xs size class to container', async () => {
  const { container } = render(<Slider aria-label="Volume" size="xs" />);
  const wrapper = container.firstChild as HTMLElement;
  expect(wrapper).toHaveClass('h-12');
});

test('applies sm size class to container', async () => {
  const { container } = render(<Slider aria-label="Volume" size="sm" />);
  const wrapper = container.firstChild as HTMLElement;
  expect(wrapper).toHaveClass('h-12');
});

test('applies md size class to container', async () => {
  const { container } = render(<Slider aria-label="Volume" size="md" />);
  const wrapper = container.firstChild as HTMLElement;
  expect(wrapper).toHaveClass('h-14');
});

test('applies lg size class to container', async () => {
  const { container } = render(<Slider aria-label="Volume" size="lg" />);
  const wrapper = container.firstChild as HTMLElement;
  expect(wrapper).toHaveClass('h-18');
});

test('applies xl size class to container', async () => {
  const { container } = render(<Slider aria-label="Volume" size="xl" />);
  const wrapper = container.firstChild as HTMLElement;
  expect(wrapper).toHaveClass('h-28');
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

test('does not render inset icon for sizes without inset support (xs)', async () => {
  const { container } = render(<Slider aria-label="Volume" size="xs" icon={<span data-testid="icon">icon</span>} />);
  expect(container.querySelector('[data-testid="icon"]')).toBeNull();
});

// Change handling (uncontrolled)
test('uncontrolled change updates the value and fires onValueChange', async () => {
  const onValueChange = vi.fn();
  render(<Slider aria-label="Volume" onValueChange={onValueChange} />);
  const slider = screen.getByRole('slider', { name: 'Volume' });

  fireEvent.change(slider, { target: { value: '40' } });
  expect(slider).toHaveValue('40');
  expect(onValueChange).toHaveBeenCalledWith(40);
});

test('composes native onChange with onValueChange and uncontrolled state', () => {
  const onChange = vi.fn();
  const onValueChange = vi.fn();
  render(<Slider aria-label="Volume" onChange={onChange} onValueChange={onValueChange} />);

  const slider = screen.getByRole('slider', { name: 'Volume' });
  fireEvent.change(slider, { target: { value: '40' } });

  expect(slider).toHaveValue('40');
  expect(onChange).toHaveBeenCalledTimes(1);
  expect(onValueChange).toHaveBeenCalledWith(40);
});

// Change handling (controlled)
test('controlled change fires onValueChange without mutating internal state', async () => {
  const onValueChange = vi.fn();
  render(<Slider aria-label="Volume" value={50} onValueChange={onValueChange} />);
  const slider = screen.getByRole('slider', { name: 'Volume' });

  fireEvent.change(slider, { target: { value: '30' } });
  expect(onValueChange).toHaveBeenCalledWith(30);
  // Controlled value stays put because the parent did not update it.
  expect(slider).toHaveValue('50');
});

// Pointer interaction toggles the dragging state
test('pointer down/up toggles the dragging state', async () => {
  const { container } = render(<Slider aria-label="Volume" />);
  const wrapper = container.firstChild as HTMLElement;

  fireEvent.pointerDown(wrapper);
  expect(wrapper).toHaveAttribute('data-dragging', 'true');

  fireEvent.pointerUp(wrapper);
  expect(wrapper).not.toHaveAttribute('data-dragging');
});

test('pointer leave ends the dragging state', async () => {
  const { container } = render(<Slider aria-label="Volume" />);
  const wrapper = container.firstChild as HTMLElement;

  fireEvent.pointerDown(wrapper);
  expect(wrapper).toHaveAttribute('data-dragging', 'true');

  fireEvent.pointerLeave(wrapper);
  expect(wrapper).not.toHaveAttribute('data-dragging');
});

// Tooltip — only while dragging
test('shows the tooltip while dragging when showTooltip is enabled', async () => {
  const { container } = render(<Slider aria-label="Volume" showTooltip value={25} />);
  const wrapper = container.firstChild as HTMLElement;

  expect(container.querySelector('.md-slider__tooltip')).toBeNull();
  fireEvent.pointerDown(wrapper);
  expect(container.querySelector('.md-slider__tooltip')).not.toBeNull();
  expect(container.querySelector('.md-slider__tooltip')?.textContent).toBe('25');
});

test('formats the tooltip value with formatTooltip', async () => {
  const { container } = render(<Slider aria-label="Volume" showTooltip value={25} formatTooltip={(v) => `${v}%`} />);
  const wrapper = container.firstChild as HTMLElement;

  fireEvent.pointerDown(wrapper);
  expect(container.querySelector('.md-slider__tooltip')?.textContent).toBe('25%');
});

// Discrete slider stop indicators
test('discrete slider renders stop indicators away from the handle', async () => {
  const { container } = render(<Slider aria-label="Volume" step={25} value={50} />);
  const stops = container.querySelectorAll('.md-slider__stop');
  // Stops at 0/25/75/100 render; the stop coinciding with the handle (50%) is omitted.
  expect(stops.length).toBe(4);
  // Stops at/below the handle are active, stops above are inactive.
  expect(container.querySelector('.md-slider__stop[data-active="true"]')).not.toBeNull();
  expect(container.querySelector('.md-slider__stop[data-active="false"]')).not.toBeNull();
});

test('discrete slider with a single stop renders when far from the handle', async () => {
  const { container } = render(<Slider aria-label="Volume" min={0} max={3} step={5} value={3} />);
  expect(container.querySelectorAll('.md-slider__stop').length).toBe(1);
});

test('step of 0 is treated as a continuous slider', async () => {
  const { container } = render(<Slider aria-label="Volume" step={0} />);
  expect(container.querySelectorAll('.md-slider__stop').length).toBe(0);
});

// Range edge case (min === max)
test('handles a zero range without dividing by zero', async () => {
  const { container } = render(<Slider aria-label="Volume" min={50} max={50} value={50} />);
  const handle = container.querySelector('.md-slider__handle') as HTMLElement;
  expect(handle.style.left).toBe('0%');
});

// Vertical orientation style branches
test('vertical orientation applies vertical track and handle styling', async () => {
  const { container } = render(<Slider aria-label="Volume" orientation="vertical" value={40} step={25} />);
  const track = container.querySelector('.md-slider__track') as HTMLElement;
  expect(track.style.width).not.toBe('');

  const handle = container.querySelector('.md-slider__handle') as HTMLElement;
  expect(handle.style.bottom).toBe('40%');
});
