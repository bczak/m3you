import type { VariantProps } from 'class-variance-authority';
import { cva } from 'class-variance-authority';
import * as React from 'react';

import { cn } from '../../lib/utils';

const dividerVariants = cva('shrink-0 border-outline-variant', {
  variants: {
    variant: {
      'full-width': '',
      inset: 'mx-4',
    },
    orientation: {
      horizontal: 'border-t',
      vertical: 'self-stretch border-l',
    },
  },
  defaultVariants: {
    variant: 'full-width',
    orientation: 'horizontal',
  },
});

export type DividerProps = React.ComponentProps<'hr'> & VariantProps<typeof dividerVariants>;

const Divider = React.forwardRef<HTMLHRElement, DividerProps>(({ className, variant, orientation, ...props }, ref) => (
  <hr
    ref={ref}
    aria-orientation={orientation === 'vertical' ? 'vertical' : undefined}
    className={cn(dividerVariants({ variant, orientation }), className)}
    {...props}
  />
));
Divider.displayName = 'Divider';

export { Divider, dividerVariants };
