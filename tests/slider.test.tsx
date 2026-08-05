import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { createRef } from 'react';
import { afterEach, expect, test, vi } from 'vitest';
import { Slider } from '../src/components/Slider/slider';

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
test('applies xs size data to container', async () => {
  const { container } = render(<Slider aria-label="Volume" size="xs" />);
  const wrapper = container.firstChild as HTMLElement;
  expect(wrapper).toHaveAttribute('data-size', 'xs');
});

test('applies sm size class to container', async () => {
  const { container } = render(<Slider aria-label="Volume" size="sm" />);
  const wrapper = container.firstChild as HTMLElement;
  expect(wrapper).toHaveAttribute('data-size', 'sm');
});

test('applies md size class to container', async () => {
  const { container } = render(<Slider aria-label="Volume" size="md" />);
  const wrapper = container.firstChild as HTMLElement;
  expect(wrapper).toHaveAttribute('data-size', 'md');
});

test('applies lg size class to container', async () => {
  const { container } = render(<Slider aria-label="Volume" size="lg" />);
  const wrapper = container.firstChild as HTMLElement;
  expect(wrapper).toHaveAttribute('data-size', 'lg');
});

test('applies xl size class to container', async () => {
  const { container } = render(<Slider aria-label="Volume" size="xl" />);
  const wrapper = container.firstChild as HTMLElement;
  expect(wrapper).toHaveAttribute('data-size', 'xl');
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
  expect(wrapper).toHaveClass('md-slider');
  expect(wrapper).toHaveAttribute('data-orientation', 'horizontal');
});

test('applies vertical orientation classes', async () => {
  const { container } = render(<Slider aria-label="Volume" orientation="vertical" />);
  const wrapper = container.firstChild as HTMLElement;
  expect(wrapper).toHaveClass('md-slider');
  expect(wrapper).toHaveAttribute('data-orientation', 'vertical');
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
  const handle = container.querySelector('.md-slider__handle') as HTMLElement;

  fireEvent.pointerDown(handle, { button: 0, pointerId: 1, clientX: 0, clientY: 0 });
  expect(wrapper).toHaveAttribute('data-dragging', 'true');

  fireEvent.pointerUp(handle, { pointerId: 1, clientX: 0, clientY: 0 });
  expect(wrapper).not.toHaveAttribute('data-dragging');
});

test('pointer cancel ends the dragging state', async () => {
  const { container } = render(<Slider aria-label="Volume" />);
  const wrapper = container.firstChild as HTMLElement;
  const handle = container.querySelector('.md-slider__handle') as HTMLElement;

  fireEvent.pointerDown(handle, { button: 0, pointerId: 1, clientX: 0, clientY: 0 });
  expect(wrapper).toHaveAttribute('data-dragging', 'true');

  fireEvent.pointerCancel(handle, { pointerId: 1, clientX: 0, clientY: 0 });
  expect(wrapper).not.toHaveAttribute('data-dragging');
});

// Tooltip — only while dragging
test('shows the tooltip while dragging when showTooltip is enabled', async () => {
  const { container } = render(<Slider aria-label="Volume" showTooltip value={25} />);
  const handle = container.querySelector('.md-slider__handle') as HTMLElement;

  expect(container.querySelector('.md-slider__tooltip')).toBeNull();
  fireEvent.pointerDown(handle, { button: 0, pointerId: 1, clientX: 0, clientY: 0 });
  expect(container.querySelector('.md-slider__tooltip')).not.toBeNull();
  expect(container.querySelector('.md-slider__tooltip')?.textContent).toBe('25');
});

test('formats the tooltip value with formatTooltip', async () => {
  const { container } = render(<Slider aria-label="Volume" showTooltip value={25} formatTooltip={(v) => `${v}%`} />);
  const handle = container.querySelector('.md-slider__handle') as HTMLElement;

  fireEvent.pointerDown(handle, { button: 0, pointerId: 1, clientX: 0, clientY: 0 });
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
  expect(handle.style.bottom).toBe('50%');
});

test('a non-finite value falls back to the minimum', async () => {
  render(<Slider aria-label="Volume" min={10} max={90} value={Number.NaN} />);

  expect(screen.getByRole('slider')).toHaveValue('10');
});

test('disabled and non-primary pointer presses never start a drag', async () => {
  const onValueChange = vi.fn();
  const { container, rerender } = render(<Slider aria-label="Volume" disabled onValueChange={onValueChange} />);
  const wrapper = container.firstChild as HTMLElement;
  let handle = container.querySelector('.md-slider__handle') as HTMLElement;

  fireEvent.pointerDown(handle, { button: 0, pointerId: 1, clientX: 10, clientY: 0 });
  expect(wrapper).not.toHaveAttribute('data-dragging');

  rerender(<Slider aria-label="Volume" onValueChange={onValueChange} />);
  handle = container.querySelector('.md-slider__handle') as HTMLElement;
  fireEvent.pointerDown(handle, { button: 2, pointerId: 1, clientX: 10, clientY: 0 });
  expect(wrapper).not.toHaveAttribute('data-dragging');
  expect(onValueChange).not.toHaveBeenCalled();
});

test('pointer move updates the value only for the pointer that started the drag', async () => {
  const onValueChange = vi.fn();
  const { container } = render(<Slider aria-label="Volume" min={0} max={100} onValueChange={onValueChange} />);
  const handle = container.querySelector('.md-slider__handle') as HTMLElement;

  fireEvent.pointerDown(handle, { button: 0, pointerId: 1, clientX: 0, clientY: 0 });
  onValueChange.mockClear();

  // A different pointer is ignored while pointer 1 owns the drag.
  fireEvent.pointerMove(handle, { pointerId: 99, clientX: 1, clientY: 0 });
  expect(onValueChange).not.toHaveBeenCalled();

  fireEvent.pointerMove(handle, { pointerId: 1, clientX: 1, clientY: 0 });
  expect(onValueChange).toHaveBeenCalled();

  // Releasing a pointer that does not own the drag leaves it running.
  fireEvent.pointerUp(handle, { pointerId: 99, clientX: 1, clientY: 0 });
  expect(container.firstChild).toHaveAttribute('data-dragging', 'true');
});

test('vertical dragging reads the pointer position from the Y axis', async () => {
  const onValueChange = vi.fn();
  const { container } = render(
    <Slider aria-label="Volume" orientation="vertical" min={0} max={100} onValueChange={onValueChange} />,
  );
  const handle = container.querySelector('.md-slider__handle') as HTMLElement;

  fireEvent.pointerDown(handle, { button: 0, pointerId: 1, clientX: 0, clientY: 0 });
  expect(onValueChange).toHaveBeenCalled();
  // Zero-height track in happy-dom: clientY 0 maps to the top, i.e. the maximum.
  expect(screen.getByRole('slider')).toHaveValue('100');
});

test('centered mode draws the active segment on both sides of the origin', async () => {
  const { container, rerender } = render(
    <Slider aria-label="Balance" mode="centered" origin={50} min={0} max={100} value={20} step={25} />,
  );
  const belowOrigin = container.querySelector('.md-slider__track-active') as HTMLElement;
  expect(belowOrigin).not.toBeNull();
  expect(container.querySelectorAll('.md-slider__stop').length).toBeGreaterThan(0);

  rerender(<Slider aria-label="Balance" mode="centered" origin={50} min={0} max={100} value={80} step={25} />);
  expect(container.querySelector('.md-slider__track-active')).not.toBeNull();
});
