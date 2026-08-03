import './icon-button.css';
import * as React from 'react';
import { cx } from '../../lib/cx';
import { M3Ripple as Ripple } from '../../lib/m3-ripple';
import { useButtonGroup } from '../ButtonGroup/button-group-context';

export type IconButtonProps = React.ComponentProps<'button'> & {
  /** Visual emphasis. `standard` has no container; the rest match the Button variants. */
  variant?: 'standard' | 'filled' | 'elevated' | 'tonal' | 'outlined';
  /** Corner style. `round` is the M3 default. */
  shape?: 'round' | 'square';
  /** Size on the M3 scale. */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  /** Horizontal padding, without changing height — useful for tuning target size in a dense row. */
  width?: 'narrow' | 'default' | 'wide';
  /** Swap to the opposite shape while the button is held. */
  morph?: boolean;
  /** Renders the selected state and emits `aria-pressed`. */
  selected?: boolean;
};

const IconButton = React.forwardRef<HTMLButtonElement, React.PropsWithoutRef<IconButtonProps>>(
  (
    {
      className,
      variant = 'filled',
      shape: shapeProp,
      size: sizeProp,
      width = 'default',
      morph: morphProp,
      selected: selectedProp,
      children,
      onClick,
      ...props
    },
    ref,
  ) => {
    const groupProps = useButtonGroup();

    const size = sizeProp ?? groupProps?.size ?? 'sm';
    const shape = shapeProp ?? groupProps?.shape ?? 'round';
    const morph = morphProp ?? groupProps?.morph ?? false;
    const selected = selectedProp ?? groupProps?.selected;
    const selectedValue = selected !== undefined ? String(selected) : undefined;

    const activateIconButton = (e: React.MouseEvent<HTMLButtonElement>) => {
      groupProps?.onClick?.();
      onClick?.(e);
    };

    return (
      <button
        type="button"
        className={cx('md-icon-button', className)}
        data-variant={variant}
        data-shape={shape}
        data-size={size}
        data-width={width}
        data-morph={morph || undefined}
        data-selected={selectedValue}
        aria-pressed={selected !== undefined ? selected : undefined}
        onClick={activateIconButton}
        ref={ref}
        {...props}
      >
        <Ripple />
        {children}
      </button>
    );
  },
);
IconButton.displayName = 'IconButton';

export { IconButton };
