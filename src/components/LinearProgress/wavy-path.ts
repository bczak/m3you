/**
 * Pure helpers that generate SVG path data for the M3 Expressive wavy linear
 * progress indicator.
 *
 * The waveform is one quadratic Bezier per half-period. Each curve runs from one
 * zero crossing to the next with its control point at the midpoint, offset by
 * twice the amplitude, so `x` advances linearly along the curve and `y` traces a
 * parabola that peaks at exactly `amplitude`. Reading the curve as a function of
 * `x` lets a segment start and end anywhere — including part-way through a
 * half-period — by cutting the curve with its polar form, so the drawn line can
 * end in true round caps instead of being clipped by a box.
 */

type WaveSegmentInput = {
  /** Centre-line start, in px from the left edge of the drawing. */
  start: number;
  /** Centre-line end, in px. A range shorter than zero collapses to a dot at its midpoint. */
  end: number;
  /** Vertical centre of the wave, in px. */
  centerY: number;
  amplitude: number;
  wavelength: number;
  /**
   * Horizontal shift of the waveform, in px: the point drawn at `x` is the wave's value at `x + offset`. Growing it
   * over time makes the wave flow towards the start.
   */
  offset?: number;
};

const round = (value: number) => Math.round(value * 1000) / 1000;

/** Path data for the wave's centre line between `start` and `end`. Always draws at least one (zero-length) curve. */
export const drawLinearWaveSegment = ({
  start,
  end,
  centerY,
  amplitude,
  wavelength,
  offset = 0,
}: WaveSegmentInput): string => {
  let from = start;
  let to = end;
  if (to < from) {
    from = (start + end) / 2;
    to = from;
  }

  const step = wavelength / 2;
  // Position along half-period `k`, from 0 at its first zero crossing to 1 at the next.
  const local = (x: number, k: number) => (x + offset) / step - k;
  // Even half-periods bulge one way, odd ones the other.
  const swing = (k: number) => (Math.abs(k % 2) === 0 ? amplitude : -amplitude);
  const yAt = (u: number, k: number) => centerY + 4 * swing(k) * u * (1 - u);

  let k = Math.floor((from + offset) / step);
  let x = from;
  const parts = [`M ${round(x)},${round(yAt(local(x, k), k))}`];

  do {
    const next = Math.min(to, (k + 1) * step - offset);
    const ua = local(x, k);
    const ub = local(next, k);
    // Polar form of the half-period's curve at (ua, ub): the control point of the piece between them.
    const controlY = centerY + 2 * swing(k) * ((1 - ua) * ub + ua * (1 - ub));
    parts.push(`Q ${round((x + next) / 2)},${round(controlY)} ${round(next)},${round(yAt(ub, k))}`);
    x = next;
    k += 1;
  } while (x < to);

  return parts.join(' ');
};
