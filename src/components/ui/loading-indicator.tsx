import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';

import { cn } from '../../lib/utils';

const loadingIndicatorVariants = cva('inline-flex shrink-0 items-center justify-center', {
  variants: {
    size: {
      sm: 'size-8',
      md: 'size-12',
      lg: 'size-16',
    },
    contained: {
      true: 'rounded-full bg-tertiary-container',
      false: '',
    },
  },
  defaultVariants: {
    size: 'md',
    contained: false,
  },
});

const loadingIndicatorIconVariants = cva('animate-loading-indicator text-primary', {
  variants: {
    size: {
      sm: 'size-5',
      md: 'size-8',
      lg: 'size-10',
    },
    contained: {
      true: 'text-tertiary',
      false: '',
    },
  },
  defaultVariants: {
    size: 'md',
    contained: false,
  },
});

export type LoadingIndicatorProps = React.ComponentProps<'div'> & VariantProps<typeof loadingIndicatorVariants>;

const LoadingIndicator = React.forwardRef<HTMLDivElement, LoadingIndicatorProps>(
  ({ className, size = 'md', contained = false, ...props }, ref) => {
    return (
      <div
        ref={ref}
        role="progressbar"
        aria-label="Loading"
        aria-busy="true"
        className={cn(loadingIndicatorVariants({ size, contained, className }))}
        {...props}
      >
        <svg
          aria-hidden="true"
          viewBox="0 0 48 48"
          fill="currentColor"
          className={cn(loadingIndicatorIconVariants({ size, contained }))}
        >
          <path d="M24 4L28.5 16.5L41 12L32 22L44 24L32 26L41 36L28.5 31.5L24 44L19.5 31.5L7 36L16 26L4 24L16 22L7 12L19.5 16.5L24 4Z" />
        </svg>
      </div>
    );
  },
);
LoadingIndicator.displayName = 'LoadingIndicator';

export { LoadingIndicator, loadingIndicatorVariants };
