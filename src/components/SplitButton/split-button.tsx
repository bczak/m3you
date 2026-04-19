import '../Button/button.css';
import './split-button.css';
import { Menu as BaseMenu } from '@base-ui/react/menu';
import { ChevronDown } from 'lucide-react';
import { Ripple } from 'm3-ripple';
import type * as React from 'react';
import { createContext, useContext, useState } from 'react';
import { cx } from '../../lib/cx';

// =============================================================================
// Context
// =============================================================================

interface SplitButtonContextValue {
  variant: 'filled' | 'tonal' | 'elevated' | 'outlined';
  size: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  shape: 'round' | 'square';
  morph: boolean;
  selected?: boolean;
  open: boolean;
  setOpen: (open: boolean) => void;
}

const SplitButtonCtx = createContext<SplitButtonContextValue | null>(null);

function useSplitButton() {
  const ctx = useContext(SplitButtonCtx);
  if (!ctx) throw new Error('SplitButton sub-components must be used within <SplitButton>');
  return ctx;
}

// =============================================================================
// SplitButton (Root)
// =============================================================================

export interface SplitButtonProps extends React.ComponentProps<'div'> {
  variant?: 'filled' | 'tonal' | 'elevated' | 'outlined';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  shape?: 'round' | 'square';
  morph?: boolean;
  selected?: boolean;
}

const SplitButton = ({
  variant = 'filled',
  size = 'sm',
  shape = 'round',
  morph = false,
  selected,
  className,
  children,
  ref,
  ...props
}: SplitButtonProps & { ref?: React.Ref<HTMLDivElement> }) => {
  const [open, setOpen] = useState(false);
  const selectedValue = selected !== undefined ? String(selected) : undefined;

  return (
    <SplitButtonCtx value={{ variant, size, shape, morph, selected, open, setOpen }}>
      <div
        ref={ref}
        className={cx('md-split-button', className)}
        data-variant={variant}
        data-size={size}
        data-shape={shape}
        data-morph={morph || undefined}
        data-selected={selectedValue}
        data-open={open || undefined}
        role="group"
        {...props}
      >
        {children}
      </div>
    </SplitButtonCtx>
  );
};
SplitButton.displayName = 'SplitButton';

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

// =============================================================================
// SplitButtonMenu (Trailing dropdown with menu)
// =============================================================================

export interface SplitButtonMenuProps {
  children?: React.ReactNode;
  side?: 'top' | 'bottom';
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

// =============================================================================
// Exports
// =============================================================================

export { SplitButton, SplitButtonAction, SplitButtonMenu };
