import './circular-progress.css';
import * as React from 'react';
import { useEffect, useRef } from 'react';

import { cx } from '../../lib/cx';
import { drawCircularArc, drawWavyArc, separationDegrees, sizeToDegrees, wavyRadiusAt } from './wavy-arc';

export type CircularProgressVariant = 'flat' | 'wavy';

type CircularProgressSize = 'sm' | 'md' | 'lg';

export type CircularProgressProps = React.ComponentProps<'div'> & {
  /** Diameter on the M3 scale. */
  size?: CircularProgressSize;
  /** Progress from 0 to 100. Ignored when indeterminate. */
  value?: number;
  /** Whether the amount of work is known. */
  type?: 'determinate' | 'indeterminate';
  /** @deprecated Use `type="indeterminate"` instead. */
  indeterminate?: boolean;
  /**
   * Track thickness in pixels. The ring's centre-line stays put and the box grows or shrinks with the stroke
   * (`md` flat: 40 px at 4, 44 px at 8).
   */
  strokeWidth?: number;
  /**
   * Kit-backed physical stroke thickness. Overrides strokeWidth when provided. At 8 the box grows by 4 px (`md`: flat
   * 44 px, wavy 52 px) around the same ring.
   */
  thickness?: 4 | 8;
  /** M3 Expressive appearance. Defaults to 'flat'. */
  variant?: CircularProgressVariant;
};

/**
 * Box per size at the 4 dp reference stroke. The kit keeps the centre-line fixed and grows the frame with the stroke
 * (Flat 40 → 44, Wave 48 → 52 at 8 dp), so the rendered box is `base + strokeWidth − 4`.
 */
const REFERENCE_STROKE = 4;
const FLAT_DIAMETER: Record<CircularProgressSize, number> = { sm: 24, md: 40, lg: 48 };
const WAVY_DIAMETER: Record<CircularProgressSize, number> = { sm: 28, md: 48, lg: 64 };

/** Wave amplitude (px). Constant across thicknesses — the 8 dp kit ring has the same centre-line as the 4 dp one. */
const WAVY_AMPLITUDE = 1.6;
/** Visible gap between the end of the active indicator and the track. */
const ARC_GAP = 4;

/**
 * Flat indeterminate arc limits as fractions of the circumference — the classic spinner's 1 and 90 units of an
 * r = 20 ring, scaled so every size draws the same shape.
 */
const FLAT_INDETERMINATE_MIN_ARC = 0.008;
const FLAT_INDETERMINATE_MAX_ARC = 0.716;

/**
 * Indeterminate cycle from @m3e/web. Four equal phases give
 * hold-min → grow → hold-max → shrink → repeat.
 */
const WAVY_INDETERMINATE_DURATION_MS = 1575;

const smoothStep = (p: number) => p * p * (3 - 2 * p);

/** Oscillates between minSweep and maxSweep on a four-phase cycle. */
const computeWavyIndeterminateSweep = (
  tMs: number,
  diameter: number,
  strokeWidth: number,
  amplitude: number,
): number => {
  const sweepPadding = sizeToDegrees(strokeWidth, diameter, strokeWidth, amplitude) * 2;
  const minSweep = 18 + sweepPadding;
  const maxSweep = 280 - sweepPadding;

  const phase = WAVY_INDETERMINATE_DURATION_MS;
  const cycle = phase * 4;
  const u = tMs % cycle;

  if (u < phase) return minSweep;
  if (u < phase * 2) return minSweep + (maxSweep - minSweep) * smoothStep((u - phase) / phase);
  if (u < phase * 3) return maxSweep;
  return maxSweep - (maxSweep - minSweep) * smoothStep((u - phase * 3) / phase);
};

/**
 * The root's style: the box the component computes from `size` and the stroke, handed to the stylesheet as `--_size`
 * rather than set as an inline width and height. The `.md-circular-progress` rule applies it at ordinary specificity,
 * so a consumer's stylesheet can still resize the root, and so can `style`. Either way the svg fills the box and its
 * viewBox scales the whole ring with it.
 */
const boxStyle = (diameter: number, style: React.CSSProperties | undefined) =>
  ({ '--_size': `${diameter}px`, ...style }) as React.CSSProperties;

