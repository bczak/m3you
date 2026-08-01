import './menu.css';
import { Menu as BaseMenu } from '@base-ui/react/menu';
import { Check, ChevronRight } from 'lucide-react';
import { Ripple } from 'm3-ripple';
import * as React from 'react';
import { use } from 'react';

import { cx } from '../../lib/cx';

type MenuColor = 'standard' | 'vibrant';
const MenuColorContext = React.createContext<MenuColor>('standard');

// =============================================================================
// Menu (Root)
// =============================================================================

export interface MenuProps {
  /** @deprecated accepted for backwards-compatible tests/stories; styling is token-driven. */
  color?: string;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  modal?: boolean;
  children?: React.ReactNode;
}

function Menu({ color = 'standard', open, defaultOpen, onOpenChange, modal = true, children }: MenuProps) {
  return (
    <MenuColorContext.Provider value={color === 'vibrant' ? 'vibrant' : 'standard'}>
      <BaseMenu.Root open={open} defaultOpen={defaultOpen} onOpenChange={onOpenChange} modal={modal}>
        {children}
      </BaseMenu.Root>
    </MenuColorContext.Provider>
  );
}
Menu.displayName = 'Menu';

// =============================================================================
// MenuTrigger
// =============================================================================

export interface MenuTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
}

const MenuTrigger = ({
  asChild,
  children,
  ref,
  ...props
}: MenuTriggerProps & { ref?: React.Ref<HTMLButtonElement> }) => {
  if (asChild && React.isValidElement(children)) {
    return <BaseMenu.Trigger ref={ref} render={children as React.ReactElement<Record<string, unknown>>} {...props} />;
  }

  return (
    <BaseMenu.Trigger ref={ref} {...props}>
      {children}
    </BaseMenu.Trigger>
  );
};
MenuTrigger.displayName = 'MenuTrigger';

// =============================================================================
// MenuContent
// =============================================================================

export interface MenuContentProps extends React.HTMLAttributes<HTMLDivElement> {
  grouped?: boolean;
  side?: 'top' | 'bottom';
  align?: 'start' | 'end' | 'center';
}

const MenuContent = ({
  className,
  grouped,
  side = 'bottom',
  align = 'start',
  children,
  ref,
  ...props
}: MenuContentProps & { ref?: React.Ref<HTMLDivElement> }) => {
  const color = use(MenuColorContext);
  const colorClass = color === 'vibrant' ? 'bg-tertiary-container' : 'bg-surface-container-low';
  return (
    <BaseMenu.Portal>
      <BaseMenu.Positioner side={side} align={align} sideOffset={4}>
        <BaseMenu.Popup
          ref={ref}
          className={cx('md-menu rounded-2xl p-1', grouped ? 'gap-1' : 'shadow-md', !grouped && colorClass, className)}
          {...props}
        >
          {children}
        </BaseMenu.Popup>
      </BaseMenu.Positioner>
    </BaseMenu.Portal>
  );
};
MenuContent.displayName = 'MenuContent';

// =============================================================================
// MenuGroup
// =============================================================================

export interface MenuGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  label?: React.ReactNode;
}

const MenuGroup = ({
  className,
  label,
  children,
  ref,
  ...props
}: MenuGroupProps & { ref?: React.Ref<HTMLDivElement> }) => {
  return (
    <BaseMenu.Group ref={ref} className={cx('md-menu-group', className)} {...props}>
      {label ? <MenuLabel>{label}</MenuLabel> : null}
      <div data-menu-group="" className="rounded-2xl shadow-md">
        {children}
      </div>
    </BaseMenu.Group>
  );
};
MenuGroup.displayName = 'MenuGroup';

// =============================================================================
// MenuLabel
// =============================================================================

const MenuLabel = ({
  className,
  ref,
  ...props
}: React.ComponentPropsWithoutRef<'div'> & { ref?: React.Ref<HTMLDivElement> }) => (
  <BaseMenu.GroupLabel ref={ref} className={cx('md-menu-label', className)} {...props} />
);
MenuLabel.displayName = 'MenuLabel';

// =============================================================================
// Helpers
// =============================================================================

/** Separates React element children (icons) from text children */
function splitIcons(children: React.ReactNode): { icons: React.ReactNode[]; rest: React.ReactNode[] } {
  const icons: React.ReactNode[] = [];
  const rest: React.ReactNode[] = [];
  React.Children.forEach(children, (child) => {
    if (React.isValidElement(child)) {
      icons.push(child);
    } else {
      rest.push(child);
    }
  });
  return { icons, rest };
}

// =============================================================================
// MenuItem
// =============================================================================

export interface MenuItemProps extends React.ComponentPropsWithoutRef<'div'> {
  supportingText?: React.ReactNode;
  closeOnSelect?: boolean;
  selected?: boolean;
  leadingIcon?: React.ReactNode;
  trailingText?: React.ReactNode;
  disabled?: boolean;
  onClick?: React.MouseEventHandler<HTMLElement>;
}

