import './fab.css';
import * as React from 'react';

import { cx } from '../../lib/cx';
import { IconButton, type IconButtonProps } from '../IconButton/icon-button';

export type FABColor =
  | 'primary'
  | 'secondary'
  | 'tertiary'
  | 'primary-container'
  | 'secondary-container'
  | 'tertiary-container';

export type FABSize = 'small' | 'medium' | 'large';

export type FABProps = Omit<IconButtonProps, 'shape' | 'width'> & {
  /** Use the lowered elevation, for a FAB resting on a coloured surface. */
  lowered?: boolean;
  /** M3 FAB color role. Overrides the legacy `variant` color mapping. */
  color?: FABColor;
  /** Kit-backed 56/80/96px size. Overrides the legacy `size` scale. */
  fabSize?: FABSize;
};

const FAB = React.forwardRef<HTMLButtonElement, React.PropsWithoutRef<FABProps>>(
  ({ className, variant = 'tonal', size = 'md', lowered = false, color, fabSize, ...props }, ref) => {
    const resolvedSize = fabSize === 'large' ? 'lg' : fabSize ? 'md' : size;

    return (
      <IconButton
        ref={ref}
        variant={variant}
        size={resolvedSize}
        shape="square"
        width="default"
        className={cx('md-fab', className)}
        data-lowered={lowered || undefined}
        data-fab-color={color}
        data-fab-size={fabSize}
        {...props}
      />
    );
  },
);
FAB.displayName = 'FAB';

export { FAB };
