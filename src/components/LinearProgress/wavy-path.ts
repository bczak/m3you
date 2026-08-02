/**
 * Pure helpers that generate SVG path data for the M3 Expressive wavy linear
 * progress indicator. Geometry mirrors @m3e/web so the waveform stays seamless
 * when sliding by exactly one wavelength.
 *
 * Sine-based quadratic Bezier sampling at step = wavelength/2 gives one
 * control point per half-period — enough to reproduce a smooth sine visually
 * while keeping the path string short.
 */

type WavePathInput = {
  width: number;
  amplitude: number;
  wavelength: number;
  strokeWidth: number;
  phase?: number;
};

export type WavePath = {
  path: string;
  viewBox: string;
  height: number;
  width: number;
};

export const drawLinearWavyPath = ({
  width,
  amplitude,
  wavelength,
  strokeWidth,
  phase = 0,
}: WavePathInput): WavePath => {
  // Half-height of the *stroked* wave: the centre line swings by `amplitude`,
  // and the stroke adds half its width beyond each peak. The drawing therefore
  // occupies exactly `envelope * 2` units, which must equal the viewBox height
  // — if the viewBox were taller, `preserveAspectRatio="… meet"` would scale
  // the whole wave down and the horizontal period would no longer match
  // `--_wavelength`, desyncing the slide animation a little more every cycle.
  const envelope = amplitude + strokeWidth / 2;
  const y = envelope;
  const step = wavelength / 2;
  const parts: string[] = [`M 0,${y}`];

  // A quadratic Bezier only reaches half of its control-point offset at the
  // apex, so the control point overshoots by 2x for the curve itself to peak
  // at `amplitude`.
  const controlAmplitude = amplitude * 2;

  let x = 0;
  while (x <= width) {
    const endX = x + step;
    const endY = y + amplitude * Math.sin((2 * Math.PI * endX) / wavelength + phase);
    const cpX = x + step / 2;
    const cpY = y + controlAmplitude * Math.sin((2 * Math.PI * cpX) / wavelength + phase);
    parts.push(`Q ${cpX},${cpY} ${endX},${endY}`);
    x += step;
  }

  return {
    path: parts.join(' '),
    viewBox: `0 0 ${width} ${envelope * 2}`,
    height: strokeWidth + amplitude * 2,
    width,
  };
};
