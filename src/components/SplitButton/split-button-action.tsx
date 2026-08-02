import '../Button/button.css';
import './split-button.css';
import * as React from 'react';
import { cx } from '../../lib/cx';
import { M3Ripple as Ripple } from '../../lib/m3-ripple';
import { useSplitButton } from './split-button-context';

// =============================================================================
// SplitButtonAction (Leading action button)
// =============================================================================

export interface SplitButtonActionProps extends React.ComponentProps<'button'> {}

const SplitButtonAction = React.forwardRef<HTMLButtonElement, React.PropsWithoutRef<SplitButtonActionProps>>(
  ({ className, children, disabled: disabledProp, ...props }, ref) => {
    const { variant, size, shape, morph, selected, disabled } = useSplitButton();
    const selectedValue = selected !== undefined ? String(selected) : undefined;

    return (
      <button
        ref={ref}
        type="button"
        className={cx('md-button', 'md-split-button__action', className)}
        data-variant={variant}
        data-size={size}
        data-shape={shape}
        data-morph={morph || undefined}
        data-selected={selectedValue}
        aria-pressed={selected !== undefined ? selected : undefined}
        disabled={disabled || disabledProp}
        {...props}
      >
        <Ripple />
        {children}
      </button>
    );
  },
);
SplitButtonAction.displayName = 'SplitButtonAction';

export { SplitButtonAction };
