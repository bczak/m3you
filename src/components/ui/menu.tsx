import { Check, ChevronRight } from 'lucide-react';
import { Ripple } from 'm3-ripple';
import * as React from 'react';
import * as ReactDOM from 'react-dom';

import { cn } from '../../lib/utils';

// =============================================================================
// Utilities
// =============================================================================

/**
 * Collect menu items at the current menu level only (skip nested [role="menu"]).
 */
function getMenuItems(container: HTMLElement): HTMLElement[] {
  const items: HTMLElement[] = [];
  const walk = (node: HTMLElement) => {
    for (const child of Array.from(node.children)) {
      const el = child as HTMLElement;
      // Skip nested submenus
      if (el.getAttribute('role') === 'menu') continue;
      if (el.getAttribute('role') === 'menuitem' && el.getAttribute('aria-disabled') !== 'true') {
        items.push(el);
      }
      if (el.children.length > 0) {
        walk(el);
      }
    }
  };
  walk(container);
  return items;
}

// =============================================================================
// Context
// =============================================================================

interface MenuContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
  color: 'standard' | 'vibrant';
  menuId: string;
  triggerRef: React.RefObject<HTMLButtonElement | null>;
  contentRef: React.RefObject<HTMLDivElement | null>;
  closeMenu: () => void;
}

const MenuContext = React.createContext<MenuContextValue | null>(null);

function useMenu() {
  const ctx = React.useContext(MenuContext);
  if (!ctx) throw new Error('Menu components must be used within <Menu>');
  return ctx;
}

interface SubMenuContextValue {
  subOpen: boolean;
  setSubOpen: (open: boolean) => void;
  subMenuId: string;
  subTriggerRef: React.RefObject<HTMLButtonElement | null>;
  subContentRef: React.RefObject<HTMLDivElement | null>;
  cancelClose: () => void;
  scheduleClose: () => void;
}

const SubMenuContext = React.createContext<SubMenuContextValue | null>(null);

function useSubMenu() {
  const ctx = React.useContext(SubMenuContext);
  if (!ctx) throw new Error('MenuSub components must be used within <MenuSub>');
  return ctx;
}

// =============================================================================
// Menu (Root)
// =============================================================================

export interface MenuProps extends React.HTMLAttributes<HTMLDivElement> {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  color?: 'standard' | 'vibrant';
}

const Menu = React.forwardRef<HTMLDivElement, MenuProps>(
  (
    { open: controlledOpen, defaultOpen = false, onOpenChange, color = 'standard', children, className, ...props },
    ref,
  ) => {
    const [internalOpen, setInternalOpen] = React.useState(defaultOpen);
    const isControlled = controlledOpen !== undefined;
    const open = isControlled ? controlledOpen : internalOpen;
    const menuId = React.useId();
    const triggerRef = React.useRef<HTMLButtonElement>(null);
    const contentRef = React.useRef<HTMLDivElement>(null);

    const setOpen = React.useCallback(
      (value: boolean) => {
        if (!isControlled) setInternalOpen(value);
        onOpenChange?.(value);
      },
      [isControlled, onOpenChange],
    );

    const closeMenu = React.useCallback(() => {
      setOpen(false);
      requestAnimationFrame(() => {
        triggerRef.current?.focus();
      });
    }, [setOpen]);

    // Click outside to close
    React.useEffect(() => {
      if (!open) return;
      const handlePointerDown = (e: PointerEvent) => {
        const target = e.target as Node;
        // Check if click is inside trigger, main content, or any portalled submenu
        const isInsideTrigger = triggerRef.current?.contains(target);
        const isInsideContent = contentRef.current?.contains(target);
        const isInsideSubmenu = (target as HTMLElement).closest?.('[role="menu"]') != null;
        if (!isInsideTrigger && !isInsideContent && !isInsideSubmenu) {
          closeMenu();
        }
      };
      document.addEventListener('pointerdown', handlePointerDown);
      return () => document.removeEventListener('pointerdown', handlePointerDown);
    }, [open, closeMenu]);

    // Escape to close
    React.useEffect(() => {
      if (!open) return;
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          e.preventDefault();
          closeMenu();
        }
      };
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }, [open, closeMenu]);

    return (
      <MenuContext.Provider value={{ open, setOpen, color, menuId, triggerRef, contentRef, closeMenu }}>
        <div ref={ref} className={cn('relative inline-flex', className)} {...props}>
          {children}
        </div>
      </MenuContext.Provider>
    );
  },
);
Menu.displayName = 'Menu';

