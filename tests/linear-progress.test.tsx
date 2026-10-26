import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { render, screen } from '@testing-library/react';
import { createRef } from 'react';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';
import { LinearProgress } from '../src/components/LinearProgress/linear-progress';
import { drawLinearWaveSegment } from '../src/components/LinearProgress/wavy-path';

const css = readFileSync(resolve(process.cwd(), 'src/components/LinearProgress/linear-progress.css'), 'utf8');

/** Declarations of the first rule whose selector list is exactly `selector`. */
const rule = (selector: string) => {
  let start = css.indexOf(`\n${selector} {`);
  // Skip selector lists that merely end in `selector`.
  while (start > 0 && css[start - 1] === ',') start = css.indexOf(`\n${selector} {`, start + 1);
  expect(start, selector).toBeGreaterThanOrEqual(0);
  return css.slice(css.indexOf('{', start) + 1, css.indexOf('}', start));
};

/** Body of an @keyframes block. */
const keyframes = (name: string) => {
  const start = css.indexOf(`@keyframes ${name} {`);
  expect(start, name).toBeGreaterThanOrEqual(0);
  return css.slice(start, css.indexOf('\n}', start));
};

/* -------------------------------------------------------------------------- */
/* Frame loop and layout stubs                                                */
/* -------------------------------------------------------------------------- */

const START = 1000;
let frames: FrameRequestCallback[] = [];
/** Box per class name; anything else measures as an empty box at the origin. */
let rects: Record<string, { left?: number; width?: number; height?: number }> = {};

beforeEach(() => {
  frames = [];
  rects = {};
  vi.spyOn(performance, 'now').mockReturnValue(START);
  vi.spyOn(window, 'requestAnimationFrame').mockImplementation((callback: FrameRequestCallback) => {
    frames.push(callback);
    return frames.length;
  });
  vi.spyOn(window, 'cancelAnimationFrame').mockImplementation(() => {});
  vi.spyOn(Element.prototype, 'getBoundingClientRect').mockImplementation(function (this: Element) {
    const match = Object.keys(rects).find((name) => this.classList.contains(name));
    const box = { left: 0, width: 0, height: 0, ...(match ? rects[match] : {}) };
    return { ...box, top: 0, x: box.left, y: 0, right: box.left + box.width, bottom: box.height } as DOMRect;
  });
});

afterEach(() => {
  vi.restoreAllMocks();
});

/** Runs the next queued animation frame `elapsed` ms after the wave started. */
const nextFrame = (elapsed: number) => {
  const callback = frames.shift() as FrameRequestCallback;
  callback(START + elapsed);
};

type Point = { x: number; y: number };
type Piece = { from: Point; control: Point; to: Point };

/** Splits `M x,y Q cx,cy x,y …` into quadratic pieces. */
const piecesOf = (d: string): Piece[] => {
  const numbers = d.match(/-?[\d.]+/g)?.map(Number) ?? [];
  const pieces: Piece[] = [];
  let from = { x: numbers[0], y: numbers[1] };
  for (let i = 2; i < numbers.length; i += 4) {
    const control = { x: numbers[i], y: numbers[i + 1] };
    const to = { x: numbers[i + 2], y: numbers[i + 3] };
    pieces.push({ from, control, to });
    from = to;
  }
  return pieces;
};

const bezierAt = ({ from, control, to }: Piece, t: number): Point => ({
  x: (1 - t) ** 2 * from.x + 2 * t * (1 - t) * control.x + t ** 2 * to.x,
  y: (1 - t) ** 2 * from.y + 2 * t * (1 - t) * control.y + t ** 2 * to.y,
});

const waveOf = (container: HTMLElement) =>
  container.querySelector('.md-linear-progress__wave path')?.getAttribute('d') ?? '';

/* -------------------------------------------------------------------------- */
/* Semantics and API                                                          */
/* -------------------------------------------------------------------------- */

