import { type VariantProps, cva } from 'class-variance-authority';
import * as React from 'react';

import { cn } from '../../lib/utils';

const buttonGroupVariants = cva('inline-flex', {
  variants: {
    orientation: {
      horizontal:
        '[&>button]:rounded-none [&>button:first-child]:rounded-l-md [&>button:last-child]:rounded-r-md [&>button:not(:first-child)]:-ml-px',
      vertical:
        'flex-col [&>button]:rounded-none [&>button:first-child]:rounded-t-md [&>button:last-child]:rounded-b-md [&>button:not(:first-child)]:-mt-px',
    },
  },
  defaultVariants: {
    orientation: 'horizontal',
  },
});

export interface ButtonGroupProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof buttonGroupVariants> {}

const ButtonGroup = React.forwardRef<HTMLDivElement, ButtonGroupProps>(({ className, orientation, ...props }, ref) => {
  // biome-ignore lint/a11y/useSemanticElements: fieldset is not appropriate for button groups, role="group" is correct per WAI-ARIA
  return <div ref={ref} role="group" className={cn(buttonGroupVariants({ orientation, className }))} {...props} />;
});
ButtonGroup.displayName = 'ButtonGroup';

export { ButtonGroup, buttonGroupVariants };
