import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';

import { cn } from '../../lib/utils';

/* =============================================================================
   Toolbar - M3 Expressive Toolbar container
   Two types: docked (full-width, replaces bottom app bar) and floating (pill-shaped)
   Two color schemes: standard (surface) and vibrant (primary container)
   Two layouts: horizontal and vertical (vertical only for floating)
   ============================================================================= */

const toolbarVariants = cva('flex items-center', {
  variants: {
    type: {
      docked: 'h-16 w-full justify-center gap-8 px-4',
      floating: 'w-fit rounded-full shadow-md p-3',
    },
    color: {
      standard: 'bg-surface-container text-foreground',
      vibrant: 'bg-primary-container text-primary-container-foreground',
    },
    layout: {
      horizontal: 'flex-row',
      vertical: 'flex-col',
    },
  },
  compoundVariants: [
    { type: 'floating', layout: 'horizontal', class: 'h-16 gap-2' },
    { type: 'floating', layout: 'vertical', class: 'w-16 gap-2' },
  ],
  defaultVariants: {
    type: 'floating',
    color: 'standard',
    layout: 'horizontal',
  },
});

export type ToolbarProps = React.ComponentProps<'div'> & VariantProps<typeof toolbarVariants>;

const Toolbar = React.forwardRef<HTMLDivElement, ToolbarProps>(
  ({ className, type = 'floating', color = 'standard', layout = 'horizontal', children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        role="toolbar"
        aria-orientation={layout === 'vertical' ? 'vertical' : 'horizontal'}
        className={cn(toolbarVariants({ type, color, layout, className }))}
        {...props}
      >
        {children}
      </div>
    );
  },
);
Toolbar.displayName = 'Toolbar';

export { Toolbar, toolbarVariants };