// =============================================================================
// MenuTrigger
// =============================================================================

export interface MenuTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
}

const MenuTrigger = React.forwardRef<HTMLButtonElement, MenuTriggerProps>(
  ({ asChild, children, onClick, ...props }, ref) => {
    const { open, setOpen, menuId, triggerRef } = useMenu();

    const mergedRef = React.useCallback(
      (node: HTMLButtonElement | null) => {
        (triggerRef as React.RefObject<HTMLButtonElement | null>).current = node;
        if (typeof ref === 'function') ref(node);
        else if (ref) ref.current = node;
      },
      [ref, triggerRef],
    );

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      onClick?.(e);
      setOpen(!open);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        if (!open) setOpen(true);
      }
    };

    if (asChild && React.isValidElement(children)) {
      return React.cloneElement(
        children as React.ReactElement<{
          ref?: React.Ref<HTMLButtonElement>;
          onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
          onKeyDown?: (e: React.KeyboardEvent<HTMLButtonElement>) => void;
          'aria-expanded'?: boolean;
          'aria-haspopup'?: string;
          'aria-controls'?: string;
        }>,
        {
          ref: mergedRef,
          onClick: (e: React.MouseEvent<HTMLButtonElement>) => {
            handleClick(e);
            (
              children as React.ReactElement<{ onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void }>
            ).props.onClick?.(e);
          },
          onKeyDown: (e: React.KeyboardEvent<HTMLButtonElement>) => {
            handleKeyDown(e);
            (
              children as React.ReactElement<{ onKeyDown?: (e: React.KeyboardEvent<HTMLButtonElement>) => void }>
            ).props.onKeyDown?.(e);
          },
          'aria-expanded': open,
          'aria-haspopup': 'menu',
          'aria-controls': open ? menuId : undefined,
        },
      );
    }

    return (
      <button
        ref={mergedRef}
        type="button"
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-controls={open ? menuId : undefined}
        {...props}
      >
        {children}
      </button>
    );
  },
);
MenuTrigger.displayName = 'MenuTrigger';

// =============================================================================
// MenuContent
// =============================================================================

export interface MenuContentProps extends React.HTMLAttributes<HTMLDivElement> {
  side?: 'top' | 'bottom';
  align?: 'start' | 'end' | 'center';
  grouped?: boolean;
}

const MenuContent = React.forwardRef<HTMLDivElement, MenuContentProps>(
  ({ className, side = 'bottom', align = 'start', grouped = false, children, ...props }, ref) => {
    const { open, color, menuId, contentRef, closeMenu } = useMenu();

    const mergedRef = React.useCallback(
      (node: HTMLDivElement | null) => {
        (contentRef as React.RefObject<HTMLDivElement | null>).current = node;
        if (typeof ref === 'function') ref(node);
        else if (ref) ref.current = node;
      },
      [ref, contentRef],
    );

    // Focus first item when opened
    React.useEffect(() => {
      if (open && contentRef.current) {
        requestAnimationFrame(() => {
          const firstItem = contentRef.current?.querySelector<HTMLElement>(
            '[role="menuitem"]:not([aria-disabled="true"])',
          );
          firstItem?.focus();
        });
      }
    }, [open, contentRef]);

    // Keyboard navigation + typeahead
    const searchBufferRef = React.useRef('');
    const searchTimeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
      const container = contentRef.current;
      if (!container) return;

      const items = getMenuItems(container);
      const currentIndex = items.indexOf(document.activeElement as HTMLElement);

      switch (e.key) {
        case 'ArrowDown': {
          e.preventDefault();
          e.stopPropagation();
          const next = currentIndex < items.length - 1 ? currentIndex + 1 : 0;
          items[next]?.focus();
          break;
        }
        case 'ArrowUp': {
          e.preventDefault();
          e.stopPropagation();
          const prev = currentIndex > 0 ? currentIndex - 1 : items.length - 1;
          items[prev]?.focus();
          break;
        }
        case 'Home': {
          e.preventDefault();
          e.stopPropagation();
          items[0]?.focus();
          break;
        }
        case 'End': {
          e.preventDefault();
          e.stopPropagation();
          items[items.length - 1]?.focus();
          break;
        }
        case 'Tab': {
          e.preventDefault();
          closeMenu();
          break;
        }
        default: {
          // Typeahead: single printable character
          if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
            searchBufferRef.current += e.key.toLowerCase();
            if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
            searchTimeoutRef.current = setTimeout(() => {
              searchBufferRef.current = '';
            }, 500);
            const match = items.find((item) => {
              const text = item.textContent?.toLowerCase() ?? '';
              return text.startsWith(searchBufferRef.current);
            });
            if (match) match.focus();
          }
        }
      }
    };

    if (!open) return null;

    const sideClasses = side === 'top' ? 'bottom-full mb-1' : 'top-full mt-1';
    const alignClasses = align === 'end' ? 'right-0' : align === 'center' ? 'left-1/2 -translate-x-1/2' : 'left-0';
    const colorClasses =
      color === 'vibrant'
        ? 'bg-tertiary-container text-tertiary-container-foreground'
        : 'bg-surface-container-low text-surface-foreground';

    return (
      <div
        ref={mergedRef}
        id={menuId}
        role="menu"
        tabIndex={-1}
        data-menu-grouped={grouped || undefined}
        className={cn(
          'absolute z-50 flex min-w-28 max-w-70 flex-col outline-none',
          'animate-menu-in',
          sideClasses,
          alignClasses,
          grouped ? 'gap-1' : 'overflow-y-auto rounded-2xl p-1 shadow-md',
          !grouped && colorClasses,
          className,
        )}
        onKeyDown={handleKeyDown}
        {...props}
      >
        {children}
      </div>
    );
  },
);
MenuContent.displayName = 'MenuContent';