const MenuItem = ({
  supportingText,
  closeOnSelect,
  selected,
  leadingIcon,
  trailingText,
  disabled = false,
  className,
  children,
  onClick,
  onKeyUp,
  ref,
  ...props
}: MenuItemProps & { ref?: React.Ref<HTMLDivElement> }) => {
  const color = use(MenuColorContext);
  const selectedClass = selected ? (color === 'vibrant' ? 'bg-tertiary' : 'bg-tertiary-container') : undefined;
  return (
    <BaseMenu.Item
      ref={ref}
      disabled={disabled}
      onClick={onClick}
      closeOnClick={closeOnSelect}
      onKeyUp={onKeyUp}
      data-disabled={disabled || undefined}
      data-selected={selected || undefined}
      className={cx('md-menu-item rounded-xl h-12 overflow-hidden', disabled && 'opacity-38', selectedClass, className)}
      {...props}
    >
      <Ripple hoverOpacity={0} />
      {selected && !leadingIcon ? <Check aria-hidden="true" /> : null}
      {leadingIcon}
      {supportingText ? <MenuItemContent supportingText={supportingText}>{children}</MenuItemContent> : children}
      {trailingText ? <span className="md-menu-item__trailing">{trailingText}</span> : null}
    </BaseMenu.Item>
  );
};
MenuItem.displayName = 'MenuItem';

/** Renders icon outside the text column, text + supporting inside */
function MenuItemContent({ children, supportingText }: { children: React.ReactNode; supportingText: React.ReactNode }) {
  const { icons, rest } = splitIcons(children);
  return (
    <>
      {icons}
      <span className="md-menu-item__content">
        <span className="md-menu-item__label">{rest}</span>
        <span className="md-menu-item__supporting">{supportingText}</span>
      </span>
    </>
  );
}

// =============================================================================
// MenuDivider
// =============================================================================

export type MenuDividerProps = React.ComponentProps<'div'>;

const MenuDivider = ({ className, ref, ...props }: MenuDividerProps & { ref?: React.Ref<HTMLDivElement> }) => (
  <BaseMenu.Separator ref={ref} className={cx('md-menu-divider', className)} {...props} />
);
MenuDivider.displayName = 'MenuDivider';

// =============================================================================
// MenuSub (Submenu Root)
// =============================================================================

export interface MenuSubProps {
  children?: React.ReactNode;
}

function MenuSub({ children }: MenuSubProps) {
  return <BaseMenu.SubmenuRoot>{children}</BaseMenu.SubmenuRoot>;
}
MenuSub.displayName = 'MenuSub';

// =============================================================================
// MenuSubTrigger
// =============================================================================

export interface MenuSubTriggerProps extends React.ComponentPropsWithoutRef<'div'> {
  supportingText?: React.ReactNode;
  disabled?: boolean;
}

const MenuSubTrigger = ({
  supportingText,
  disabled = false,
  className,
  children,
  ref,
  ...props
}: MenuSubTriggerProps & { ref?: React.Ref<HTMLDivElement> }) => {
  return (
    <BaseMenu.SubmenuTrigger
      ref={ref}
      disabled={disabled}
      data-disabled={disabled || undefined}
      className={cx('md-menu-item rounded-xl h-12 overflow-hidden', disabled && 'opacity-38', className)}
      {...props}
    >
      <Ripple hoverOpacity={0} />
      {supportingText ? <MenuItemContent supportingText={supportingText}>{children}</MenuItemContent> : children}
      <span className="md-menu-item__chevron" aria-hidden="true">
        <ChevronRight />
      </span>
    </BaseMenu.SubmenuTrigger>
  );
};
MenuSubTrigger.displayName = 'MenuSubTrigger';

// =============================================================================
// MenuSubContent
// =============================================================================

export interface MenuSubContentProps extends React.HTMLAttributes<HTMLDivElement> {}

const MenuSubContent = ({
  className,
  children,
  ref,
  ...props
}: MenuSubContentProps & { ref?: React.Ref<HTMLDivElement> }) => {
  return (
    <BaseMenu.Portal>
      <BaseMenu.Positioner sideOffset={4}>
        <BaseMenu.Popup ref={ref} className={cx('md-menu rounded-2xl p-1 shadow-md', className)} {...props}>
          {children}
        </BaseMenu.Popup>
      </BaseMenu.Positioner>
    </BaseMenu.Portal>
  );
};
MenuSubContent.displayName = 'MenuSubContent';

// =============================================================================
// Exports
// =============================================================================

export {
  Menu,
  MenuContent,
  MenuDivider,
  MenuGroup,
  MenuItem,
  MenuLabel,
  MenuSub,
  MenuSubContent,
  MenuSubTrigger,
  MenuTrigger,
};
