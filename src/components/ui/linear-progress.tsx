import { cva, type VariantProps } from 'class-variance-authority';
import type * as React from 'react';

import { cn } from '../../lib/utils';

const linearProgressVariants = cva('relative w-full overflow-hidden rounded-full bg-primary-container', {
  variants: {
    size: {
      sm: 'h-1',
      md: 'h-1',
      lg: 'h-1.5',
    },
  },
  defaultVariants: {
    size: 'md',
  },
});

const linearProgressIndicatorVariants = cva('h-full rounded-full bg-primary transition-[width] duration-150 ease-out', {
  variants: {
    indeterminate: {
      true: 'absolute animate-linear-progress-indeterminate',
      false: '',
    },
  },
  defaultVariants: {
    indeterminate: false,
  },
});

export type LinearProgressProps = React.ComponentProps<'div'> &
  VariantProps<typeof linearProgressVariants> & {
    /** Progress value from 0 to 100. Ignored when indeterminate is true. */
    value?: number;
    /** When true, shows an indeterminate animation instead of a progress value. */
    indeterminate?: boolean;
  };

const LinearProgress = ({
  className,
  size = 'md',
  value = 0,
  indeterminate = false,
  ref,
  ...props
}: LinearProgressProps & { ref?: React.Ref<HTMLDivElement> }) => {
  const clampedValue = Math.min(100, Math.max(0, value));

  return (
    <div
      ref={ref}
      role="progressbar"
      aria-valuenow={indeterminate ? undefined : clampedValue}
      aria-valuemin={indeterminate ? undefined : 0}
      aria-valuemax={indeterminate ? undefined : 100}
      aria-label={indeterminate ? 'Loading' : `Progress: ${clampedValue}%`}
      className={cn(linearProgressVariants({ size, className }))}
      {...props}
    >
      <div
        className={cn(linearProgressIndicatorVariants({ indeterminate }))}
        style={indeterminate ? undefined : { width: `${clampedValue}%` }}
      />
    </div>
  );
};
LinearProgress.displayName = 'LinearProgress';

export { LinearProgress, linearProgressVariants };
