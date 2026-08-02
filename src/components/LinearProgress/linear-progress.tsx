import './linear-progress.css';

import type * as React from 'react';
import { useMemo } from 'react';

import { cx } from '../../lib/cx';
import { drawLinearWavyPath } from './wavy-path';

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

const PATH_RENDER_WIDTH = 2048;

const LinearProgress = ({
  className,
  value = 0,
  type = 'determinate',
  indeterminate = false,
  variant = 'flat',
  thickness = 4,
  ref,
  style,
  ...props
}: LinearProgressProps & { ref?: React.Ref<HTMLDivElement> }) => {
  const clampedValue = Math.min(100, Math.max(0, value));
  const resolvedType = indeterminate ? 'indeterminate' : type;
  const isIndeterminate = resolvedType === 'indeterminate';
  const amplitude = thickness;
  const wavelength = thickness === 4 ? 20 : 40;
  const wave = useMemo(
    () =>
      drawLinearWavyPath({
        width: PATH_RENDER_WIDTH,
        amplitude,
        wavelength,
        strokeWidth: thickness,
      }),
    [amplitude, thickness, wavelength],
  );
  const rootStyle = {
    ...style,
    '--_thickness': `${thickness}px`,
    '--_amplitude': `${amplitude}px`,
    '--_wavelength': `${wavelength}px`,
  } as React.CSSProperties;

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
    style: rootStyle,
    ...props,
  };

  if (isIndeterminate) {
    return (
      <div {...rootProps}>
        <span className="md-linear-progress__indeterminate-track" />
        <span className="md-linear-progress__indeterminate-segment">
          {variant === 'wavy' ? (
            <svg
              className="md-linear-progress__wave md-linear-progress__wave--sliding"
              width={PATH_RENDER_WIDTH}
              height={wave.height}
              viewBox={wave.viewBox}
              preserveAspectRatio="xMinYMid meet"
              aria-hidden="true"
            >
              <path
                d={wave.path}
                stroke="currentColor"
                strokeWidth={thickness}
                strokeLinecap="round"
                fill="none"
                vectorEffect="non-scaling-stroke"
              />
            </svg>
          ) : null}
        </span>
      </div>
    );
  }

  if (clampedValue >= 100) {
    return (
      <div {...rootProps} data-complete="">
        <span className="md-linear-progress__complete" />
      </div>
    );
  }

  const lowValue = clampedValue > 0 && clampedValue <= 5;
  return (
    <div {...rootProps} data-low-value={lowValue || undefined}>
      <div className="md-linear-progress__row" style={{ '--_value': `${clampedValue}%` } as React.CSSProperties}>
        {clampedValue > 0 ? (
          <span className="md-linear-progress__active">
            {variant === 'wavy' && !lowValue ? (
              <svg
                className="md-linear-progress__wave md-linear-progress__wave--sliding"
                width={PATH_RENDER_WIDTH}
                height={wave.height}
                viewBox={wave.viewBox}
                preserveAspectRatio="xMinYMid meet"
                aria-hidden="true"
              >
                <path
                  d={wave.path}
                  stroke="currentColor"
                  strokeWidth={thickness}
                  strokeLinecap="round"
                  fill="none"
                  vectorEffect="non-scaling-stroke"
                />
              </svg>
            ) : null}
          </span>
        ) : null}
        {clampedValue > 0 ? <span className="md-linear-progress__gap" /> : null}
        <span className="md-linear-progress__track" />
        <span className="md-linear-progress__gap" />
        <span className="md-linear-progress__stop" />
      </div>
    </div>
  );
};
LinearProgress.displayName = 'LinearProgress';

export { LinearProgress };
