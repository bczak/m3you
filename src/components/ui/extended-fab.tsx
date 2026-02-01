import * as React from 'react';

import { cn } from '../../lib/utils';
import { Button, type ButtonProps } from './button';

export type ExtendedFABProps = Omit<ButtonProps, 'shape'> & {
  icon?: React.ReactNode;
  label: string;
  lowered?: boolean;
};

const ExtendedFAB = React.forwardRef<HTMLButtonElement, ExtendedFABProps>(
  ({ className, variant = 'tonal', size = 'md', lowered = false, icon, label, children, ...props }, ref) => {
    return (
      <Button
        ref={ref}
        variant={variant}
        size={size}
        shape="square"
        className={cn(
          // Extended FAB specific: 16dp corner radius (between round and square)
          'gap-3 rounded-2xl shadow-md hover:shadow-lg',
          // Lowered elevation variant
          lowered && 'shadow-sm hover:shadow-md',
          className,
        )}
        {...props}
      >
        {icon}
        {label}
        {children}
      </Button>
    );
  },
);
ExtendedFAB.displayName = 'ExtendedFAB';

export { ExtendedFAB };
