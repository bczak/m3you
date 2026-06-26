import { cleanup, render, screen } from '@testing-library/react';
import { createRef } from 'react';
import { afterEach, expect, test, vi } from 'vitest';
import { CircularProgress } from '../src/components/CircularProgress/circular-progress';
import { drawCircularArc, drawWavyArc, sizeToDegrees } from '../src/components/CircularProgress/wavy-arc';

afterEach(() => {
  vi.restoreAllMocks();
  cleanup();
});

test('flat determinate: renders ring with aria values', async () => {
  const { container } = render(<CircularProgress value={75} />);
  const progress = screen.getByRole('progressbar', { name: 'Progress: 75%' });

  expect(progress).toHaveAttribute('aria-valuenow', '75');
  expect(progress).toHaveAttribute('aria-valuemin', '0');
  expect(progress).toHaveAttribute('aria-valuemax', '100');
  expect(progress).toHaveAttribute('data-variant', 'flat');
  expect(container.querySelector('.md-circular-progress__indicator')).not.toBeNull();
  expect(container.querySelector('.md-circular-progress__track')).not.toBeNull();
});

test('flat indeterminate: drops aria values and marks indicator', async () => {
  const { container } = render(<CircularProgress type="indeterminate" />);
  const progress = screen.getByRole('progressbar', { name: 'Loading' });

  expect(progress).not.toHaveAttribute('aria-valuenow');
  expect(container.querySelector('.md-circular-progress__indicator[data-indeterminate]')).not.toBeNull();
});

test('forwards refs to the root div', async () => {
  const ref = createRef<HTMLDivElement>();
  render(<CircularProgress ref={ref} />);

  expect(ref.current).toBeInstanceOf(HTMLDivElement);
});

test('wavy determinate: renders active wavy path and inactive track arc', async () => {
  const { container } = render(<CircularProgress variant="wavy" value={42} />);
  const progress = screen.getByRole('progressbar', { name: 'Progress: 42%' });

  expect(progress).toHaveAttribute('data-variant', 'wavy');

  const active = container.querySelector('.md-circular-progress__wavy-active') as SVGPathElement;
  const track = container.querySelector('.md-circular-progress__wavy-track') as SVGPathElement;
  expect(active).not.toBeNull();
  expect(track).not.toBeNull();
  // Wavy path is sampled as line segments → "L " present; flat track arc is "A r r 0 0 0 ...".
  expect(active.getAttribute('d') ?? '').toContain('L ');
  expect(track.getAttribute('d') ?? '').toContain(' A ');
});

test('wavy determinate at 100%: renders a flat (no-amplitude) full ring', async () => {
  const { container } = render(<CircularProgress variant="wavy" value={100} />);
  const active = container.querySelector('.md-circular-progress__wavy-active') as SVGPathElement;
  expect(active).not.toBeNull();
  // At full, amplitude clamps to 0, so the active path is drawn by drawCircularArc
  // (which emits "A" commands) rather than drawWavyArc (which emits only "L").
  expect(active.getAttribute('d') ?? '').toContain(' A ');
});

test('wavy determinate at 0%: shows only the full track, no active', async () => {
  const { container } = render(<CircularProgress variant="wavy" value={0} />);
  expect(container.querySelector('.md-circular-progress__wavy-active')).toBeNull();
  expect(container.querySelector('.md-circular-progress__wavy-track')).not.toBeNull();
});

test('wavy indeterminate: drops aria values and applies spinning svg class', async () => {
  const { container } = render(<CircularProgress variant="wavy" type="indeterminate" />);
  const progress = screen.getByRole('progressbar', { name: 'Loading' });

  expect(progress).not.toHaveAttribute('aria-valuenow');
  expect(progress).toHaveAttribute('data-indeterminate', 'true');
  expect(container.querySelector('.md-circular-progress__svg--wavy-spin')).not.toBeNull();
  expect(container.querySelector('.md-circular-progress__wavy-active')).not.toBeNull();
  expect(container.querySelector('.md-circular-progress__wavy-track')).not.toBeNull();
});

test('deprecated indeterminate prop resolves to indeterminate type', async () => {
  render(<CircularProgress indeterminate />);
  const progress = screen.getByRole('progressbar', { name: 'Loading' });
  expect(progress).toHaveAttribute('data-type', 'indeterminate');
  expect(progress).not.toHaveAttribute('aria-valuenow');
});

