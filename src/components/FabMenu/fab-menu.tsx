import './fab-menu.css';
import { XIcon } from 'lucide-react';
import * as React from 'react';

import { cx } from '../../lib/cx';
import { Button } from '../Button/button';
import type { FABColor } from '../Fab/fab';

// =============================================================================
// Types
// =============================================================================

/**
 * Colour roles a FAB menu item may take.
 *
 * Two departures from M3, both deliberate, both recorded in README →
 * Deliberate extensions and exclusions.
 *
 * M3 gives a FAB menu one colour set for the whole menu — primary, secondary or
 * tertiary — and a single `list-item.container.color` token per set, so items
 * cannot differ from one another. Per-item colour is an m3you extension for
 * apps whose actions carry opposite meanings. It stays decorative: M3 makes the
 * icon and label the differentiators ("The icon provides a differentiation
 * between items", "FAB menu items should always have label text"), and this
 * type requires both.
 *
 * `error-container` is the second departure. M3 lists no error colour style for
 * a FAB or a FAB menu, and the FAB guidelines say to "avoid using a FAB for
 * minor or destructive actions, such as… Alerts or errors". Only the container
 * pair is offered, never the solid `error` fill, which M3 defines as
 * "attention-grabbing… indicating urgency" — wrong for a routine menu.
 * `error-container` / `on-error-container` is an intended M3 pair, so contrast
 * is guaranteed. An app that needs more than one extra semantic colour should
 * follow M3's own advice and define custom colour roles instead of reaching
 * further into `error`.
 */
export type FABMenuItemColor = FABColor | 'error-container';

export interface FABMenuItemOption {
  /** Leading icon. Filled icons read better at this size than outlined ones. */
  icon: React.ReactNode;
  /** Visible text for the action. Doubles as the item's React key. */
  label: string;
  /** Called when the action is chosen. */
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  /** Leave the menu open after this item is clicked. */
  keepOpen?: boolean;
  /** Render the item non-interactive, with the M3 disabled treatment. */
  disabled?: boolean;
  /**
   * Colour role for this item alone, overriding the menu's `color`. Paints the
   * container, the label, the icon and — because the state layer is mixed from
   * `currentColor` — the hover, focus and press layers, which M3 requires to
   * match the icon colour. Omit it to inherit the menu's `color`.
   */
  color?: FABMenuItemColor;
  /** Accessible name, when the visible label is not the whole story. */
  'aria-label'?: string;
}

type FABMenuTriggerProps = React.ComponentProps<'button'> & {
  icon?: React.ReactNode;
  label?: React.ReactNode;
  color?: FABColor;
  'data-fab-color'?: FABColor;
};

export interface FABMenuProps extends React.HTMLAttributes<HTMLDivElement> {
  /** The actions revealed when the menu opens. Each may set its own `color`. */
  items: FABMenuItemOption[];
  /** Open state (controlled). Pair with `onOpenChange`. */
  open?: boolean;
  /** Initial open state when uncontrolled. */
  defaultOpen?: boolean;
  /** Called when the menu opens or closes. */
  onOpenChange?: (open: boolean) => void;
  /** Dim the content behind the open menu. */
  scrim?: boolean;
  /** Icon shown on the trigger while the menu is open. Defaults to a cross. */
  closeIcon?: React.ReactNode;
  /**
   * Color role shared by menu segments and an unconfigured trigger. An item
   * that sets its own `color` overrides this for that item only; the trigger is
   * never affected by an item's colour.
   */
  color?: FABColor;
  children: React.ReactElement<FABMenuTriggerProps>;
}

// =============================================================================
// FABMenu
// =============================================================================

const FABMenu = React.forwardRef<HTMLDivElement, React.PropsWithoutRef<FABMenuProps>>(
  (
    {
      items,
      open: controlledOpen,
      defaultOpen = false,
      onOpenChange,
      scrim = false,
      closeIcon,
      color = 'secondary-container',
      className,
      children,
      ...props
    },
    ref,
  ) => {
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
      'data-fab-color': children.props['data-fab-color'] ?? color,
    };

    if (children.props.color === undefined) {
      triggerOverrides.color = color;
    }

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
                data-fab-color={item.color ?? color}
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
  },
);
FABMenu.displayName = 'FABMenu';

export { FABMenu };
