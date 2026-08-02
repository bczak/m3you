import './extended-fab.css';
import type * as React from 'react';
import { forwardRef } from 'react';

import { cx } from '../../lib/cx';
import { Button, type ButtonProps } from '../Button/button';

export type ExtendedFABProps = Omit<ButtonProps, 'shape'> & {
  /** Icon shown before the label. */
  icon?: React.ReactNode;
  /** Text label. Required — the component measures it to animate its own width. */
  label: string;
  /** Use the lowered elevation. */
  lowered?: boolean;
};

const ExtendedFAB = forwardRef<HTMLButtonElement, React.PropsWithoutRef<ExtendedFABProps>>(
  ({ className, variant = 'tonal', size = 'md', lowered = false, icon, label, children, ...props }, ref) => {
    return (
      <Button
        ref={ref}
        variant={variant}
        size={size}
        shape="square"
        className={cx('md-extended-fab', className)}
        data-lowered={lowered || undefined}
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