test('renders determinate progress from the provided value', () => {
  const { container } = render(<LinearProgress value={54} />);
  const progress = screen.getByRole('progressbar', { name: 'Progress: 54%' });
  const row = container.querySelector('.md-linear-progress__row') as HTMLDivElement;

  expect(progress).toHaveAttribute('aria-valuenow', '54');
  expect(progress).toHaveAttribute('aria-valuemin', '0');
  expect(progress).toHaveAttribute('aria-valuemax', '100');
  expect(row.style.getPropertyValue('--_value')).toBe('54%');
  expect(container.querySelector('.md-linear-progress__active')).not.toBeNull();
});

test('clamps determinate values to the valid range', () => {
  const { container, rerender } = render(<LinearProgress value={-12} />);
  let progress = screen.getByRole('progressbar', { name: 'Progress: 0%' });
  const row = container.querySelector('.md-linear-progress__row') as HTMLDivElement;

  expect(progress).toHaveAttribute('aria-valuenow', '0');
  expect(row.style.getPropertyValue('--_value')).toBe('0%');

  rerender(<LinearProgress value={140} />);
  progress = screen.getByRole('progressbar', { name: 'Progress: 100%' });

  expect(progress).toHaveAttribute('aria-valuenow', '100');
  expect(progress).toHaveAttribute('data-complete');
  expect(container.querySelector('.md-linear-progress__complete')).not.toBeNull();
});

test('renders indeterminate progress without determinate aria values', () => {
  const { container } = render(<LinearProgress type="indeterminate" />);
  const progress = screen.getByRole('progressbar', { name: 'Loading' });

  expect(progress).not.toHaveAttribute('aria-valuenow');
  expect(progress).not.toHaveAttribute('aria-valuemin');
  expect(progress).not.toHaveAttribute('aria-valuemax');
  expect(container.querySelectorAll('.md-linear-progress__indeterminate-segment')).toHaveLength(1);
});

test('passes through standard div props, merges className and keeps consumer styles', () => {
  render(
    <LinearProgress className="custom-class" data-testid="progress" id="download-progress" style={{ margin: 4 }} />,
  );
  const progress = screen.getByTestId('progress');

  expect(progress).toHaveClass('md-linear-progress');
  expect(progress).toHaveClass('custom-class');
  expect(progress).toHaveAttribute('id', 'download-progress');
  expect(progress.style.margin).toBe('4px');
});

test('forwards refs to the root div', () => {
  const ref = createRef<HTMLDivElement>();
  render(<LinearProgress ref={ref} />);

  expect(ref.current).toBeInstanceOf(HTMLDivElement);
});

test('deprecated `indeterminate` prop resolves to the indeterminate type', () => {
  const { container } = render(<LinearProgress indeterminate />);
  const progress = screen.getByRole('progressbar', { name: 'Loading' });

  expect(progress).toHaveAttribute('data-type', 'indeterminate');
  expect(progress).toHaveAttribute('data-indeterminate', 'true');
  expect(progress).not.toHaveAttribute('aria-valuenow');
  expect(container.querySelector('.md-linear-progress__indeterminate-segment')).not.toBeNull();
});

/* -------------------------------------------------------------------------- */
/* Determinate layout: active, gap, track to the end, stop on top              */
/* -------------------------------------------------------------------------- */

test('determinate row is active, one gap, then a track that runs to the end under the stop', () => {
  const { container } = render(<LinearProgress variant="wavy" value={42} />);
  const row = container.querySelector('.md-linear-progress__row') as HTMLDivElement;
  const parts = Array.from(row.children).map((child) => child.className.replace('md-linear-progress__', ''));

  expect(parts).toEqual(['active', 'gap', 'track', 'stop']);
  // The track fills the rest of the row; the stop is taken out of the flow and laid over its rounded end.
  expect(rule('.md-linear-progress__track')).toContain('flex: 1 1 auto');
  expect(rule('.md-linear-progress__row')).toContain('position: relative');
  const stop = rule('.md-linear-progress__stop');
  expect(stop).toContain('position: absolute');
  expect(stop).toContain('inset-inline-end: 0');
  expect(stop).toContain('top: 50%');
});

test('at 0% the track and stop fill the whole row', () => {
  const { container } = render(<LinearProgress variant="wavy" value={0} />);
  const row = container.querySelector('.md-linear-progress__row') as HTMLDivElement;

  expect(container.querySelector('.md-linear-progress__active')).toBeNull();
  expect(container.querySelector('.md-linear-progress__gap')).toBeNull();
  expect(Array.from(row.children).map((child) => child.className)).toEqual([
    'md-linear-progress__track',
    'md-linear-progress__stop',
  ]);
});

