import './button.css';
import { Button as BaseButton } from '@base-ui/react/button';
import { Ripple } from 'm3-ripple';
import type * as React from 'react';
import { cx } from '../../lib/cx';
import { useButtonGroup } from '../ButtonGroup/button-group-context';

export type ButtonProps = React.ComponentProps<'button'> & {
  variant?: 'filled' | 'elevated' | 'tonal' | 'outlined' | 'text';
  shape?: 'round' | 'square';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  morph?: boolean;
  selected?: boolean;
};

const Button = ({
  className,
  variant = 'filled',
  shape: shapeProp,
  size: sizeProp,
  morph: morphProp,
  selected: selectedProp,
  children,
  onClick,
  ref,
  ...props
}: ButtonProps & { ref?: React.Ref<HTMLButtonElement> }) => {
  const groupProps = useButtonGroup();

  const size = sizeProp ?? groupProps?.size ?? 'sm';
  const shape = shapeProp ?? groupProps?.shape ?? 'round';
  const morph = morphProp ?? groupProps?.morph ?? false;
  const selected = selectedProp ?? groupProps?.selected;
  const selectedValue = selected !== undefined ? String(selected) : undefined;

  const activateButton = (e: React.MouseEvent<HTMLButtonElement>) => {
    groupProps?.onClick?.();
    onClick?.(e);
  };

  return (
    <BaseButton
      className={cx('md-button', className)}
      data-variant={variant}
      data-shape={shape}
      data-size={size}
      data-morph={morph || undefined}
      data-selected={selectedValue}
      aria-pressed={selected !== undefined ? selected : undefined}
      onClick={activateButton}
      ref={ref}
      {...props}
    >
      <Ripple />
      {children}
    </BaseButton>
  );
};
Button.displayName = 'Button';

export { Button };
