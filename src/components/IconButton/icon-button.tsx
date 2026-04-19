import './icon-button.css';
import { Ripple } from 'm3-ripple';
import type * as React from 'react';

import { cx } from '../../lib/cx';
import { useButtonGroup } from '../ButtonGroup/button-group-context';

export type IconButtonProps = React.ComponentProps<'button'> & {
  variant?: 'standard' | 'filled' | 'elevated' | 'tonal' | 'outlined';
  shape?: 'round' | 'square';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  width?: 'narrow' | 'default' | 'wide';
  morph?: boolean;
  selected?: boolean;
};

const IconButton = ({
  className,
  variant = 'filled',
  shape: shapeProp,
  size: sizeProp,
  width = 'default',
  morph: morphProp,
  selected: selectedProp,
  children,
  onClick,
  ref,
  ...props
}: IconButtonProps & { ref?: React.Ref<HTMLButtonElement> }) => {
  const groupProps = useButtonGroup();

  const size = sizeProp ?? groupProps?.size ?? 'sm';
  const shape = shapeProp ?? groupProps?.shape ?? 'round';
  const morph = morphProp ?? groupProps?.morph ?? false;
  const selected = selectedProp ?? groupProps?.selected;
  const selectedValue = selected !== undefined ? String(selected) : undefined;

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    groupProps?.onClick?.();
    onClick?.(e);
  };

  return (
    <button
      className={cx('md-icon-button', className)}
      data-variant={variant}
      data-shape={shape}
      data-size={size}
      data-width={width}
      data-morph={morph || undefined}
      data-selected={selectedValue}
      aria-pressed={selected !== undefined ? selected : undefined}
      onClick={handleClick}
      ref={ref}
      {...props}
    >
      <Ripple />
      {children}
    </button>
  );
};
IconButton.displayName = 'IconButton';

export { IconButton };
