import './circular-progress.css';
import * as React from 'react';
import { useEffect, useId, useMemo, useRef } from 'react';

import { cx } from '../../lib/cx';
import { drawCircularArc, drawWavyArc, sizeToDegrees } from './wavy-arc';

export type CircularProgressVariant = 'flat' | 'wavy';

export type CircularProgressProps = React.ComponentProps<'div'> & {
  /** Diameter on the M3 scale. */
  size?: 'sm' | 'md' | 'lg';
  /** Progress from 0 to 100. Ignored when indeterminate. */
  value?: number;
  /** Whether the amount of work is known. */
  type?: 'determinate' | 'indeterminate';
  /** @deprecated Use `type="indeterminate"` instead. */
  indeterminate?: boolean;
  /** Track thickness in pixels. */
  strokeWidth?: number;
  /** Kit-backed physical stroke thickness. Overrides strokeWidth when provided. */
  thickness?: 4 | 8;
  /** M3 Expressive appearance. Defaults to 'flat'. */
  variant?: CircularProgressVariant;
};

/** Diameter in px per size for the wavy variant (M3 Expressive: 48 dp @ md). */
const WAVY_DIAMETER: Record<'sm' | 'md' | 'lg', number> = { sm: 28, md: 48, lg: 64 };

/** M3 Expressive tokens for the wavy variant (px). */
const WAVY_AMPLITUDE = 1.6;
const ARC_GAP = 4;
const FLAT_DIAMETER = { sm: 24, md: 40, lg: 48 } as const;

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
    const maskId = useId();

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
          diameter={FLAT_DIAMETER[size]}
        />
      );
    }

    const diameter = WAVY_DIAMETER[size];
    return (
      <WavyCircularProgress
        rootProps={rootProps}
        clampedValue={clampedValue}
        indeterminate={isIndeterminate}
        diameter={diameter}
        strokeWidth={resolvedStrokeWidth}
        maskId={maskId}
      />
    );
  },
);
CircularProgress.displayName = 'CircularProgress';

/* -------------------------------------------------------------------------- */
/* Flat variant (existing behavior)                                           */
/* -------------------------------------------------------------------------- */

type FlatProps = {
  rootProps: React.ComponentProps<'div'> & { ref?: React.Ref<HTMLDivElement> };
  clampedValue: number;
  indeterminate: boolean;
  strokeWidth: number;
  diameter: number;
};