// =============================================================================
// MenuItem
// =============================================================================

export interface MenuItemProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  leadingIcon?: React.ReactNode;
  trailingIcon?: React.ReactNode;
  trailingText?: React.ReactNode;
  badge?: React.ReactNode;
  supportingText?: React.ReactNode;
  selected?: boolean;
  disabled?: boolean;
  closeOnSelect?: boolean;
}

const MenuItem = React.forwardRef<HTMLButtonElement, MenuItemProps>(
  (
    {
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
      ...props
    },
    ref,
  ) => {
    const { color, closeMenu } = useMenu();

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (disabled) return;
      onClick?.(e);
      if (closeOnSelect) closeMenu();
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleClick(e as unknown as React.MouseEvent<HTMLButtonElement>);
      }
    };

    const isVibrant = color === 'vibrant';

    // Color classes based on color scheme and selected state
    const colorClasses = selected
      ? isVibrant
        ? 'bg-tertiary text-tertiary-foreground'
        : 'bg-tertiary-container text-tertiary-container-foreground'
      : isVibrant
        ? 'text-tertiary-container-foreground'
        : 'text-surface-foreground';

    // Hover/focus classes
    const stateClasses = selected
      ? isVibrant
        ? 'hover:bg-tertiary/90 focus-visible:bg-tertiary/80'
        : 'hover:bg-tertiary-container/80 focus-visible:bg-tertiary-container/70'
      : isVibrant
        ? 'hover:bg-tertiary-container-foreground/8 focus-visible:bg-tertiary-container-foreground/12'
        : 'hover:bg-surface-foreground/8 focus-visible:bg-surface-foreground/12';

    // Icon color for non-selected items
    const iconClasses = selected
      ? ''
      : isVibrant
        ? 'text-tertiary-container-foreground'
        : 'text-surface-variant-foreground';

    return (
      <button
        ref={ref}
        type="button"
        role="menuitem"
        tabIndex={-1}
        aria-disabled={disabled || undefined}
        data-selected={selected || undefined}
        className={cn(
          'relative flex h-12 w-full cursor-pointer select-none items-center gap-3 overflow-hidden rounded-xl px-3 text-sm outline-none transition-colors',
          colorClasses,
          stateClasses,
          disabled && 'pointer-events-none opacity-[0.38]',
          className,
        )}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        {...props}
      >
        <Ripple />
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
      </button>
    );
  },
);
MenuItem.displayName = 'MenuItem';

// =============================================================================
// MenuDivider
// =============================================================================

export type MenuDividerProps = React.ComponentProps<'hr'>;