test('wavy determinate at a small value flattens the wave (no mask)', async () => {
  const { container } = render(<CircularProgress variant="wavy" value={3} />);
  const active = container.querySelector('.md-circular-progress__wavy-active') as SVGPathElement;
  expect(active).not.toBeNull();
  // Amplitude clamps to 0 for tiny sweeps, so the active arc is a plain "A" arc with no mask.
  expect(active.getAttribute('d') ?? '').toContain(' A ');
  expect(active.closest('g')?.getAttribute('mask')).toBeFalsy();
});

/* -------------------------------------------------------------------------- */
/* wavy-arc geometry helpers (direct unit tests)                              */
/* -------------------------------------------------------------------------- */

test('sizeToDegrees converts a pixel size to degrees', async () => {
  expect(sizeToDegrees(8, 48, 4, 1.6)).toBeGreaterThan(0);
});

test('drawCircularArc returns an empty result for a zero diameter or stroke', async () => {
  expect(drawCircularArc({ diameter: 0, strokeWidth: 4, amplitude: 0 })).toEqual({ path: '', viewBox: '0 0 0 0' });
  expect(drawCircularArc({ diameter: 48, strokeWidth: 0, amplitude: 0 })).toEqual({ path: '', viewBox: '0 0 0 0' });
});

test('drawCircularArc applies a gap and a small-arc flag for short sweeps', async () => {
  const arc = drawCircularArc({ diameter: 48, strokeWidth: 4, amplitude: 1.6, startAngle: 0, endAngle: 90, gap: 4 });
  expect(arc.path).toMatch(/A [\d.]+ [\d.]+ 0 0 0/);
});

test('drawWavyArc returns an empty result for a zero diameter or stroke', async () => {
  expect(drawWavyArc({ diameter: 0, strokeWidth: 4, wavelength: 15, amplitude: 1.6 })).toEqual({
    path: '',
    viewBox: '0 0 0 0',
  });
  expect(drawWavyArc({ diameter: 48, strokeWidth: 0, wavelength: 15, amplitude: 1.6 })).toEqual({
    path: '',
    viewBox: '0 0 0 0',
  });
});

test('drawWavyArc applies a gap to its endpoints', async () => {
  const arc = drawWavyArc({ diameter: 48, strokeWidth: 4, wavelength: 15, amplitude: 1.6, gap: 4 });
  expect(arc.path).toContain('L ');
});

test('drawWavyArc handles a zero-length arc and wrap-around angles', async () => {
  const zero = drawWavyArc({
    diameter: 48,
    strokeWidth: 4,
    wavelength: 15,
    amplitude: 1.6,
    startAngle: 90,
    endAngle: 90,
  });
  expect(zero.path.startsWith('M ')).toBe(true);

  const wrap = drawWavyArc({
    diameter: 48,
    strokeWidth: 4,
    wavelength: 15,
    amplitude: 1.6,
    startAngle: 270,
    endAngle: 90,
  });
  expect(wrap.path).toContain('L ');
});

test('drawWavyArc with zero steps yields only a move command', async () => {
  const arc = drawWavyArc({ diameter: 48, strokeWidth: 4, wavelength: 15, amplitude: 1.6, steps: 0 });
  expect(arc.path.startsWith('M ')).toBe(true);
  expect(arc.path).not.toContain('L ');
});

test('wavy indeterminate animation ticks through all sweep phases', async () => {
  const base = performance.now();
  // One timestamp per phase of the four-phase oscillation cycle (cycle = 1575ms * 4).
  const offsets = [800, 2400, 4000, 5600];
  let i = 0;
  vi.spyOn(window, 'requestAnimationFrame').mockImplementation((cb: FrameRequestCallback) => {
    if (i < offsets.length) {
      const off = offsets[i++];
      cb(base + off);
    }
    return i;
  });
  vi.spyOn(window, 'cancelAnimationFrame').mockImplementation(() => {});

  const { container } = render(<CircularProgress variant="wavy" type="indeterminate" />);

  const active = container.querySelector('.md-circular-progress__wavy-active') as SVGPathElement;
  const track = container.querySelector('.md-circular-progress__wavy-track') as SVGPathElement;
  // The rAF loop recomputed and applied paths.
  expect(active.getAttribute('d') ?? '').toContain('L ');
  expect(track.getAttribute('d') ?? '').toContain(' A ');
});
