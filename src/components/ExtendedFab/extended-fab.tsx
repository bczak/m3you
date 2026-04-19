import './extended-fab.css';
import type * as React from 'react';

import { cx } from '../../lib/cx';
import { Button, type ButtonProps } from '../Button/button';

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
      className={cx('md-extended-fab', className)}
      data-lowered={lowered || undefined}
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