const CircularProgress = React.forwardRef<HTMLDivElement, React.PropsWithoutRef<CircularProgressProps>>(
  (
    {
      className,
      size = 'md',
      value = 0,
      type = 'determinate',
      indeterminate = false,
      strokeWidth = 4,
      thickness,
      variant = 'flat',
      ...props
    },
    ref,
  ) => {
    const clampedValue = Math.min(100, Math.max(0, value));
    const resolvedStrokeWidth = thickness ?? strokeWidth;
    const isWavy = variant === 'wavy';
    const resolvedType = indeterminate ? 'indeterminate' : type;
    const isIndeterminate = resolvedType === 'indeterminate';

    const rootProps = {
      ref,
      role: 'progressbar' as const,
      'aria-valuenow': isIndeterminate ? undefined : clampedValue,
      'aria-valuemin': isIndeterminate ? undefined : 0,
      'aria-valuemax': isIndeterminate ? undefined : 100,
      'aria-label': isIndeterminate ? 'Loading' : `Progress: ${clampedValue}%`,
      className: cx('md-circular-progress', className),
      'data-size': size,
      'data-variant': variant,
      'data-indeterminate': isIndeterminate || undefined,
      'data-type': resolvedType,
      'data-thickness': resolvedStrokeWidth,
      ...props,
    };

    if (!isWavy) {
      return (
        <FlatCircularProgress
          rootProps={rootProps}
          clampedValue={clampedValue}
          indeterminate={isIndeterminate}
          strokeWidth={resolvedStrokeWidth}
          size={size}
        />
      );
    }

    return (
      <WavyCircularProgress
        rootProps={rootProps}
        clampedValue={clampedValue}
        indeterminate={isIndeterminate}
        size={size}
        strokeWidth={resolvedStrokeWidth}
      />
    );
  },
);
CircularProgress.displayName = 'CircularProgress';

/* -------------------------------------------------------------------------- */
/* Flat variant                                                               */
/* -------------------------------------------------------------------------- */

type FlatProps = {
  rootProps: React.ComponentProps<'div'> & { ref?: React.Ref<HTMLDivElement> };
  clampedValue: number;
  indeterminate: boolean;
  strokeWidth: number;
  size: CircularProgressSize;
};

/** A single dash of `length` starting `start` px along the ring, in a pattern one circumference long. */
const dash = (length: number, start: number, circumference: number): React.CSSProperties => ({
  strokeDasharray: `${length} ${circumference - length}`,
  strokeDashoffset: -start,
});

/**
 * Dash lengths for the flat indeterminate keyframes (see `md-circular-progress-dash` in the CSS). The indicator runs
 * [0, min] → [C − max, C] → [C, C + min]; the track always covers the rest of the ring minus the gaps, so both stay
 * linear in the same eased progress and the 4 dp gap holds through the whole cycle. Every pattern is exactly one
 * circumference long, so an arc that passes 12 o'clock wraps round instead of sliding off the end of the path.
 */
const flatIndeterminateVars = (circumference: number, separation: number): React.CSSProperties => {
  const min = circumference * FLAT_INDETERMINATE_MIN_ARC;
  // Leave room for both gaps, so the track never needs a negative length on small, thick rings. Where that cap binds
  // (sm at 8 dp) the track shrinks to a zero-length dash — a single round-cap dot still 4 dp from both ends — at the
  // mid-cycle frame and grows back: the track never jumps in or out, so the dot is deliberate.
  const max = Math.max(min, Math.min(circumference * FLAT_INDETERMINATE_MAX_ARC, circumference - 2 * separation));
  const trackAtMin = Math.max(0, circumference - min - 2 * separation);
  const trackAtMax = Math.max(0, circumference - max - 2 * separation);
  const pattern = (length: number) => `${length} ${circumference - length}`;

  return {
    '--_dash-min': pattern(min),
    '--_dash-max': pattern(max),
    '--_dash-offset-mid': -(circumference - max),
    '--_dash-offset-end': -circumference,
    '--_track-dash-min': pattern(trackAtMin),
    '--_track-dash-max': pattern(trackAtMax),
    '--_track-offset-start': -(min + separation),
    '--_track-offset-mid': -(circumference + separation),
    '--_track-offset-end': -(circumference + min + separation),
  } as React.CSSProperties;
};

