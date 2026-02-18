import { PlusIcon } from 'lucide-react';
import * as React from 'react';

import { cn } from '../../lib/utils';
import { Button, type ButtonProps } from './button';
import { IconButton, type IconButtonProps } from './icon-button';

const FABMenuContext = React.createContext<{
  open: boolean;
  setOpen: (open: boolean) => void;
  menuId: string;
  triggerRef: React.RefObject<HTMLButtonElement | null>;
  contentRef: React.RefObject<HTMLDivElement | null>;
} | null>(null);

const useFABMenu = () => {
  const context = React.useContext(FABMenuContext);
  if (!context) throw new Error('FABMenu components must be used within FABMenu');
  return context;
};

// =============================================================================
// FABMenu (Root)
// =============================================================================

export interface FABMenuProps extends React.HTMLAttributes<HTMLDivElement> {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  scrim?: boolean;
}

const FABMenu = ({
  open: controlledOpen,
  defaultOpen = false,
  onOpenChange,
  scrim = false,
  className,
  children,
  ref,
  ...props
}: FABMenuProps & { ref?: React.Ref<HTMLDivElement> }) => {
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

  // Handle Escape key to close menu
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) {
        e.preventDefault();
        setOpen(false);
        triggerRef.current?.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, setOpen]);

  // Focus first menu item when opened
  React.useEffect(() => {
    if (open && contentRef.current) {
      const firstItem = contentRef.current.querySelector<HTMLButtonElement>('[role="menuitem"]');
      firstItem?.focus();
    }
  }, [open]);

  return (
    <FABMenuContext.Provider value={{ open, setOpen, menuId, triggerRef, contentRef }}>
      <div ref={ref} className={cn('relative inline-flex flex-col items-end gap-2', className)} {...props}>
        {scrim && (
          <button
            type="button"
            aria-label="Close menu"
            tabIndex={-1}
            className={cn(
              'fixed inset-0 cursor-default bg-scrim/40 transition-opacity duration-200',
              open ? 'opacity-100' : 'pointer-events-none opacity-0',
            )}
            onClick={() => setOpen(false)}
          />
        )}
        {children}
      </div>
    </FABMenuContext.Provider>
  );
};
FABMenu.displayName = 'FABMenu';

// =============================================================================
// FABMenuTrigger
// =============================================================================

export interface FABMenuTriggerProps extends Omit<IconButtonProps, 'children'> {
  icon?: React.ReactNode;
  closeIcon?: React.ReactNode;
  asChild?: boolean;
  children?: React.ReactNode;
}

const FABMenuTrigger = ({
  icon,
  closeIcon,
  asChild = false,
  children,
  className,
  onClick,
  size = 'md',
  shape = 'square',
  ref,
  ...props
}: FABMenuTriggerProps & { ref?: React.Ref<HTMLButtonElement> }) => {
  const { open, setOpen, menuId, triggerRef } = useFABMenu();

  // Merge refs
  const mergedRef = React.useCallback(
    (node: HTMLButtonElement | null) => {
      (triggerRef as React.RefObject<HTMLButtonElement | null>).current = node;
      if (typeof ref === 'function') {
        ref(node);
      } else if (ref) {
        ref.current = node;
      }
    },
    [ref, triggerRef],
  );

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    setOpen(!open);
    onClick?.(e);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
      e.preventDefault();
      if (!open) setOpen(true);
    }
  };

  // If asChild is true and children is provided, clone the child with necessary props
  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(
      children as React.ReactElement<{
        ref?: React.Ref<HTMLButtonElement>;
        onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
        className?: string;
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
        className: cn('z-10', (children as React.ReactElement<{ className?: string }>).props.className),
        'aria-expanded': open,
        'aria-haspopup': 'menu',
        'aria-controls': menuId,
      },
    );
  }

  // Default trigger using IconButton
  const displayIcon = icon ?? <PlusIcon />;

  return (
    <IconButton
      ref={mergedRef}
      className={cn('z-10', className)}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      size={size}
      shape={open ? 'round' : shape}
      aria-expanded={open}
      aria-haspopup="menu"
      aria-controls={menuId}
      {...props}
    >
      <span className={cn('transition-transform duration-200', open && 'rotate-45')}>
        {open && closeIcon ? closeIcon : displayIcon}
      </span>
    </IconButton>
  );
};
FABMenuTrigger.displayName = 'FABMenuTrigger';

