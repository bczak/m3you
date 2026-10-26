import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { cleanup, render, screen } from '@testing-library/react';
import { createRef } from 'react';
import { afterEach, expect, test, vi } from 'vitest';
import { CircularProgress } from '../src/components/CircularProgress/circular-progress';
import {
  drawCircularArc,
  drawWavyArc,
  separationDegrees,
  sizeToDegrees,
  wavyRadiusAt,
} from '../src/components/CircularProgress/wavy-arc';

afterEach(() => {
  vi.restoreAllMocks();
  cleanup();
});

const css = readFileSync(resolve(process.cwd(), 'src/components/CircularProgress/circular-progress.css'), 'utf8');

/** Visible gap between the active indicator and the track (M3: 4 dp). */
const ARC_GAP = 4;

type Point = { x: number; y: number };

const distance = (a: Point, b: Point) => Math.hypot(a.x - b.x, a.y - b.y);

/** Dash length, pattern gap and start (−offset) of a flat circle's inline style. */
const dashOf = (element: Element | null) => {
  const style = (element as SVGElement).style;
  const [length, gap] = style.strokeDasharray.split(/\s+/).map(Number);
  return { length, gap, start: -Number(style.strokeDashoffset) };
};

/** Point `along` px round a ring of radius `r` from 12 o'clock, clockwise (the flat circles are rotated −90°). */
const pointAlong = (r: number, along: number): Point => {
  const angle = along / r - Math.PI / 2;
  return { x: r * Math.cos(angle), y: r * Math.sin(angle) };
};

const numbersOf = (d: string): number[] => d.match(/-?[\d.]+(?:e-?\d+)?/g)?.map(Number) ?? [];

/** Every coordinate pair of a polyline `d` (`M x,y L x,y …`), in order. */
const pointsOf = (d: string): Point[] => {
  const numbers = numbersOf(d);
  const points: Point[] = [];
  for (let i = 0; i + 1 < numbers.length; i += 2) points.push({ x: numbers[i], y: numbers[i + 1] });
  return points;
};

const pathPoints = (element: Element | null): Point[] => pointsOf(element?.getAttribute('d') ?? '');

/** Start point, radius and end point of a single-arc path `M x y A r r 0 large 0 x y`. */
const arcOf = (element: Element | null) => {
  const [x0, y0, radius, , , , , x1, y1] = numbersOf(element?.getAttribute('d') ?? '');
  return { start: { x: x0, y: y0 }, radius, end: { x: x1, y: y1 } };
};

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

// The partial wave used to be the full ring behind a <mask> whose id came from useId() (`:r0:` on React 18, `«r0»`
// on 19). The mask's round cap is wider than the stroke and reaches past its angle, which pulled the track to ~3.4dp
// at sm 8dp, and its default region (the path's bbox + 10%) clipped the 8dp crests. The wave is now drawn only over
// its sweep, with the stroke's own round caps, as the indeterminate wave already was — no mask, no generated id.
test('wavy determinate draws only the swept wave, with its own round caps and no <mask>', async () => {
  const { container } = render(<CircularProgress variant="wavy" value={42} />);
  const active = container.querySelector('.md-circular-progress__wavy-active') as SVGPathElement;

  expect(container.querySelector('mask, defs, [mask]')).toBeNull();
  expect(active).toHaveAttribute('stroke-linecap', 'round');
  // A partial sweep: the path starts and ends well apart, both on the wave (radius 18.8–22 round the 24px centre).
  const wave = pathPoints(active);
  expect(distance(wave[0], wave[wave.length - 1])).toBeGreaterThan(10);
  for (const point of wave) expect(distance(point, { x: 24, y: 24 })).toBeGreaterThan(18.79);
});

