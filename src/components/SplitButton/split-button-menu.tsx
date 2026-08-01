import '../Button/button.css';
import './split-button.css';
import { Menu as BaseMenu } from '@base-ui/react/menu';
import { ChevronDown } from 'lucide-react';
import { Ripple } from 'm3-ripple';
import type * as React from 'react';

import { cx } from '../../lib/cx';
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
}

const SplitButtonMenu = ({ children, side = 'bottom', align = 'end' }: SplitButtonMenuProps) => {
  const { variant, size, shape, morph, selected, open, setOpen } = useSplitButton();
  const selectedValue = selected !== undefined ? String(selected) : undefined;

  return (
    <BaseMenu.Root open={open} onOpenChange={setOpen}>
      <BaseMenu.Trigger
        render={
          <button
            type="button"
            aria-label="Open menu"
            className={cx('md-button', 'md-split-button__trigger')}
            data-variant={variant}
            data-size={size}
            data-shape={shape}
            data-morph={morph || undefined}
            data-selected={selectedValue}
          >
            <Ripple />
            <ChevronDown aria-hidden="true" />
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
