import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';

import { cn } from '../../lib/utils';

const circularProgressVariants = cva('inline-flex shrink-0', {
  variants: {
    size: {
      sm: 'size-6',
      md: 'size-10',
      lg: 'size-12',
    },
  },
  defaultVariants: {
    size: 'md',
  },
});

const circularProgressSvgVariants = cva('', {
  variants: {
    indeterminate: {
      true: 'animate-circular-progress-rotate',
      false: '',
    },
  },
  defaultVariants: {
    indeterminate: false,
  },
});

const circularProgressTrackVariants = cva('stroke-primary-container', {
  variants: {
    size: {
      sm: '',
      md: '',
      lg: '',
    },
  },
  defaultVariants: {
    size: 'md',
  },
});

const circularProgressIndicatorVariants = cva('stroke-primary transition-[stroke-dashoffset] duration-150 ease-out', {
  variants: {
    indeterminate: {
      true: 'animate-circular-progress-dash',
      false: '',
    },
  },
  defaultVariants: {
    indeterminate: false,
  },
});

export type CircularProgressProps = React.ComponentProps<'div'> &
  VariantProps<typeof circularProgressVariants> & {
    /** Progress value from 0 to 100. Ignored when indeterminate is true. */
    value?: number;
    /** When true, shows an indeterminate animation instead of a progress value. */
    indeterminate?: boolean;
    /** Stroke width of the progress circle. */
    strokeWidth?: number;
  };

const CircularProgress = React.forwardRef<HTMLDivElement, CircularProgressProps>(
  ({ className, size = 'md', value = 0, indeterminate = false, strokeWidth = 4, ...props }, ref) => {
    const clampedValue = Math.min(100, Math.max(0, value));

    // SVG circle calculations
    const radius = 20; // viewBox is 48x48, center at 24, radius 20 gives good padding for stroke
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
        className={cn(circularProgressVariants({ size, className }))}
        {...props}
      >
        <svg
          aria-hidden="true"
          viewBox="0 0 48 48"
          fill="none"
          className={cn('size-full', circularProgressSvgVariants({ indeterminate }))}
        >
          {/* Track circle */}
          <circle
            cx="24"
            cy="24"
            r={radius}
            strokeWidth={strokeWidth}
            fill="none"
            className={cn(circularProgressTrackVariants({ size }))}
          />
          {/* Progress indicator circle */}
          <circle
            cx="24"
            cy="24"
            r={radius}
            strokeWidth={strokeWidth}
            fill="none"
            strokeLinecap="round"
            className={cn(circularProgressIndicatorVariants({ indeterminate }))}
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
  },
);
CircularProgress.displayName = 'CircularProgress';

export { CircularProgress, circularProgressVariants };