/* -------------------------------------------------------------------------- */
/* Wave geometry                                                               */
/* -------------------------------------------------------------------------- */

test.each([4, 8] as const)('the wave swing stays 3px at %ddp, so only the stroke grows', (thickness) => {
  render(<LinearProgress variant="wavy" value={54} thickness={thickness} />);
  const progress = screen.getByRole('progressbar');

  expect(progress.style.getPropertyValue('--_thickness')).toBe(`${thickness}px`);
  expect(progress.style.getPropertyValue('--_amplitude')).toBe('3px');
  // 4dp → 10px, 8dp → 14px (the kit's 8dp Wave frame).
  expect(rule('.md-linear-progress[data-variant="wavy"]')).toContain(
    'height: calc(var(--_thickness) + var(--_amplitude) * 2)',
  );
});

test('the wavy indicator keeps its height at every value, flat ends included', () => {
  // One unconditional rule: no :not([data-low-value]) / :not([data-complete]) guard that would collapse the bar.
  expect(css).not.toMatch(/\[data-variant="wavy"\]:not\(\[data-complete\]\)/);
  expect(css).not.toMatch(/\[data-variant="wavy"\]:not\(\[data-low-value\]\):not/);

  const { container, rerender } = render(<LinearProgress variant="wavy" value={100} />);
  expect(screen.getByRole('progressbar')).toHaveAttribute('data-complete');
  expect(container.querySelector('.md-linear-progress__complete')).not.toBeNull();
  expect(container.querySelector('svg')).toBeNull();
  // The flat line is centred in the tall box.
  expect(rule('.md-linear-progress__complete')).toContain('transform: translateY(-50%)');

  rerender(<LinearProgress variant="wavy" value={5} />);
  expect(screen.getByRole('progressbar')).toHaveAttribute('data-low-value', 'true');
  expect(rule('.md-linear-progress__row')).toContain('align-items: center');
});

test.each([
  [5, true],
  [10, true],
  [11, false],
  [20, false],
])('wavy at %d%% lies flat: %s', (value, flat) => {
  const { container } = render(<LinearProgress variant="wavy" value={value} />);
  const progress = screen.getByRole('progressbar');

  expect(progress.hasAttribute('data-low-value')).toBe(flat);
  expect(container.querySelector('.md-linear-progress__active svg') === null).toBe(flat);
});

test.each([4, 8] as const)('the determinate wave is drawn cap to cap inside the active box at %ddp', (thickness) => {
  const height = thickness + 6;
  rects = { 'md-linear-progress__active': { width: 200, height } };
  const { container } = render(<LinearProgress variant="wavy" value={50} thickness={thickness} />);
  const path = container.querySelector('.md-linear-progress__wave path') as SVGPathElement;
  const pieces = piecesOf(waveOf(container));

  expect(path).toHaveAttribute('stroke-linecap', 'round');
  expect(path).toHaveAttribute('stroke-width', String(thickness));
  // Round caps reach exactly the box edges: the centre line is inset by half a stroke at both ends.
  expect(pieces[0].from.x).toBe(thickness / 2);
  expect(pieces.at(-1)?.to.x).toBe(200 - thickness / 2);
  // The centre line swings ±3px about the middle of the box, so the stroke fills it exactly.
  const ys = pieces.flatMap((piece) => [0, 0.25, 0.5, 0.75, 1].map((t) => bezierAt(piece, t).y));
  expect(Math.min(...ys)).toBeCloseTo(height / 2 - 3, 3);
  expect(Math.max(...ys)).toBeCloseTo(height / 2 + 3, 3);
  // The box no longer clips the stroke.
  expect(rule('.md-linear-progress__active')).not.toContain('overflow');
  expect(rule('.md-linear-progress__wave')).toContain('overflow: visible');
});

