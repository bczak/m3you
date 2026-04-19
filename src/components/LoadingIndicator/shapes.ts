// M3 Loading Indicator — Official shape paths
// Generated from materialshapes-python (https://github.com/T-Dynamos/materialshapes-python)
// Each shape is in a 48×48 coordinate space, matching the SVG viewBox

type Vec2 = [number, number];

interface Cubic {
  p0: Vec2;
  cp1: Vec2;
  cp2: Vec2;
  p1: Vec2;
}

// ── Exact M3 shape paths (output from materialshapes RoundedPolygon system) ──
// Sequence matches the official loading indicator: cookie12Sided → pentagon → pill →
// verySunny → cookie4Sided → oval → flower → softBoom

const RAW_PATHS = [
  // cookie12Sided (25 cubics) — 12-pointed star, inner_radius=0.8, rounding=0.5, rotated -90°
  'M 24.00 0.25 C 25.23 0.25, 26.46 0.74, 27.36 1.73 C 28.56 3.04, 30.41 3.54, 32.10 3.00 C 34.65 2.19, 37.35 3.75, 37.92 6.36 C 38.30 8.10, 39.66 9.45, 41.39 9.83 C 44.01 10.40, 45.56 13.10, 44.75 15.65 C 44.21 17.34, 44.71 19.20, 46.02 20.39 C 48.00 22.20, 48.00 25.31, 46.02 27.11 C 44.71 28.31, 44.21 30.16, 44.75 31.85 C 45.56 34.40, 44.01 37.10, 41.39 37.67 C 39.66 38.05, 38.30 39.41, 37.92 41.14 C 37.35 43.76, 34.65 45.32, 32.10 44.50 C 30.41 43.96, 28.56 44.46, 27.36 45.77 C 25.56 47.75, 22.44 47.75, 20.64 45.77 C 19.44 44.46, 17.59 43.96, 15.90 44.50 C 13.35 45.32, 10.65 43.76, 10.08 41.14 C 9.70 39.41, 8.34 38.05, 6.61 37.67 C 3.99 37.10, 2.44 34.40, 3.25 31.85 C 3.79 30.16, 3.29 28.31, 1.98 27.11 C 0.00 25.31, 0.00 22.20, 1.98 20.39 C 3.29 19.20, 3.79 17.34, 3.25 15.65 C 2.44 13.10, 3.99 10.40, 6.61 9.83 C 8.34 9.45, 9.70 8.10, 10.08 6.36 C 10.65 3.75, 13.35 2.19, 15.90 3.00 C 17.59 3.54, 19.44 3.04, 20.64 1.73 C 21.54 0.74, 22.77 0.25, 24.00 0.25 Z',

  // pentagon (11 cubics) — 5-sided rounded polygon via _custom_polygon with mirroring
  'M 24.00 2.06 C 25.62 2.06, 27.24 2.55, 28.63 3.52 C 33.78 7.16, 38.93 10.80, 44.08 14.43 C 46.84 16.38, 48.00 19.90, 46.93 23.11 C 44.99 28.92, 43.05 34.74, 41.11 40.55 C 40.03 43.77, 37.02 45.94, 33.62 45.94 C 27.21 45.94, 20.79 45.94, 14.38 45.94 C 10.98 45.94, 7.97 43.77, 6.89 40.55 C 4.95 34.74, 3.01 28.92, 1.07 23.11 C 0.00 19.90, 1.16 16.38, 3.92 14.43 C 9.07 10.80, 14.22 7.16, 19.37 3.52 C 20.76 2.55, 22.38 2.06, 24.00 2.06 Z',

  // pill (13 cubics) — capsule shape via _custom_polygon, 3 points × 2 reps + mirroring
  'M 41.91 6.09 C 45.14 9.32, 47.29 13.62, 47.78 18.43 C 47.85 19.14, 47.93 19.84, 48.00 20.55 C 47.97 26.11, 45.75 31.42, 41.82 35.35 C 39.66 37.51, 37.51 39.66, 35.35 41.82 C 31.42 45.75, 26.11 47.97, 20.55 48.00 C 19.84 47.93, 19.14 47.85, 18.43 47.78 C 8.81 46.79, 1.21 39.19, 0.22 29.57 C 0.15 28.86, 0.07 28.16, 0.00 27.45 C 0.03 21.89, 2.25 16.58, 6.18 12.65 C 8.34 10.49, 10.49 8.34, 12.65 6.18 C 16.58 2.25, 21.89 0.03, 27.45 0.00 C 28.16 0.07, 28.86 0.15, 29.57 0.22 C 34.38 0.71, 38.68 2.86, 41.91 6.09 Z',

  // verySunny (33 cubics) — 8-pointed sun, prominent rays, 2 points × 8 reps
  'M 24.00 47.68 C 22.68 47.68, 21.36 47.03, 20.59 45.75 C 20.02 44.79, 19.45 43.84, 18.88 42.88 C 17.98 41.38, 16.20 40.65, 14.50 41.07 C 13.42 41.34, 12.34 41.61, 11.26 41.88 C 8.35 42.61, 5.71 39.97, 6.44 37.06 C 6.71 35.98, 6.98 34.90, 7.25 33.82 C 7.68 32.13, 6.94 30.35, 5.44 29.45 C 4.49 28.88, 3.53 28.30, 2.57 27.73 C 0.00 26.19, 0.00 22.46, 2.57 20.91 C 3.53 20.34, 4.48 19.77, 5.44 19.20 C 6.94 18.30, 7.68 16.52, 7.25 14.83 C 6.98 13.74, 6.71 12.66, 6.44 11.58 C 5.71 8.67, 8.35 6.03, 11.26 6.76 C 12.34 7.03, 13.42 7.30, 14.50 7.57 C 16.20 8.00, 17.97 7.26, 18.87 5.76 C 19.44 4.81, 20.02 3.85, 20.59 2.90 C 22.13 0.32, 25.86 0.32, 27.41 2.90 C 27.98 3.85, 28.55 4.81, 29.12 5.76 C 30.02 7.26, 31.80 8.00, 33.50 7.57 C 34.58 7.30, 35.66 7.03, 36.74 6.76 C 39.65 6.03, 42.29 8.67, 41.56 11.58 C 41.29 12.66, 41.02 13.74, 40.75 14.82 C 40.32 16.52, 41.06 18.29, 42.56 19.19 C 43.51 19.77, 44.47 20.34, 45.43 20.91 C 48.00 22.46, 48.00 26.19, 45.43 27.73 C 44.47 28.30, 43.52 28.87, 42.56 29.44 C 41.06 30.34, 40.32 32.12, 40.75 33.82 C 41.02 34.90, 41.29 35.98, 41.56 37.06 C 42.29 39.97, 39.65 42.61, 36.74 41.88 C 35.66 41.61, 34.58 41.34, 33.50 41.07 C 31.80 40.64, 30.03 41.38, 29.13 42.88 C 28.56 43.84, 27.98 44.79, 27.41 45.75 C 26.64 47.03, 25.32 47.68, 24.00 47.68 Z',

  // cookie4Sided (17 cubics) — 4-pointed cookie, 2 points × 4 reps
  'M 41.83 41.80 C 38.90 44.72, 34.36 46.04, 29.85 44.09 C 29.20 43.81, 28.55 43.53, 27.90 43.25 C 25.42 42.18, 22.60 42.18, 20.12 43.25 C 19.48 43.53, 18.83 43.81, 18.18 44.09 C 9.17 48.00, 0.02 38.87, 3.92 29.85 C 4.20 29.19, 4.48 28.54, 4.76 27.89 C 5.83 25.41, 5.83 22.59, 4.75 20.11 C 4.47 19.47, 4.19 18.82, 3.91 18.18 C 0.01 9.16, 9.14 0.02, 18.16 3.91 C 18.81 4.19, 19.47 4.47, 20.12 4.75 C 22.60 5.82, 25.41 5.82, 27.89 4.75 C 28.54 4.47, 29.19 4.19, 29.83 3.91 C 38.84 0.00, 47.99 9.13, 44.10 18.15 C 43.82 18.81, 43.54 19.46, 43.26 20.11 C 42.18 22.59, 42.19 25.41, 43.26 27.89 C 43.54 28.53, 43.82 29.18, 44.10 29.82 C 46.05 34.33, 44.75 38.87, 41.83 41.80 Z',

  // oval (9 cubics) — circle scaled 1.0×0.64, rotated -45°
  'M 43.61 4.39 C 45.24 6.03, 46.37 8.16, 46.92 10.69 C 48.00 15.75, 46.63 22.01, 43.10 28.09 C 39.57 34.17, 34.17 39.57, 28.09 43.10 C 22.01 46.63, 15.75 48.00, 10.69 46.92 C 5.62 45.83, 2.17 42.38, 1.08 37.31 C 0.00 32.25, 1.37 25.99, 4.90 19.91 C 8.43 13.83, 13.83 8.43, 19.91 4.90 C 25.99 1.37, 32.25 0.00, 37.31 1.08 C 39.84 1.63, 41.97 2.76, 43.61 4.39 Z',
];

