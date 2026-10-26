import * as React from 'react';

import { cx } from '../../lib/cx';
import { IconButton, type IconButtonProps } from '../IconButton/icon-button';
// After IconButton on purpose: this puts fab.css after icon-button.css in the
// published stylesheet and in dev, so the FAB's (0,3,0) shape and size rules
// win their ties with IconButton's square-shape rules (a medium FAB would
// otherwise fall back to IconButton's 16dp corner instead of 20dp).
import './fab.css';

export type FABColor =
  | 'primary'
  | 'secondary'
  | 'tertiary'
  | 'primary-container'
  | 'secondary-container'
  | 'tertiary-container';

export type FABSize = 'small' | 'medium' | 'large';

export type FABProps = Omit<IconButtonProps, 'shape' | 'width' | 'color' | 'morph'> & {
  /**
   * Tighten the corners while pressed. Off by default: unlike an icon button,
   * an M3 FAB keeps its corner radius when pressed.
   */
  morph?: boolean;
  /** Use the lowered elevation, for a FAB resting on a coloured surface. */
  lowered?: boolean;
  /** M3 FAB color role. Overrides the legacy `variant` color mapping. */
  color?: FABColor;
  /** Kit-backed 56/80/96px size. Overrides the legacy `size` scale. */
  fabSize?: FABSize;
};

const FAB = React.forwardRef<HTMLButtonElement, React.PropsWithoutRef<FABProps>>(
  ({ className, variant = 'tonal', size = 'md', lowered = false, morph = false, color, fabSize, ...props }, ref) => {
    const resolvedSize = fabSize === 'large' ? 'lg' : fabSize ? 'md' : size;

    return (
      <IconButton
        ref={ref}
        variant={variant}
        size={resolvedSize}
        shape="square"
        width="default"
        morph={morph}
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
