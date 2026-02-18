import type * as React from 'react';

import { cn } from '../../lib/utils';
import { Button, type ButtonProps } from './button';

export type ExtendedFABProps = Omit<ButtonProps, 'shape'> & {
  icon?: React.ReactNode;
  label: string;
  lowered?: boolean;
};

const ExtendedFAB = ({
  className,
  variant = 'tonal',
  size = 'md',
  lowered = false,
  icon,
  label,
  children,
  ref,
  ...props
}: ExtendedFABProps & { ref?: React.Ref<HTMLButtonElement> }) => {
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
};
ExtendedFAB.displayName = 'ExtendedFAB';

export { ExtendedFAB };