test('wavy determinate at 100%: the completed ring stays wavy', async () => {
  const { container } = render(<CircularProgress variant="wavy" value={100} />);
  const active = container.querySelector('.md-circular-progress__wavy-active') as SVGPathElement;
  expect(active).not.toBeNull();
  // Kit: Wave Progress=100 is a 9-cycle wavy ring (47.63×47.12), not a circle — so the active path is the sampled
  // wave ("L" segments), closing on itself, with no track left over.
  expect(active.getAttribute('d') ?? '').toContain('L ');
  expect(active.getAttribute('d') ?? '').not.toContain(' A ');
  const wave = pathPoints(active);
  expect(distance(wave[0], wave[wave.length - 1])).toBeCloseTo(0);
  expect(container.querySelector('.md-circular-progress__wavy-track')).toBeNull();
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

test('wavy determinate at a small value flattens the wave', async () => {
  const { container } = render(<CircularProgress variant="wavy" value={3} />);
  const active = container.querySelector('.md-circular-progress__wavy-active') as SVGPathElement;
  expect(active).not.toBeNull();
  // Amplitude clamps to 0 for tiny sweeps, so the active arc is a plain "A" arc on the wave's mean circle.
  expect(active.getAttribute('d') ?? '').toContain(' A ');
  expect(arcOf(active).radius).toBeCloseTo(20.4);
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

test('drawCircularArc sets the large-arc flag only for sweeps over 180 degrees', async () => {
  const short = drawCircularArc({ diameter: 48, strokeWidth: 4, amplitude: 1.6, startAngle: 0, endAngle: 90 });
  expect(short.path).toMatch(/A [\d.]+ [\d.]+ 0 0 0/);
  const long = drawCircularArc({ diameter: 48, strokeWidth: 4, amplitude: 1.6, startAngle: 0, endAngle: 270 });
  expect(long.path).toMatch(/A [\d.]+ [\d.]+ 0 1 0/);
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

/* -------------------------------------------------------------------------- */
/* Flat geometry                                                              */
/* -------------------------------------------------------------------------- */

test.each([
  4, 8,
] as const)('flat determinate at 50%%, %ddp: indicator covers [0, 50%%] with a 4dp gap at both ends', (thickness) => {
  const { container } = render(<CircularProgress value={50} thickness={thickness} />);
  const r = 18;
  const circumference = 2 * Math.PI * r;
  const indicator = dashOf(container.querySelector('.md-circular-progress__indicator'));
  const track = dashOf(container.querySelector('.md-circular-progress__track'));

  // Each arc is a single dash in a pattern one circumference long.
  expect(indicator.length + indicator.gap).toBeCloseTo(circumference);
  expect(track.length + track.gap).toBeCloseTo(circumference);

  // The indicator's round caps land on 12 o'clock and on the 50% mark.
  expect(indicator.start).toBeCloseTo(thickness / 2);
  expect(indicator.start + indicator.length + thickness / 2).toBeCloseTo(circumference / 2);

  // Kit: the caps are separated by ~4dp, not touching (4dp) or overlapping (8dp) — measured cap to cap.
  const indicatorStart = pointAlong(r, indicator.start);
  const indicatorEnd = pointAlong(r, indicator.start + indicator.length);
  const trackStart = pointAlong(r, track.start);
  const trackEnd = pointAlong(r, track.start + track.length);
  expect(distance(indicatorEnd, trackStart) - thickness).toBeCloseTo(ARC_GAP);
  expect(distance(trackEnd, indicatorStart) - thickness).toBeCloseTo(ARC_GAP);
});

test("flat CSS starts every dash at 12 o'clock", async () => {
  const rule = css.match(/\.md-circular-progress__track,\s*\.md-circular-progress__indicator \{[^}]*\}/)?.[0] ?? '';
  expect(rule).toContain('transform: rotate(-90deg)');
  expect(rule).toContain('transform-origin: center');
});

test('flat determinate at 0%: draws only the full track, no indicator dot', async () => {
  const { container } = render(<CircularProgress value={0} />);
  expect(container.querySelector('.md-circular-progress__indicator')).toBeNull();
  const track = container.querySelector('.md-circular-progress__track') as SVGCircleElement;
  expect(track).not.toBeNull();
  expect(track.style.strokeDasharray).toBe('');
});

test('flat determinate at 100%: draws the full indicator ring and no track', async () => {
  const { container } = render(<CircularProgress value={100} />);
  const indicator = container.querySelector('.md-circular-progress__indicator') as SVGCircleElement;
  expect(indicator).not.toBeNull();
  expect(indicator.style.strokeDasharray).toBe('');
  expect(container.querySelector('.md-circular-progress__track')).toBeNull();
});

test('flat determinate drops the track once there is no room for it between the gaps', async () => {
  const { container } = render(<CircularProgress value={99} />);
  expect(container.querySelector('.md-circular-progress__indicator')).not.toBeNull();
  expect(container.querySelector('.md-circular-progress__track')).toBeNull();
});

test("flat determinate keeps a tiny value to one cap-wide dot at 12 o'clock", async () => {
  const { container } = render(<CircularProgress value={0.5} />);
  const indicator = dashOf(container.querySelector('.md-circular-progress__indicator'));
  expect(indicator.length).toBe(0);
  expect(indicator.start).toBe(2);
  expect(container.querySelector('.md-circular-progress__track')).not.toBeNull();
});

test.each([
  ['sm', 4, 24, 10],
  ['sm', 8, 28, 10],
  ['md', 4, 40, 18],
  ['md', 8, 44, 18],
  ['lg', 4, 48, 22],
  ['lg', 8, 52, 22],
] as const)('flat %s at %ddp: %dpx box around a fixed centre-line radius of %d', (size, thickness, box, radius) => {
  const { container } = render(<CircularProgress size={size} thickness={thickness} value={40} />);
  const root = screen.getByRole('progressbar');
  expect(root).toHaveStyle({ width: `${box}px`, height: `${box}px` });
  expect(container.querySelector('svg')).toHaveAttribute('viewBox', `0 0 ${box} ${box}`);
  for (const circle of container.querySelectorAll('circle')) {
    expect(circle).toHaveAttribute('r', String(radius));
    expect(circle).toHaveAttribute('stroke-width', String(thickness));
  }
});

test('flat: the legacy strokeWidth sizes the box the same way, and a consumer style still wins', async () => {
  const { rerender } = render(<CircularProgress strokeWidth={6} value={40} />);
  expect(screen.getByRole('progressbar')).toHaveStyle({ width: '42px', height: '42px' });
  expect(screen.getByRole('progressbar')).toHaveAttribute('data-thickness', '6');

  rerender(<CircularProgress value={40} style={{ width: 80, height: 80 }} />);
  expect(screen.getByRole('progressbar')).toHaveStyle({ width: '80px', height: '80px' });
});

/** The three flat indeterminate keyframes, read back from the custom properties the component sets on the svg. */
const flatIndeterminateFrames = (svg: SVGSVGElement) => {
  const read = (name: string) => svg.style.getPropertyValue(name).trim().split(/\s+/).map(Number);
  const frame = (dash: string, indicatorStart: number, trackDash: string, trackOffset: string) => ({
    pattern: read(dash),
    start: indicatorStart,
    trackPattern: read(trackDash),
    trackStart: -read(trackOffset)[0],
  });
  return [
    frame('--_dash-min', 0, '--_track-dash-min', '--_track-offset-start'),
    frame('--_dash-max', -read('--_dash-offset-mid')[0], '--_track-dash-max', '--_track-offset-mid'),
    frame('--_dash-min', -read('--_dash-offset-end')[0], '--_track-dash-min', '--_track-offset-end'),
  ];
};

test.each([
  ['sm', 4, 10],
  ['md', 4, 18],
  ['md', 8, 18],
  ['lg', 4, 22],
] as const)('flat indeterminate %s %ddp: the arc never runs off the path and the track follows it', (size, thickness, r) => {
  const { container } = render(<CircularProgress size={size} thickness={thickness} type="indeterminate" />);
  const svg = container.querySelector('svg') as SVGSVGElement;
  const circumference = 2 * Math.PI * r;
  // Centre-line distance along the ring that leaves a 4dp straight-line gap between the round caps.
  const separation = 2 * r * Math.asin((ARC_GAP + thickness) / (2 * r));
  const frames = flatIndeterminateFrames(svg);

  for (const { pattern, start, trackPattern, trackStart } of frames) {
    // One-circumference patterns wrap round 12 o'clock, so some arc is always on screen at every size.
    expect(pattern[0] + pattern[1]).toBeCloseTo(circumference);
    expect(trackPattern[0] + trackPattern[1]).toBeCloseTo(circumference);
    expect(pattern[0]).toBeGreaterThan(0);
    // The track starts one gap past the head and stops one gap before the tail.
    expect(trackStart).toBeCloseTo(start + pattern[0] + separation);
    expect(trackPattern[0]).toBeCloseTo(circumference - pattern[0] - 2 * separation);
  }
  // Grow until the head reaches 12 o'clock, then shrink back to where the cycle began.
  expect(frames[1].start + frames[1].pattern[0]).toBeCloseTo(circumference);
  expect(frames[2].start).toBeCloseTo(circumference);

  expect(container.querySelector('.md-circular-progress__track[data-indeterminate]')).not.toBeNull();
  expect(container.querySelector('.md-circular-progress__indicator[data-indeterminate]')).not.toBeNull();
});

test('flat indeterminate on a small, thick ring caps the arc so the track never goes negative', async () => {
  const { container } = render(<CircularProgress size="sm" thickness={8} type="indeterminate" />);
  const [, mid] = flatIndeterminateFrames(container.querySelector('svg') as SVGSVGElement);
  const r = 10;
  const separation = 2 * r * Math.asin((ARC_GAP + 8) / (2 * r));
  expect(mid.pattern[0]).toBeCloseTo(2 * Math.PI * r - 2 * separation);
  expect(mid.trackPattern[0]).toBe(0);
});

test('flat indeterminate CSS animates both arcs from the per-size custom properties', async () => {
  const keyframes = (name: string) => css.match(new RegExp(`@keyframes ${name} \\{[\\s\\S]*?\\n\\}`))?.[0] ?? '';
  const dash = keyframes('md-circular-progress-dash');
  const trackDash = keyframes('md-circular-progress-track-dash');

  expect(dash).toContain('var(--_dash-min)');
  expect(dash).toContain('var(--_dash-max)');
  expect(dash).toContain('var(--_dash-offset-end)');
  expect(trackDash).toContain('var(--_track-dash-max)');
  expect(trackDash).toContain('var(--_track-offset-end)');
  // No absolute lengths tuned for one radius (the old 90/200 dash slid off the end of smaller rings).
  expect(`${dash}${trackDash}`).not.toMatch(/stroke-dash(?:array|offset):\s*-?[1-9]/);
  expect(css).toMatch(/\.md-circular-progress__track\[data-indeterminate\] \{[^}]*md-circular-progress-track-dash/);
});

/* -------------------------------------------------------------------------- */
/* Wavy geometry                                                              */
/* -------------------------------------------------------------------------- */

test.each([
  [4, 48],
  [8, 52],
] as const)('wavy at %ddp: %dpx box, track on the wave crest (r = 22), amplitude fixed at 1.6', (thickness, box) => {
  const { container, rerender } = render(<CircularProgress variant="wavy" thickness={thickness} value={0} />);
  expect(screen.getByRole('progressbar')).toHaveStyle({ width: `${box}px`, height: `${box}px` });
  expect(container.querySelector('svg')).toHaveAttribute('viewBox', `0 0 ${box} ${box}`);
  // Kit: Wave Progress=0 track is 48.16 / 52.17 — centre-line r ≈ 22.08 for both thicknesses.
  expect(arcOf(container.querySelector('.md-circular-progress__wavy-track')).radius).toBeCloseTo(22);

  rerender(<CircularProgress variant="wavy" thickness={thickness} value={100} />);
  const radii = pathPoints(container.querySelector('.md-circular-progress__wavy-active')).map((p) =>
    distance(p, { x: box / 2, y: box / 2 }),
  );
  // The wave's centre-line runs 20.4 ± 1.6 at both thicknesses; its crest meets the track radius.
  expect(Math.max(...radii)).toBeCloseTo(22, 1);
  expect(Math.min(...radii)).toBeCloseTo(18.8, 1);
});

/** Wavy box per size at 4dp (the kit's md is 48); the box grows with the stroke round a fixed track radius. */
const WAVY_BOX = { sm: 28, md: 48, lg: 64 } as const;
const WAVY_CASES = [
  ['sm', 4],
  ['sm', 8],
  ['md', 4],
  ['md', 8],
  ['lg', 4],
  ['lg', 8],
] as const;

/** Clockwise angle of `p` from 12 o'clock round the centre (c, c), in degrees. */
const angleOf = (p: Point, c: number) => ((Math.atan2(p.x - c, c - p.y) * 180) / Math.PI + 360) % 360;

/** How far, in degrees, a round cap of radius `cap` centred on `p` reaches round the centre (c, c). */
const capReach = (p: Point, c: number, cap: number) => (Math.asin(cap / distance(p, { x: c, y: c })) * 180) / Math.PI;

/**
 * The active indicator's centre-line from its start angle to its end angle: the sampled wave, or — for a sweep small
 * enough to be flattened — the end points of its single arc, which are its closest points to anything beyond them.
 */
const activePoints = (element: Element | null): Point[] => {
  if (!(element?.getAttribute('d') ?? '').includes(' A ')) return pathPoints(element);
  const arc = arcOf(element);
  return [arc.end, arc.start];
};

/**
 * Visible gaps between a round-capped wave and the two round-capped ends of the track, both `stroke` wide. The wave
 * lies outside the track's sweep, so the track's nearest point to it is one of the track's ends: each gap is the
 * closest point of the wave's centre-line to that end, less half a stroke for each cap.
 */
const gapsTo = (wave: Point[], track: ReturnType<typeof arcOf>, stroke: number) =>
  [track.start, track.end].map((end) => Math.min(...wave.map((point) => distance(point, end))) - stroke);

test.each(
  WAVY_CASES,
)('wavy determinate %s %ddp: the wave covers [0, value] and the track keeps a 4dp gap at both ends', (size, thickness) => {
  const c = (WAVY_BOX[size] + thickness - 4) / 2;
  for (const value of [30, 42, 50]) {
    const { container, unmount } = render(
      <CircularProgress variant="wavy" size={size} thickness={thickness} value={value} />,
    );
    const wave = activePoints(container.querySelector('.md-circular-progress__wavy-active'));
    const first = wave[0];
    const last = wave[wave.length - 1];

    // The wave's own round caps reach exactly 12 o'clock and the value's angle.
    expect(angleOf(first, c) - capReach(first, c, thickness / 2)).toBeCloseTo(0, 3);
    expect(angleOf(last, c) + capReach(last, c, thickness / 2)).toBeCloseTo(value * 3.6, 3);

    // The whole wave, not only its end points, stays ARC_GAP clear of the track's caps — at sm 8dp the old masked
    // wave measured ~3.4dp here.
    const track = arcOf(container.querySelector('.md-circular-progress__wavy-track'));
    for (const gap of gapsTo(wave, track, thickness)) expect(gap).toBeCloseTo(ARC_GAP, 3);
    unmount();
  }
});

test('wavy determinate drops the track once there is no room for it between the gaps', async () => {
  const { container } = render(<CircularProgress variant="wavy" value={99} />);
  expect(container.querySelector('.md-circular-progress__wavy-active')).not.toBeNull();
  expect(container.querySelector('.md-circular-progress__wavy-track')).toBeNull();
});

test.each(
  WAVY_CASES,
)('wavy indeterminate %s %ddp: the track keeps a 4dp gap from the wave through the whole cycle', (size, thickness) => {
  const frames: Array<{ wave: Point[]; track: ReturnType<typeof arcOf> }> = [];
  const base = performance.now();
  let frame = 0;
  // Record what is on screen each time the loop asks for a frame, then step 300ms on — 21 frames span the four-phase
  // cycle (4 × 1575ms), through the minimum and maximum sweeps and both transitions.
  vi.spyOn(window, 'requestAnimationFrame').mockImplementation((tick: FrameRequestCallback) => {
    frames.push({
      wave: pathPoints(document.querySelector('.md-circular-progress__wavy-active')),
      track: arcOf(document.querySelector('.md-circular-progress__wavy-track')),
    });
    if (frame < 21) tick(base + 300 * frame++);
    return frame;
  });
  vi.spyOn(window, 'cancelAnimationFrame').mockImplementation(() => {});

  render(<CircularProgress variant="wavy" type="indeterminate" size={size} thickness={thickness} />);

  expect(frames).toHaveLength(22);
  for (const { wave, track } of frames) {
    expect(track.radius).toBeCloseTo((WAVY_BOX[size] - 4) / 2);
    for (const gap of gapsTo(wave, track, thickness)) expect(gap).toBeCloseTo(ARC_GAP, 3);
  }
});

test.each([
  'determinate',
  'indeterminate',
] as const)('wavy %s: a consumer style sizes the box, as on the flat variant', (type) => {
  const { container } = render(
    <CircularProgress variant="wavy" type={type} value={40} style={{ width: 96, height: 96, margin: 4 }} />,
  );
  expect(screen.getByRole('progressbar')).toHaveStyle({ width: '96px', height: '96px', margin: '4px' });
  // The wavy svg carries width/height attributes at the computed size; only the CSS rule stretching it to the root
  // lets the ring scale with that box (happy-dom loads no CSS, so read the rule itself).
  expect(container.querySelector('svg')).toHaveClass('md-circular-progress__svg');
  const rule = css.match(/\.md-circular-progress__svg \{[^}]*\}/)?.[0] ?? '';
  expect(rule).toContain('width: 100%');
  expect(rule).toContain('height: 100%');
});

test('flat: the ring scales with a consumer-sized box instead of keeping a screen-pixel stroke', async () => {
  const { container } = render(<CircularProgress value={40} style={{ width: 80, height: 80 }} />);
  // `vector-effect: non-scaling-stroke` measures dashes in screen pixels, so on an 80px box Chromium repeated the
  // one-circumference dash pattern round the doubled ring and drew the 40% indicator twice.
  for (const circle of container.querySelectorAll('circle')) {
    expect(circle).not.toHaveAttribute('vector-effect');
    expect(circle).not.toHaveAttribute('vectorEffect');
  }
});

test('separationDegrees turns a straight-line distance between concentric points into an angle', async () => {
  expect(separationDegrees(0, 10, 10)).toBe(0);
  expect(separationDegrees(10 * Math.SQRT2, 10, 10)).toBeCloseTo(90);
  // Out-of-range distances clamp instead of returning NaN.
  expect(separationDegrees(100, 10, 10)).toBe(180);
  expect(separationDegrees(5, 10, 20)).toBe(0);
});

test('wavyRadiusAt matches the wave drawWavyArc samples', async () => {
  const wave = { diameter: 40.8, strokeWidth: 4, wavelength: (Math.PI * 40.8) / 9, amplitude: 1.6 };
  // Crest at 12 o'clock, trough at 6 o'clock.
  expect(wavyRadiusAt({ ...wave, degrees: 0 })).toBeCloseTo(22);
  expect(wavyRadiusAt({ ...wave, degrees: 180 })).toBeCloseTo(18.8);
  const [first] = pointsOf(drawWavyArc({ ...wave, startAngle: 90, endAngle: 120 }).path);
  expect(distance(first, { x: 24, y: 24 })).toBeCloseTo(wavyRadiusAt({ ...wave, degrees: 90 }));
});