// ── Parse SVG path into cubics (handles M, C, L commands) ───────────────────

function parsePath(d: string): Cubic[] {
  const tokens = d.match(/[MCLZmclz]|-?\d+\.?\d*/g) ?? [];
  const cubics: Cubic[] = [];
  let cur: Vec2 = [0, 0];
  let i = 0;

  const num = () => Number(tokens[i++]);

  while (i < tokens.length) {
    const cmd = tokens[i];
    if (cmd === 'M' || cmd === 'm') {
      i++;
      cur = [num(), num()];
    } else if (cmd === 'C' || cmd === 'c') {
      i++;
      while (i < tokens.length && !/[MCLZmclz]/.test(tokens[i])) {
        const cp1: Vec2 = [num(), num()];
        const cp2: Vec2 = [num(), num()];
        const end: Vec2 = [num(), num()];
        cubics.push({ p0: cur, cp1, cp2, p1: end });
        cur = end;
      }
    } else if (cmd === 'L' || cmd === 'l') {
      i++;
      while (i < tokens.length && !/[MCLZmclz]/.test(tokens[i])) {
        const end: Vec2 = [num(), num()];
        cubics.push({
          p0: cur,
          cp1: [cur[0] + (end[0] - cur[0]) / 3, cur[1] + (end[1] - cur[1]) / 3],
          cp2: [cur[0] + (2 * (end[0] - cur[0])) / 3, cur[1] + (2 * (end[1] - cur[1])) / 3],
          p1: end,
        });
        cur = end;
      }
    } else if (cmd === 'Z' || cmd === 'z') {
      i++;
    } else {
      i++;
    }
  }
  return cubics;
}

