import './divider.css';
import type * as React from 'react';

import { cx } from '../../lib/cx';

export type DividerProps = React.ComponentProps<'hr'> & {
  variant?: 'full-width' | 'inset' | 'heavy';
  orientation?: 'horizontal' | 'vertical';
};

const Divider = ({
  className,
  variant = 'full-width',
  orientation = 'horizontal',
  ref,
  ...props
}: DividerProps & { ref?: React.Ref<HTMLHRElement> }) => (
  <hr
    ref={ref}
    aria-orientation={orientation === 'vertical' ? 'vertical' : undefined}
    className={cx('md-divider', className)}
    data-variant={variant}
    data-orientation={orientation}
    {...props}
  />
);
Divider.displayName = 'Divider';

export { Divider };
