import { readFileSync } from 'node:fs';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { createRef } from 'react';
import { afterEach, expect, test, vi } from 'vitest';
import { RangeSlider, Slider } from '../src/components/Slider/slider';

const sliderCss = readFileSync('src/components/Slider/slider.css', 'utf8');

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

/**
 * Gives the track a real box. Values map over the length between the 6px end insets, so on the default
 * 112px track a 0–100 value sits at x = 6 + value (and at y = 106 - value when vertical).
 */
function layoutTrack(container: HTMLElement, { width = 112, height = 112 } = {}) {
  const track = container.querySelector('.md-slider__track') as HTMLElement;
  vi.spyOn(track, 'getBoundingClientRect').mockReturnValue({
    x: 0,
    y: 0,
    left: 0,
    top: 0,
    right: width,
    bottom: height,
    width,
    height,
    toJSON: () => ({}),
  } as DOMRect);
  return track;
}

const atX = (value: number) => ({ clientX: 6 + value, clientY: 0 });
const atY = (value: number) => ({ clientX: 0, clientY: 106 - value });

function segments(container: HTMLElement) {
  return {
    before: container.querySelector('.md-slider__track-inactive[data-segment="before"]') as HTMLElement,
    active: container.querySelector('.md-slider__track-active') as HTMLElement,
    after: container.querySelector('.md-slider__track-inactive[data-segment="after"]') as HTMLElement,
  };
}

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

