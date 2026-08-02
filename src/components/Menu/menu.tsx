import './menu.css';
import { Menu as BaseMenu } from '@base-ui/react/menu';
import { Check, ChevronRight } from 'lucide-react';
import { Ripple } from 'm3-ripple';
import * as React from 'react';

import { cx } from '../../lib/cx';

type MenuColor = 'standard' | 'vibrant';
const MenuColorContext = React.createContext<MenuColor>('standard');

// =============================================================================
// Menu (Root)
// =============================================================================

export interface MenuProps {
  /** @deprecated accepted for backwards-compatible tests/stories; styling is token-driven. */
  color?: string;
  /** Open state (controlled). Pair with `onOpenChange`. */
  open?: boolean;
  /** Initial open state when uncontrolled. */
  defaultOpen?: boolean;
  /** Called when the menu opens or closes. */
  onOpenChange?: (open: boolean) => void;
  /** Trap focus and block interaction with the page behind the menu. */
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
  /**
   * Render the trigger as your own element instead of a plain `<button>`:
   * `<MenuTrigger render={<Button variant="outlined">Open</Button>} />`.
   *
   * This matches the `render` prop used by Dialog, Tooltip and the sheets, all of
   * which forward to the same Base UI convention.
   */
  render?: React.ReactElement<Record<string, unknown>>;
  /**
   * @deprecated Use `render` instead, for consistency with the other components.
   * `<MenuTrigger asChild><Button /></MenuTrigger>` still works and behaves
   * identically to `<MenuTrigger render={<Button />} />`.
   */
  asChild?: boolean;
}

const MenuTrigger = React.forwardRef<HTMLButtonElement, React.PropsWithoutRef<MenuTriggerProps>>(
  ({ render, asChild, children, ...props }, ref) => {
    // `asChild` took the element from `children`; `render` takes it as a prop.
    // Resolve both to the single element Base UI expects.
    const rendered = render ?? (asChild && React.isValidElement(children) ? children : undefined);

    if (rendered) {
      return <BaseMenu.Trigger ref={ref} render={rendered as React.ReactElement<Record<string, unknown>>} {...props} />;
    }

    return (
      <BaseMenu.Trigger ref={ref} {...props}>
        {children}
      </BaseMenu.Trigger>
    );
  },
);
MenuTrigger.displayName = 'MenuTrigger';

// =============================================================================
// MenuContent
// =============================================================================

export interface MenuContentProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Lay the items out as connected groups rather than a single surface. */
  grouped?: boolean;
  /** Which side of the trigger the menu opens towards. */
  side?: 'top' | 'bottom';
  /** How the menu aligns to the trigger along that side. */
  align?: 'start' | 'end' | 'center';
  /**
   * Forwarded to the underlying portal. Pass `{ container }` to render into a
   * specific element instead of `document.body` — useful inside a bounded
   * surface such as a device frame or an embedded preview.
   */
  portalProps?: Omit<BaseMenu.Portal.Props, 'children'>;
}

const MenuContent = React.forwardRef<HTMLDivElement, React.PropsWithoutRef<MenuContentProps>>(
  ({ className, grouped, side = 'bottom', align = 'start', children, portalProps, ...props }, ref) => {
    const color = React.useContext(MenuColorContext);
    const colorClass = color === 'vibrant' ? 'bg-tertiary-container' : 'bg-surface-container-low';
    return (
      <BaseMenu.Portal {...portalProps}>
        <BaseMenu.Positioner side={side} align={align} sideOffset={4}>
          <BaseMenu.Popup
            ref={ref}
            className={cx(
              'md-menu rounded-2xl p-1',
              grouped ? 'gap-1' : 'shadow-md',
              !grouped && colorClass,
              className,
            )}
            {...props}
          >
            {children}
          </BaseMenu.Popup>
        </BaseMenu.Positioner>
      </BaseMenu.Portal>
    );
  },
);
MenuContent.displayName = 'MenuContent';

// =============================================================================
// MenuGroup
// =============================================================================

export interface MenuGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Optional heading rendered above the group. */
  label?: React.ReactNode;
}

