import '../Button/button.css';
import './split-button.css';
import { Ripple } from 'm3-ripple';
import type * as React from 'react';

import { cx } from '../../lib/cx';
import { useSplitButton } from './split-button-context';

// =============================================================================
// SplitButtonAction (Leading action button)
// =============================================================================

export interface SplitButtonActionProps extends React.ComponentProps<'button'> {}

const SplitButtonAction = ({
  className,
  children,
  ref,
  ...props
}: SplitButtonActionProps & { ref?: React.Ref<HTMLButtonElement> }) => {
  const { variant, size, shape, morph, selected } = useSplitButton();
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
      {...props}
    >
      <Ripple />
      {children}
    </button>
  );
};
SplitButtonAction.displayName = 'SplitButtonAction';

export { SplitButtonAction };