const FlatCircularProgress = ({ rootProps, clampedValue, indeterminate, strokeWidth, diameter }: FlatProps) => {
  const { ref, ...rest } = rootProps;
  const radius = (diameter - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progressLength = (clampedValue / 100) * circumference;
  const hasTwoArcs = clampedValue > 0 && clampedValue < 100;
  const indicatorLength = hasTwoArcs ? Math.max(progressLength - ARC_GAP, 0) : progressLength;
  const trackLength = hasTwoArcs
    ? Math.max(circumference - progressLength - ARC_GAP, 0)
    : circumference - progressLength;

  return (
    <div {...rest} ref={ref}>
      <svg
        aria-hidden="true"
        viewBox={`0 0 ${diameter} ${diameter}`}
        fill="none"
        className="md-circular-progress__svg"
        data-indeterminate={indeterminate || undefined}
      >
        <circle
          cx={diameter / 2}
          cy={diameter / 2}
          r={radius}
          strokeWidth={strokeWidth}
          fill="none"
          className="md-circular-progress__track"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
          style={
            indeterminate
              ? undefined
              : {
                  strokeDasharray: `${trackLength} ${circumference}`,
                  strokeDashoffset: -(progressLength + (hasTwoArcs ? ARC_GAP / 2 : 0)),
                  transform: 'rotate(-90deg)',
                  transformOrigin: 'center',
                }
          }
        />
        <circle
          cx={diameter / 2}
          cy={diameter / 2}
          r={radius}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          className="md-circular-progress__indicator"
          data-indeterminate={indeterminate || undefined}
          vectorEffect="non-scaling-stroke"
          style={
            indeterminate
              ? undefined
              : {
                  strokeDasharray: `${indicatorLength} ${circumference}`,
                  strokeDashoffset: hasTwoArcs ? -ARC_GAP / 2 : 0,
                  transform: 'rotate(-90deg)',
                  transformOrigin: 'center',
                }
          }
        />
      </svg>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* Wavy variant — M3 Expressive                                               */
/* -------------------------------------------------------------------------- */

type WavyProps = {
  rootProps: React.ComponentProps<'div'> & { ref?: React.Ref<HTMLDivElement> };
  clampedValue: number;
  indeterminate: boolean;
  diameter: number;
  strokeWidth: number;
  maskId: string;
};

const WavyCircularProgress = ({ rootProps, clampedValue, indeterminate, diameter, strokeWidth, maskId }: WavyProps) => {
  const { ref, ...rest } = rootProps;
  const activeRef = useRef<SVGPathElement>(null);
  const trackRef = useRef<SVGPathElement>(null);
  const waveAmplitude = WAVY_AMPLITUDE * (strokeWidth / 4);
  const geometryDiameter = Math.max(1, diameter - waveAmplitude * 2 - strokeWidth);
  const wavelength = (Math.PI * geometryDiameter) / 9;

  const minDegrees = useMemo(
    () => sizeToDegrees(strokeWidth * 2, geometryDiameter, strokeWidth, waveAmplitude),
    [geometryDiameter, strokeWidth, waveAmplitude],
  );

  // Animate the indeterminate sweep in a requestAnimationFrame loop — the
  // oscillation-with-dwell curve cannot be expressed as a CSS keyframe on a
  // `d=` attribute, so we recompute the path every tick.
  useEffect(() => {
    if (!indeterminate) return;
    let rafId = 0;
    const start = performance.now();

    const tick = (now: number) => {
      const elapsed = now - start;
      const sweep = computeWavyIndeterminateSweep(elapsed, geometryDiameter, strokeWidth, waveAmplitude);
      const active = drawWavyArc({
        diameter: geometryDiameter,
        strokeWidth,
        wavelength,
        amplitude: waveAmplitude,
        endAngle: sweep,
      });
      const track = drawCircularArc({
        diameter: geometryDiameter,
        strokeWidth,
        amplitude: waveAmplitude,
        gap: ARC_GAP / 2,
        startAngle: sweep,
      });
      activeRef.current?.setAttribute('d', active.path);
      trackRef.current?.setAttribute('d', track.path);
      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [indeterminate, geometryDiameter, strokeWidth, waveAmplitude, wavelength]);

  const viewBox = useMemo(
    () => drawCircularArc({ diameter: geometryDiameter, strokeWidth, amplitude: waveAmplitude, endAngle: 20 }).viewBox,
    [geometryDiameter, strokeWidth, waveAmplitude],
  );

  if (indeterminate) {
    const initialSweep = 18 + sizeToDegrees(ARC_GAP, geometryDiameter, strokeWidth, waveAmplitude) * 2;
    const initialActive = drawWavyArc({
      diameter: geometryDiameter,
      strokeWidth,
      wavelength,
      amplitude: waveAmplitude,
      endAngle: initialSweep,
    });
    const initialTrack = drawCircularArc({
      diameter: geometryDiameter,
      strokeWidth,
      amplitude: waveAmplitude,
      gap: ARC_GAP / 2,
      startAngle: initialSweep,
    });

    return (
      <div {...rest} ref={ref} style={{ ...rest.style, width: diameter, height: diameter }}>
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
            d={initialActive.path}
            stroke="currentColor"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
          <path
            ref={trackRef}
            className="md-circular-progress__wavy-track"
            d={initialTrack.path}
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
  let degrees = (clampedValue / 100) * 360;
  if (degrees > 0) degrees = Math.max(0, minDegrees, degrees);

  // Clamp amplitude to 0 for very small or full sweeps — M3 Expressive flattens
  // the wave at both ends so a near-empty arc or full ring stays legible.
  const amplitude = degrees <= minDegrees + minDegrees / 2 || degrees === 360 ? 0 : waveAmplitude;
  const hasGap = degrees > 0 && degrees < 360;
  const activeArc = drawCircularArc({
    diameter: geometryDiameter,
    strokeWidth,
    amplitude: waveAmplitude,
    gap: hasGap ? ARC_GAP / 2 : 0,
    endAngle: degrees,
  });

  // The full-circle wavy path is masked by the flat active arc (with slightly
  // thicker stroke for anti-aliasing padding) so the visible part keeps the
  // seamless-phase geometry even when the sweep is partial.
  const fullWavy =
    amplitude > 0
      ? drawWavyArc({
          diameter: geometryDiameter,
          strokeWidth,
          wavelength,
          amplitude,
          endAngle: 360,
        })
      : null;

  const inactiveArc = drawCircularArc({
    diameter: geometryDiameter,
    strokeWidth,
    amplitude: waveAmplitude,
    gap: degrees > 0 ? ARC_GAP / 2 : 0,
    startAngle: degrees,
    endAngle: 360,
  });

  const maskPadding = amplitude > 0 ? amplitude + strokeWidth / 2 : strokeWidth;
  const inactiveVisible = 360 - degrees >= minDegrees;

  return (
    <div {...rest} ref={ref} style={{ ...rest.style, width: diameter, height: diameter }}>
      <svg
        className="md-circular-progress__svg"
        width={diameter}
        height={diameter}
        viewBox={activeArc.viewBox}
        aria-hidden="true"
      >
        {fullWavy && degrees > 0 && (
          <defs>
            <mask id={maskId}>
              <path
                d={activeArc.path}
                stroke="white"
                strokeWidth={strokeWidth + maskPadding}
                fill="none"
                strokeLinecap="round"
              />
            </mask>
          </defs>
        )}
        {degrees > 0 && (
          <g mask={fullWavy ? `url(#${maskId})` : undefined}>
            <path
              className="md-circular-progress__wavy-active"
              d={fullWavy ? fullWavy.path : activeArc.path}
              stroke="currentColor"
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          </g>
        )}
        {inactiveVisible && (
          <path
            className="md-circular-progress__wavy-track"
            d={inactiveArc.path}
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
