import { cva, type VariantProps } from 'class-variance-authority';
import { Ripple } from 'm3-ripple';
import * as React from 'react';

import { cn } from '../../lib/utils';

const cardVariants = cva('relative overflow-hidden rounded-xl', {
  variants: {
    variant: {
      elevated: 'bg-surface-container-low text-foreground shadow-md',
      filled: 'bg-surface-container-highest text-foreground',
      outlined: 'border border-outline-variant bg-surface text-foreground',
    },
  },
  defaultVariants: {
    variant: 'filled',
  },
});

export type CardProps = React.ComponentProps<'div'> &
  VariantProps<typeof cardVariants> & {
    disabled?: boolean;
    ripple?: boolean;
  };

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = 'filled', disabled, ripple, onClick, onKeyDown, children, ...props }, ref) => {
    const isInteractive = Boolean(onClick);
    const showRipple = ripple ?? isInteractive;

    const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (isInteractive && !disabled && (e.key === 'Enter' || e.key === ' ')) {
        e.preventDefault();
        onClick?.(e as unknown as React.MouseEvent<HTMLDivElement>);
      }
      onKeyDown?.(e);
    };

    return (
      // biome-ignore lint/a11y/noStaticElementInteractions: role="button" is set conditionally when interactive
      <div
        ref={ref}
        role={isInteractive ? 'button' : undefined}
        tabIndex={isInteractive && !disabled ? 0 : undefined}
        aria-disabled={isInteractive && disabled ? true : undefined}
        onClick={!disabled ? onClick : undefined}
        onKeyDown={isInteractive ? handleKeyDown : onKeyDown}
        className={cn(
          cardVariants({ variant }),
          isInteractive &&
            !disabled &&
            'cursor-pointer transition-shadow duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
          isInteractive && !disabled && variant === 'elevated' && 'hover:shadow-lg',
          isInteractive && !disabled && variant !== 'elevated' && 'hover:shadow-sm',
          disabled && 'pointer-events-none opacity-38',
          className,
        )}
        {...props}
      >
        {showRipple && !disabled && <Ripple />}
        {children}
      </div>
    );
  },
);
Card.displayName = 'Card';

export { Card, cardVariants };
