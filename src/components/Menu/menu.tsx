import './menu.css';
import { Menu as BaseMenu } from '@base-ui/react/menu';
import { ChevronRight } from 'lucide-react';
import { Ripple } from 'm3-ripple';
import * as React from 'react';

import { cx } from '../../lib/cx';

// =============================================================================
// Menu (Root)
// =============================================================================

export interface MenuProps {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  modal?: boolean;
  children?: React.ReactNode;
}

function Menu({ open, defaultOpen, onOpenChange, modal = true, children }: MenuProps) {
  return (
    <BaseMenu.Root open={open} defaultOpen={defaultOpen} onOpenChange={onOpenChange} modal={modal}>
      {children}
    </BaseMenu.Root>
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
  side?: 'top' | 'bottom';
  align?: 'start' | 'end' | 'center';
}

const MenuContent = ({
  className,
  side = 'bottom',
  align = 'start',
  children,
  ref,
  ...props
}: MenuContentProps & { ref?: React.Ref<HTMLDivElement> }) => {
  return (
    <BaseMenu.Portal>
      <BaseMenu.Positioner side={side} align={align} sideOffset={4}>
        <BaseMenu.Popup ref={ref} className={cx('md-menu', className)} {...props}>
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

export interface MenuGroupProps extends React.HTMLAttributes<HTMLDivElement> {}

const MenuGroup = ({ className, children, ref, ...props }: MenuGroupProps & { ref?: React.Ref<HTMLDivElement> }) => {
  return (
    <BaseMenu.Group ref={ref} className={cx('md-menu-group', className)} {...props}>
      {children}
    </BaseMenu.Group>
  );
};
MenuGroup.displayName = 'MenuGroup';

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
  disabled?: boolean;
  onClick?: React.MouseEventHandler<HTMLElement>;
}

const MenuItem = ({
  supportingText,
  disabled = false,
  className,
  children,
  onClick,
  ref,
  ...props
}: MenuItemProps & { ref?: React.Ref<HTMLDivElement> }) => {
  return (
    <BaseMenu.Item
      ref={ref}
      disabled={disabled}
      onClick={onClick}
      data-disabled={disabled || undefined}
      className={cx('md-menu-item', className)}
      {...props}
    >
      <Ripple hoverOpacity={0} />
      {supportingText ? <MenuItemContent supportingText={supportingText}>{children}</MenuItemContent> : children}
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
      className={cx('md-menu-item', className)}
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
        <BaseMenu.Popup ref={ref} className={cx('md-menu', className)} {...props}>
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

export { Menu, MenuContent, MenuDivider, MenuGroup, MenuItem, MenuSub, MenuSubContent, MenuSubTrigger, MenuTrigger };
