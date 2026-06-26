import './fab-menu.css';
import { XIcon } from 'lucide-react';
import * as React from 'react';

import { cx } from '../../lib/cx';
import { Button } from '../Button/button';

// =============================================================================
// Types
// =============================================================================

export interface FABMenuItemOption {
  icon: React.ReactNode;
  label: string;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  keepOpen?: boolean;
  disabled?: boolean;
  'aria-label'?: string;
}

type FABMenuTriggerProps = React.ComponentProps<'button'> & {
  icon?: React.ReactNode;
  label?: React.ReactNode;
};

export interface FABMenuProps extends React.HTMLAttributes<HTMLDivElement> {
  items: FABMenuItemOption[];
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  scrim?: boolean;
  closeIcon?: React.ReactNode;
  children: React.ReactElement<FABMenuTriggerProps>;
}

// =============================================================================
// FABMenu
// =============================================================================

const FABMenu = ({
  items,
  open: controlledOpen,
  defaultOpen = false,
  onOpenChange,
  scrim = false,
  closeIcon,
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

  const state = open ? 'open' : 'closed';
  const isExtendedFAB = (children.type as { displayName?: string })?.displayName === 'ExtendedFAB';
  const closeIconElement = closeIcon ?? <XIcon />;

  const setOpen = React.useCallback(
    (value: boolean) => {
      if (!isControlled) setInternalOpen(value);
      onOpenChange?.(value);
    },
    [isControlled, onOpenChange],
  );

  // Measure ExtendedFAB natural width once for CSS width transition.
  // Done on mount only — re-measuring on close gives wrong values
  // because gap/padding are mid-transition at that point.
  const measured = React.useRef(false);
  React.useLayoutEffect(() => {
    const el = triggerRef.current;
    if (!el || !isExtendedFAB || measured.current || open) return;
    el.style.setProperty('--_natural-width', `${el.offsetWidth}px`);
    measured.current = true;
  }, [open, isExtendedFAB]);

  // Escape key closes menu
  React.useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
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
      const firstItem = contentRef.current.querySelector<HTMLButtonElement>('[role="menuitem"]:not([disabled])');
      firstItem?.focus();
    }
  }, [open]);

  // Keyboard navigation within menu content
  const handleContentKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const menuItems = contentRef.current?.querySelectorAll<HTMLButtonElement>('[role="menuitem"]:not([disabled])');
    if (!menuItems?.length) return;

    const currentIndex = Array.from(menuItems).indexOf(document.activeElement as HTMLButtonElement);

    switch (e.key) {
      case 'ArrowUp':
        e.preventDefault();
        if (currentIndex < menuItems.length - 1) {
          menuItems[currentIndex + 1]?.focus();
        }
        break;
      case 'ArrowDown':
        e.preventDefault();
        if (currentIndex > 0) {
          menuItems[currentIndex - 1]?.focus();
        } else if (currentIndex === 0) {
          setOpen(false);
          triggerRef.current?.focus();
        }
        break;
      case 'Home':
        e.preventDefault();
        menuItems[menuItems.length - 1]?.focus();
        break;
      case 'End':
        e.preventDefault();
        menuItems[0]?.focus();
        break;
      case 'Tab':
        setOpen(false);
        break;
    }
  };

  // Trigger handlers
  const handleTriggerClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    setOpen(!open);
    children.props.onClick?.(e);
  };

  const handleTriggerKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if ((e.key === 'ArrowUp' || e.key === 'ArrowDown') && !open) {
      e.preventDefault();
      setOpen(true);
    }
    children.props.onKeyDown?.(e);
  };

  // Clone trigger with morph overrides
  const triggerOverrides: Record<string, unknown> = {
    ref: triggerRef,
    className: cx('md-fab-menu-trigger', children.props.className),
    'data-menu-state': state,
    onClick: handleTriggerClick,
    onKeyDown: handleTriggerKeyDown,
    'aria-expanded': open,
    'aria-haspopup': 'menu',
    'aria-controls': menuId,
  };

  if (open) {
    if (isExtendedFAB) {
      triggerOverrides.icon = closeIconElement;
      triggerOverrides.label = '';
    } else {
      triggerOverrides.children = closeIconElement;
    }
  }

  const trigger = React.cloneElement(children, triggerOverrides);

  return (
    <div ref={ref} className={cx('md-fab-menu', className)} {...props}>
      {scrim && (
        <button
          type="button"
          aria-label="Close menu"
          tabIndex={-1}
          className="md-fab-menu__scrim"
          data-state={state}
          onClick={() => setOpen(false)}
        />
      )}

      {/* Menu items */}
      <div
        ref={contentRef}
        id={menuId}
        role="menu"
        tabIndex={-1}
        aria-orientation="vertical"
        aria-hidden={!open}
        className="md-fab-menu__content"
        data-state={state}
        onKeyDown={handleContentKeyDown}
      >
        {items.map((item, index) => {
          const delay = open ? index * 35 : (items.length - 1 - index) * 20;

          return (
            <Button
              key={item.label}
              role="menuitem"
              variant="tonal"
              shape="round"
              size="md"
              className="md-fab-menu-item"
              data-state={state}
              style={{ transitionDelay: `${delay}ms` }}
              tabIndex={open ? 0 : -1}
              disabled={item.disabled}
              aria-label={item['aria-label']}
              onClick={(e) => {
                item.onClick?.(e);
                if (!item.keepOpen) setOpen(false);
              }}
            >
              {item.icon}
              {item.label}
            </Button>
          );
        })}
      </div>

      {/* Single trigger element — morphs between FAB/ExtendedFAB and close button */}
      {trigger}
    </div>
  );
};
FABMenu.displayName = 'FABMenu';

export { FABMenu };
