import './linear-progress.css';

import * as React from 'react';
import { useRef } from 'react';

import { cx } from '../../lib/cx';
import { drawLinearWaveSegment } from './wavy-path';

export type LinearProgressVariant = 'flat' | 'wavy';

export type LinearProgressProps = React.ComponentProps<'div'> & {
  /** Progress from 0 to 100. Ignored when indeterminate. */
  value?: number;
  /** Whether the amount of work is known. */
  type?: 'determinate' | 'indeterminate';
  /** @deprecated Use type="indeterminate" instead. */
  indeterminate?: boolean;
  /** M3 Expressive appearance. Defaults to flat. */
  variant?: LinearProgressVariant;
  /** Kit-backed physical track thickness. */
  thickness?: 4 | 8;
};

/**
 * Wave amplitude (px). The swing stays the same at both thicknesses — only the stroke grows — so the wavy indicator
 * is `thickness + 2 × 3` tall: 10 px at 4 dp, 14 px at 8 dp (the kit's 8 dp Wave frame).
 */
const WAVE_AMPLITUDE = 3;
/** M3 Expressive wavelengths: the determinate wave is twice as long as the indeterminate one. */
const DETERMINATE_WAVELENGTH = 40;
const INDETERMINATE_WAVELENGTH = 20;
/** Time for the wave to flow one wavelength. */
const WAVE_PERIOD_MS = 1500;
/** At or below this value the determinate wave lies flat, as in the kit (Progress=10 flat, Progress=20 wavy). */
const FLAT_WAVE_MAX_VALUE = 10;

/**
 * Redraws the wave inside `box` every frame: centre line from half a stroke in from each edge, so both round caps
 * land on the box's edges instead of being clipped by it. The waveform is anchored to the track (the box's parent)
 * and flows along it over time, so a moving, growing indeterminate segment reveals one continuous wave. With
 * `prefers-reduced-motion: reduce` the wave holds still; an indeterminate segment still travels.
 */
const useFlowingWave = (
  boxRef: React.RefObject<HTMLSpanElement | null>,
  pathRef: React.RefObject<SVGPathElement | null>,
  enabled: boolean,
  thickness: number,
  wavelength: number,
) => {
  React.useLayoutEffect(() => {
    if (!enabled) return;
    const box = boxRef.current as HTMLSpanElement;
    const path = pathRef.current as SVGPathElement;
    const parent = box.parentElement as HTMLElement;
    // Read live every frame, so switching the preference takes effect without a re-render.
    const reducedMotion =
      typeof window.matchMedia === 'function' ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;
    const startTime = performance.now();
    let frame = 0;

    const draw = (now: number) => {
      const track = parent.getBoundingClientRect();
      const rect = box.getBoundingClientRect();
      // Client rects include ancestor transforms (a dialog scaling in, a scaled preview), but the SVG draws in the
      // box's own CSS pixels: undo the scale, measured against the parent's untransformed layout size. Each axis is
      // measured on its own, as a `scaleX()` leaves the height alone.
      const scaleX = track.width > 0 && parent.offsetWidth > 0 ? track.width / parent.offsetWidth : 1;
      const scaleY = track.height > 0 && parent.offsetHeight > 0 ? track.height / parent.offsetHeight : 1;
      const width = rect.width / scaleX;
      const flow = reducedMotion?.matches ? 0 : (((now - startTime) / WAVE_PERIOD_MS) % 1) * wavelength;
      const half = thickness / 2;
      path.setAttribute(
        'd',
        width > 0
          ? drawLinearWaveSegment({
              start: half,
              end: width - half,
              centerY: rect.height / scaleY / 2,
              amplitude: WAVE_AMPLITUDE,
              wavelength,
              offset: (rect.left - track.left) / scaleX + flow,
            })
          : '',
      );
    };
    const tick = (now: number) => {
      draw(now);
      frame = requestAnimationFrame(tick);
    };

    // Draw before the first paint, then keep the wave flowing.
    draw(startTime);
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [boxRef, pathRef, enabled, thickness, wavelength]);
};

const LinearProgress = React.forwardRef<HTMLDivElement, React.PropsWithoutRef<LinearProgressProps>>(
  (
    {
      className,
      value = 0,
      type = 'determinate',
      indeterminate = false,
      variant = 'flat',
      thickness = 4,
      style,
      ...props
    },
    ref,
  ) => {
    const clampedValue = Math.min(100, Math.max(0, value));
    const resolvedType = indeterminate ? 'indeterminate' : type;
    const isIndeterminate = resolvedType === 'indeterminate';
    const isWavy = variant === 'wavy';
    const lowValue = clampedValue > 0 && clampedValue <= FLAT_WAVE_MAX_VALUE;
    const complete = clampedValue >= 100;
    const drawsWave = isWavy && (isIndeterminate || (clampedValue > FLAT_WAVE_MAX_VALUE && !complete));
    const wavelength = isIndeterminate ? INDETERMINATE_WAVELENGTH : DETERMINATE_WAVELENGTH;

    const boxRef = useRef<HTMLSpanElement>(null);
    const pathRef = useRef<SVGPathElement>(null);
    useFlowingWave(boxRef, pathRef, drawsWave, thickness, wavelength);

    const wave = drawsWave ? (
      <svg className="md-linear-progress__wave" aria-hidden="true">
        <path
          ref={pathRef}
          stroke="currentColor"
          strokeWidth={thickness}
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </svg>
    ) : null;

    const rootProps = {
      ref,
      role: 'progressbar' as const,
      'aria-valuenow': isIndeterminate ? undefined : clampedValue,
      'aria-valuemin': isIndeterminate ? undefined : 0,
      'aria-valuemax': isIndeterminate ? undefined : 100,
      'aria-label': isIndeterminate ? 'Loading' : `Progress: ${clampedValue}%`,
      className: cx('md-linear-progress', className),
      'data-variant': variant,
      'data-thickness': thickness,
      'data-indeterminate': isIndeterminate || undefined,
      'data-type': resolvedType,
      style: {
        ...style,
        '--_thickness': `${thickness}px`,
        '--_amplitude': `${WAVE_AMPLITUDE}px`,
      } as React.CSSProperties,
      ...props,
    };

    if (isIndeterminate) {
      // The track splits around the segment, keeping a 4 dp gap on both sides of it as it travels and grows.
      return (
        <div {...rootProps}>
          <span className="md-linear-progress__indeterminate-track md-linear-progress__indeterminate-track--start" />
          <span ref={boxRef} className="md-linear-progress__indeterminate-segment">
            {wave}
          </span>
          <span className="md-linear-progress__indeterminate-track md-linear-progress__indeterminate-track--end" />
        </div>
      );
    }

    if (complete) {
      return (
        <div {...rootProps} data-complete="">
          <span className="md-linear-progress__complete" />
        </div>
      );
    }

    return (
      <div {...rootProps} data-low-value={lowValue || undefined}>
        <div className="md-linear-progress__row" style={{ '--_value': `${clampedValue}%` } as React.CSSProperties}>
          {clampedValue > 0 ? (
            <>
              <span ref={boxRef} className="md-linear-progress__active">
                {wave}
              </span>
              <span className="md-linear-progress__gap" />
            </>
          ) : null}
          {/* The track runs to the end of the row; the stop sits on top of its rounded end. */}
          <span className="md-linear-progress__track" />
          <span className="md-linear-progress__stop" />
        </div>
      </div>
    );
  },
);
LinearProgress.displayName = 'LinearProgress';

export { LinearProgress };