test('the inset icon sits 10px in from the start of the active track, which begins at the slider edge', () => {
  const { container } = render(<Slider aria-label="Volume" value={60} icon={<span data-testid="icon">icon</span>} />);
  const active = container.querySelector('.md-slider__track-active') as HTMLElement;
  // The icon is laid out inside the active track, whose start is the track start (the slider edge)…
  expect(container.querySelector('.md-slider__icon')?.parentElement).toBe(active);
  expect(active.style.insetInlineStart).toBe('0%');

  // …so its inset from the track is its inset from the slider: MDC Android's 10dp track icon padding,
  // at the minimum end in either orientation (and mirrored in RTL through the logical inset).
  const iconRule = sliderCss.match(/\.md-slider__icon \{[\s\S]*?\n\}/)?.[0] ?? '';
  expect(iconRule).toContain('--_icon-inset: 10px;');
  expect(iconRule).toMatch(/horizontal"\] & \{[^}]*inset-inline-start: var\(--_icon-inset\);/);
  expect(iconRule).toMatch(/vertical"\] & \{[^}]*bottom: var\(--_icon-inset\);/);
  expect(iconRule).not.toMatch(/(inset-inline-start|bottom): 4px/);
});

test('the inset icon hides, rather than clips, once the active track cannot hold it with the inset on both sides', () => {
  // The active track is the size container the icon's visibility is queried against.
  const activeRule = sliderCss.match(/\n\.md-slider__track-active \{[\s\S]*?\n\}/)?.[0] ?? '';
  expect(activeRule).toContain('container: md-slider-active / size;');
  const inset = Number(sliderCss.match(/--_icon-inset: (\d+)px;/)?.[1]);
  expect(inset).toBe(10);

  // MDC Android's fit rule: the segment must be at least icon size + 2 x padding, per rendered icon size and axis.
  for (const [size, extra] of [
    ['md', ''],
    ['lg', ''],
    ['xl', '[data-size="xl"]'],
  ] as const) {
    const { container, unmount } = render(<Slider aria-label="Volume" size={size} icon={<span>icon</span>} />);
    const iconSize = Number.parseInt((container.querySelector('.md-slider__icon') as HTMLElement).style.width, 10);
    unmount();
    const fit = iconSize + 2 * inset;
    for (const [axis, orientation] of [
      ['width', 'horizontal'],
      ['height', 'vertical'],
    ] as const) {
      const query = `@container md-slider-active (${axis} < ${fit}px) {\n  .md-slider[data-orientation="${orientation}"]${extra} .md-slider__icon {\n    visibility: hidden;`;
      expect(sliderCss, `${size} ${orientation}`).toContain(query);
    }
  }
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

test('a cancelled pointer keeps the last dragged value instead of reading its coordinates', () => {
  const onValueChange = vi.fn();
  const { container } = render(<Slider aria-label="Volume" onValueChange={onValueChange} />);
  const root = container.firstChild as HTMLElement;
  layoutTrack(container);

  fireEvent.pointerDown(root, { button: 0, pointerId: 1, ...atX(30) });
  expect(onValueChange).toHaveBeenLastCalledWith(30);
  onValueChange.mockClear();

  fireEvent.pointerCancel(root, { pointerId: 1, ...atX(90) });
  expect(onValueChange).not.toHaveBeenCalled();
  expect(screen.getByRole('slider')).toHaveValue('30');
  expect(root).not.toHaveAttribute('data-dragging');
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

test('a continuous slider snaps pointer input to the native input step, so the indicator reads an integer', () => {
  const onValueChange = vi.fn();
  const { container } = render(<Slider aria-label="Volume" showTooltip onValueChange={onValueChange} />);
  const root = container.firstChild as HTMLElement;
  // 320px of handle travel: x = 134.3 is 40.09…% of the way along.
  layoutTrack(container, { width: 332 });

  fireEvent.pointerDown(root, { button: 0, pointerId: 1, clientX: 134.3, clientY: 0 });
  expect(onValueChange).toHaveBeenLastCalledWith(40);
  expect(container.querySelector('.md-slider__tooltip')?.textContent).toBe('40');
  expect(screen.getByRole('slider')).toHaveValue('40');
});

test('pointer input follows an explicit fractional step', () => {
  const onValueChange = vi.fn();
  const { container } = render(<Slider aria-label="Volume" step={0.5} onValueChange={onValueChange} />);
  layoutTrack(container, { width: 332 });

  // 40.4% of the way along rounds to the nearest half step.
  fireEvent.pointerDown(container.firstChild as HTMLElement, { button: 0, pointerId: 1, clientX: 135.28, clientY: 0 });
  expect(onValueChange).toHaveBeenLastCalledWith(40.5);
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

test('stops share the handle inset, so the end stops sit 6px in from the track ends', () => {
  const { container } = render(<Slider aria-label="Volume" step={25} value={50} />);
  const stops = Array.from(container.querySelectorAll<HTMLElement>('.md-slider__stop'));
  expect(stops.map((stop) => stop.style.insetInlineStart)).toEqual([
    '6px',
    'calc(25% + 3px)',
    'calc(75% - 3px)',
    'calc(100% - 6px)',
  ]);
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
  expect(handle.style.insetInlineStart).toBe('6px');
});

// Geometry: the tracks run edge to edge, the handle travels 6px in from each end
test('the handle centre travels 6px in from each end of the track', () => {
  const { container, rerender } = render(<Slider aria-label="Volume" value={0} />);
  const handle = () => container.querySelector('.md-slider__handle') as HTMLElement;
  expect(handle().style.insetInlineStart).toBe('6px');

  rerender(<Slider aria-label="Volume" value={50} />);
  expect(handle().style.insetInlineStart).toBe('50%');

  rerender(<Slider aria-label="Volume" value={100} />);
  expect(handle().style.insetInlineStart).toBe('calc(100% - 6px)');
  expect(handle()).toHaveStyle({ insetInlineStart: 'calc(100% - 6px)' });
});

test('the track box is full length; only the handle travel is inset', () => {
  const trackRule = sliderCss.match(/\.md-slider__track \{[^}]*\{[^}]*\}[^}]*\{[^}]*\}\s*\}/)?.[0] ?? '';
  expect(trackRule).toContain('width: 100%;');
  expect(trackRule).toContain('height: 100%;');
  expect(trackRule).not.toMatch(/margin/);
});

test('standard mode keeps the handle gap on both sides at every value', () => {
  const { container } = render(<Slider aria-label="Volume" value={25} />);
  const { before, active, after } = segments(container);

  expect(before).toBeNull();
  // The active track runs from the track start to 8px short of the handle centre (25% + 3px)…
  expect(active.style.insetInlineStart).toBe('0%');
  expect(active.style.insetInlineEnd).toBe('calc(75% + 5px)');
  // …and the inactive track resumes 8px past it and runs to the track end.
  expect(after.style.insetInlineStart).toBe('calc(25% + 11px)');
  expect(after.style.insetInlineEnd).toBe('0%');
});

test('a pressed handle narrows to 2px and the tracks close in to keep a 6px gap', () => {
  const { container } = render(<Slider aria-label="Volume" />);
  const root = container.firstChild as HTMLElement;
  layoutTrack(container);
  const { active, after } = segments(container);
  const thumb = container.querySelector('.md-slider__thumb') as HTMLElement;

  fireEvent.pointerDown(root, { button: 0, pointerId: 1, ...atX(50) });
  expect(thumb.style.width).toBe('2px');
  expect(active.style.insetInlineEnd).toBe('calc(50% + 7px)');
  expect(after.style.insetInlineStart).toBe('calc(50% + 7px)');

  fireEvent.pointerUp(root, { pointerId: 1, ...atX(50) });
  expect(thumb.style.width).toBe('4px');
  expect(active.style.insetInlineEnd).toBe('calc(50% + 8px)');
  expect(after.style.insetInlineStart).toBe('calc(50% + 8px)');
});

// Vertical orientation style branches
test('vertical orientation applies vertical track and handle styling', async () => {
  const { container } = render(<Slider aria-label="Volume" orientation="vertical" value={40} step={25} />);
  const track = container.querySelector('.md-slider__track') as HTMLElement;
  expect(track.style.width).not.toBe('');

  const handle = container.querySelector('.md-slider__handle') as HTMLElement;
  expect(handle.style.bottom).toBe('50%');

  const { active, after } = segments(container);
  expect(active.style.bottom).toBe('0%');
  expect(active.style.top).toBe('calc(50% + 8px)');
  expect(after.style.bottom).toBe('calc(50% + 8px)');
  expect(active.style.borderBottomLeftRadius).toBe('12px');
  expect(active.style.borderTopLeftRadius).toBe('2px');
  expect((container.querySelector('.md-slider__stop') as HTMLElement).style.bottom).toBe('6px');
  expect((container.querySelector('.md-slider__thumb') as HTMLElement).style.height).toBe('4px');
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

test('pressing anywhere on the track moves the handle there and starts a drag', () => {
  const onValueChange = vi.fn();
  const { container } = render(<Slider aria-label="Volume" onValueChange={onValueChange} />);
  const root = container.firstChild as HTMLElement;
  const track = layoutTrack(container);

  fireEvent.pointerDown(track, { button: 0, pointerId: 1, ...atX(70) });
  expect(onValueChange).toHaveBeenLastCalledWith(70);
  expect(root).toHaveAttribute('data-dragging', 'true');
  expect(screen.getByRole('slider')).toHaveFocus();

  fireEvent.pointerMove(root, { pointerId: 1, ...atX(85) });
  fireEvent.pointerUp(root, { pointerId: 1, ...atX(90) });
  expect(onValueChange).toHaveBeenLastCalledWith(90);
  expect(screen.getByRole('slider')).toHaveValue('90');
});

test('a press keeps the input focused for the keyboard, without the keyboard focus ring', () => {
  const { container, rerender } = render(<Slider aria-label="Volume" />);
  const root = container.firstChild as HTMLElement;
  layoutTrack(container);
  const input = screen.getByRole('slider');
  const focus = vi.spyOn(input, 'focus');

  // Cancelling the press stops the browser's mousedown default from blurring the input straight after.
  expect(fireEvent.pointerDown(root, { button: 0, pointerId: 1, ...atX(30) })).toBe(false);
  expect(focus).toHaveBeenCalledWith({ focusVisible: false });
  expect(input).toHaveFocus();
  fireEvent.pointerUp(root, { pointerId: 1, ...atX(30) });
  input.blur();

  // A disabled slider leaves the press alone.
  rerender(<Slider aria-label="Volume" disabled />);
  expect(fireEvent.pointerDown(root, { button: 0, pointerId: 2, ...atX(30) })).toBe(true);
  expect(input).not.toHaveFocus();
});

test('the pointer maps over the inset travel, clamping presses beyond either end', () => {
  const onValueChange = vi.fn();
  const { container } = render(<Slider aria-label="Volume" onValueChange={onValueChange} />);
  const root = container.firstChild as HTMLElement;
  layoutTrack(container);

  fireEvent.pointerDown(root, { button: 0, pointerId: 1, clientX: 2, clientY: 0 });
  expect(onValueChange).toHaveBeenLastCalledWith(0);
  fireEvent.pointerMove(root, { pointerId: 1, clientX: 110, clientY: 0 });
  expect(onValueChange).toHaveBeenLastCalledWith(100);
});

test('vertical dragging reads the pointer position from the Y axis', async () => {
  const onValueChange = vi.fn();
  const { container } = render(
    <Slider aria-label="Volume" orientation="vertical" min={0} max={100} onValueChange={onValueChange} />,
  );
  const handle = container.querySelector('.md-slider__handle') as HTMLElement;
  layoutTrack(container);

  fireEvent.pointerDown(handle, { button: 0, pointerId: 1, ...atY(70) });
  expect(onValueChange).toHaveBeenLastCalledWith(70);
  expect(screen.getByRole('slider')).toHaveValue('70');
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

test('centered mode leaves 2px of clearance on each side of the origin', () => {
  const { container, rerender } = render(<Slider aria-label="Balance" mode="centered" value={25} />);
  let { before, active, after } = segments(container);
  // Below the origin: inactive up to the handle, active from the handle to 2px short of the origin.
  expect(before.style.insetInlineStart).toBe('0%');
  expect(before.style.insetInlineEnd).toBe('calc(75% + 5px)');
  expect(active.style.insetInlineStart).toBe('calc(25% + 11px)');
  expect(active.style.insetInlineEnd).toBe('calc(50% + 2px)');
  expect(after.style.insetInlineEnd).toBe('0%');
  expect(active.style.borderStartStartRadius).toBe('2px');
  expect(active.style.borderEndEndRadius).toBe('2px');

  rerender(<Slider aria-label="Balance" mode="centered" value={75} />);
  ({ before, active, after } = segments(container));
  // Above the origin: active from 2px past the origin to the handle, inactive from the handle on.
  expect(before.style.insetInlineStart).toBe('0%');
  expect(active.style.insetInlineStart).toBe('calc(50% + 2px)');
  expect(active.style.insetInlineEnd).toBe('calc(25% + 11px)');
  expect(after.style.insetInlineStart).toBe('calc(75% + 5px)');

  rerender(<Slider aria-label="Balance" mode="centered" value={50} />);
  ({ active, after } = segments(container));
  // At the origin the active segment collapses (its end falls before its start).
  expect(active.style.insetInlineStart).toBe('calc(50% + 2px)');
  expect(active.style.insetInlineEnd).toBe('calc(50% + 8px)');
  expect(after.style.insetInlineStart).toBe('calc(50% + 8px)');
});

// Right-to-left
test('horizontal positions and corners are logical, so the slider mirrors in RTL', () => {
  const { container } = render(<Slider aria-label="Volume" value={25} />);
  const handle = container.querySelector('.md-slider__handle') as HTMLElement;
  const { active, after } = segments(container);

  expect(handle.style.left).toBe('');
  expect(handle.style.insetInlineStart).toBe('calc(25% + 3px)');
  expect(active.style.left).toBe('');
  expect(active.style.borderStartStartRadius).toBe('12px');
  expect(active.style.borderEndStartRadius).toBe('12px');
  expect(active.style.borderStartEndRadius).toBe('2px');
  expect(after.style.borderEndEndRadius).toBe('12px');
  expect(after.style.borderTopLeftRadius).toBe('');

  // Centring uses a logical margin rather than a physical translate, which would not mirror.
  expect(sliderCss).not.toContain('translate(-50%, -50%)');
  expect(sliderCss).toContain('margin-inline-start: calc(var(--_hit-width) / -2);');
  expect(sliderCss).toContain('margin-inline-start: -2px;');
  expect(sliderCss).toContain('inset-inline-start: var(--_icon-inset);');
});

test('in a right-to-left track the pointer maps from the right edge', () => {
  const onValueChange = vi.fn();
  const { container } = render(<Slider aria-label="Volume" onValueChange={onValueChange} />);
  const track = layoutTrack(container);
  const realGetComputedStyle = window.getComputedStyle.bind(window);
  vi.spyOn(window, 'getComputedStyle').mockImplementation((element, pseudo) =>
    element === track
      ? ({ direction: 'rtl' } as unknown as CSSStyleDeclaration)
      : realGetComputedStyle(element as Element, pseudo),
  );

  // 30px in from the left edge is 70 when the minimum sits at the right.
  fireEvent.pointerDown(container.firstChild as HTMLElement, { button: 0, pointerId: 1, ...atX(30) });
  expect(onValueChange).toHaveBeenLastCalledWith(70);
});

// Handle visuals
test('the handle carries no ripple or state layer, only the thumb', () => {
  const { container } = render(<Slider aria-label="Volume" />);
  const handle = container.querySelector('.md-slider__handle') as HTMLElement;
  fireEvent.pointerDown(handle, { button: 0, pointerId: 1, clientX: 0, clientY: 0 });

  expect(handle.children).toHaveLength(1);
  expect(handle.firstElementChild).toHaveClass('md-slider__thumb');
});

test('the slider box hugs the handle height, with a 48px floor for the touch target', () => {
  const handleHeights = Object.fromEntries(
    [
      ...sliderCss.matchAll(
        /&\[data-size="(\w+)"\](?:,\s*&\[data-size="(\w+)"\])?\s*\{\s*--_handle-height:\s*(\d+)px;/g,
      ),
    ].flatMap(([, first, second, height]) => [first, second].filter(Boolean).map((size) => [size, Number(height)])),
  );
  expect(handleHeights).toEqual({ xs: 44, sm: 44, lg: 68, xl: 108 });
  expect(sliderCss).toMatch(/\.md-slider \{[^}]*--_handle-height: 52px;/);
  expect(sliderCss).toContain('height: max(var(--_hit-height), var(--_handle-height));');
  expect(sliderCss).toContain('width: max(var(--_hit-height), var(--_handle-height));');
  expect(sliderCss).toContain('--_hit-height: 48px;');
});

test('the focus ring goes on the focused input’s own handle, not on both range handles', () => {
  const ringRule = sliderCss.match(/([^{}]+)\{\s*outline: var\(--md-sys-state-focus-indicator-thickness\)/)?.[1] ?? '';
  const selectors = ringRule
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .split(',')
    .map((selector) => selector.trim());
  expect(selectors).toEqual([
    '.md-slider:not(.md-range-slider):has(.md-slider__input:focus-visible) .md-slider__handle',
    '.md-range-slider:has(.md-slider__input:first-of-type:focus-visible) .md-slider__handle:first-of-type',
    '.md-range-slider:has(.md-slider__input:last-of-type:focus-visible) .md-slider__handle:last-of-type',
  ]);

  // Those structural selectors rely on this order: lower input first, and the lower handle first in the track.
  render(<RangeSlider defaultValue={[20, 80]} />);
  const root = document.querySelector('.md-range-slider') as HTMLElement;
  const [lowerInput, upperInput] = screen.getAllByRole('slider');
  const first = root.querySelector<HTMLElement>('.md-slider__handle:first-of-type');
  const last = root.querySelector<HTMLElement>('.md-slider__handle:last-of-type');
  expect(root.querySelector('.md-slider__input:first-of-type')).toBe(lowerInput);
  expect(root.querySelector('.md-slider__input:last-of-type')).toBe(upperInput);
  expect(first?.style.insetInlineStart).toBe('calc(20% + 3.6px)');
  expect(last?.style.insetInlineStart).toBe('calc(80% - 3.6px)');
});

test('the value indicator clears the visible handle rather than the fixed hit box', () => {
  expect(sliderCss).toContain(
    'top: calc(50% - var(--_handle-height) / 2 - var(--_tooltip-gap) - var(--_tooltip-height));',
  );
  expect(sliderCss).toContain('right: calc(50% + var(--_handle-height) / 2 + var(--_tooltip-gap));');
  expect(sliderCss).not.toContain('top: -48px');
});

// RangeSlider
test('RangeSlider moves the handle nearer the press', () => {
  const onValueChange = vi.fn();
  const { container } = render(<RangeSlider defaultValue={[20, 80]} onValueChange={onValueChange} />);
  const root = container.firstChild as HTMLElement;
  const track = layoutTrack(container);
  const [lower, upper] = screen.getAllByRole('slider');

  fireEvent.pointerDown(track, { button: 0, pointerId: 1, ...atX(30) });
  expect(root).toHaveAttribute('data-dragging', 'lower');
  expect(lower).toHaveFocus();
  expect(onValueChange).toHaveBeenLastCalledWith([30, 80]);
  fireEvent.pointerUp(root, { pointerId: 1, ...atX(30) });
  expect(root).not.toHaveAttribute('data-dragging');

  const focusUpper = vi.spyOn(upper, 'focus');
  expect(fireEvent.pointerDown(track, { button: 0, pointerId: 2, ...atX(60) })).toBe(false);
  expect(root).toHaveAttribute('data-dragging', 'upper');
  expect(focusUpper).toHaveBeenCalledWith({ focusVisible: false });
  expect(upper).toHaveFocus();
  expect(onValueChange).toHaveBeenLastCalledWith([30, 60]);

  // Dragged past the other handle, a thumb stops at it.
  fireEvent.pointerMove(root, { pointerId: 2, ...atX(10) });
  expect(onValueChange).toHaveBeenLastCalledWith([30, 30]);
});

test('RangeSlider handles that coincide at the maximum part in the direction of the first move', () => {
  const onValueChange = vi.fn();
  const { container } = render(<RangeSlider defaultValue={[100, 100]} showTooltip onValueChange={onValueChange} />);
  const root = container.firstChild as HTMLElement;
  layoutTrack(container);
  const [lower] = screen.getAllByRole('slider');

  fireEvent.pointerDown(root, { button: 0, pointerId: 1, ...atX(100) });
  // Undecided: the upper handle, on top, shows the press; nothing moves yet.
  expect(root).toHaveAttribute('data-dragging', 'upper');
  expect(container.querySelector('.md-slider__tooltip')?.textContent).toBe('100');
  expect(onValueChange).not.toHaveBeenCalled();

  fireEvent.pointerMove(root, { pointerId: 1, ...atX(100) });
  expect(onValueChange).not.toHaveBeenCalled();

  fireEvent.pointerMove(root, { pointerId: 1, ...atX(70) });
  expect(root).toHaveAttribute('data-dragging', 'lower');
  expect(lower).toHaveFocus();
  expect(onValueChange).toHaveBeenLastCalledWith([70, 100]);

  fireEvent.pointerUp(root, { pointerId: 1, ...atX(60) });
  expect(onValueChange).toHaveBeenLastCalledWith([60, 100]);
});

test('RangeSlider handles that coincide at the minimum part upward', () => {
  const onValueChange = vi.fn();
  const { container } = render(<RangeSlider defaultValue={[0, 0]} onValueChange={onValueChange} />);
  const root = container.firstChild as HTMLElement;
  layoutTrack(container);

  fireEvent.pointerDown(root, { button: 0, pointerId: 1, ...atX(0) });
  fireEvent.pointerMove(root, { pointerId: 1, ...atX(40) });
  expect(root).toHaveAttribute('data-dragging', 'upper');
  expect(onValueChange).toHaveBeenLastCalledWith([0, 40]);
});

test('RangeSlider coinciding handles: a press to one side moves that side at once; a tap moves nothing', () => {
  const onValueChange = vi.fn();
  const { container, rerender } = render(<RangeSlider value={[50, 50]} onValueChange={onValueChange} />);
  const root = container.firstChild as HTMLElement;
  layoutTrack(container);

  fireEvent.pointerDown(root, { button: 0, pointerId: 1, ...atX(20) });
  expect(onValueChange).toHaveBeenLastCalledWith([20, 50]);
  fireEvent.pointerUp(root, { pointerId: 1, ...atX(20) });

  fireEvent.pointerDown(root, { button: 0, pointerId: 2, ...atX(90) });
  expect(onValueChange).toHaveBeenLastCalledWith([50, 90]);
  fireEvent.pointerUp(root, { pointerId: 2, ...atX(90) });

  onValueChange.mockClear();
  rerender(<RangeSlider value={[50, 50]} onValueChange={onValueChange} />);
  fireEvent.pointerDown(root, { button: 0, pointerId: 3, ...atX(50) });
  fireEvent.pointerUp(root, { pointerId: 3, ...atX(50) });
  expect(onValueChange).not.toHaveBeenCalled();
  expect(root).not.toHaveAttribute('data-dragging');
});

test('RangeSlider narrows only the pressed handle and closes its gaps to 6px', () => {
  const { container } = render(<RangeSlider defaultValue={[20, 80]} />);
  const root = container.firstChild as HTMLElement;
  layoutTrack(container);
  const { before, active, after } = segments(container);
  const [lowerThumb, upperThumb] = Array.from(container.querySelectorAll<HTMLElement>('.md-slider__thumb'));

  expect(before.style.insetInlineEnd).toBe('calc(80% + 4.4px)');
  expect(active.style.insetInlineStart).toBe('calc(20% + 11.6px)');
  expect(active.style.insetInlineEnd).toBe('calc(20% + 11.6px)');
  expect(after.style.insetInlineStart).toBe('calc(80% + 4.4px)');

  fireEvent.pointerDown(root, { button: 0, pointerId: 1, ...atX(80) });
  expect(upperThumb.style.width).toBe('2px');
  expect(lowerThumb.style.width).toBe('4px');
  expect(before.style.insetInlineEnd).toBe('calc(80% + 4.4px)');
  expect(active.style.insetInlineEnd).toBe('calc(20% + 10.6px)');
  expect(after.style.insetInlineStart).toBe('calc(80% + 3.4px)');
});

test('RangeSlider cancels without reading the cancelled coordinates', () => {
  const onValueChange = vi.fn();
  const { container } = render(<RangeSlider defaultValue={[20, 80]} onValueChange={onValueChange} />);
  const root = container.firstChild as HTMLElement;
  layoutTrack(container);

  fireEvent.pointerDown(root, { button: 0, pointerId: 1, ...atX(30) });
  onValueChange.mockClear();
  fireEvent.pointerCancel(root, { pointerId: 1, ...atX(5) });
  expect(onValueChange).not.toHaveBeenCalled();
  expect(root).not.toHaveAttribute('data-dragging');
  expect(screen.getAllByRole('slider')[0]).toHaveValue('30');
});

test('RangeSlider composes consumer pointer handlers and ignores stray pointers', () => {
  const handlers = {
    onPointerDown: vi.fn(),
    onPointerMove: vi.fn(),
    onPointerUp: vi.fn(),
    onPointerCancel: vi.fn(),
  };
  const onValueChange = vi.fn();
  const { container } = render(<RangeSlider defaultValue={[20, 80]} onValueChange={onValueChange} {...handlers} />);
  const root = container.firstChild as HTMLElement;
  layoutTrack(container);

  // Moves and releases with no press in progress do nothing.
  fireEvent.pointerMove(root, { pointerId: 1, ...atX(40) });
  fireEvent.pointerUp(root, { pointerId: 1, ...atX(40) });
  expect(onValueChange).not.toHaveBeenCalled();

  fireEvent.pointerDown(root, { button: 0, pointerId: 1, ...atX(30) });
  fireEvent.pointerCancel(root, { pointerId: 1, ...atX(30) });
  expect(handlers.onPointerDown).toHaveBeenCalledOnce();
  expect(handlers.onPointerMove).toHaveBeenCalledOnce();
  expect(handlers.onPointerUp).toHaveBeenCalledOnce();
  expect(handlers.onPointerCancel).toHaveBeenCalledOnce();
});

test('RangeSlider vertical segments and handles are placed from the bottom', () => {
  const onValueChange = vi.fn();
  const { container } = render(
    <>
      <span id="range-label">Range</span>
      <RangeSlider
        orientation="vertical"
        defaultValue={[20, 80]}
        onValueChange={onValueChange}
        lowerInputProps={{ 'aria-labelledby': 'range-label' }}
      />
    </>,
  );
  const root = container.querySelector('.md-range-slider') as HTMLElement;
  const [lowerHandle, upperHandle] = Array.from(container.querySelectorAll<HTMLElement>('.md-slider__handle'));
  const { before, after } = segments(container);
  layoutTrack(container);

  expect(screen.getAllByRole('slider')[0]).not.toHaveAttribute('aria-label');
  expect(lowerHandle.style.bottom).toBe('calc(20% + 3.6px)');
  expect(upperHandle.style.bottom).toBe('calc(80% - 3.6px)');
  expect(before.style.bottom).toBe('0%');
  expect(after.style.top).toBe('0%');

  fireEvent.pointerDown(root, { button: 0, pointerId: 1, ...atY(90) });
  expect(onValueChange).toHaveBeenLastCalledWith([20, 90]);
  expect((container.querySelectorAll('.md-slider__thumb')[1] as HTMLElement).style.height).toBe('2px');
});

test('RangeSlider orders its values, forwards both input refs and clamps native input changes', () => {
  const lowerRef = createRef<HTMLInputElement>();
  const upperNodes: (HTMLInputElement | null)[] = [];
  const lowerOnChange = vi.fn();
  const upperOnChange = vi.fn();
  const onValueChange = vi.fn();
  render(
    <RangeSlider
      defaultValue={[90, 10]}
      onValueChange={onValueChange}
      lowerInputProps={{ ref: lowerRef, 'aria-label': 'Minimum', onChange: lowerOnChange }}
      upperInputProps={{
        ref: (node) => {
          upperNodes.push(node);
        },
        'aria-labelledby': 'upper-label',
        onChange: upperOnChange,
      }}
    />,
  );
  const [lower, upper] = screen.getAllByRole('slider');

  expect(lowerRef.current).toBe(lower);
  expect(upperNodes.at(-1)).toBe(upper);
  expect(lower).toHaveValue('10');
  expect(upper).toHaveValue('90');
  expect(lower).toHaveAccessibleName('Minimum');
  expect(upper).not.toHaveAttribute('aria-label');

  fireEvent.change(lower, { target: { value: '95' } });
  expect(onValueChange).toHaveBeenLastCalledWith([90, 90]);
  expect(lowerOnChange).toHaveBeenCalledOnce();

  fireEvent.change(upper, { target: { value: '5' } });
  expect(onValueChange).toHaveBeenLastCalledWith([90, 90]);
  expect(upperOnChange).toHaveBeenCalledOnce();
});

test('RangeSlider ignores disabled and non-primary presses and formats its tooltip', () => {
  const onValueChange = vi.fn();
  const { container, rerender } = render(
    <RangeSlider disabled defaultValue={[20, 80]} onValueChange={onValueChange} />,
  );
  const root = container.firstChild as HTMLElement;
  layoutTrack(container);

  fireEvent.pointerDown(root, { button: 0, pointerId: 1, ...atX(30) });
  expect(root).not.toHaveAttribute('data-dragging');
  for (const input of screen.getAllByRole('slider')) expect(input).toBeDisabled();

  rerender(
    <RangeSlider defaultValue={[20, 80]} showTooltip formatTooltip={(v) => `${v}%`} onValueChange={onValueChange} />,
  );
  fireEvent.pointerDown(root, { button: 2, pointerId: 1, ...atX(30) });
  expect(root).not.toHaveAttribute('data-dragging');
  expect(onValueChange).not.toHaveBeenCalled();

  fireEvent.pointerDown(root, { button: 0, pointerId: 1, ...atX(30) });
  expect(container.querySelector('.md-slider__tooltip')?.textContent).toBe('30%');
});
