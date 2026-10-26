import { expect, test } from 'vitest';
import { drawLinearWaveSegment } from '../src/components/LinearProgress/wavy-path';

/**
 * Geometry invariants for the wavy linear progress indicator.
 *
 * LinearProgress redraws the active segment every frame with a growing
 * `offset`, so the wave flows without a sliding SVG. That is only seamless if
 * the curve really is periodic in the wavelength, and it only matches the kit
 * if the drawn line — not its control points — swings by exactly `amplitude`.
 *
 * These assertions sample the actual Bezier curve, not its control points: a
 * quadratic Bezier only reaches half of its control-point offset at the apex,
 * so control points sit outside the drawn envelope by design.
 */

const INPUT = { start: 0, end: 2048, centerY: 5, amplitude: 3, wavelength: 40 };

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

test('the curve peaks at the requested amplitude', () => {
  const ys = samplePath(drawLinearWaveSegment(INPUT)).map((p) => p.y);
  const centre = (Math.min(...ys) + Math.max(...ys)) / 2;

  expect(Math.max(...ys) - centre).toBeCloseTo(INPUT.amplitude, 3);
});

test('the wave repeats at exactly one wavelength, so the per-frame flow is seamless', () => {
  const samples = samplePath(drawLinearWaveSegment(INPUT));
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

test('advancing the offset by one wavelength redraws the identical wave', () => {
  const base = drawLinearWaveSegment({ ...INPUT, end: 400, offset: 7 });
  expect(drawLinearWaveSegment({ ...INPUT, end: 400, offset: 7 + INPUT.wavelength })).toBe(base);
});
