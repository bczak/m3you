import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';

import { cn } from '../../lib/utils';

const badgeVariants = cva('inline-flex items-center justify-center font-medium text-error-foreground', {
  variants: {
    size: {
      small: 'size-1.5 rounded-[3px] bg-error',
      large: 'h-4 min-w-4 rounded-lg bg-error px-1 text-[11px] leading-none',
    },
  },
  defaultVariants: {
    size: 'large',
  },
});

export type BadgeProps = Omit<React.ComponentProps<'span'>, 'children'> &
  VariantProps<typeof badgeVariants> & {
    /** The count to display in the badge. If undefined or 0, shows a small dot badge. */
    count?: number;
    /** Maximum count to display before showing overflow (e.g., 999+). Defaults to 999. */
    max?: number;
    /** Whether to show the badge. Defaults to true. */
    visible?: boolean;
  };

const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, size, count, max = 999, visible = true, ...props }, ref) => {
    // Determine if this should be a small (dot) or large badge
    const isSmall = size === 'small' || count === undefined || count === 0;
    const actualSize = isSmall ? 'small' : 'large';

    // Format the display value
    const getDisplayValue = () => {
      if (isSmall) return null;
      if (count !== undefined && count > max) {
        return `${max}+`;
      }
      return count?.toString();
    };

    if (!visible) return null;

    return (
      <span ref={ref} className={cn(badgeVariants({ size: actualSize, className }))} {...props}>
        {getDisplayValue()}
      </span>
    );
  },
);
Badge.displayName = 'Badge';

// BadgeAnchor - A wrapper component to position a badge relative to its children
export type BadgeAnchorProps = React.ComponentProps<'span'> & {
  /** The badge element to display */
  badge: React.ReactElement<BadgeProps>;
  /** Position of the badge relative to the anchor. Defaults to 'top-right'. */
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  /** Overlap type for badge positioning. 'rectangular' for rectangular content, 'circular' for circular content. */
  overlap?: 'rectangular' | 'circular';
};

const anchorPositionVariants = cva('absolute', {
  variants: {
    position: {
      'top-right': 'right-0 top-0 translate-x-1/2 -translate-y-1/2',
      'top-left': 'left-0 top-0 -translate-x-1/2 -translate-y-1/2',
      'bottom-right': 'bottom-0 right-0 translate-x-1/2 translate-y-1/2',
      'bottom-left': 'bottom-0 left-0 -translate-x-1/2 translate-y-1/2',
    },
    overlap: {
      rectangular: '',
      circular: '',
    },
  },
  compoundVariants: [
    // Adjust positioning for circular overlap (badges sit closer to the edge)
    { position: 'top-right', overlap: 'circular', class: 'right-[14%] top-[14%]' },
    { position: 'top-left', overlap: 'circular', class: 'left-[14%] top-[14%]' },
    { position: 'bottom-right', overlap: 'circular', class: 'bottom-[14%] right-[14%]' },
    { position: 'bottom-left', overlap: 'circular', class: 'bottom-[14%] left-[14%]' },
  ],
  defaultVariants: {
    position: 'top-right',
    overlap: 'rectangular',
  },
});

const BadgeAnchor = React.forwardRef<HTMLSpanElement, BadgeAnchorProps>(
  ({ className, children, badge, position = 'top-right', overlap = 'rectangular', ...props }, ref) => {
    return (
      <span ref={ref} className={cn('relative inline-flex', className)} {...props}>
        {children}
        <span className={cn(anchorPositionVariants({ position, overlap }))}>{badge}</span>
      </span>
    );
  },
);
BadgeAnchor.displayName = 'BadgeAnchor';

export { Badge, BadgeAnchor, badgeVariants };
