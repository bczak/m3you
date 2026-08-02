import './fab.css';
import type * as React from 'react';
import { forwardRef } from 'react';

import { cx } from '../../lib/cx';
import { IconButton, type IconButtonProps } from '../IconButton/icon-button';

export type FABProps = Omit<IconButtonProps, 'shape' | 'width'> & {
  /** Use the lowered elevation, for a FAB resting on a coloured surface. */
  lowered?: boolean;
};

const FAB = forwardRef<HTMLButtonElement, React.PropsWithoutRef<FABProps>>(
  ({ className, variant = 'tonal', size = 'md', lowered = false, ...props }, ref) => {
    return (
      <IconButton
        ref={ref}
        variant={variant}
        size={size}
        shape="square"
        width="default"
        className={cx('md-fab', className)}
        data-lowered={lowered || undefined}
        {...props}
      />
    );
  },
);
FAB.displayName = 'FAB';

export { FAB };
