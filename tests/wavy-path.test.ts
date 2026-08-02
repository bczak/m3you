import { expect, test } from 'vitest';
import { drawLinearWavyPath } from '../src/components/LinearProgress/wavy-path';

/**
 * Geometry invariants for the wavy linear progress indicator.
 *
 * The sliding animation translates the SVG by exactly `--_wavelength` CSS px
 * per cycle, which is only seamless if the wave renders at 1:1 scale. Any
 * mismatch between the viewBox and the element's rendered height makes
 * `preserveAspectRatio="… meet"` downscale the whole drawing — shrinking the
 * horizontal period while the animation keeps sliding the full wavelength, so
 * the wave jumps out of phase every time the loop restarts.
 *
 * These assertions sample the actual Bezier curve, not its control points: a
 * quadratic Bezier only reaches half of its control-point offset at the apex,
 * so control points sit outside the drawn envelope by design.
 */

const INPUT = { width: 2048, amplitude: 3, wavelength: 40, strokeWidth: 4 };

type Point = { x: number; y: number };

/** Sample every `Q cx,cy x,y` segment of the path into points on the curve. */
function samplePath(path: string, perSegment = 24): Point[] {
  const nums = (s: string) => s.split(',').map(Number);
  const [startX, startY] = nums(path.slice(2, path.indexOf(' ', 2)));

  let from: Point = { x: startX, y: startY };
  const out: Point[] = [from];

  for (const m of path.matchAll(/Q (-?[\d.]+),(-?[\d.]+) (-?[\d.]+),(-?[\d.]+)/g)) {
    const control = { x: Number(m[1]), y: Number(m[2]) };
    const to = { x: Number(m[3]), y: Number(m[4]) };
    for (let i = 1; i <= perSegment; i++) {
      const t = i / perSegment;
      const u = 1 - t;
      out.push({
        x: u * u * from.x + 2 * u * t * control.x + t * t * to.x,
        y: u * u * from.y + 2 * u * t * control.y + t * t * to.y,
      });
    }
    from = to;
  }
  return out;
}

const viewBoxOf = (viewBox: string) => {
  const [x, y, width, height] = viewBox.split(/\s+/).map(Number);
  return { x, y, width, height };
};

test('viewBox height matches the drawing height, so the wave renders unscaled', () => {
  const wave = drawLinearWavyPath(INPUT);

  // If these differ, `meet` scales the wave down and the slide animation
  // desyncs from the wave's period — the reported loop glitch.
  expect(viewBoxOf(wave.viewBox).height).toBe(wave.height);
});

test('the stroked wave fills the viewBox exactly — no clipping, no dead space', () => {
  const wave = drawLinearWavyPath(INPUT);
  const box = viewBoxOf(wave.viewBox);
  const half = INPUT.strokeWidth / 2;
  const ys = samplePath(wave.path).map((p) => p.y);

  expect(Math.min(...ys) - half).toBeCloseTo(box.y, 3);
  expect(Math.max(...ys) + half).toBeCloseTo(box.y + box.height, 3);
});

test('the curve peaks at the requested amplitude', () => {
  const wave = drawLinearWavyPath(INPUT);
  const ys = samplePath(wave.path).map((p) => p.y);
  const centre = (Math.min(...ys) + Math.max(...ys)) / 2;

  expect(Math.max(...ys) - centre).toBeCloseTo(INPUT.amplitude, 3);
});

test('the wave repeats at exactly one wavelength, so a one-wavelength slide is seamless', () => {
  const wave = drawLinearWavyPath(INPUT);
  const samples = samplePath(wave.path);
  const at = new Map(samples.map((p) => [p.x.toFixed(4), p.y]));

  let compared = 0;
  for (const p of samples) {
    const shifted = at.get((p.x + INPUT.wavelength).toFixed(4));
    if (shifted === undefined) continue;
    expect(shifted).toBeCloseTo(p.y, 6);
    compared++;
  }
  expect(compared).toBeGreaterThan(100);
});
