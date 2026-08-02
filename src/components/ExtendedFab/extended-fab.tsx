import './extended-fab.css';
import type * as React from 'react';

import { cx } from '../../lib/cx';
import { Button, type ButtonProps } from '../Button/button';
import type { FABColor, FABSize } from '../Fab/fab';

export type ExtendedFABProps = Omit<ButtonProps, 'shape'> & {
  /** Icon shown before the label. */
  icon?: React.ReactNode;
  /** Text label. Required — the component measures it to animate its own width. */
  label: string;
  /** Use the lowered elevation. */
  lowered?: boolean;
  /** M3 FAB color role. Overrides the legacy `variant` color mapping. */
  color?: FABColor;
  /** Kit-backed 56/80/96px size. Overrides the legacy `size` scale. */
  fabSize?: FABSize;
};

const ExtendedFAB = ({
  className,
  variant = 'tonal',
  size = 'md',
  lowered = false,
  color,
  fabSize,
  icon,
  label,
  children,
  ref,
  ...props
}: ExtendedFABProps & { ref?: React.Ref<HTMLButtonElement> }) => {
  const resolvedSize = fabSize === 'large' ? 'lg' : fabSize ? 'md' : size;

  return (
    <Button
      ref={ref}
      variant={variant}
      size={resolvedSize}
      shape="square"
      className={cx('md-extended-fab', className)}
      data-lowered={lowered || undefined}
      data-fab-color={color}
      data-fab-size={fabSize}
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
