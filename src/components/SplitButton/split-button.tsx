import '../Button/button.css';
import './split-button.css';
import * as React from 'react';
import { useMemo, useState } from 'react';

import { cx } from '../../lib/cx';
import { SplitButtonCtx } from './split-button-context';

// =============================================================================
// SplitButton (Root)
// =============================================================================

export interface SplitButtonProps extends React.ComponentProps<'div'> {
  /** Visual emphasis, applied to both halves. */
  variant?: 'filled' | 'tonal' | 'elevated' | 'outlined';
  /** Size on the M3 scale, applied to both halves. */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  /** Corner style of the outer edges. */
  shape?: 'round' | 'square';
  /** Change corner radius while a half is held. */
  morph?: boolean;
  /** Renders the selected state on both halves. */
  selected?: boolean;
  /** Disables both the action and menu trigger. */
  disabled?: boolean;
}

const SplitButton = React.forwardRef<HTMLDivElement, React.PropsWithoutRef<SplitButtonProps>>(
  (
    {
      variant = 'filled',
      size = 'sm',
      shape = 'round',
      morph = true,
      selected,
      disabled = false,
      className,
      children,
      ...props
    },
    ref,
  ) => {
    const [open, setOpen] = useState(false);
    const selectedValue = selected !== undefined ? String(selected) : undefined;
    const contextValue = useMemo(
      () => ({ variant, size, shape, morph, selected, disabled, open, setOpen }),
      [variant, size, shape, morph, selected, disabled, open],
    );

    return (
      <SplitButtonCtx.Provider value={contextValue}>
        {/* biome-ignore lint/a11y/useSemanticElements: role="group" is correct per WAI-ARIA */}
        <div
          ref={ref}
          className={cx('md-split-button', className)}
          data-variant={variant}
          data-size={size}
          data-shape={shape}
          data-morph={morph || undefined}
          data-selected={selectedValue}
          data-disabled={disabled || undefined}
          data-open={open || undefined}
          role="group"
          {...props}
        >
          {children}
        </div>
      </SplitButtonCtx.Provider>
    );
  },
);
SplitButton.displayName = 'SplitButton';

export { SplitButton };
