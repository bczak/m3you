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

export type ArcResult = { path: string; viewBox: string };

export const sizeToDegrees = (size: number, diameter: number, strokeWidth: number, amplitude: number): number => {
  const { r } = computeCircle(diameter, strokeWidth, amplitude);
  return size * (360 / (2 * Math.PI * r));
};

/** Standard circular arc between two angles, drawn clockwise. */
export const drawCircularArc = ({
  diameter,
  strokeWidth,
  amplitude,
  startAngle = 0,
  endAngle = 360,
  gap = 0,
}: {
  diameter: number;
  strokeWidth: number;
  amplitude: number;
  startAngle?: number;
  endAngle?: number;
  gap?: number;
}): ArcResult => {
  if (diameter === 0 || strokeWidth === 0) return { path: '', viewBox: '0 0 0 0' };

  const circle = computeCircle(diameter, strokeWidth, amplitude);
  let a0 = startAngle;
  let a1 = endAngle;

  if (gap > 0) {
    const gapDeg = sizeToDegrees(gap, diameter, strokeWidth, amplitude);
    a0 += gapDeg;
    a1 -= gapDeg;
  }

  // SVG arcs can't represent a 360° sweep with a single A command — back off
  // by a thousandth of a degree so it stays a true arc.
  if (a1 - a0 >= 360) a1 = a0 + 359.999;

  const start = polarToCartesian(circle, a1);
  const end = polarToCartesian(circle, a0);
  const largeArc = a1 - a0 <= 180 ? '0' : '1';
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
  gap = 0,
  steps = 200,
}: {
  diameter: number;
  strokeWidth: number;
  wavelength: number;
  amplitude: number;
  startAngle?: number;
  endAngle?: number;
  gap?: number;
  steps?: number;
}): ArcResult => {
  if (diameter === 0 || strokeWidth === 0) return { path: '', viewBox: '0 0 0 0' };

  const circle = computeCircle(diameter, strokeWidth, amplitude);

  let a0 = startAngle;
  let a1 = endAngle;
  if (gap > 0) {
    const gapDeg = sizeToDegrees(gap, diameter, strokeWidth, amplitude);
    a0 += gapDeg;
    a1 -= gapDeg;
  }

  const startRad = degreesToRadians(a0);
  let endRad = degreesToRadians(a1);
  if (a0 === a1) endRad = startRad;
  else if (endRad < startRad) endRad += Math.PI * 2;

  const totalAngle = endRad - startRad;
  const waveCount = (2 * Math.PI * circle.r) / wavelength;
  const phase = (Math.PI / 2) * (waveCount - 1);

  const parts: string[] = [];
  for (let i = 0; i <= steps; i++) {
    const t = steps === 0 ? 0 : i / steps;
    const angle = startRad + t * totalAngle;
    const wave = Math.sin(angle * waveCount + phase);
    const radius = circle.r - amplitude * wave;
    const x = radius * Math.cos(angle) + circle.cx;
    const y = radius * Math.sin(angle) + circle.cy;
    parts.push(i === 0 ? `M ${x},${y}` : `L ${x},${y}`);
  }

  const viewBox = `0 0 ${diameter + circle.padding * 2} ${diameter + circle.padding * 2}`;
  return { path: parts.join(' '), viewBox };
};