// =============================================================================
// FABMenuContent
// =============================================================================

export interface FABMenuContentProps extends React.HTMLAttributes<HTMLDivElement> {}

const FABMenuContent = ({
  className,
  children,
  ref,
  ...props
}: FABMenuContentProps & { ref?: React.Ref<HTMLDivElement> }) => {
  const { open, setOpen, menuId, triggerRef, contentRef } = useFABMenu();

  // Merge refs
  const mergedRef = React.useCallback(
    (node: HTMLDivElement | null) => {
      (contentRef as React.RefObject<HTMLDivElement | null>).current = node;
      if (typeof ref === 'function') {
        ref(node);
      } else if (ref) {
        ref.current = node;
      }
    },
    [ref, contentRef],
  );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const items = contentRef.current?.querySelectorAll<HTMLButtonElement>('[role="menuitem"]:not([disabled])');
    if (!items?.length) return;

    const currentIndex = Array.from(items).indexOf(document.activeElement as HTMLButtonElement);

    switch (e.key) {
      case 'ArrowUp':
        e.preventDefault();
        // In flex-col-reverse, visual "up" is next item in DOM
        if (currentIndex < items.length - 1) {
          items[currentIndex + 1]?.focus();
        }
        break;
      case 'ArrowDown':
        e.preventDefault();
        // In flex-col-reverse, visual "down" is previous item in DOM
        if (currentIndex > 0) {
          items[currentIndex - 1]?.focus();
        } else if (currentIndex === 0) {
          // Move focus back to trigger when at bottom
          triggerRef.current?.focus();
          setOpen(false);
        }
        break;
      case 'Home':
        e.preventDefault();
        items[items.length - 1]?.focus(); // First visual item (last in DOM due to reverse)
        break;
      case 'End':
        e.preventDefault();
        items[0]?.focus(); // Last visual item (first in DOM due to reverse)
        break;
      case 'Tab':
        // Close menu on Tab
        setOpen(false);
        break;
    }
  };

  // Clone children with staggered animation
  const childArray = React.Children.toArray(children);
  let itemIndex = 0;

  const enhancedChildren = childArray.map((child) => {
    if (!React.isValidElement(child)) return child;

    const index = itemIndex++;
    return React.cloneElement(
      child as React.ReactElement<{
        style?: React.CSSProperties;
        'data-state'?: string;
        tabIndex?: number;
      }>,
      {
        style: {
          ...(child as React.ReactElement<{ style?: React.CSSProperties }>).props.style,
          transitionDelay: `${index * 50}ms`,
        },
        'data-state': open ? 'open' : 'closed',
        tabIndex: open ? 0 : -1,
      },
    );
  });

  return (
    <div
      ref={mergedRef}
      id={menuId}
      role="menu"
      aria-orientation="vertical"
      aria-hidden={!open}
      className={cn('flex flex-col-reverse items-end gap-1', className)}
      data-state={open ? 'open' : 'closed'}
      onKeyDown={handleKeyDown}
      {...props}
    >
      {enhancedChildren}
    </div>
  );
};
FABMenuContent.displayName = 'FABMenuContent';

// =============================================================================
// FABMenuItem
// =============================================================================

export type FABMenuItemProps = ButtonProps & {
  closeOnClick?: boolean;
};

const FABMenuItem = ({
  className,
  variant = 'tonal',
  shape = 'round',
  size = 'md',
  closeOnClick = true,
  onClick,
  children,
  ref,
  ...props
}: FABMenuItemProps & { ref?: React.Ref<HTMLButtonElement> }) => {
  const { setOpen } = useFABMenu();

  return (
    <Button
      ref={ref}
      role="menuitem"
      variant={variant}
      shape={shape}
      size={size}
      className={cn(
        'transition-all duration-200 ease-out data-[state=closed]:pointer-events-none data-[state=closed]:translate-y-4 data-[state=open]:translate-y-0 data-[state=closed]:scale-90 data-[state=open]:scale-100 data-[state=closed]:opacity-0 data-[state=open]:opacity-100',
        className,
      )}
      onClick={(e) => {
        onClick?.(e);
        if (closeOnClick) setOpen(false);
      }}
      {...props}
    >
      {children}
    </Button>
  );
};
FABMenuItem.displayName = 'FABMenuItem';

export { FABMenu, FABMenuContent, FABMenuItem, FABMenuTrigger };