test.each([
  ['determinate', 40, 4],
  ['determinate', 40, 8],
  ['indeterminate', 20, 4],
  ['indeterminate', 20, 8],
] as const)('the %s wave has a %dpx wavelength at %ddp', (type, wavelength, thickness) => {
  rects = {
    'md-linear-progress__active': { width: 300, height: thickness + 6 },
    'md-linear-progress__indeterminate-segment': { width: 300, height: thickness + 6 },
  };
  const { container } = render(<LinearProgress variant="wavy" type={type} value={80} thickness={thickness} />);
  const pieces = piecesOf(waveOf(container));
  // Every whole piece spans half a wavelength, between consecutive zero crossings.
  const whole = pieces.slice(1, -1).map((piece) => piece.to.x - piece.from.x);

  expect(whole.length).toBeGreaterThan(4);
  for (const span of whole) expect(span).toBeCloseTo(wavelength / 2, 3);
  for (const piece of pieces.slice(1)) expect(piece.from.y).toBeCloseTo((thickness + 6) / 2, 3);
});

test('the wave flows along the track over time and stops when unmounted', () => {
  rects = { 'md-linear-progress__active': { width: 200, height: 10 } };
  const { container, unmount } = render(<LinearProgress variant="wavy" value={50} />);
  const initial = piecesOf(waveOf(container));
  expect(initial[0].to.x).toBe(20);

  // A quarter of the 1.5s period moves the wave a quarter wavelength (10px) towards the start.
  nextFrame(375);
  const moved = piecesOf(waveOf(container));
  expect(moved[0].to.x).toBe(10);
  expect(moved[0].from.x).toBe(2);
  expect(moved.at(-1)?.to.x).toBe(198);

  // A whole period brings the wave back to where it started, so the loop is seamless.
  nextFrame(1500);
  expect(piecesOf(waveOf(container))).toEqual(initial);

  // The loop keeps scheduling frames until the component goes away.
  expect(frames).toHaveLength(1);
  unmount();
  expect(window.cancelAnimationFrame).toHaveBeenCalled();
});

test('the wave holds still when the user prefers reduced motion', () => {
  const query = { matches: true };
  vi.spyOn(window, 'matchMedia').mockReturnValue(query as MediaQueryList);
  rects = { 'md-linear-progress__active': { width: 200, height: 10 } };
  const { container } = render(<LinearProgress variant="wavy" value={50} />);
  const initial = piecesOf(waveOf(container));

  expect(window.matchMedia).toHaveBeenCalledWith('(prefers-reduced-motion: reduce)');
  nextFrame(375);
  expect(piecesOf(waveOf(container))).toEqual(initial);

  // The preference is read live, so turning it off lets the wave flow again without a re-render.
  query.matches = false;
  nextFrame(375);
  expect(piecesOf(waveOf(container))[0].to.x).toBe(10);
});

test('the wave flows where matchMedia is unavailable', () => {
  const own = Object.getOwnPropertyDescriptor(window, 'matchMedia');
  Object.defineProperty(window, 'matchMedia', { configurable: true, writable: true, value: undefined });
  try {
    rects = { 'md-linear-progress__active': { width: 200, height: 10 } };
    const { container } = render(<LinearProgress variant="wavy" value={50} />);
    nextFrame(375);
    expect(piecesOf(waveOf(container))[0].to.x).toBe(10);
  } finally {
    if (own) Object.defineProperty(window, 'matchMedia', own);
    else Reflect.deleteProperty(window, 'matchMedia');
  }
});

/** Untransformed layout size of the determinate row: 400 × 10 px. */
const stubRowLayout = () => {
  const isRow = (element: HTMLElement) => element.classList.contains('md-linear-progress__row');
  vi.spyOn(HTMLElement.prototype, 'offsetWidth', 'get').mockImplementation(function (this: HTMLElement) {
    return isRow(this) ? 400 : 0;
  });
  vi.spyOn(HTMLElement.prototype, 'offsetHeight', 'get').mockImplementation(function (this: HTMLElement) {
    return isRow(this) ? 10 : 0;
  });
};

