import './linear-progress.css';
import type * as React from 'react';
import { forwardRef, useId, useMemo } from 'react';

import { cx } from '../../lib/cx';
import { drawLinearWavyPath } from './wavy-path';

export type LinearProgressVariant = 'flat' | 'wavy';

export type LinearProgressProps = React.ComponentProps<'div'> & {
  /** Progress from 0 to 100. Ignored when indeterminate. */
  value?: number;
  /** Whether the amount of work is known. */
  type?: 'determinate' | 'indeterminate';
  /** @deprecated Use `type="indeterminate"` instead. */
  indeterminate?: boolean;
  /** M3 Expressive appearance. Defaults to 'flat'. */
  variant?: LinearProgressVariant;
};

/** M3 Expressive linear progress tokens (px). */
const AMPLITUDE = 3;
const STROKE_WIDTH = 4;
const WAVELENGTH_DETERMINATE = 40;
const WAVELENGTH_INDETERMINATE = 24;

/** Wide enough to cover typical progress bars; inner content clips overflow. */
const PATH_RENDER_WIDTH = 2048;

const LinearProgress = forwardRef<HTMLDivElement, React.PropsWithoutRef<LinearProgressProps>>(
  ({ className, value = 0, type = 'determinate', indeterminate = false, variant = 'flat', ...props }, ref) => {
    const clampedValue = Math.min(100, Math.max(0, value));
    const isWavy = variant === 'wavy';
    const resolvedType = indeterminate ? 'indeterminate' : type;
    const isIndeterminate = resolvedType === 'indeterminate';
    const maskId = useId();

    const determinatePath = useMemo(
      () =>
        drawLinearWavyPath({
          width: PATH_RENDER_WIDTH,
          amplitude: AMPLITUDE,
          wavelength: WAVELENGTH_DETERMINATE,
          strokeWidth: STROKE_WIDTH,
        }),
      [],
    );
    const indeterminatePath = useMemo(
      () =>
        drawLinearWavyPath({
          width: PATH_RENDER_WIDTH,
          amplitude: AMPLITUDE,
          wavelength: WAVELENGTH_INDETERMINATE,
          strokeWidth: STROKE_WIDTH,
        }),
      [],
    );

    const rootProps = {
      ref,
      role: 'progressbar' as const,
      'aria-valuenow': isIndeterminate ? undefined : clampedValue,
      'aria-valuemin': isIndeterminate ? undefined : 0,
      'aria-valuemax': isIndeterminate ? undefined : 100,
      'aria-label': isIndeterminate ? 'Loading' : `Progress: ${clampedValue}%`,
      className: cx('md-linear-progress', className),
      'data-variant': variant,
      'data-indeterminate': isIndeterminate || undefined,
      'data-type': resolvedType,
      ...props,
    };

    if (!isWavy) {
      return (
        <div {...rootProps}>
          <div
            className="md-linear-progress__indicator"
            data-indeterminate={isIndeterminate || undefined}
            style={isIndeterminate ? undefined : { width: `${clampedValue}%` }}
          />
        </div>
      );
    }

    if (isIndeterminate) {
      // Wavy indeterminate: two band masks slide over a static wave, revealing
      // primary + secondary segments. Where masks hide the wave, a track line
      // shows through the inverse mask.
      return (
        <div {...rootProps}>
          <svg
            className="md-linear-progress__wave"
            width="100%"
            height={indeterminatePath.height}
            viewBox={indeterminatePath.viewBox}
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <defs>
              <mask id={`${maskId}-show`} maskUnits="userSpaceOnUse">
                <rect width={PATH_RENDER_WIDTH} height="100%" fill="black" />
                <rect className="md-linear-progress__band-primary" height="100%" fill="white" />
                <rect className="md-linear-progress__band-secondary" height="100%" fill="white" />
              </mask>
              <mask id={`${maskId}-hide`} maskUnits="userSpaceOnUse">
                <rect width={PATH_RENDER_WIDTH} height="100%" fill="white" />
                <rect className="md-linear-progress__band-primary" height="100%" fill="black" />
                <rect className="md-linear-progress__band-secondary" height="100%" fill="black" />
              </mask>
            </defs>
            <g mask={`url(#${maskId}-show)`}>
              <path
                className="md-linear-progress__wave-path"
                d={indeterminatePath.path}
                stroke="currentColor"
                strokeWidth={STROKE_WIDTH}
                strokeLinecap="round"
                fill="none"
              />
            </g>
            <g mask={`url(#${maskId}-hide)`}>
              <rect
                className="md-linear-progress__wave-track"
                width={PATH_RENDER_WIDTH}
                height={STROKE_WIDTH}
                y={AMPLITUDE}
              />
            </g>
          </svg>
        </div>
      );
    }

    // Wavy determinate: flex row of [active | gap | track | gap | stop].
    // At 100% we render a flat complete bar (matches M3 spec — no wave at full).
    if (clampedValue >= 100) {
      return (
        <div {...rootProps} data-complete>
          <div className="md-linear-progress__complete" />
        </div>
      );
    }

    return (
      <div {...rootProps}>
        <div className="md-linear-progress__row" style={{ '--_value': `${clampedValue}%` } as React.CSSProperties}>
          {clampedValue > 0 && (
            <div className="md-linear-progress__active">
              <svg
                className="md-linear-progress__wave md-linear-progress__wave--sliding"
                width={PATH_RENDER_WIDTH}
                height={determinatePath.height}
                viewBox={determinatePath.viewBox}
                preserveAspectRatio="xMinYMid meet"
                aria-hidden="true"
              >
                <path
                  d={determinatePath.path}
                  stroke="currentColor"
                  strokeWidth={STROKE_WIDTH}
                  strokeLinecap="round"
                  fill="none"
                />
              </svg>
            </div>
          )}
          {clampedValue > 0 && <div className="md-linear-progress__gap" />}
          <div className="md-linear-progress__track" />
          {clampedValue > 0 && <div className="md-linear-progress__gap" />}
          {clampedValue > 0 && <div className="md-linear-progress__stop" />}
        </div>
      </div>
    );
  },
);
LinearProgress.displayName = 'LinearProgress';

export { LinearProgress };
