import './button-group.css';
import type * as React from 'react';
import { forwardRef } from 'react';

import { cx } from '../../lib/cx';

// =============================================================================
// ButtonGroup (Base) — Stateless layout wrapper
// =============================================================================

export interface ButtonGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Lay the buttons out in a row or a column. */
  orientation?: 'horizontal' | 'vertical';
}

const ButtonGroup = forwardRef<HTMLDivElement, React.PropsWithoutRef<ButtonGroupProps>>(
  ({ className, orientation = 'horizontal', ...props }, ref) => {
    return (
      // biome-ignore lint/a11y/useSemanticElements: role="group" is correct per WAI-ARIA
      <div
        ref={ref}
        role="group"
        data-orientation={orientation}
        className={cx('md-button-group', className)}
        {...props}
      />
    );
  },
);
ButtonGroup.displayName = 'ButtonGroup';

export { ButtonGroup };