test('the wave is drawn in the box’s own pixels when an ancestor is scaled', () => {
  // A scale(0.5) ancestor halves every client rect, but not the row's layout size or the SVG's coordinates.
  stubRowLayout();
  rects = {
    'md-linear-progress__row': { left: 10, width: 200, height: 5 },
    'md-linear-progress__active': { left: 10, width: 100, height: 5 },
  };
  const { container } = render(<LinearProgress variant="wavy" value={50} />);
  const pieces = piecesOf(waveOf(container));

  // Cap to cap across the unscaled 200px box, swinging about its unscaled 5px centre line.
  expect(pieces[0].from.x).toBe(2);
  expect(pieces[0].to.x).toBe(20);
  expect(pieces.at(-1)?.to.x).toBe(198);
  expect(pieces[1].from.y).toBe(5);
});

test.each([
  ['scaleX(0.5)', { width: 200, height: 10 }, { width: 100, height: 10 }],
  ['scaleY(2)', { width: 400, height: 20 }, { width: 200, height: 20 }],
])('a %s ancestor undoes the scale on each axis separately', (_, row, active) => {
  stubRowLayout();
  rects = {
    'md-linear-progress__row': { left: 10, ...row },
    'md-linear-progress__active': { left: 10, ...active },
  };
  const { container } = render(<LinearProgress variant="wavy" value={50} />);
  const pieces = piecesOf(waveOf(container));

  // Cap to cap across the unscaled 200px box, swinging 3px either side of its unscaled 5px centre line, so the
  // crests stay inside the root's overflow.
  expect(pieces[0].from.x).toBe(2);
  expect(pieces.at(-1)?.to.x).toBe(198);
  const ys = pieces.flatMap((piece) => [0, 0.25, 0.5, 0.75, 1].map((t) => bezierAt(piece, t).y));
  expect(Math.min(...ys)).toBeCloseTo(2, 3);
  expect(Math.max(...ys)).toBeCloseTo(8, 3);
});

test('flat indicators and low or complete wavy values draw no wave and run no frame loop', () => {
  const { rerender } = render(<LinearProgress value={50} />);
  rerender(<LinearProgress type="indeterminate" />);
  rerender(<LinearProgress variant="wavy" value={8} />);
  rerender(<LinearProgress variant="wavy" value={100} />);

  expect(window.requestAnimationFrame).not.toHaveBeenCalled();
  expect(document.querySelector('svg')).toBeNull();
});

/* -------------------------------------------------------------------------- */
/* Indeterminate                                                               */
/* -------------------------------------------------------------------------- */

test('the indeterminate track splits around one segment', () => {
  const { container } = render(<LinearProgress type="indeterminate" />);
  const progress = screen.getByRole('progressbar');

  expect(Array.from(progress.children).map((child) => child.className)).toEqual([
    'md-linear-progress__indeterminate-track md-linear-progress__indeterminate-track--start',
    'md-linear-progress__indeterminate-segment',
    'md-linear-progress__indeterminate-track md-linear-progress__indeterminate-track--end',
  ]);
  expect(container.querySelector('svg')).toBeNull();
});

