import { Menu as BaseMenu } from '@base-ui/react/menu';
import { cva } from 'class-variance-authority';
import { Check, ChevronRight } from 'lucide-react';
import { Ripple } from 'm3-ripple';
import * as React from 'react';

import { cn } from '../../lib/utils';

// =============================================================================
// CVA Variants
// =============================================================================

const menuContainerVariants = cva('', {
  variants: {
    color: {
      standard: 'bg-surface-container-low text-surface-foreground',
      vibrant: 'bg-tertiary-container text-tertiary-container-foreground',
    },
  },
  defaultVariants: { color: 'standard' },
});

const menuItemVariants = cva(
  'relative flex h-12 w-full cursor-pointer select-none items-center gap-3 overflow-hidden rounded-xl px-3 text-sm outline-none transition-colors',
  {
    variants: {
      color: { standard: '', vibrant: '' },
      selected: { true: '', false: '' },
      disabled: { true: 'pointer-events-none opacity-[0.38]', false: '' },
    },
    compoundVariants: [
      {
        color: 'standard',
        selected: false,
        className: 'text-surface-foreground hover:bg-surface-foreground/8 focus-visible:bg-surface-foreground/12',
      },
      {
        color: 'vibrant',
        selected: false,
        className:
          'text-tertiary-container-foreground hover:bg-tertiary-container-foreground/8 focus-visible:bg-tertiary-container-foreground/12',
      },
      {
        color: 'standard',
        selected: true,
        className:
          'bg-tertiary-container text-tertiary-container-foreground hover:bg-tertiary-container/80 focus-visible:bg-tertiary-container/70',
      },
      {
        color: 'vibrant',
        selected: true,
        className: 'bg-tertiary text-tertiary-foreground hover:bg-tertiary/90 focus-visible:bg-tertiary/80',
      },
    ],
    defaultVariants: { color: 'standard', selected: false, disabled: false },
  },
);

const menuIconVariants = cva('', {
  variants: {
    color: {
      standard: 'text-surface-variant-foreground',
      vibrant: 'text-tertiary-container-foreground',
    },
    selected: { true: '', false: '' },
  },
  compoundVariants: [{ selected: true, className: '' }],
  defaultVariants: { color: 'standard', selected: false },
});

const menuLabelVariants = cva('flex h-8 items-center px-3 font-medium text-xs', {
  variants: {
    color: {
      standard: 'text-surface-variant-foreground',
      vibrant: 'text-tertiary-container-foreground/70',
    },
  },
  defaultVariants: { color: 'standard' },
});

// =============================================================================
// Color Context (styling only — Base UI handles all behavior)
// =============================================================================

type MenuColor = 'standard' | 'vibrant';

const MenuColorContext = React.createContext<MenuColor>('standard');

function useMenuColor() {
  return React.useContext(MenuColorContext);
}

// =============================================================================
// Menu (Root)
// =============================================================================

export interface MenuProps {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  color?: MenuColor;
  children?: React.ReactNode;
  className?: string;
}