const MenuDivider = React.forwardRef<HTMLHRElement, MenuDividerProps>(({ className, ...props }, ref) => (
  <hr ref={ref} className={cn('my-1 border-outline-variant', className)} {...props} />
));
MenuDivider.displayName = 'MenuDivider';

// =============================================================================
// MenuLabel
// =============================================================================

export type MenuLabelProps = React.HTMLAttributes<HTMLDivElement>;

const MenuLabel = React.forwardRef<HTMLDivElement, MenuLabelProps>(({ className, children, ...props }, ref) => {
  const { color } = useMenu();
  return (
    <div
      ref={ref}
      className={cn(
        'flex h-8 items-center px-3 font-medium text-xs',
        color === 'vibrant' ? 'text-tertiary-container-foreground/70' : 'text-surface-variant-foreground',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
});
MenuLabel.displayName = 'MenuLabel';

// =============================================================================
// MenuGroup
// =============================================================================

export interface MenuGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  label?: string;
}

const MenuGroup = React.forwardRef<HTMLDivElement, MenuGroupProps>(({ className, label, children, ...props }, ref) => {
  const { color } = useMenu();
  const colorClasses =
    color === 'vibrant'
      ? 'bg-tertiary-container text-tertiary-container-foreground'
      : 'bg-surface-container-low text-surface-foreground';

  const labelColorClasses =
    color === 'vibrant' ? 'text-tertiary-container-foreground/70' : 'text-surface-variant-foreground';

  return (
    // biome-ignore lint/a11y/useSemanticElements: fieldset adds unwanted border styling; div[role=group] is more appropriate in menu context
    <div ref={ref} role="group" aria-label={label} className={cn('flex flex-col', className)} {...props}>
      {label && <div className={cn('flex h-8 items-center px-3 font-medium text-xs', labelColorClasses)}>{label}</div>}
      <div data-menu-group="" className={cn('flex flex-col rounded-2xl p-1 shadow-md', colorClasses)}>
        {children}
      </div>
    </div>
  );
});
MenuGroup.displayName = 'MenuGroup';

// =============================================================================
// MenuSub (Submenu Root)
// =============================================================================

export type MenuSubProps = React.HTMLAttributes<HTMLDivElement>;

const MenuSub = React.forwardRef<HTMLDivElement, MenuSubProps>(({ className, children, ...props }, ref) => {
  const [subOpen, setSubOpen] = React.useState(false);
  const subMenuId = React.useId();
  const subTriggerRef = React.useRef<HTMLButtonElement>(null);
  const subContentRef = React.useRef<HTMLDivElement>(null);
  const closeTimeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const cancelClose = React.useCallback(() => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
  }, []);

  const scheduleClose = React.useCallback(() => {
    cancelClose();
    closeTimeoutRef.current = setTimeout(() => {
      setSubOpen(false);
    }, 150);
  }, [cancelClose]);

  const handleMouseEnter = () => {
    cancelClose();
    setSubOpen(true);
  };

  return (
    <SubMenuContext.Provider
      value={{ subOpen, setSubOpen, subMenuId, subTriggerRef, subContentRef, cancelClose, scheduleClose }}
    >
      {/* biome-ignore lint/a11y/noStaticElementInteractions: submenu hover interaction requires mouse events on container */}
      <div
        ref={ref}
        className={cn('relative', className)}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={scheduleClose}
        {...props}
      >
        {children}
      </div>
    </SubMenuContext.Provider>
  );
});
MenuSub.displayName = 'MenuSub';

// =============================================================================
// MenuSubTrigger
// =============================================================================

export interface MenuSubTriggerProps extends Omit<MenuItemProps, 'trailingIcon' | 'closeOnSelect'> {}

const MenuSubTrigger = React.forwardRef<HTMLButtonElement, MenuSubTriggerProps>(
  ({ children, onKeyDown, ...props }, ref) => {
    const { subOpen, setSubOpen, subMenuId, subTriggerRef } = useSubMenu();

    const mergedRef = React.useCallback(
      (node: HTMLButtonElement | null) => {
        (subTriggerRef as React.RefObject<HTMLButtonElement | null>).current = node;
        if (typeof ref === 'function') ref(node);
        else if (ref) ref.current = node;
      },
      [ref, subTriggerRef],
    );

    const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        e.stopPropagation();
        setSubOpen(true);
      }
      onKeyDown?.(e);
    };

    return (
      <MenuItem
        ref={mergedRef}
        closeOnSelect={false}
        trailingIcon={<ChevronRight className="size-5" />}
        aria-haspopup="menu"
        aria-expanded={subOpen}
        aria-controls={subOpen ? subMenuId : undefined}
        onKeyDown={handleKeyDown}
        onClick={() => setSubOpen(true)}
        {...props}
      >
        {children}
      </MenuItem>
    );
  },
);
MenuSubTrigger.displayName = 'MenuSubTrigger';