// ── Cubic Bézier evaluation ─────────────────────────────────────────────────

function evalCubic(c: Cubic, t: number): Vec2 {
  const u = 1 - t;
  return [
    u * u * u * c.p0[0] + 3 * u * u * t * c.cp1[0] + 3 * u * t * t * c.cp2[0] + t * t * t * c.p1[0],
    u * u * u * c.p0[1] + 3 * u * u * t * c.cp1[1] + 3 * u * t * t * c.cp2[1] + t * t * t * c.p1[1],
  ];
}

// ── Arc-length based resampling ─────────────────────────────────────────────

function cubicArcLength(c: Cubic, steps = 20): number {
  let len = 0;
  let prev = c.p0;
  for (let i = 1; i <= steps; i++) {
    const pt = evalCubic(c, i / steps);
    const dx = pt[0] - prev[0];
    const dy = pt[1] - prev[1];
    len += Math.sqrt(dx * dx + dy * dy);
    prev = pt;
  }
  return len;
}

function resampleToPoints(cubics: Cubic[], numPoints: number): Vec2[] {
  const lengths = cubics.map((c) => cubicArcLength(c));
  const totalLength = lengths.reduce((a, b) => a + b, 0);
  const cumLengths: number[] = [];
  let cum = 0;
  for (const l of lengths) {
    cum += l;
    cumLengths.push(cum);
  }

  const points: Vec2[] = [];
  for (let i = 0; i < numPoints; i++) {
    const targetLen = (i / numPoints) * totalLength;
    let segIdx = 0;
    let prevCum = 0;
    for (let j = 0; j < cumLengths.length; j++) {
      if (cumLengths[j] >= targetLen) {
        segIdx = j;
        break;
      }
      prevCum = cumLengths[j];
    }
    const segLen = lengths[segIdx];
    const localTarget = targetLen - prevCum;
    const t = segLen > 0 ? localTarget / segLen : 0;
    points.push(evalCubic(cubics[segIdx], Math.max(0, Math.min(1, t))));
  }
  return points;
}

// ── Catmull-Rom → cubic Bézier smooth SVG path ─────────────────────────────

function pointsToSvgPath(pts: Vec2[]): string {
  const n = pts.length;
  const p = (i: number) => pts[((i % n) + n) % n];
  const alpha = 1 / 6;
  const f = (v: number) => v.toFixed(2);

  let d = `M ${f(p(0)[0])} ${f(p(0)[1])}`;
  for (let i = 0; i < n; i++) {
    const p0 = p(i - 1);
    const p1 = p(i);
    const p2 = p(i + 1);
    const p3 = p(i + 2);

    const cp1x = p1[0] + alpha * (p2[0] - p0[0]);
    const cp1y = p1[1] + alpha * (p2[1] - p0[1]);
    const cp2x = p2[0] - alpha * (p3[0] - p1[0]);
    const cp2y = p2[1] - alpha * (p3[1] - p1[1]);

    d += ` C ${f(cp1x)} ${f(cp1y)}, ${f(cp2x)} ${f(cp2y)}, ${f(p2[0])} ${f(p2[1])}`;
  }
  return `${d} Z`;
}

// ── Public API ──────────────────────────────────────────────────────────────

const N_SAMPLES = 64;

export const SHAPE_SEQUENCE: string[] = RAW_PATHS.map((raw) => {
  const cubics = parsePath(raw);
  const points = resampleToPoints(cubics, N_SAMPLES);
  return pointsToSvgPath(points);
});

export const SHAPE_NAMES = ['cookie12Sided', 'pentagon', 'pill', 'verySunny', 'cookie4Sided', 'oval'] as const;