const MenuGroup = React.forwardRef<HTMLDivElement, React.PropsWithoutRef<MenuGroupProps>>(
  ({ className, label, children, ...props }, ref) => {
    return (
      <BaseMenu.Group ref={ref} className={cx('md-menu-group', className)} {...props}>
        {label ? <MenuLabel>{label}</MenuLabel> : null}
        <div data-menu-group="" className="rounded-2xl shadow-md">
          {children}
        </div>
      </BaseMenu.Group>
    );
  },
);
MenuGroup.displayName = 'MenuGroup';

// =============================================================================
// MenuLabel
// =============================================================================

const MenuLabel = React.forwardRef<HTMLDivElement, React.PropsWithoutRef<React.ComponentPropsWithoutRef<'div'>>>(
  ({ className, ...props }, ref) => (
    <BaseMenu.GroupLabel ref={ref} className={cx('md-menu-label', className)} {...props} />
  ),
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
  /** Second line under the label. */
  supportingText?: React.ReactNode;
  /** Whether choosing this item closes the menu. */
  closeOnSelect?: boolean;
  /** Render the selected state and show a check. */
  selected?: boolean;
  /** Icon before the label. */
  leadingIcon?: React.ReactNode;
  /** Trailing text, typically a keyboard shortcut. */
  trailingText?: React.ReactNode;
  /** Disable the item and skip it in keyboard navigation. */
  disabled?: boolean;
  /** Called when the item is chosen. */
  onClick?: React.MouseEventHandler<HTMLElement>;
}

const MenuItem = React.forwardRef<HTMLDivElement, React.PropsWithoutRef<MenuItemProps>>(
  (
    {
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
      ...props
    },
    ref,
  ) => {
    const color = React.useContext(MenuColorContext);
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
        className={cx(
          'md-menu-item rounded-xl h-12 overflow-hidden',
          disabled && 'opacity-38',
          selectedClass,
          className,
        )}
        {...props}
      >
        <Ripple hoverOpacity={0} />
        {selected && !leadingIcon ? <Check aria-hidden="true" /> : null}
        {leadingIcon}
        {supportingText ? <MenuItemContent supportingText={supportingText}>{children}</MenuItemContent> : children}
        {trailingText ? <span className="md-menu-item__trailing">{trailingText}</span> : null}
      </BaseMenu.Item>
    );
  },
);
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

const MenuDivider = React.forwardRef<HTMLDivElement, React.PropsWithoutRef<MenuDividerProps>>(
  ({ className, ...props }, ref) => (
    <BaseMenu.Separator ref={ref} className={cx('md-menu-divider', className)} {...props} />
  ),
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
  /** Second line under the label. */
  supportingText?: React.ReactNode;
  /** Disable the sub-menu and skip it in keyboard navigation. */
  disabled?: boolean;
}

const MenuSubTrigger = React.forwardRef<HTMLDivElement, React.PropsWithoutRef<MenuSubTriggerProps>>(
  ({ supportingText, disabled = false, className, children, ...props }, ref) => {
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
  },
);
MenuSubTrigger.displayName = 'MenuSubTrigger';

// =============================================================================
// MenuSubContent
// =============================================================================

export interface MenuSubContentProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Forwarded to the underlying portal. Pass `{ container }` to render into a
   * specific element instead of `document.body` — useful inside a bounded
   * surface such as a device frame or an embedded preview.
   */
  portalProps?: Omit<BaseMenu.Portal.Props, 'children'>;
}

const MenuSubContent = React.forwardRef<HTMLDivElement, React.PropsWithoutRef<MenuSubContentProps>>(
  ({ className, children, portalProps, ...props }, ref) => {
    return (
      <BaseMenu.Portal {...portalProps}>
        <BaseMenu.Positioner sideOffset={4}>
          <BaseMenu.Popup ref={ref} className={cx('md-menu rounded-2xl p-1 shadow-md', className)} {...props}>
            {children}
          </BaseMenu.Popup>
        </BaseMenu.Positioner>
      </BaseMenu.Portal>
    );
  },
);
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
