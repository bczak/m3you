import './circular-progress.css';
import type * as React from 'react';

import { cx } from '../../lib/cx';

export type CircularProgressProps = React.ComponentProps<'div'> & {
  size?: 'sm' | 'md' | 'lg';
  value?: number;
  indeterminate?: boolean;
  strokeWidth?: number;
};

const CircularProgress = ({
  className,
  size = 'md',
  value = 0,
  indeterminate = false,
  strokeWidth = 4,
  ref,
  ...props
}: CircularProgressProps & { ref?: React.Ref<HTMLDivElement> }) => {
  const clampedValue = Math.min(100, Math.max(0, value));
  const radius = 20;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (clampedValue / 100) * circumference;

  return (
    <div
      ref={ref}
      role="progressbar"
      aria-valuenow={indeterminate ? undefined : clampedValue}
      aria-valuemin={indeterminate ? undefined : 0}
      aria-valuemax={indeterminate ? undefined : 100}
      aria-label={indeterminate ? 'Loading' : `Progress: ${clampedValue}%`}
      className={cx('md-circular-progress', className)}
      data-size={size}
      {...props}
    >
      <svg
        aria-hidden="true"
        viewBox="0 0 48 48"
        fill="none"
        className="md-circular-progress__svg"
        data-indeterminate={indeterminate || undefined}
      >
        <circle
          cx="24"
          cy="24"
          r={radius}
          strokeWidth={strokeWidth}
          fill="none"
          className="md-circular-progress__track"
        />
        <circle
          cx="24"
          cy="24"
          r={radius}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          className="md-circular-progress__indicator"
          data-indeterminate={indeterminate || undefined}
          style={
            indeterminate
              ? undefined
              : {
                  strokeDasharray: circumference,
                  strokeDashoffset,
                  transform: 'rotate(-90deg)',
                  transformOrigin: 'center',
                }
          }
        />
      </svg>
    </div>
  );
};
CircularProgress.displayName = 'CircularProgress';

export { CircularProgress };
