import './divider.css';
import type * as React from 'react';
import { forwardRef } from 'react';

import { cx } from '../../lib/cx';

export type DividerProps = React.ComponentProps<'hr'> & {
  /** `inset` indents the line to align with list text; `heavy` is thicker. */
  variant?: 'full-width' | 'inset' | 'heavy';
  /** Draw the line horizontally or vertically. */
  orientation?: 'horizontal' | 'vertical';
};

const Divider = forwardRef<HTMLHRElement, React.PropsWithoutRef<DividerProps>>(
  ({ className, variant = 'full-width', orientation = 'horizontal', ...props }, ref) => (
    <hr
      ref={ref}
      aria-orientation={orientation === 'vertical' ? 'vertical' : undefined}
      className={cx('md-divider', className)}
      data-variant={variant}
      data-orientation={orientation}
      {...props}
    />
  ),
);
Divider.displayName = 'Divider';

export { Divider };