test('the segment is driven by its tail and head, and each track piece keeps a gap from it', () => {
  const segment = rule('.md-linear-progress__indeterminate-segment');
  expect(segment).toContain('animation-name: md-linear-progress-tail, md-linear-progress-head');
  expect(segment).toContain('animation-timing-function: var(--_tail-easing), var(--_head-easing)');
  expect(segment).not.toContain('width: 40%');

  // The start piece follows the tail and the end piece follows the head, on the same easing.
  const start = rule('.md-linear-progress__indeterminate-track--start');
  expect(start).toContain('animation-name: md-linear-progress-track-start');
  expect(start).toContain('animation-timing-function: var(--_tail-easing)');
  const end = rule('.md-linear-progress__indeterminate-track--end');
  expect(end).toContain('animation-name: md-linear-progress-track-end');
  expect(end).toContain('animation-timing-function: var(--_head-easing)');

  // tail: 0 → 100% + gap; the start piece is the tail minus the gap.
  expect(keyframes('md-linear-progress-tail')).toMatch(
    /0% \{\s*left: 0%;[\s\S]*90%,\s*100% \{\s*left: calc\(100% \+ var\(--_gap\)\);/,
  );
  expect(keyframes('md-linear-progress-track-start')).toMatch(
    /0% \{\s*width: calc\(0% - var\(--_gap\)\);[\s\S]*90%,\s*100% \{\s*width: 100%;/,
  );
  // head: −gap → 100%; the end piece starts a gap after the head.
  expect(keyframes('md-linear-progress-head')).toMatch(
    /0% \{\s*right: calc\(100% \+ var\(--_gap\)\);[\s\S]*50%,\s*100% \{\s*right: 0%;/,
  );
  expect(keyframes('md-linear-progress-track-end')).toMatch(
    /0% \{\s*left: 0%;[\s\S]*50%,\s*100% \{\s*left: calc\(100% \+ var\(--_gap\)\);/,
  );
  expect(rule('.md-linear-progress')).toContain('--_gap: 4px');
});

test('the wavy indeterminate segment draws its wave from the track origin and hides when empty', () => {
  rects = {
    'md-linear-progress': { left: 0 },
    'md-linear-progress__indeterminate-segment': { left: 40, width: 120, height: 10 },
  };
  const { container } = render(<LinearProgress variant="wavy" type="indeterminate" />);
  const progress = screen.getByRole('progressbar');

  expect(progress).toHaveAttribute('data-variant', 'wavy');
  expect(container.querySelectorAll('.md-linear-progress__indeterminate-segment')).toHaveLength(1);
  // The segment sits 40px along the track, so its wave continues the track's waveform: the first zero crossing
  // after the cap is at 50px on the track, 10px into the segment.
  const pieces = piecesOf(waveOf(container));
  expect(pieces[0].from.x).toBe(2);
  expect(pieces[0].to.x).toBe(10);
  expect(pieces.at(-1)?.to.x).toBe(118);

  // Between cycles the segment has no width, and nothing is drawn.
  rects['md-linear-progress__indeterminate-segment'] = { left: 0, width: 0, height: 10 };
  nextFrame(16);
  expect(waveOf(container)).toBe('');

  // Narrower than one stroke, it is a single dot in the middle of the box.
  rects['md-linear-progress__indeterminate-segment'] = { left: 0, width: 2, height: 10 };
  nextFrame(32);
  expect(waveOf(container)).toMatch(/^M 1,[\d.]+ Q 1,[\d.]+ 1,[\d.]+$/);
});

/* -------------------------------------------------------------------------- */
/* Path helpers                                                               */
/* -------------------------------------------------------------------------- */

/** The parabolic half-wave each piece approximates: ±amplitude at the middle of every half-period. */
const waveY = (x: number, { centerY = 5, amplitude = 3, wavelength = 40, offset = 0 } = {}) => {
  const p = (x + offset) / (wavelength / 2);
  const k = Math.floor(p);
  const u = p - k;
  return centerY + (Math.abs(k % 2) === 0 ? 1 : -1) * 4 * amplitude * u * (1 - u);
};

test('drawLinearWaveSegment cuts the waveform anywhere, including part-way through a half-period', () => {
  const input = { start: 3.7, end: 87.3, centerY: 5, amplitude: 3, wavelength: 40, offset: -13.4 };
  const pieces = piecesOf(drawLinearWaveSegment(input));

  expect(pieces[0].from.x).toBeCloseTo(3.7, 3);
  expect(pieces.at(-1)?.to.x).toBeCloseTo(87.3, 3);
  // Negative half-periods alternate too, and every point on every piece lies on the wave.
  for (const piece of pieces) {
    for (const t of [0, 0.25, 0.5, 0.75, 1]) {
      const point = bezierAt(piece, t);
      expect(point.y).toBeCloseTo(waveY(point.x, input), 2);
    }
  }
});

test('drawLinearWaveSegment defaults to no offset and collapses a reversed range to a dot', () => {
  const pieces = piecesOf(drawLinearWaveSegment({ start: 0, end: 40, centerY: 5, amplitude: 3, wavelength: 40 }));
  expect(pieces.map((piece) => piece.to.x)).toEqual([20, 40]);
  expect(pieces[0].control.y).toBe(11);
  expect(pieces[1].control.y).toBe(-1);

  expect(drawLinearWaveSegment({ start: 6, end: 2, centerY: 5, amplitude: 3, wavelength: 40 })).toBe(
    'M 4,6.92 Q 4,6.92 4,6.92',
  );
});
