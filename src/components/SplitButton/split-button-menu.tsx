import '../Button/button.css';
import './split-button.css';
import { Menu as BaseMenu } from '@base-ui/react/menu';
import { ChevronDown } from 'lucide-react';
import type * as React from 'react';
import { cx } from '../../lib/cx';
import { M3Ripple as Ripple } from '../../lib/m3-ripple';
import { useSplitButton } from './split-button-context';

// =============================================================================
// SplitButtonMenu (Trailing dropdown with menu)
// =============================================================================

export interface SplitButtonMenuProps {
  children?: React.ReactNode;
  /** Which side of the button the menu opens towards. */
  side?: 'top' | 'bottom';
  /** How the menu aligns to the button along that side. */
  align?: 'start' | 'end' | 'center';
  /** Props applied to the native menu trigger. */
  triggerProps?: Omit<React.ComponentProps<'button'>, 'children' | 'ref'>;
  /** Ref forwarded to the native menu trigger. */
  triggerRef?: React.Ref<HTMLButtonElement>;
  /** Localizable accessible name for the icon-only trigger. */
  triggerLabel?: string;
  /** Replaces the default chevron icon. */
  triggerIcon?: React.ReactNode;
}

const SplitButtonMenu = ({
  children,
  side = 'bottom',
  align = 'end',
  triggerProps,
  triggerRef,
  triggerLabel = 'Open menu',
  triggerIcon = <ChevronDown aria-hidden="true" />,
}: SplitButtonMenuProps) => {
  const { variant, size, shape, morph, selected, disabled, open, setOpen } = useSplitButton();
  const selectedValue = selected !== undefined ? String(selected) : undefined;
  const {
    className: triggerClassName,
    disabled: triggerDisabled,
    'aria-label': triggerAriaLabel,
    ...nativeTriggerProps
  } = triggerProps ?? {};

  return (
    <BaseMenu.Root open={open} onOpenChange={(nextOpen) => !disabled && setOpen(nextOpen)}>
      <BaseMenu.Trigger
        render={
          <button
            ref={triggerRef}
            type="button"
            aria-label={triggerAriaLabel ?? triggerLabel}
            className={cx('md-button', 'md-split-button__trigger', triggerClassName)}
            data-variant={variant}
            data-size={size}
            data-shape={shape}
            data-morph={morph || undefined}
            data-selected={selectedValue}
            disabled={disabled || triggerDisabled}
            {...nativeTriggerProps}
          >
            <Ripple />
            {triggerIcon}
          </button>
        }
      />
      <BaseMenu.Portal>
        <BaseMenu.Positioner side={side} align={align} sideOffset={4}>
          <BaseMenu.Popup className="md-menu">{children}</BaseMenu.Popup>
        </BaseMenu.Positioner>
      </BaseMenu.Portal>
    </BaseMenu.Root>
  );
};
SplitButtonMenu.displayName = 'SplitButtonMenu';

export { SplitButtonMenu };
