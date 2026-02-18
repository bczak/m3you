import { cva, type VariantProps } from 'class-variance-authority';
import type * as React from 'react';

import { cn } from '../../lib/utils';

/* =============================================================================
   App Bar - M3 Expressive App Bar
   Four types: search (compose with SearchBar), small, medium flexible, large flexible
   Displays headline, navigation icon, and 1-2 essential actions at the top of a page.
   On scroll, apply elevated state to separate from body content.
   ============================================================================= */

const appBarVariants = cva('sticky top-0 z-10 flex w-full flex-col transition-colors duration-200', {
  variants: {
    variant: {
      small: '',
      medium: '',
      large: '',
    },
    elevated: {
      true: 'bg-surface-container',
      false: 'bg-surface',
    },
  },
  defaultVariants: {
    variant: 'small',
    elevated: false,
  },
});

export type AppBarProps = React.ComponentProps<'header'> &
  VariantProps<typeof appBarVariants> & {
    /** Headline text */
    headline?: string;
    /** Optional subtitle text below headline */
    subtitle?: string;
    /** Leading navigation icon (e.g. back arrow, menu icon) */
    leadingIcon?: React.ReactNode;
    /** Trailing action icons (1-2 IconButtons) */
    trailingIcons?: React.ReactNode;
    /** Center-align headline (small variant only) */
    centerAligned?: boolean;
  };

const AppBar = ({
  className,
  variant = 'small',
  elevated = false,
  headline,
  subtitle,
  leadingIcon,
  trailingIcons,
  centerAligned = false,
  children,
  ref,
  ...props
}: AppBarProps & { ref?: React.Ref<HTMLElement> }) => {
  if (variant === 'small') {
    return (
      <header ref={ref} className={cn(appBarVariants({ variant, elevated, className }))} {...props}>
        <div className="flex h-16 items-center gap-1 px-1">
          {/* Leading icon — 48px touch target with 4px margin */}
          {leadingIcon && (
            <div className="flex shrink-0 items-center text-on-surface [&_svg]:size-6">{leadingIcon}</div>
          )}

          {/* Headline */}
          <div className={cn('min-w-0 flex-1 px-3', centerAligned && 'text-center')}>
            {headline && <h1 className="truncate font-normal text-[22px] text-on-surface leading-7">{headline}</h1>}
            {subtitle && <p className="truncate font-medium text-on-surface-variant text-xs">{subtitle}</p>}
          </div>

          {/* Trailing icons */}
          {trailingIcons && (
            <div className="flex shrink-0 items-center gap-1 text-on-surface-variant [&_svg]:size-6">
              {trailingIcons}
            </div>
          )}
        </div>

        {children}
      </header>
    );
  }

  // Medium flexible and Large flexible — two-row layout
  const isMedium = variant === 'medium';

  return (
    <header ref={ref} className={cn(appBarVariants({ variant, elevated, className }))} {...props}>
      {/* Top row: leading icon + trailing icons */}
      <div className="flex h-12 items-center gap-1 px-1">
        {leadingIcon && <div className="flex shrink-0 items-center text-on-surface [&_svg]:size-6">{leadingIcon}</div>}
        <div className="flex-1" />
        {trailingIcons && (
          <div className="flex shrink-0 items-center gap-1 text-on-surface-variant [&_svg]:size-6">{trailingIcons}</div>
        )}
      </div>

      {/* Bottom row: headline + subtitle */}
      <div className={cn('px-4 pb-3', isMedium ? 'pt-0' : 'pt-1')}>
        {headline && (
          <h1
            className={cn('font-normal text-on-surface', isMedium ? 'text-[28px] leading-9' : 'text-[36px] leading-11')}
          >
            {headline}
          </h1>
        )}
        {subtitle && (
          <p className={cn('font-medium text-on-surface-variant', isMedium ? 'text-sm' : 'text-base')}>{subtitle}</p>
        )}
      </div>

      {children}
    </header>
  );
};
AppBar.displayName = 'AppBar';

export { AppBar, appBarVariants };