// =============================================================================
// MenuSubContent
// =============================================================================

export type MenuSubContentProps = React.HTMLAttributes<HTMLDivElement>;

const MenuSubContent = React.forwardRef<HTMLDivElement, MenuSubContentProps>(
  ({ className, children, ...props }, ref) => {
    const { color } = useMenu();
    const { subOpen, setSubOpen, subMenuId, subTriggerRef, subContentRef, cancelClose, scheduleClose } = useSubMenu();

    const mergedRef = React.useCallback(
      (node: HTMLDivElement | null) => {
        (subContentRef as React.RefObject<HTMLDivElement | null>).current = node;
        if (typeof ref === 'function') ref(node);
        else if (ref) ref.current = node;
      },
      [ref, subContentRef],
    );

    const [position, setPosition] = React.useState<{ top: number; left: number }>({ top: 0, left: 0 });

    // Calculate position from trigger bounding rect
    React.useEffect(() => {
      if (subOpen && subTriggerRef.current) {
        const rect = subTriggerRef.current.getBoundingClientRect();
        let top = rect.top;
        let left = rect.right + 4;

        // Flip to left side if overflowing viewport right edge
        if (left + 200 > window.innerWidth) {
          left = rect.left - 200 - 4;
        }

        // Prevent overflowing viewport bottom
        const estimatedHeight = 200;
        if (top + estimatedHeight > window.innerHeight) {
          top = Math.max(8, window.innerHeight - estimatedHeight);
        }

        setPosition({ top, left });
      }
    }, [subOpen, subTriggerRef]);

    // Focus first item when submenu opens
    React.useEffect(() => {
      if (subOpen && subContentRef.current) {
        requestAnimationFrame(() => {
          const firstItem = subContentRef.current?.querySelector<HTMLElement>(
            '[role="menuitem"]:not([aria-disabled="true"])',
          );
          firstItem?.focus();
        });
      }
    }, [subOpen, subContentRef]);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
      const container = subContentRef.current;
      if (!container) return;

      if (e.key === 'ArrowLeft' || e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        setSubOpen(false);
        requestAnimationFrame(() => {
          subTriggerRef.current?.focus();
        });
        return;
      }

      const items = getMenuItems(container);
      const currentIndex = items.indexOf(document.activeElement as HTMLElement);

      switch (e.key) {
        case 'ArrowDown': {
          e.preventDefault();
          e.stopPropagation();
          const next = currentIndex < items.length - 1 ? currentIndex + 1 : 0;
          items[next]?.focus();
          break;
        }
        case 'ArrowUp': {
          e.preventDefault();
          e.stopPropagation();
          const prev = currentIndex > 0 ? currentIndex - 1 : items.length - 1;
          items[prev]?.focus();
          break;
        }
        case 'Home': {
          e.preventDefault();
          e.stopPropagation();
          items[0]?.focus();
          break;
        }
        case 'End': {
          e.preventDefault();
          e.stopPropagation();
          items[items.length - 1]?.focus();
          break;
        }
      }
    };

    if (!subOpen) return null;

    const colorClasses =
      color === 'vibrant'
        ? 'bg-tertiary-container text-tertiary-container-foreground'
        : 'bg-surface-container-low text-surface-foreground';

    return ReactDOM.createPortal(
      <div
        ref={mergedRef}
        id={subMenuId}
        role="menu"
        tabIndex={-1}
        style={{ top: position.top, left: position.left }}
        className={cn(
          'fixed z-50 flex min-w-28 max-w-70 flex-col rounded-2xl p-1 shadow-md outline-none',
          'animate-menu-in',
          colorClasses,
          className,
        )}
        onKeyDown={handleKeyDown}
        onMouseEnter={cancelClose}
        onMouseLeave={scheduleClose}
        {...props}
      >
        {children}
      </div>,
      document.body,
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
