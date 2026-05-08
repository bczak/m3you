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
  // Inflate amplitude by stroke/2 so peaks touch the outer edges without the
  // round stroke caps clipping (same trick m3e uses).
  const effectiveAmp = amplitude + strokeWidth / 2;
  const y = effectiveAmp;
  const step = wavelength / 2;
  const parts: string[] = [`M 0,${y}`];

  let x = 0;
  while (x <= width) {
    const endX = x + step;
    const endY = y + effectiveAmp * Math.sin((2 * Math.PI * endX) / wavelength + phase);
    const cpX = x + step / 2;
    const cpY = y + effectiveAmp * Math.sin((2 * Math.PI * (x + step / 2)) / wavelength + phase);
    parts.push(`Q ${cpX},${cpY} ${endX},${endY}`);
    x += step;
  }

  // 1px vertical breathing room keeps round caps inside the viewBox.
  const padding = 1;
  return {
    path: parts.join(' '),
    viewBox: `0 ${-padding} ${width} ${effectiveAmp * 2 + padding * 2}`,
    height: strokeWidth + amplitude * 2,
    width,
  };
};