function Menu({ open, defaultOpen, onOpenChange, color = 'standard', children }: MenuProps) {
  return (
    <MenuColorContext.Provider value={color}>
      <BaseMenu.Root open={open} defaultOpen={defaultOpen} onOpenChange={onOpenChange}>
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
  side?: 'top' | 'bottom';
  align?: 'start' | 'end' | 'center';
  grouped?: boolean;
}

const MenuContent = ({
  className,
  side = 'bottom',
  align = 'start',
  grouped = false,
  children,
  ref,
  ...props
}: MenuContentProps & { ref?: React.Ref<HTMLDivElement> }) => {
  const color = useMenuColor();

  return (
    <BaseMenu.Portal>
      <BaseMenu.Positioner side={side} align={align} sideOffset={4}>
        <BaseMenu.Popup
          ref={ref}
          data-menu-grouped={grouped || undefined}
          className={cn(
            'flex min-w-28 max-w-70 flex-col outline-none',
            'animate-menu-in',
            grouped ? 'gap-1' : 'overflow-y-auto rounded-2xl p-1 shadow-md',
            !grouped && menuContainerVariants({ color }),
            className,
          )}
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
// MenuItem
// =============================================================================

export interface MenuItemProps extends React.ComponentPropsWithoutRef<'div'> {
  leadingIcon?: React.ReactNode;
  trailingIcon?: React.ReactNode;
  trailingText?: React.ReactNode;
  badge?: React.ReactNode;
  supportingText?: React.ReactNode;
  selected?: boolean;
  disabled?: boolean;
  closeOnSelect?: boolean;
  onClick?: React.MouseEventHandler<HTMLElement>;
}

const MenuItem = ({
  leadingIcon,
  trailingIcon,
  trailingText,
  badge,
  supportingText,
  selected = false,
  disabled = false,
  closeOnSelect = true,
  className,
  children,
  onClick,
  ref,
  ...props
}: MenuItemProps & { ref?: React.Ref<HTMLDivElement> }) => {
  const color = useMenuColor();
  const iconClasses = menuIconVariants({ color, selected });

  return (
    <BaseMenu.Item
      ref={ref}
      disabled={disabled}
      closeOnClick={closeOnSelect}
      onClick={onClick}
      data-selected={selected || undefined}
      className={cn(menuItemVariants({ color, selected, disabled }), className)}
      {...props}
    >
      <Ripple hoverOpacity={0} />
      {selected && !leadingIcon && <Check className="size-5 shrink-0" aria-hidden="true" />}
      {leadingIcon && (
        <span className={cn('flex size-6 shrink-0 items-center justify-center', iconClasses)} aria-hidden="true">
          {leadingIcon}
        </span>
      )}
      <span className="flex min-w-0 flex-1 flex-col items-start">
        <span className="truncate">{children}</span>
        {supportingText && <span className="truncate text-xs opacity-70">{supportingText}</span>}
      </span>
      {badge && <span className="shrink-0">{badge}</span>}
      {trailingText && <span className={cn('shrink-0 text-xs', iconClasses)}>{trailingText}</span>}
      {trailingIcon && (
        <span className={cn('flex size-6 shrink-0 items-center justify-center', iconClasses)} aria-hidden="true">
          {trailingIcon}
        </span>
      )}
    </BaseMenu.Item>
  );
};
MenuItem.displayName = 'MenuItem';

// =============================================================================
// MenuDivider
// =============================================================================

export type MenuDividerProps = React.ComponentProps<'div'>;

const MenuDivider = ({ className, ref, ...props }: MenuDividerProps & { ref?: React.Ref<HTMLDivElement> }) => (
  <BaseMenu.Separator ref={ref} className={cn('my-1 border-outline-variant border-t', className)} {...props} />
);
MenuDivider.displayName = 'MenuDivider';

// =============================================================================
// MenuLabel
// =============================================================================

export type MenuLabelProps = React.HTMLAttributes<HTMLDivElement>;

const MenuLabel = ({ className, children, ref, ...props }: MenuLabelProps & { ref?: React.Ref<HTMLDivElement> }) => {
  const color = useMenuColor();
  return (
    <BaseMenu.GroupLabel ref={ref} className={cn(menuLabelVariants({ color }), className)} {...props}>
      {children}
    </BaseMenu.GroupLabel>
  );
};
MenuLabel.displayName = 'MenuLabel';

// =============================================================================
// MenuGroup
// =============================================================================

export interface MenuGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  label?: string;
}

const MenuGroup = ({
  className,
  label,
  children,
  ref,
  ...props
}: MenuGroupProps & { ref?: React.Ref<HTMLDivElement> }) => {
  const color = useMenuColor();

  return (
    <BaseMenu.Group ref={ref} className={cn('flex flex-col', className)} {...props}>
      {label && <div className={menuLabelVariants({ color })}>{label}</div>}
      <div
        data-menu-group=""
        className={cn('flex flex-col rounded-2xl p-1 shadow-md', menuContainerVariants({ color }))}
      >
        {children}
      </div>
    </BaseMenu.Group>
  );
};
MenuGroup.displayName = 'MenuGroup';

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

export interface MenuSubTriggerProps extends Omit<MenuItemProps, 'trailingIcon' | 'closeOnSelect'> {}

const MenuSubTrigger = ({
  children,
  className,
  leadingIcon,
  badge,
  trailingText,
  supportingText,
  selected,
  disabled,
  ref,
  ...props
}: MenuSubTriggerProps & { ref?: React.Ref<HTMLDivElement> }) => {
  const color = useMenuColor();
  const iconClasses = menuIconVariants({ color, selected });

  return (
    <BaseMenu.SubmenuTrigger
      ref={ref}
      disabled={disabled}
      data-selected={selected || undefined}
      className={cn(menuItemVariants({ color, selected, disabled }), className)}
      {...props}
    >
      <Ripple hoverOpacity={0} />
      {selected && !leadingIcon && <Check className="size-5 shrink-0" aria-hidden="true" />}
      {leadingIcon && (
        <span className={cn('flex size-6 shrink-0 items-center justify-center', iconClasses)} aria-hidden="true">
          {leadingIcon}
        </span>
      )}
      <span className="flex min-w-0 flex-1 flex-col items-start">
        <span className="truncate">{children}</span>
        {supportingText && <span className="truncate text-xs opacity-70">{supportingText}</span>}
      </span>
      {badge && <span className="shrink-0">{badge}</span>}
      {trailingText && <span className={cn('shrink-0 text-xs', iconClasses)}>{trailingText}</span>}
      <span className={cn('flex size-6 shrink-0 items-center justify-center', iconClasses)} aria-hidden="true">
        <ChevronRight className="size-5" />
      </span>
    </BaseMenu.SubmenuTrigger>
  );
};
MenuSubTrigger.displayName = 'MenuSubTrigger';

// =============================================================================
// MenuSubContent
// =============================================================================

export type MenuSubContentProps = React.HTMLAttributes<HTMLDivElement>;

const MenuSubContent = ({
  className,
  children,
  ref,
  ...props
}: MenuSubContentProps & { ref?: React.Ref<HTMLDivElement> }) => {
  const color = useMenuColor();

  return (
    <BaseMenu.Portal>
      <BaseMenu.Positioner sideOffset={4}>
        <BaseMenu.Popup
          ref={ref}
          className={cn(
            'flex min-w-28 max-w-70 flex-col rounded-2xl p-1 shadow-md outline-none',
            'animate-menu-in',
            menuContainerVariants({ color }),
            className,
          )}
          {...props}
        >
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
  menuContainerVariants,
  MenuContent,
  MenuDivider,
  MenuGroup,
  menuIconVariants,
  MenuItem,
  menuItemVariants,
  MenuLabel,
  menuLabelVariants,
  MenuSub,
  MenuSubContent,
  MenuSubTrigger,
  MenuTrigger,
};