const FlatCircularProgress = ({ rootProps, clampedValue, indeterminate, strokeWidth, size }: FlatProps) => {
  const { ref, style, ...rest } = rootProps;
  const diameter = FLAT_DIAMETER[size] + strokeWidth - REFERENCE_STROKE;
  const radius = (diameter - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const cap = strokeWidth / 2;
  // Distance along the ring between the centre-line ends of the indicator and the track: their round caps sit
  // ARC_GAP + one stroke apart in a straight line.
  const separation = (separationDegrees(ARC_GAP + strokeWidth, radius, radius) / 360) * circumference;

  // `null` hides the circle, `undefined` draws the full ring (or hands it to the indeterminate keyframes).
  let indicatorStyle: React.CSSProperties | null | undefined;
  let trackStyle: React.CSSProperties | null | undefined;

  if (indeterminate || clampedValue === 100) {
    indicatorStyle = undefined;
    trackStyle = indeterminate ? undefined : null;
  } else if (clampedValue === 0) {
    // Only the track at 0 — a zero-length round-capped dash would still paint a dot at 12 o'clock.
    indicatorStyle = null;
    trackStyle = undefined;
  } else {
    // The indicator's visible extent, round caps included, is exactly [0, progress] (at least one cap-to-cap dot);
    // the track gives up the ARC_GAP on either side of it.
    const activeEnd = Math.max((clampedValue / 100) * circumference, strokeWidth);
    const trackStart = activeEnd - cap + separation;
    const trackLength = circumference + cap - separation - trackStart;
    indicatorStyle = dash(activeEnd - strokeWidth, cap, circumference);
    trackStyle = trackLength > 0 ? dash(trackLength, trackStart, circumference) : null;
  }

  // No `vector-effect: non-scaling-stroke`: when a consumer's style resizes the box, the stroke and the dashes must
  // scale with the viewBox together. A non-scaling stroke measures its dashes in screen pixels, so on a larger box
  // each one-circumference pattern repeated round the ring and drew the indicator twice.
  const circleProps = {
    cx: diameter / 2,
    cy: diameter / 2,
    r: radius,
    strokeWidth,
    fill: 'none',
    strokeLinecap: 'round' as const,
    'data-indeterminate': indeterminate || undefined,
  };

  return (
    <div {...rest} ref={ref} style={boxStyle(diameter, style)}>
      <svg
        aria-hidden="true"
        viewBox={`0 0 ${diameter} ${diameter}`}
        fill="none"
        className="md-circular-progress__svg"
        data-indeterminate={indeterminate || undefined}
        style={indeterminate ? flatIndeterminateVars(circumference, separation) : undefined}
      >
        {trackStyle !== null && <circle {...circleProps} className="md-circular-progress__track" style={trackStyle} />}
        {indicatorStyle !== null && (
          <circle {...circleProps} className="md-circular-progress__indicator" style={indicatorStyle} />
        )}
      </svg>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* Wavy variant — M3 Expressive                                               */
/* -------------------------------------------------------------------------- */

type WavyGeometry = {
  /** Rendered box (and viewBox) edge. */
  diameter: number;
  strokeWidth: number;
  /** Diameter of the wave's mean circle. */
  geometryDiameter: number;
  /** Diameter of the track circle — the wave's crest, as in the kit (Wave 4 dp track 48.16 → r ≈ 22.08). */
  trackDiameter: number;
  wavelength: number;
};

const wavyGeometry = (size: CircularProgressSize, strokeWidth: number): WavyGeometry => {
  const geometryDiameter = WAVY_DIAMETER[size] - 2 * WAVY_AMPLITUDE - REFERENCE_STROKE;
  return {
    diameter: WAVY_DIAMETER[size] + strokeWidth - REFERENCE_STROKE,
    strokeWidth,
    geometryDiameter,
    trackDiameter: geometryDiameter + 2 * WAVY_AMPLITUDE,
    wavelength: (Math.PI * geometryDiameter) / 9,
  };
};

/** Flat track arc on the crest circle between two angles. */
const drawTrackArc = (geometry: WavyGeometry, startAngle: number, endAngle: number) =>
  drawCircularArc({
    diameter: geometry.trackDiameter,
    strokeWidth: geometry.strokeWidth,
    amplitude: 0,
    startAngle,
    endAngle,
  });

/** The wave drawWavyArc and wavyRadiusAt describe for this geometry; amplitude 0 is the flattened mean circle. */
const waveOf = (geometry: WavyGeometry, amplitude: number) => ({
  diameter: geometry.geometryDiameter,
  strokeWidth: geometry.strokeWidth,
  wavelength: geometry.wavelength,
  amplitude,
});

type Wave = ReturnType<typeof waveOf>;

/** Vertices each partial wave is drawn with; the gap search checks exactly these points. */
const WAVE_STEPS = 200;

/**
 * Where the track starts and ends so it clears the wave drawn between `startAngle` and `endAngle` by ARC_GAP at both
 * ends. Both arcs have round caps, so every point of the wave's centre-line must sit ARC_GAP + one stroke from the
 * track's centre-line; outside the track's sweep the nearest track point is one of its ends. A steep wave on a small
 * ring can come closer to the track just before its end point than at it, so the whole drawn centre-line is checked.
 */
const trackLimits = (geometry: WavyGeometry, wave: Wave, startAngle: number, endAngle: number) => {
  const distance = ARC_GAP + geometry.strokeWidth;
  const trackRadius = geometry.trackDiameter / 2;
  let start = Number.NEGATIVE_INFINITY;
  let end = Number.POSITIVE_INFINITY;
  for (let i = 0; i <= WAVE_STEPS; i++) {
    const degrees = startAngle + ((endAngle - startAngle) * i) / WAVE_STEPS;
    const separation = separationDegrees(distance, wavyRadiusAt({ ...wave, degrees }), trackRadius);
    start = Math.max(start, degrees + separation);
    end = Math.min(end, degrees - separation);
  }
  return { start, end: 360 + end };
};

/**
 * Angle of the wave point whose round cap just reaches `edge` — clockwise of it for `direction` 1, anticlockwise for
 * −1. A cap of radius `strokeWidth / 2` on a point `r` from the centre spans asin(cap / r) either side of it; `r`
 * depends on the angle, so iterate. The map contracts (the cap's reach changes at most about half as fast as the
 * angle, even on the steep sm 8 dp wave), so a fixed 24 rounds settle well below a thousandth of a degree.
 */
const CAP_ITERATIONS = 24;
const capCentre = (wave: Wave, edge: number, direction: 1 | -1): number => {
  const cap = wave.strokeWidth / 2;
  let degrees = edge;
  for (let i = 0; i < CAP_ITERATIONS; i++) {
    const radius = wavyRadiusAt({ ...wave, degrees });
    degrees = edge + (direction * Math.asin(Math.min(1, cap / radius)) * 180) / Math.PI;
  }
  return degrees;
};

/** Active wave from 0° to `sweep`, and the track filling the rest of the ring with an ARC_GAP at both ends. */
const drawIndeterminateArcs = (geometry: WavyGeometry, sweep: number) => {
  const wave = waveOf(geometry, WAVY_AMPLITUDE);
  const track = trackLimits(geometry, wave, 0, sweep);
  return {
    active: drawWavyArc({ ...wave, endAngle: sweep, steps: WAVE_STEPS }).path,
    track: drawTrackArc(geometry, track.start, track.end).path,
  };
};

type WavyProps = {
  rootProps: React.ComponentProps<'div'> & { ref?: React.Ref<HTMLDivElement> };
  clampedValue: number;
  indeterminate: boolean;
  size: CircularProgressSize;
  strokeWidth: number;
};

const WavyCircularProgress = ({ rootProps, clampedValue, indeterminate, size, strokeWidth }: WavyProps) => {
  const { ref, style, ...rest } = rootProps;
  const activeRef = useRef<SVGPathElement>(null);
  const trackRef = useRef<SVGPathElement>(null);
  const geometry = wavyGeometry(size, strokeWidth);
  const { diameter, geometryDiameter } = geometry;
  const viewBox = `0 0 ${diameter} ${diameter}`;
  const rootStyle = boxStyle(diameter, style);

  // Animate the indeterminate sweep in a requestAnimationFrame loop — the
  // oscillation-with-dwell curve cannot be expressed as a CSS keyframe on a
  // `d=` attribute, so we recompute the path every tick.
  useEffect(() => {
    if (!indeterminate) return;
    const tickGeometry = wavyGeometry(size, strokeWidth);
    let rafId = 0;
    const start = performance.now();

    const tick = (now: number) => {
      const sweep = computeWavyIndeterminateSweep(
        now - start,
        tickGeometry.geometryDiameter,
        strokeWidth,
        WAVY_AMPLITUDE,
      );
      const arcs = drawIndeterminateArcs(tickGeometry, sweep);
      activeRef.current?.setAttribute('d', arcs.active);
      trackRef.current?.setAttribute('d', arcs.track);
      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [indeterminate, size, strokeWidth]);

  if (indeterminate) {
    const initial = drawIndeterminateArcs(
      geometry,
      computeWavyIndeterminateSweep(0, geometryDiameter, strokeWidth, WAVY_AMPLITUDE),
    );

    return (
      <div {...rest} ref={ref} style={rootStyle}>
        <svg
          className="md-circular-progress__svg md-circular-progress__svg--wavy-spin"
          width={diameter}
          height={diameter}
          viewBox={viewBox}
          aria-hidden="true"
        >
          <path
            ref={activeRef}
            className="md-circular-progress__wavy-active"
            d={initial.active}
            stroke="currentColor"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
          <path
            ref={trackRef}
            className="md-circular-progress__wavy-track"
            d={initial.track}
            stroke="currentColor"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            fill="none"
          />
        </svg>
      </div>
    );
  }

  // Determinate wavy.
  const minDegrees = sizeToDegrees(strokeWidth * 2, geometryDiameter, strokeWidth, WAVY_AMPLITUDE);
  let degrees = (clampedValue / 100) * 360;
  if (degrees > 0) degrees = Math.max(minDegrees, degrees);

  // Flatten the wave for very small sweeps so a near-empty arc stays legible.
  // The completed ring stays wavy, as in the kit (Wave Progress=100 is not a circle).
  const wave = waveOf(geometry, degrees <= minDegrees + minDegrees / 2 ? 0 : WAVY_AMPLITUDE);

  let activePath: string | null = null;
  let track: { start: number; end: number } | null = { start: 0, end: 360 };
  if (degrees >= 360) {
    activePath = drawWavyArc({ ...wave, endAngle: 360 }).path;
    track = null;
  } else if (degrees > 0) {
    // Inset the ends so the round caps, not the cap centres, land on 0° and `degrees`: the visible indicator covers
    // exactly [0°, degrees] (at least one cap-to-cap dot).
    const startAngle = Math.min(capCentre(wave, 0, 1), degrees / 2);
    const endAngle = Math.max(capCentre(wave, degrees, -1), degrees / 2);
    activePath =
      wave.amplitude > 0
        ? drawWavyArc({ ...wave, startAngle, endAngle, steps: WAVE_STEPS }).path
        : drawCircularArc({ ...wave, amplitude: WAVY_AMPLITUDE, startAngle, endAngle }).path;
    track = trackLimits(geometry, wave, startAngle, endAngle);
  }

  return (
    <div {...rest} ref={ref} style={rootStyle}>
      <svg
        className="md-circular-progress__svg"
        width={diameter}
        height={diameter}
        viewBox={viewBox}
        aria-hidden="true"
      >
        {activePath !== null && (
          <path
            className="md-circular-progress__wavy-active"
            d={activePath}
            stroke="currentColor"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        )}
        {track !== null && track.end > track.start && (
          <path
            className="md-circular-progress__wavy-track"
            d={drawTrackArc(geometry, track.start, track.end).path}
            stroke="currentColor"
            strokeWidth={strokeWidth}
            fill="none"
            strokeLinecap="round"
          />
        )}
      </svg>
    </div>
  );
};

export { CircularProgress };
