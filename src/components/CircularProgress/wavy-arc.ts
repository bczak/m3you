/**
 * Polar-space wavy arc generators for the M3 Expressive circular progress
 * indicator. Math ported from @m3e/web.
 *
 * Key trick: phase = (π/2) · (waveCount - 1) where waveCount = 2πr / λ.
 * That phase makes sin(0·waveCount + phase) === sin(2π·waveCount + phase),
 * so the wave closes seamlessly around a full circle — no visible seam at
 * the 0°/360° boundary.
 */

type Circle = { cx: number; cy: number; r: number; padding: number };

const degreesToRadians = (deg: number): number => ((deg - 90) * Math.PI) / 180;

const polarToCartesian = (circle: Circle, deg: number) => {
  const rad = degreesToRadians(deg);
  return {
    x: circle.cx + circle.r * Math.cos(rad),
    y: circle.cy + circle.r * Math.sin(rad),
  };
};

const computeCircle = (diameter: number, strokeWidth: number, padding: number): Circle => {
  const totalPadding = padding + strokeWidth / 2;
  const r = diameter / 2;
  return { cx: r + totalPadding, cy: r + totalPadding, r, padding: totalPadding };
};

/** Wave phase that closes the wave seamlessly round a full circle (see the header). */
const wavePhase = (waveCount: number): number => (Math.PI / 2) * (waveCount - 1);

/** Radius of the wave at `angle` (radians, as returned by degreesToRadians). */
const waveRadius = (circle: Circle, waveCount: number, amplitude: number, angle: number): number =>
  circle.r - amplitude * Math.sin(angle * waveCount + wavePhase(waveCount));

export type ArcResult = { path: string; viewBox: string };

export const sizeToDegrees = (size: number, diameter: number, strokeWidth: number, amplitude: number): number => {
  const { r } = computeCircle(diameter, strokeWidth, amplitude);
  return size * (360 / (2 * Math.PI * r));
};

/**
 * Angle (degrees) between two points on concentric circles of radii `r1` and `r2` that sit `distance` apart in a
 * straight line. Gaps between round-capped arcs are straight-line distances between their end caps, which on a small,
 * tightly curved ring is noticeably less than the same length measured along the arc.
 */
export const separationDegrees = (distance: number, r1: number, r2: number): number => {
  const cos = (r1 * r1 + r2 * r2 - distance * distance) / (2 * r1 * r2);
  return (Math.acos(Math.min(1, Math.max(-1, cos))) * 180) / Math.PI;
};

/** Radius, from the centre, of the wave drawWavyArc draws with the same arguments at `degrees`. */
export const wavyRadiusAt = ({
  diameter,
  strokeWidth,
  wavelength,
  amplitude,
  degrees,
}: {
  diameter: number;
  strokeWidth: number;
  wavelength: number;
  amplitude: number;
  degrees: number;
}): number => {
  const circle = computeCircle(diameter, strokeWidth, amplitude);
  return waveRadius(circle, (2 * Math.PI * circle.r) / wavelength, amplitude, degreesToRadians(degrees));
};

/** Standard circular arc between two angles, drawn clockwise. */
export const drawCircularArc = ({
  diameter,
  strokeWidth,
  amplitude,
  startAngle = 0,
  endAngle = 360,
}: {
  diameter: number;
  strokeWidth: number;
  amplitude: number;
  startAngle?: number;
  endAngle?: number;
}): ArcResult => {
  if (diameter === 0 || strokeWidth === 0) return { path: '', viewBox: '0 0 0 0' };

  const circle = computeCircle(diameter, strokeWidth, amplitude);
  // SVG arcs can't represent a 360° sweep with a single A command — back off
  // by a thousandth of a degree so it stays a true arc.
  const a1 = endAngle - startAngle >= 360 ? startAngle + 359.999 : endAngle;

  const start = polarToCartesian(circle, a1);
  const end = polarToCartesian(circle, startAngle);
  const largeArc = a1 - startAngle <= 180 ? '0' : '1';
  const path = `M ${start.x} ${start.y} A ${circle.r} ${circle.r} 0 ${largeArc} 0 ${end.x} ${end.y}`;
  const viewBox = `0 0 ${diameter + circle.padding * 2} ${diameter + circle.padding * 2}`;
  return { path, viewBox };
};

/** Wavy arc sampled as `steps + 1` line segments. */
export const drawWavyArc = ({
  diameter,
  strokeWidth,
  wavelength,
  amplitude,
  startAngle = 0,
  endAngle = 360,
  steps = 200,
}: {
  diameter: number;
  strokeWidth: number;
  wavelength: number;
  amplitude: number;
  startAngle?: number;
  endAngle?: number;
  steps?: number;
}): ArcResult => {
  if (diameter === 0 || strokeWidth === 0) return { path: '', viewBox: '0 0 0 0' };

  const circle = computeCircle(diameter, strokeWidth, amplitude);

  const startRad = degreesToRadians(startAngle);
  let endRad = degreesToRadians(endAngle);
  if (startAngle === endAngle) endRad = startRad;
  else if (endRad < startRad) endRad += Math.PI * 2;

  const totalAngle = endRad - startRad;
  const waveCount = (2 * Math.PI * circle.r) / wavelength;

  const parts: string[] = [];
  for (let i = 0; i <= steps; i++) {
    const t = steps === 0 ? 0 : i / steps;
    const angle = startRad + t * totalAngle;
    const radius = waveRadius(circle, waveCount, amplitude, angle);
    const x = radius * Math.cos(angle) + circle.cx;
    const y = radius * Math.sin(angle) + circle.cy;
    parts.push(i === 0 ? `M ${x},${y}` : `L ${x},${y}`);
  }

  const viewBox = `0 0 ${diameter + circle.padding * 2} ${diameter + circle.padding * 2}`;
  return { path: parts.join(' '), viewBox };
};
