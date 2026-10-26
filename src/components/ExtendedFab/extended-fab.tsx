import * as React from 'react';

import { cx } from '../../lib/cx';
import { Button, type ButtonProps } from '../Button/button';
import type { FABColor, FABSize } from '../Fab/fab';
// After Button on purpose: this puts extended-fab.css after button.css in the
// published stylesheet and in dev, so the extended FAB's (0,3,0) corner rules
// win their ties with Button's square-shape rules (a medium extended FAB would
// otherwise fall back to Button's 16dp corner instead of 20dp, and xs/sm to
// 12dp instead of 16dp). Raising those rules instead would tie them with the
// FAB menu's (0,4,0) open-trigger circle.
import './extended-fab.css';

export type ExtendedFABProps = Omit<ButtonProps, 'shape' | 'color' | 'morph'> & {
  /**
   * Tighten the corners while pressed. Off by default: like a FAB, an M3
   * extended FAB keeps its corner radius when pressed.
   */
  morph?: boolean;
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

const ExtendedFAB = React.forwardRef<HTMLButtonElement, React.PropsWithoutRef<ExtendedFABProps>>(
  (
    {
      className,
      variant = 'tonal',
      size = 'md',
      lowered = false,
      morph = false,
      color,
      fabSize,
      icon,
      label,
      children,
      ...props
    },
    ref,
  ) => {
    const resolvedSize = fabSize === 'large' ? 'lg' : fabSize ? 'md' : size;

    return (
      <Button
        ref={ref}
        variant={variant}
        size={resolvedSize}
        shape="square"
        morph={morph}
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
  },
);
ExtendedFAB.displayName = 'ExtendedFAB';

export { ExtendedFAB };
